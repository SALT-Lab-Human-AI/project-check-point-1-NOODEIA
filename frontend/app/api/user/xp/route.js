import { NextResponse } from "next/server"
import neo4j from "neo4j-driver"
import { v4 as uuidv4 } from "uuid"
import { getLevelFromXP } from "../../../../utils/levelingSystem"

// Initialize Neo4j driver
const driver = neo4j.driver(
  process.env.NEXT_PUBLIC_NEO4J_URI,
  neo4j.auth.basic(
    process.env.NEXT_PUBLIC_NEO4J_USERNAME,
    process.env.NEXT_PUBLIC_NEO4J_PASSWORD
  ),
  { disableLosslessIntegers: true }
)

export async function POST(request) {
  const session = driver.session()

  try {
    // Get the user ID from the request body or auth
    const { userId, xpGained, source } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    if (!xpGained || xpGained < 0) {
      return NextResponse.json(
        { error: "Valid XP amount is required" },
        { status: 400 }
      )
    }

    // Default source if not provided
    const xpSource = source || 'unknown'

    // First get current XP
    const currentResult = await session.run(
      `
      MATCH (u:User {id: $userId})
      RETURN COALESCE(u.xp, 0) as currentXp
      `,
      { userId }
    )

    let newTotalXp = xpGained
    if (currentResult.records.length > 0) {
      const currentXp = currentResult.records[0].get('currentXp')
      newTotalXp = currentXp + xpGained
    }

    // Calculate new level based on total XP
    const newLevel = getLevelFromXP(newTotalXp)

    // Update user's XP and level, and create XP transaction record with timestamp
    const transactionId = uuidv4()
    const result = await session.run(
      `
      MATCH (u:User {id: $userId})
      SET u.xp = $newTotalXp,
          u.level = $newLevel
      CREATE (xt:XPTransaction {
        id: $transactionId,
        userId: $userId,
        amount: $xpGained,
        source: $xpSource,
        createdAt: datetime()
      })
      CREATE (u)-[:EARNED_XP]->(xt)
      RETURN u.id as id, u.xp as xp, u.level as level
      `,
      { userId, newTotalXp, newLevel: neo4j.int(newLevel), xpGained, xpSource, transactionId }
    )

    if (result.records.length === 0) {
      // User doesn't exist, create them with initial XP
      const initialLevel = getLevelFromXP(xpGained)
      const transactionId = uuidv4()
      const createResult = await session.run(
        `
        CREATE (u:User {
          id: $userId,
          xp: $xpGained,
          level: $level,
          createdAt: datetime()
        })
        CREATE (xt:XPTransaction {
          id: $transactionId,
          userId: $userId,
          amount: $xpGained,
          source: $xpSource,
          createdAt: datetime()
        })
        CREATE (u)-[:EARNED_XP]->(xt)
        RETURN u.id as id, u.xp as xp, u.level as level
        `,
        { userId, xpGained, level: neo4j.int(initialLevel), xpSource, transactionId }
      )

      const record = createResult.records[0]
      return NextResponse.json({
        id: record.get('id'),
        xp: record.get('xp'),
        level: record.get('level'),
        xpGained
      })
    }

    const record = result.records[0]
    return NextResponse.json({
      id: record.get('id'),
      xp: record.get('xp'),
      level: record.get('level'),
      xpGained
    })

  } catch (error) {
    console.error("Error updating XP:", error)
    return NextResponse.json(
      { error: "Failed to update XP" },
      { status: 500 }
    )
  } finally {
    await session.close()
  }
}

export async function GET(request) {
  const session = driver.session()

  try {
    // Get userId from query params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Get user's current XP and level
    const result = await session.run(
      `
      MATCH (u:User {id: $userId})
      RETURN u.id as id,
             COALESCE(u.xp, 0) as xp,
             COALESCE(u.level, 1) as level,
             u.name as name,
             u.email as email
      `,
      { userId }
    )

    if (result.records.length === 0) {
      return NextResponse.json({
        id: userId,
        xp: 0,
        level: 1
      })
    }

    const record = result.records[0]
    return NextResponse.json({
      id: record.get('id'),
      xp: record.get('xp'),
      level: record.get('level'),
      name: record.get('name'),
      email: record.get('email')
    })

  } catch (error) {
    console.error("Error fetching XP:", error)
    return NextResponse.json(
      { error: "Failed to fetch XP" },
      { status: 500 }
    )
  } finally {
    await session.close()
  }
}