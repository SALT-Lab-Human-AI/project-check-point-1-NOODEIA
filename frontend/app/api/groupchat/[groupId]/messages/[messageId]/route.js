import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import groupChatService from '../../../../../../services/groupchat.service'
import pusherService from '../../../../../../services/pusher.service'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function PUT(request, { params }) {
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
    const { content } = body

    if (!content) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      )
    }

    const result = await groupChatService.editMessage(
      params.messageId,
      user.id,
      content
    )

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    await pusherService.editMessage(params.groupId, params.messageId, content)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error editing message:', error)
    return NextResponse.json(
      { error: 'Failed to edit message' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
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

    const result = await groupChatService.deleteMessage(params.messageId, user.id)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    await pusherService.deleteMessage(params.groupId, params.messageId)

    return NextResponse.json({ message: 'Message deleted successfully' })
  } catch (error) {
    console.error('Error deleting message:', error)
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    )
  }
}