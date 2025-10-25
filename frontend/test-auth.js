const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://wwuhgudenirecbvlraya.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3dWhndWRlbmlyZWNidmxyYXlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1Mzk4MTMsImV4cCI6MjA3NTExNTgxM30.ZBgiIxuZ3qPzW6JDmAcFSyyMUuA0_zLV5k4iWN5DJrQ'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAuth() {
  console.log('Testing Supabase authentication...')

  // Test with a sample account
  const email = 'test@example.com'
  const password = 'testpassword123'

  console.log(`\nAttempting to sign in with email: ${email}`)

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) {
      console.log('\nSign in failed with error:')
      console.log('Error code:', error.status)
      console.log('Error message:', error.message)
      console.log('Full error:', error)

      // Try to create the account if it doesn't exist
      if (error.message.includes('Invalid login credentials')) {
        console.log('\nAccount might not exist. Attempting to create it...')
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: email,
          password: password,
        })

        if (signUpError) {
          console.log('Sign up also failed:', signUpError.message)
        } else {
          console.log('Account created successfully!')
          console.log('User ID:', signUpData.user?.id)
          console.log('Email:', signUpData.user?.email)
        }
      }
    } else {
      console.log('\nSign in successful!')
      console.log('User ID:', data.user?.id)
      console.log('Email:', data.user?.email)
      console.log('Session token exists:', !!data.session?.access_token)
    }

    // Test getting current session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionData?.session) {
      console.log('\nCurrent session exists:')
      console.log('User:', sessionData.session.user?.email)
    } else {
      console.log('\nNo active session found')
    }

  } catch (err) {
    console.log('\nUnexpected error:', err)
  }

  process.exit(0)
}

testAuth()