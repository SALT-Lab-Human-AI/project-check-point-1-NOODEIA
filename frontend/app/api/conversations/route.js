import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { userId, title } = await request.json()

    if (!userId || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const conversation = await prisma.conversation.create({
      data: {
        userId,
        title,
      },
    })

    return NextResponse.json(conversation)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const conversations = await prisma.conversation.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(conversations)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}