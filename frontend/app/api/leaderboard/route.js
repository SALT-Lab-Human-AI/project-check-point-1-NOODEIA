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

    // Query pattern matches administrator dashboard - use rolling windows for time-based filters
    // Daily: last 24 hours (rolling window, timezone-agnostic)
    // Weekly: last 7 days (rolling window)
    // Monthly: first of current month in UTC
    const query = `
      MATCH (u:User)
      OPTIONAL MATCH (u)-[:COMPLETED]->(qs:QuizSession)
      WHERE qs IS NULL 
         OR (qs.completedAt IS NOT NULL 
             AND qs.totalQuestions IS NOT NULL 
             AND toInteger(qs.totalQuestions) > 0
             AND (
               $timeframe = 'all-time' 
               OR ($timeframe = 'daily' AND qs.completedAt >= datetime() - duration({hours: 24}))
               OR ($timeframe = 'weekly' AND qs.completedAt >= datetime() - duration({days: 7}))
               OR ($timeframe = 'monthly' AND qs.completedAt >= datetime({year: date().year, month: date().month, day: 1, hour: 0, minute: 0, second: 0}))
             ))
      WITH u, $timeframe AS timeframe, $type AS boardType, qs
      WITH 
        u,
        timeframe,
        boardType,
        [s IN collect(qs) WHERE s IS NOT NULL] AS timeframeSessions
      WITH 
        u,
        timeframe,
        boardType,
        size(timeframeSessions) AS attemptCount,
        COALESCE(toInteger(u.xp), 0) AS leaderboardXP
      WHERE 
        (timeframe = 'all-time' AND leaderboardXP > 0)
        OR (timeframe <> 'all-time' AND attemptCount > 0)
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
    
    console.log('🔍 Leaderboard Query Params:', params)

    // Enhanced debug query - check rolling 24h window
    if (timeframe === 'daily') {
      const debugQuery = `
        MATCH (u:User {id: $userId})-[:COMPLETED]->(qs:QuizSession)
        WHERE qs.completedAt IS NOT NULL
        WITH qs, datetime() - duration({hours: 24}) AS cutoff24h
        RETURN 
          qs.completedAt as completedAt,
          cutoff24h,
          qs.completedAt >= cutoff24h as isWithin24h,
          qs.xpEarned as xpEarned,
          qs.totalQuestions as totalQuestions,
          qs.id as sessionId
        ORDER BY qs.completedAt DESC
        LIMIT 10
      `
      const debugResult = await session.run(debugQuery, { userId })
      console.log('🔍 Daily Debug - Rolling 24h Window:', {
        userId,
        totalSessions: debugResult.records.length,
        sessions: debugResult.records.map(r => ({
          sessionId: r.get('sessionId'),
          completedAt: r.get('completedAt')?.toString(),
          cutoff24h: r.get('cutoff24h')?.toString(),
          isWithin24h: r.get('isWithin24h'),
          xpEarned: neo4jService.toNumber(r.get('xpEarned')),
          totalQuestions: neo4jService.toNumber(r.get('totalQuestions'))
        }))
      })

      // Test the exact query pattern used in main query
      const userCheckQuery = `
        MATCH (u:User {id: $userId})
        OPTIONAL MATCH (u)-[:COMPLETED]->(qs:QuizSession)
        WHERE qs IS NULL 
           OR (qs.completedAt IS NOT NULL 
               AND qs.totalQuestions IS NOT NULL 
               AND toInteger(qs.totalQuestions) > 0
               AND qs.completedAt >= datetime() - duration({hours: 24}))
        WITH u, [s IN collect(qs) WHERE s IS NOT NULL] AS timeframeSessions
        RETURN 
          u.id AS userId,
          size(timeframeSessions) AS attemptCount,
          COALESCE(toInteger(u.xp), 0) AS leaderboardXP
      `
      const userCheckResult = await session.run(userCheckQuery, { userId })
      if (userCheckResult.records.length > 0) {
        const record = userCheckResult.records[0]
        console.log('🔍 Daily Debug - User Query Result (24h rolling window):', {
          userId: record.get('userId'),
          attemptCount: neo4jService.toNumber(record.get('attemptCount')),
          leaderboardXP: neo4jService.toNumber(record.get('leaderboardXP'))
        })
      }
    }

    const rankingsResult = await session.run(query, params)
    
    console.log('📊 Leaderboard Results:', {
      timeframe,
      type,
      totalUsers: rankingsResult.records.length,
      sampleUser: rankingsResult.records[0] ? {
        userId: rankingsResult.records[0].get('userId'),
        xp: rankingsResult.records[0].get('xp'),
        attempts: rankingsResult.records[0].get('attempts')
      } : null
    })

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
