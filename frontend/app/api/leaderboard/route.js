import { NextResponse } from 'next/server'
import { neo4jService } from '@/lib/neo4j'

// GET /api/leaderboard?userId=xxx&timeframe=daily|weekly|monthly|all-time&type=xp|attempts
// Response: { rankings: [{ rank, userId, name, xp, level, attempts? }], userRank: { rank, userId, name, xp, level, attempts? }, totalUsers }
export async function GET(request) {
  const session = neo4jService.getSession()

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const timeframe = searchParams.get('timeframe') || 'all-time' // daily, weekly, monthly, all-time
    const rawType = searchParams.get('type') || 'xp'
    const type = rawType === 'accuracy' ? 'attempts' : rawType // xp or attempts

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      )
    }

    const query = `
      WITH 
           CASE WHEN $timeframe = 'daily' 
                THEN datetime({year: date().year, month: date().month, day: date().day, hour: 0, minute: 0, second: 0})
                ELSE null END AS dailyStart,
           CASE WHEN $timeframe = 'weekly'
                THEN datetime({year: date().year, month: date().month, day: date().day, hour: 0, minute: 0, second: 0}) 
                     - duration({days: CASE WHEN date().dayOfWeek = 7 THEN 0 ELSE date().dayOfWeek END})
                ELSE null END AS weeklyStart,
           CASE WHEN $timeframe = 'monthly'
                THEN datetime({year: date().year, month: date().month, day: 1, hour: 0, minute: 0, second: 0})
                ELSE null END AS monthlyStart
      WITH COALESCE(dailyStart, weeklyStart, monthlyStart) AS timeframeStart
      MATCH (u:User)
      WITH u, timeframeStart, $timeframe AS timeframe, $type AS boardType
      OPTIONAL MATCH (u)-[:COMPLETED]->(qs:QuizSession)
      WHERE qs.completedAt IS NOT NULL 
            AND qs.totalQuestions IS NOT NULL 
            AND toInteger(qs.totalQuestions) > 0
      WITH u, timeframe, boardType, timeframeStart, collect(DISTINCT qs) AS allQuizSessions
      OPTIONAL MATCH (u)-[:EARNED_XP]->(xt:XPTransaction)
      WHERE xt.createdAt IS NOT NULL
      WITH u, timeframe, boardType, timeframeStart, allQuizSessions, collect(DISTINCT xt) AS allXPTransactions
      WITH 
        u,
        timeframe,
        boardType,
        [s IN allQuizSessions WHERE s IS NOT NULL 
              AND ($timeframe = 'all-time' OR (timeframeStart IS NOT NULL AND s.completedAt >= timeframeStart))] AS timeframeSessions,
        [t IN allXPTransactions WHERE t IS NOT NULL 
              AND ($timeframe = 'all-time' OR (timeframeStart IS NOT NULL AND t.createdAt >= timeframeStart))] AS timeframeTransactions
      WITH 
        u,
        timeframe,
        boardType,
        timeframeSessions,
        timeframeTransactions,
        size(timeframeSessions) AS attemptCount,
        size(timeframeTransactions) AS txCount
      WITH 
        u,
        timeframe,
        boardType,
        attemptCount,
        txCount,
        timeframeTransactions,
        CASE 
          WHEN timeframe = 'all-time' AND u.xp IS NOT NULL AND toFloat(u.xp) > 0 THEN toFloat(u.xp)
          ELSE COALESCE(reduce(total = 0.0, t IN timeframeTransactions | total + COALESCE(toFloat(t.amount), 0.0)), 0.0)
        END AS leaderboardXP
      WHERE 
        (timeframe = 'all-time' AND leaderboardXP > 0)
        OR (timeframe <> 'all-time' AND (attemptCount > 0 OR txCount > 0))
      RETURN 
        u.id AS userId,
        COALESCE(u.name, u.email, 'Anonymous') AS name,
        leaderboardXP AS xp,
        COALESCE(toInteger(u.level), 1) AS level,
        attemptCount AS attempts,
        u.iconType AS iconType,
        u.iconEmoji AS iconEmoji,
        u.iconColor AS iconColor
      ORDER BY 
        CASE WHEN boardType = 'attempts' THEN attemptCount ELSE leaderboardXP END DESC,
        level DESC,
        userId ASC
    `

    const params = { timeframe, type }

    const rankingsResult = await session.run(query, params)

    const allUsers = rankingsResult.records.map((record, index) => ({
      rank: index + 1,
      userId: record.get('userId'),
      name: record.get('name'),
      xp: neo4jService.toNumber(record.get('xp') || 0),
      level: neo4jService.toNumber(record.get('level')),
      attempts: neo4jService.toNumber(record.get('attempts') || 0),
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
