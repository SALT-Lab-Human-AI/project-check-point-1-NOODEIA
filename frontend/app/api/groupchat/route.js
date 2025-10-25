import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import groupChatService from '../../../services/groupchat.service'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET(request) {
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

    const groupChats = await groupChatService.getGroupChats(user.id)
    return NextResponse.json(groupChats)
  } catch (error) {
    console.error('Error fetching group chats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch group chats' },
      { status: 500 }
    )
  }
}

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
    const { name, description, accessKey } = body

    if (!name || !accessKey) {
      return NextResponse.json(
        { error: 'Name and access key are required' },
        { status: 400 }
      )
    }

    const groupChat = await groupChatService.createGroupChat(
      name,
      description,
      accessKey,
      user.id
    )

    return NextResponse.json(groupChat, { status: 201 })
  } catch (error) {
    console.error('Error creating group chat:', error)
    return NextResponse.json(
      { error: 'Failed to create group chat' },
      { status: 500 }
    )
  }
}