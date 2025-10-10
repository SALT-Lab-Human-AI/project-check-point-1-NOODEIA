import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import pusherService from '../../../../services/pusher.service'
import neo4jClient from '../../../../lib/neo4j'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { groupId } = body

    if (!groupId) {
      return NextResponse.json(
        { error: 'Group ID is required' },
        { status: 400 }
      )
    }

    // Get user name from Neo4j
    const session = neo4jClient.getSession()
    let userName = user.email
    try {
      const result = await session.run(
        `MATCH (u:User {id: $userId})
         RETURN u.name as name, u.email as email`,
        { userId: user.id }
      )
      if (result.records.length > 0) {
        userName = result.records[0].get('name') || result.records[0].get('email')
      }
    } finally {
      await session.close()
    }

    // Notify typing via Pusher with user name
    await pusherService.notifyTyping(groupId, user.id, userName)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error notifying typing:', error)
    return NextResponse.json(
      { error: 'Failed to notify typing' },
      { status: 500 }
    )
  }
}