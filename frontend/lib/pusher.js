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

export const getPusherClient = () => {
  if (typeof window === 'undefined') return null

  if (!process.env.NEXT_PUBLIC_PUSHER_KEY) return null

  return new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    authEndpoint: '/api/pusher/auth'
  })
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