import { pusherServer, PUSHER_EVENTS } from '../lib/pusher'

class PusherService {
  constructor() {
    this.pusher = pusherServer
  }

  async sendMessage(groupId, message) {
    if (!this.pusher) {
      console.error('❌ Pusher not initialized!')
      return
    }

    try {
      console.log('📤 Broadcasting message via Pusher:', {
        channel: `group-${groupId}`,
        messageId: message.id,
        createdBy: message.createdBy,
        hasParentId: !!message.parentId
      })

      await this.pusher.trigger(
        `group-${groupId}`,
        PUSHER_EVENTS.MESSAGE_SENT,
        message
      )

      console.log('✅ Pusher broadcast successful')
    } catch (error) {
      console.error('❌ Failed to send message via Pusher:', error)
    }
  }

  async editMessage(groupId, messageId, newContent) {
    if (!this.pusher) return

    try {
      await this.pusher.trigger(
        `group-${groupId}`,
        PUSHER_EVENTS.MESSAGE_EDITED,
        { messageId, newContent }
      )
    } catch (error) {
      console.error('Failed to edit message via Pusher:', error)
    }
  }

  async deleteMessage(groupId, messageId) {
    if (!this.pusher) return

    try {
      await this.pusher.trigger(
        `group-${groupId}`,
        PUSHER_EVENTS.MESSAGE_DELETED,
        { messageId }
      )
    } catch (error) {
      console.error('Failed to delete message via Pusher:', error)
    }
  }

  async notifyMemberJoined(groupId, user) {
    if (!this.pusher) return

    try {
      await this.pusher.trigger(
        `group-${groupId}`,
        PUSHER_EVENTS.MEMBER_JOINED,
        { userId: user.id, userEmail: user.email }
      )
    } catch (error) {
      console.error('Failed to notify member joined:', error)
    }
  }

  async notifyMemberLeft(groupId, userId) {
    if (!this.pusher) return

    try {
      await this.pusher.trigger(
        `group-${groupId}`,
        PUSHER_EVENTS.MEMBER_LEFT,
        { userId }
      )
    } catch (error) {
      console.error('Failed to notify member left:', error)
    }
  }

  async notifyTyping(groupId, userId, userName) {
    if (!this.pusher) return

    try {
      await this.pusher.trigger(
        `group-${groupId}`,
        PUSHER_EVENTS.TYPING,
        { userId, userName }
      )
    } catch (error) {
      console.error('Failed to notify typing:', error)
    }
  }

  async notifyStopTyping(groupId, userId) {
    if (!this.pusher) return

    try {
      await this.pusher.trigger(
        `group-${groupId}`,
        PUSHER_EVENTS.STOP_TYPING,
        { userId }
      )
    } catch (error) {
      console.error('Failed to notify stop typing:', error)
    }
  }

  async authenticateUser(socketId, channel, userId) {
    if (!this.pusher) {
      throw new Error('Pusher not configured')
    }

    const authResponse = this.pusher.authorizeChannel(socketId, channel, {
      user_id: userId,
      user_info: {}
    })

    return authResponse
  }
}

export default new PusherService()