import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import groupChatService from '../../../../../../../services/groupchat.service'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET(request, { params }) {
  try {
    // Await params as required in Next.js 15
    const { messageId } = await params

    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const threadMessages = await groupChatService.getThreadMessages(
      messageId,
      user.id
    )

    return NextResponse.json(threadMessages)
  } catch (error) {
    console.error('Error fetching thread:', error)
    return NextResponse.json(
      { error: 'Failed to fetch thread' },
      { status: 500 }
    )
  }
}