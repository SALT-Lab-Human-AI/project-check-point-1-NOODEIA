import { createClient } from '@supabase/supabase-js'
import { neo4jDataService } from '../../../../services/neo4j.service'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET(request) {
  try {
    // Get userId from query params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get user profile from Neo4j
    const userProfile = await neo4jDataService.getUserById(userId)

    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(userProfile)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    // Parse request body first
    const body = await request.json()
    const { iconType, iconEmoji, iconColor, userId: providedUserId } = body

    // Try to get userId from the request body (if provided by frontend)
    let userId = providedUserId

    if (!userId) {
      // Get auth header if available
      const authHeader = request.headers.get('authorization')

      if (authHeader) {
        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error } = await supabase.auth.getUser(token)

        if (error || !user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        userId = user.id
      }
    }

    // If still no userId, return error
    if (!userId) {
      console.error('No user ID found in request')
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Prepare updates object
    const updates = {}
    if (iconType !== undefined) updates.iconType = iconType
    if (iconEmoji !== undefined) updates.iconEmoji = iconEmoji
    if (iconColor !== undefined) updates.iconColor = iconColor

    console.log('Updating user profile:', { userId, updates })

    // Update user profile in Neo4j
    try {
      const updatedUser = await neo4jDataService.updateUser(userId, updates)

      if (!updatedUser) {
        console.error('No user returned from updateUser')
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
      }

      console.log('User updated successfully:', updatedUser)
      return NextResponse.json(updatedUser)
    } catch (dbError) {
      console.error('Database error updating user:', dbError)
      return NextResponse.json({
        error: 'Database error',
        details: dbError.message
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in PATCH /api/user/profile:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}