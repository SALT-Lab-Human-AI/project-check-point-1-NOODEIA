import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
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
    const { socket_id, channel_name } = body

    if (channel_name.startsWith('private-group-')) {
      const groupId = channel_name.replace('private-group-', '')

      const groupChatService = (await import('../../../../services/groupchat.service')).default
      const groupChat = await groupChatService.getGroupChat(groupId, user.id)

      if (!groupChat) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
      }
    }

    const authResponse = await pusherService.authenticateUser(
      socket_id,
      channel_name,
      user.id
    )

    return NextResponse.json(authResponse)
  } catch (error) {
    console.error('Error authenticating Pusher:', error)
    return NextResponse.json(
      { error: 'Failed to authenticate' },
      { status: 500 }
    )
  }
}