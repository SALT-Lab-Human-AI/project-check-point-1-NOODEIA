import { NextResponse } from 'next/server'
import { neo4jService } from '@/lib/neo4j'
import neo4j from 'neo4j-driver'
import { v4 as uuidv4 } from 'uuid'

// GET /api/leaderboard-debug?action=test|addxp|check
export async function GET(request) {
  const session = neo4jService.getSession()

  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'test'
    const userId = searchParams.get('userId')

    if (action === 'addxp') {
      // Add test XP to a user
      if (!userId) {
        return NextResponse.json({ error: 'userId required for addxp' }, { status: 400 })
      }

      const xpAmount = parseFloat(searchParams.get('amount') || '10')
      const transactionId = uuidv4()

      // Get current XP
      const currentResult = await session.run(
        `MATCH (u:User {id: $userId}) RETURN COALESCE(u.xp, 0) as currentXp`,
        { userId }
      )

      let newTotalXp = xpAmount
      if (currentResult.records.length > 0) {
        const currentXp = neo4jService.toNumber(currentResult.records[0].get('currentXp'))
        newTotalXp = currentXp + xpAmount
      }

      // Create XP transaction
      const result = await session.run(
        `
        MATCH (u:User {id: $userId})
        SET u.xp = $newTotalXp
        CREATE (xt:XPTransaction {
          id: $transactionId,
          userId: $userId,
          amount: $xpAmount,
          source: 'test',
          createdAt: datetime()
        })
        CREATE (u)-[:EARNED_XP]->(xt)
        RETURN u.id as id, u.xp as xp, xt.createdAt as txTime
        `,
        { userId, newTotalXp, xpAmount, transactionId }
      )

      if (result.records.length > 0) {
        const record = result.records[0]
        return NextResponse.json({
          success: true,
          userId: record.get('id'),
          newXP: neo4jService.toNumber(record.get('xp')),
          transactionTime: record.get('txTime')?.toString()
        })
      }

      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (action === 'check') {
      // Check what XP transactions exist
      const checkQuery = `
        MATCH (u:User)-[:EARNED_XP]->(xt:XPTransaction)
        RETURN u.id as userId, u.name as userName, 
               xt.amount as amount, 
               xt.createdAt as createdAt,
               xt.source as source
        ORDER BY xt.createdAt DESC
        LIMIT 20
      `
      const result = await session.run(checkQuery)
      
      return NextResponse.json({
        totalTransactions: result.records.length,
        transactions: result.records.map(r => ({
          userId: r.get('userId'),
          userName: r.get('userName'),
          amount: neo4jService.toNumber(r.get('amount')),
          createdAt: r.get('createdAt')?.toString(),
          source: r.get('source')
        }))
      })
    }

    // Default: test timeframe calculations
    const timeframe = searchParams.get('timeframe') || 'daily'
    const testUserId = userId || searchParams.get('testUserId')

    // Calculate timeframe start
    const tfQuery = `
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
      WITH COALESCE(dailyStart, weeklyStart, monthlyStart) AS timeframeStart, datetime() as now
      RETURN timeframeStart, now, date().dayOfWeek as dayOfWeek
    `
    const tfResult = await session.run(tfQuery, { timeframe })
    const tfRecord = tfResult.records[0]
    const timeframeStart = tfRecord.get('timeframeStart')
    const now = tfRecord.get('now')

    // Test the actual query
    const testQuery = `
      WITH $timeframeStart AS timeframeStart
      MATCH (u:User)
      OPTIONAL MATCH (u)-[:EARNED_XP]->(xt:XPTransaction)
      WHERE xt.createdAt IS NOT NULL
            AND (
              $timeframe = 'all-time' 
              OR xt.createdAt >= timeframeStart
            )
      WITH u, 
           collect(xt) AS allXPTransactions
      WITH 
        u,
        size(allXPTransactions) AS txCount,
        COALESCE(reduce(total = 0.0, t IN allXPTransactions | total + COALESCE(toFloat(t.amount), 0.0)), 0.0) AS calculatedXP
      WHERE txCount > 0
      RETURN 
        u.id AS userId,
        COALESCE(u.name, u.email, 'Anonymous') AS name,
        calculatedXP AS xp,
        txCount
      ORDER BY calculatedXP DESC
      LIMIT 10
    `

    const testResult = await session.run(testQuery, { timeframe, timeframeStart })

    // If testUserId provided, check that specific user
    let userDetail = null
    if (testUserId) {
      const userQuery = `
        WITH $timeframeStart AS timeframeStart
        MATCH (u:User {id: $userId})
        OPTIONAL MATCH (u)-[:EARNED_XP]->(xt:XPTransaction)
        WHERE xt.createdAt IS NOT NULL
              AND (
                $timeframe = 'all-time' 
                OR xt.createdAt >= timeframeStart
              )
        WITH u, collect(xt) AS allXPTransactions
        RETURN 
          u.id AS userId,
          u.name AS name,
          u.xp AS totalXP,
          size(allXPTransactions) AS txCount,
          [t IN allXPTransactions | {amount: t.amount, createdAt: t.createdAt, source: t.source}] AS transactions,
          COALESCE(reduce(total = 0.0, t IN allXPTransactions | total + COALESCE(toFloat(t.amount), 0.0)), 0.0) AS calculatedXP
      `
      const userResult = await session.run(userQuery, { userId: testUserId, timeframe, timeframeStart })
      if (userResult.records.length > 0) {
        const record = userResult.records[0]
        userDetail = {
          userId: record.get('userId'),
          name: record.get('name'),
          totalXP: neo4jService.toNumber(record.get('totalXP')),
          txCount: neo4jService.toNumber(record.get('txCount')),
          calculatedXP: neo4jService.toNumber(record.get('calculatedXP')),
          transactions: record.get('transactions').map(t => ({
            amount: neo4jService.toNumber(t.amount),
            createdAt: t.createdAt?.toString(),
            source: t.source,
            inTimeframe: t.createdAt >= timeframeStart
          }))
        }
      }
    }

    return NextResponse.json({
      timeframe,
      now: now?.toString(),
      timeframeStart: timeframeStart?.toString(),
      dayOfWeek: neo4jService.toNumber(tfRecord.get('dayOfWeek')),
      topUsers: testResult.records.map(r => ({
        userId: r.get('userId'),
        name: r.get('name'),
        xp: neo4jService.toNumber(r.get('xp')),
        txCount: neo4jService.toNumber(r.get('txCount'))
      })),
      userDetail
    })

  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 })
  } finally {
    await session.close()
  }
}

