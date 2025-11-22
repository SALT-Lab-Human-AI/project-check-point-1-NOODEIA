import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import groupChatService from '../../../../services/groupchat.service'
import pusherService from '../../../../services/pusher.service'

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
    const { accessKey } = body

    if (!accessKey) {
      return NextResponse.json(
        { error: 'Access key is required' },
        { status: 400 }
      )
    }

    const result = await groupChatService.joinGroupChat(user.id, accessKey)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    await pusherService.notifyMemberJoined(result.id, {
      id: user.id,
      email: user.email
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error joining group chat:', error)
    return NextResponse.json(
      { error: 'Failed to join group chat' },
      { status: 500 }
    )
  }
}