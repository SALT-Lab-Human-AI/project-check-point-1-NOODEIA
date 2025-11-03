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

    let query
    let params = { timeframe }
    
    if (type === 'accuracy') {
      // Accuracy-based leaderboard: Calculate overall quiz accuracy
      // Overall accuracy = (sum of scores) / (sum of total questions) * 100
      query = `WITH CASE 
          WHEN $timeframe = 'daily' THEN datetime() - duration({days: 1})
          WHEN $timeframe = 'weekly' THEN datetime() - duration({days: 7})
          WHEN $timeframe = 'monthly' THEN datetime() - duration({days: 30})
          ELSE null
        END AS cutoff
        MATCH (u:User)
        OPTIONAL MATCH (u)-[:COMPLETED]->(qs:QuizSession)
        WITH u, cutoff,
             sum(CASE 
               WHEN qs IS NULL OR qs.totalQuestions IS NULL OR qs.totalQuestions <= 0 THEN 0.0
               WHEN cutoff IS NULL THEN toFloat(qs.score)
               WHEN qs.completedAt IS NOT NULL AND qs.completedAt >= cutoff THEN toFloat(qs.score)
               ELSE 0.0
             END) AS totalScore,
             sum(CASE 
               WHEN qs IS NULL OR qs.totalQuestions IS NULL OR qs.totalQuestions <= 0 THEN 0.0
               WHEN cutoff IS NULL THEN toFloat(qs.totalQuestions)
               WHEN qs.completedAt IS NOT NULL AND qs.completedAt >= cutoff THEN toFloat(qs.totalQuestions)
               ELSE 0.0
             END) AS totalQuestions
        WITH u,
             CASE 
               WHEN totalQuestions > 0 
               THEN (totalScore / totalQuestions) * 100.0
               ELSE 0.0
             END AS overallAccuracy
        RETURN u.id AS userId,
               COALESCE(u.name, u.email, 'Anonymous') AS name,
               overallAccuracy AS accuracy,
               COALESCE(u.xp, 0) AS xp,
               COALESCE(u.level, 1) AS level,
               u.iconType AS iconType,
               u.iconEmoji AS iconEmoji,
               u.iconColor AS iconColor
        ORDER BY overallAccuracy DESC, u.level DESC, u.id ASC`
    } else {
      // XP-based leaderboard (existing logic)
      if (timeframe === 'all-time') {
        query = `MATCH (u:User)
         WHERE u.xp IS NOT NULL
         RETURN u.id as userId,
                COALESCE(u.name, u.email, 'Anonymous') as name,
                COALESCE(u.xp, 0) as xp,
                COALESCE(u.level, 1) as level,
                u.iconType as iconType,
                u.iconEmoji as iconEmoji,
                u.iconColor as iconColor
         ORDER BY u.xp DESC, u.level DESC, u.id ASC`
      } else {
        // Calculate XP earned within timeframe from QuizSession nodes
        // Use duration-based filtering like admin page - past day/week/month
        // Show all users, even if they have 0 XP in the timeframe
        query = `WITH CASE 
          WHEN $timeframe = 'daily' THEN datetime() - duration({days: 1})
          WHEN $timeframe = 'weekly' THEN datetime() - duration({days: 7})
          WHEN $timeframe = 'monthly' THEN datetime() - duration({days: 30})
          ELSE null
        END AS cutoff
        MATCH (u:User)
        OPTIONAL MATCH (u)-[:COMPLETED]->(qs:QuizSession)
        WITH u, cutoff,
             sum(CASE 
               WHEN qs IS NULL THEN 0
               WHEN cutoff IS NULL THEN COALESCE(qs.xpEarned, 0)
               WHEN qs.completedAt IS NOT NULL AND qs.completedAt >= cutoff THEN COALESCE(qs.xpEarned, 0)
               ELSE 0
             END) AS earnedXP
        WITH u, CASE 
                  WHEN cutoff IS NULL THEN COALESCE(u.xp, 0)
                  ELSE COALESCE(earnedXP, 0)
                END AS leaderboardXP
        RETURN u.id AS userId,
               COALESCE(u.name, u.email, 'Anonymous') AS name,
               leaderboardXP AS xp,
               COALESCE(u.level, 1) AS level,
               u.iconType AS iconType,
               u.iconEmoji AS iconEmoji,
               u.iconColor AS iconColor
        ORDER BY leaderboardXP DESC, u.level DESC, u.id ASC`
        params = { timeframe }
      }
    }

    const rankingsResult = await session.run(query, params)

    const allUsers = rankingsResult.records.map((record, index) => ({
      rank: index + 1,
      userId: record.get('userId'),
      name: record.get('name'),
      xp: type === 'accuracy' ? neo4jService.toNumber(record.get('xp') || 0) : neo4jService.toNumber(record.get('xp')),
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
