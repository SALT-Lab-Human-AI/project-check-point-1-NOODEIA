import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import pusherService from '../../../../../services/pusher.service'

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

    // Notify stop typing via Pusher
    await pusherService.notifyStopTyping(groupId, {
      userId: user.id,
      userEmail: user.email
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error notifying stop typing:', error)
    return NextResponse.json(
      { error: 'Failed to notify stop typing' },
      { status: 500 }
    )
  }
}