import { NextResponse } from 'next/server'
import { neo4jService } from '@/lib/neo4j'

// GET /api/achievements?userId=xxx
// Response: { stats, recentSessions }
export async function GET(request) {
  const session = neo4jService.getSession()

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      )
    }

    // Get quiz progress stats
    const statsResult = await session.run(
      `MATCH (u:User {id: $userId})
       OPTIONAL MATCH (u)-[:HAS_QUIZ_PROGRESS]->(qp:QuizProgress)
       OPTIONAL MATCH (u)-[:COMPLETED]->(qs:QuizSession)
       WITH u, qp,
            count(qs) as totalSessions,
            sum(qs.xpEarned) as totalXPEarned
       RETURN
         COALESCE(qp.totalQuizzes, 0) as totalQuizzes,
         COALESCE(qp.bestStreak, 0) as bestStreak,
         COALESCE(qp.totalXPFromQuiz, 0) as totalXPFromQuiz,
         COALESCE(qp.commonCompleted, 0) as commonCompleted,
         COALESCE(qp.rareCompleted, 0) as rareCompleted,
         COALESCE(qp.legendaryCompleted, 0) as legendaryCompleted,
         COALESCE(u.xp, 0) as currentXP,
         COALESCE(u.level, 1) as currentLevel`,
      { userId }
    )

    const stats = statsResult.records[0] ? {
      totalQuizzes: neo4jService.toNumber(statsResult.records[0].get('totalQuizzes')),
      bestStreak: neo4jService.toNumber(statsResult.records[0].get('bestStreak')),
      totalXPFromQuiz: neo4jService.toNumber(statsResult.records[0].get('totalXPFromQuiz')),
      commonCompleted: neo4jService.toNumber(statsResult.records[0].get('commonCompleted')),
      rareCompleted: neo4jService.toNumber(statsResult.records[0].get('rareCompleted')),
      legendaryCompleted: neo4jService.toNumber(statsResult.records[0].get('legendaryCompleted')),
      currentXP: neo4jService.toNumber(statsResult.records[0].get('currentXP')),
      currentLevel: neo4jService.toNumber(statsResult.records[0].get('currentLevel'))
    } : {
      totalQuizzes: 0,
      bestStreak: 0,
      totalXPFromQuiz: 0,
      commonCompleted: 0,
      rareCompleted: 0,
      legendaryCompleted: 0,
      currentXP: 0,
      currentLevel: 1
    }

    // Get recent quiz sessions
    const sessionsResult = await session.run(
      `MATCH (u:User {id: $userId})-[:COMPLETED]->(qs:QuizSession)
       RETURN qs.id as id,
              qs.nodeType as nodeType,
              qs.score as score,
              qs.totalQuestions as totalQuestions,
              qs.streak as streak,
              qs.xpEarned as xpEarned,
              qs.completedAt as completedAt
       ORDER BY qs.completedAt DESC
       LIMIT 10`,
      { userId }
    )

    const recentSessions = sessionsResult.records.map(record => ({
      id: record.get('id'),
      nodeType: record.get('nodeType'),
      score: neo4jService.toNumber(record.get('score')),
      totalQuestions: neo4jService.toNumber(record.get('totalQuestions')),
      streak: neo4jService.toNumber(record.get('streak')),
      xpEarned: neo4jService.toNumber(record.get('xpEarned')),
      completedAt: record.get('completedAt')?.toStandardDate?.() || record.get('completedAt')
    }))

    return NextResponse.json({
      stats,
      recentSessions
    }, { status: 200 })

  } catch (error) {
    console.error('Achievements fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    )
  } finally {
    await session.close()
  }
}
