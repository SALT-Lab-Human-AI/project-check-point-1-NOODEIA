import Pusher from 'pusher'
import PusherClient from 'pusher-js'

export const pusherServer = process.env.PUSHER_APP_ID ? (() => {
  return new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.NEXT_PUBLIC_PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
    useTLS: true
  })
})() : null

// Store a single instance of the Pusher client
let pusherClientInstance = null

export const getPusherClient = () => {
  if (typeof window === 'undefined') return null

  if (!process.env.NEXT_PUBLIC_PUSHER_KEY) {
    console.error('❌ NEXT_PUBLIC_PUSHER_KEY is not set')
    return null
  }

  // Return existing instance if already created
  if (pusherClientInstance) {
    return pusherClientInstance
  }

  console.log('🔌 Creating Pusher client with key:', process.env.NEXT_PUBLIC_PUSHER_KEY?.slice(0, 8) + '...')
  console.log('🔌 Pusher cluster:', process.env.NEXT_PUBLIC_PUSHER_CLUSTER)

  pusherClientInstance = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    authEndpoint: '/api/pusher/auth'
  })

  // Log connection state changes
  pusherClientInstance.connection.bind('connected', () => {
    console.log('✅ Pusher connected')
  })

  pusherClientInstance.connection.bind('error', (err) => {
    console.error('❌ Pusher connection error:', err)
  })

  pusherClientInstance.connection.bind('failed', () => {
    console.error('❌ Pusher connection failed')
  })

  return pusherClientInstance
}

export const PUSHER_EVENTS = {
  MESSAGE_SENT: 'message:sent',
  MESSAGE_EDITED: 'message:edited',
  MESSAGE_DELETED: 'message:deleted',
  MEMBER_JOINED: 'member:joined',
  MEMBER_LEFT: 'member:left',
  TYPING: 'user:typing',
  STOP_TYPING: 'user:stop-typing'
}