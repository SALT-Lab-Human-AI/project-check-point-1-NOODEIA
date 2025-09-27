import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request, { params }) {
  try {
    const { id } = params
    const { role, content } = await request.json()

    if (!role || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const message = await prisma.message.create({
      data: {
        conversationId: id,
        role,
        content,
      },
    })

    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json(message)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
  }
}