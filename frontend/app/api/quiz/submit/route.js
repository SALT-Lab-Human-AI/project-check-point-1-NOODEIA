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

    if (!userId || !sessionId || score === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate percentage
    const percentage = (score / totalQuestions) * 100

    // Debug: Check types and values
    console.log('🔍 LEGENDARY NODE DEBUG:')
    console.log('  score:', score, '| type:', typeof score)
    console.log('  totalQuestions:', totalQuestions, '| type:', typeof totalQuestions)
    console.log('  score === totalQuestions?', score === totalQuestions)
    console.log('  score == totalQuestions?', score == totalQuestions)

    // Determine node type based on performance
    // Check exact 100% first (score === totalQuestions) to avoid any floating point issues
    let nodeType = 'common'
    if (score === totalQuestions) {
      // Perfect score - 100% accuracy
      nodeType = 'legendary'
      console.log('  ✅ LEGENDARY assigned!')
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

    // Get user's current XP
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

    // Save QuizSession to Neo4j
    await session.run(
      `MATCH (u:User {id: $userId})
       CREATE (qs:QuizSession {
         id: $sessionId,
         userId: $userId,
         nodeType: $nodeType,
         score: $score,
         totalQuestions: $totalQuestions,
         streak: $streak,
         xpEarned: $xpEarned,
         completedAt: datetime()
       })
       CREATE (u)-[:COMPLETED]->(qs)

       // Update or create QuizProgress
       MERGE (u)-[:HAS_QUIZ_PROGRESS]->(qp:QuizProgress {userId: $userId})
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

       RETURN qp`,
      {
        userId,
        sessionId,
        nodeType,
        score,
        totalQuestions,
        streak,
        xpEarned
      }
    )

    // Update user's XP using existing endpoint
    await fetch(`${request.headers.get('origin')}/api/user/xp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        xpGained: xpEarned
      })
    })

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
      score,
      totalQuestions
    }, { status: 200 })

  } catch (error) {
    console.error('Quiz submit error:', error)
    return NextResponse.json(
      { error: 'Failed to submit quiz' },
      { status: 500 }
    )
  } finally {
    await session.close()
  }
}
