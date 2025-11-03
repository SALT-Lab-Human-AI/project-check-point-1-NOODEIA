import { NextResponse } from 'next/server'
import { neo4jService } from '@/lib/neo4j'

// GET /api/leaderboard?userId=xxx&timeframe=daily|weekly|monthly|all-time&type=xp|accuracy
// Response: { rankings: [{ rank, userId, name, xp, level, accuracy? }], userRank: { rank, userId, name, xp, level, accuracy? }, totalUsers }
export async function GET(request) {
  const session = neo4jService.getSession()

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const timeframe = searchParams.get('timeframe') || 'all-time' // daily, weekly, monthly, all-time
    const type = searchParams.get('type') || 'xp' // xp or accuracy

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      )
    }

    const query = `
      WITH 
        $timeframe AS timeframe,
        $type AS boardType,
        CASE 
          WHEN $timeframe = 'daily' THEN datetime() - duration({days: 1})
          WHEN $timeframe = 'weekly' THEN datetime() - duration({days: 7})
          WHEN $timeframe = 'monthly' THEN datetime() - duration({days: 30})
          ELSE null
        END AS cutoff
      MATCH (u:User)
      OPTIONAL MATCH (u)-[:COMPLETED]->(qs:QuizSession)
      WITH u, boardType, timeframe, cutoff, collect(qs) AS sessions
      WITH 
        u,
        boardType,
        timeframe,
        [s IN sessions WHERE s IS NOT NULL AND (cutoff IS NULL OR (s.completedAt IS NOT NULL AND s.completedAt >= cutoff))] AS timeframeSessions
      WITH 
        u,
        boardType,
        timeframe,
        timeframeSessions,
        [s IN timeframeSessions WHERE s.totalQuestions IS NOT NULL AND toFloat(s.totalQuestions) > 0] AS accuracySessions
      WITH 
        u,
        boardType,
        timeframe,
        timeframeSessions,
        accuracySessions,
        reduce(totalAccuracy = 0.0, s IN accuracySessions | totalAccuracy + ((toFloat(s.score) / toFloat(s.totalQuestions)) * 100.0)) AS totalAccuracy,
        size(accuracySessions) AS accuracyAttempts,
        reduce(timeframeXP = 0.0, s IN timeframeSessions | timeframeXP + COALESCE(s.xpEarned, 0)) AS timeframeXP
      WITH 
        u,
        boardType,
        timeframe,
        accuracyAttempts,
        CASE 
          WHEN accuracyAttempts > 0 THEN totalAccuracy / accuracyAttempts
          ELSE 0.0
        END AS accuracy,
        CASE 
          WHEN timeframe = 'all-time' THEN COALESCE(u.xp, 0)
          ELSE timeframeXP
        END AS leaderboardXP,
        timeframeXP
      RETURN 
        u.id AS userId,
        COALESCE(u.name, u.email, 'Anonymous') AS name,
        leaderboardXP AS xp,
        COALESCE(u.level, 1) AS level,
        accuracy AS accuracy,
        u.iconType AS iconType,
        u.iconEmoji AS iconEmoji,
        u.iconColor AS iconColor,
        timeframeXP AS timeframeXP
      ORDER BY 
        CASE WHEN boardType = 'accuracy' THEN accuracy ELSE leaderboardXP END DESC,
        u.level DESC,
        u.id ASC
    `

    const params = { timeframe, type }

    const rankingsResult = await session.run(query, params)

    const allUsers = rankingsResult.records.map((record, index) => ({
      rank: index + 1,
      userId: record.get('userId'),
      name: record.get('name'),
      xp: neo4jService.toNumber(record.get('xp') || 0),
      level: neo4jService.toNumber(record.get('level')),
      accuracy: type === 'accuracy' ? neo4jService.toNumber(record.get('accuracy') || 0) : undefined,
      iconType: record.get('iconType'),
      iconEmoji: record.get('iconEmoji'),
      iconColor: record.get('iconColor')
    }))

    // Find current user's rank
    const userIndex = allUsers.findIndex(u => u.userId === userId)
    const userRank = userIndex >= 0 ? allUsers[userIndex] : null

    // Always include top 3 (or as many as available)
    const top3 = allUsers.slice(0, Math.min(3, allUsers.length))
    
    // Get top 10 users (which includes top 3)
    const topUsers = allUsers.slice(0, 10)

    // Build rankings: top 3 + remaining top 10 + user context if needed
    let rankings = [...topUsers]
    
    // If user is not in top 10, include them in the response with context
    if (userRank && userIndex >= 10) {
      // Add user with context (2 users before and after)
      const startIndex = Math.max(0, userIndex - 2)
      const endIndex = Math.min(allUsers.length, userIndex + 3)
      const userContext = allUsers.slice(startIndex, endIndex)
      
      // Filter out users already in top 10 to avoid duplicates
      const topUserIds = new Set(topUsers.map(u => u.userId))
      const uniqueContext = userContext.filter(u => !topUserIds.has(u.userId))
      
      rankings = [...topUsers, ...uniqueContext]
    }
    
    // Ensure top 3 are always first (in case of any filtering issues)
    const top3Ids = new Set(top3.map(u => u.userId))
    const withoutTop3 = rankings.filter(u => !top3Ids.has(u.userId))
    rankings = [...top3, ...withoutTop3]

    return NextResponse.json({
      rankings: rankings,
      userRank: userRank,
      totalUsers: allUsers.length,
      timeframe: timeframe,
      type: type
    }, { status: 200 })

  } catch (error) {
    console.error('Leaderboard fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  } finally {
    await session.close()
  }
}
