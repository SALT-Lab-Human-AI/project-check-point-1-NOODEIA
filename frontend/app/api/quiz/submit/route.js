import { NextResponse } from 'next/server'
import { neo4jService } from '@/lib/neo4j'

// FORCE RELOAD: 2025-01-30-01:35
// POST /api/quiz/submit
// Body: { userId, sessionId, score, totalQuestions, streak, answers }
// Response: { canOpen, nodeType, xpEarned, oldXP, newXP, currentLevel, xpInLevel, newXpInLevel, percentage }
export async function POST(request) {
  const session = neo4jService.getSession()

  try {
    const body = await request.json()
    const { userId, sessionId, score, totalQuestions, streak, answers } = body

    if (!userId || !sessionId || score === undefined || totalQuestions === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, sessionId, score, and totalQuestions are required' },
        { status: 400 }
      )
    }

    // Validate score cannot exceed totalQuestions
    if (Number(score) > Number(totalQuestions)) {
      return NextResponse.json(
        { error: `Invalid score: ${score} cannot exceed totalQuestions: ${totalQuestions}` },
        { status: 400 }
      )
    }

    // Ensure score and totalQuestions are integers
    const validatedScore = Math.floor(Number(score))
    const validatedTotalQuestions = Math.floor(Number(totalQuestions))
    
    if (validatedScore < 0 || validatedTotalQuestions <= 0) {
      return NextResponse.json(
        { error: 'Invalid score or totalQuestions values' },
        { status: 400 }
      )
    }

    // Calculate percentage
    const percentage = (validatedScore / validatedTotalQuestions) * 100

    // Determine node type based on performance
    // Check exact 100% first (validatedScore === validatedTotalQuestions) to avoid any floating point issues
    let nodeType = 'common'
    if (validatedScore === validatedTotalQuestions && validatedTotalQuestions > 0) {
      // Perfect score - 100% accuracy
      nodeType = 'legendary'
    } else if (percentage >= 80) {
      // 80-99% accuracy
      nodeType = 'rare'
    } else if (percentage >= 30) {
      // 30-79% accuracy
      nodeType = 'common'
    } else {
      // Less than 30%, no node earned
      return NextResponse.json({
        canOpen: false,
        percentage: percentage.toFixed(0),
        required: 30,
        message: `You need at least 30% to earn a node! You got ${percentage.toFixed(0)}%. Try again!`
      }, { status: 200 })
    }

    // Get user's current XP first
    const userResult = await session.run(
      `MATCH (u:User {id: $userId})
       RETURN u.xp as xp, u.level as level`,
      { userId }
    )

    const oldXP = userResult.records[0]?.get('xp') || 0
    const currentLevel = Math.floor(oldXP / 100) + 1

    // Calculate RANDOM XP based on node type
    const xpRanges = {
      common: { base: 3, random: 4 },     // 3-7 XP (30%+)
      rare: { base: 12, random: 3 },      // 12-15 XP (80%+)
      legendary: { base: 25, random: 5 }  // 25-30 XP (100%)
    }

    const range = xpRanges[nodeType]
    const xpEarned = range.base + Math.floor(Math.random() * (range.random + 1))

    // Calculate new XP values
    const newXP = oldXP + xpEarned
    const newLevel = Math.floor(newXP / 100) + 1
    const xpInLevel = oldXP % 100
    const newXpInLevel = newXP % 100

    // Check if XP was already awarded for this sessionId BEFORE creating/updating session
    // This prevents race conditions where multiple requests come in simultaneously
    const xpSourcePattern = `quiz:${sessionId}`
    const existingXpCheck = await session.run(
      `MATCH (u:User {id: $userId})-[:EARNED_XP]->(xt:XPTransaction)
       WHERE xt.source = $xpSourcePattern
       RETURN count(xt) as existingCount`,
      { userId, xpSourcePattern }
    )

    const existingXpCount = existingXpCheck.records[0]?.get('existingCount') || 0

    if (existingXpCount > 0) {
      // XP already awarded for this session, return existing data without awarding again
      // Get the actual stored session data to return correct nodeType, score, etc.
      const existingSessionResult = await session.run(
        `MATCH (qs:QuizSession {id: $sessionId})
         RETURN qs.xpEarned as xpEarned,
                qs.nodeType as nodeType,
                qs.score as score,
                qs.totalQuestions as totalQuestions`,
        { sessionId }
      )
      
      if (existingSessionResult.records.length > 0) {
        const record = existingSessionResult.records[0]
        const existingXpEarned = record.get('xpEarned') || xpEarned
        const storedNodeType = record.get('nodeType') || nodeType
        const storedScore = neo4jService.toNumber(record.get('score') || validatedScore)
        const storedTotalQuestions = neo4jService.toNumber(record.get('totalQuestions') || validatedTotalQuestions)
        const storedPercentage = (storedScore / storedTotalQuestions) * 100

        return NextResponse.json({
          canOpen: true,
          nodeType: storedNodeType, // Use stored nodeType from database
          xpEarned: existingXpEarned,
          oldXP,
          newXP: oldXP, // No new XP since it was already awarded
          currentLevel,
          newLevel: currentLevel,
          xpInLevel,
          newXpInLevel: oldXP % 100,
          percentage: storedPercentage.toFixed(0),
          score: storedScore, // Use stored score from database
          totalQuestions: storedTotalQuestions // Use stored totalQuestions from database
        }, { status: 200 })
      }
    }

    // Use validated values for storage (already declared above)
    const scoreToStore = validatedScore
    const totalQuestionsToStore = validatedTotalQuestions

    // Save QuizSession to Neo4j using MERGE to prevent duplicates
    // ON CREATE: only set properties when creating new session
    // ON MATCH: don't update existing session (to preserve original data)
    await session.run(
      `MATCH (u:User {id: $userId})
       MERGE (qs:QuizSession {id: $sessionId})
       ON CREATE SET
         qs.userId = $userId,
         qs.nodeType = $nodeType,
         qs.score = $scoreToStore,
         qs.totalQuestions = $totalQuestionsToStore,
         qs.streak = $streak,
         qs.xpEarned = $xpEarned,
         qs.completedAt = datetime()
       MERGE (u)-[:COMPLETED]->(qs)

       // Update or create QuizProgress
       // First MERGE the QuizProgress node itself
       MERGE (qp:QuizProgress {userId: $userId})
       ON CREATE SET
         qp.totalQuizzes = 1,
         qp.bestStreak = $streak,
         qp.totalXPFromQuiz = $xpEarned,
         qp.commonCompleted = CASE WHEN $nodeType = 'common' THEN 1 ELSE 0 END,
         qp.rareCompleted = CASE WHEN $nodeType = 'rare' THEN 1 ELSE 0 END,
         qp.legendaryCompleted = CASE WHEN $nodeType = 'legendary' THEN 1 ELSE 0 END
       ON MATCH SET
         qp.totalQuizzes = qp.totalQuizzes + 1,
         qp.bestStreak = CASE WHEN $streak > qp.bestStreak THEN $streak ELSE qp.bestStreak END,
         qp.totalXPFromQuiz = qp.totalXPFromQuiz + $xpEarned,
         qp.commonCompleted = qp.commonCompleted + CASE WHEN $nodeType = 'common' THEN 1 ELSE 0 END,
         qp.rareCompleted = qp.rareCompleted + CASE WHEN $nodeType = 'rare' THEN 1 ELSE 0 END,
         qp.legendaryCompleted = qp.legendaryCompleted + CASE WHEN $nodeType = 'legendary' THEN 1 ELSE 0 END

       // Then MERGE the relationship (only create if it doesn't exist)
       MERGE (u)-[:HAS_QUIZ_PROGRESS]->(qp)

       RETURN qp`,
      {
        userId,
        sessionId,
        nodeType,
        scoreToStore,
        totalQuestionsToStore,
        streak,
        xpEarned
      }
    )

    // Update user's XP using existing endpoint
    // Include sessionId in the source to track which session this XP came from
    // This allows us to check for duplicates based on sessionId
    const origin = request.headers.get('origin') || request.headers.get('host') || 'http://localhost:3000'
    const baseUrl = origin.startsWith('http') ? origin : `http://${origin}`
    const xpResponse = await fetch(`${baseUrl}/api/user/xp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        xpGained: xpEarned,
        source: `quiz:${sessionId}` // Include sessionId to track duplicates
      })
    })

    if (!xpResponse.ok) {
      throw new Error('Failed to award XP')
    }

    return NextResponse.json({
      canOpen: true,
      nodeType,
      xpEarned,
      oldXP,
      newXP,
      currentLevel,
      newLevel,
      xpInLevel,
      newXpInLevel,
      percentage: percentage.toFixed(0),
      score: scoreToStore, // Use validated score
      totalQuestions: totalQuestionsToStore // Use validated totalQuestions
    }, { status: 200 })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to submit quiz' },
      { status: 500 }
    )
  } finally {
    await session.close()
  }
}
