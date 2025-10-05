import { v4 as uuidv4 } from 'uuid'
import neo4jClient from '../lib/neo4j'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

class GroupChatService {
  // Group Chat Management
  async createGroupChat(name, description, accessKey, createdBy) {
    const session = neo4jClient.getSession()
    try {
      const groupId = uuidv4()
      const result = await session.run(
        `
        MATCH (u:User {id: $userId})
        CREATE (g:GroupChat {
          id: $groupId,
          name: $name,
          description: $description,
          accessKey: $accessKey,
          createdAt: datetime(),
          createdBy: $createdBy
        })
        CREATE (u)-[:MEMBER_OF {joinedAt: datetime(), role: 'admin'}]->(g)
        RETURN g
        `,
        {
          groupId,
          name,
          description,
          accessKey,
          createdBy,
          userId: createdBy
        }
      )
      return result.records[0]?.get('g').properties
    } finally {
      await session.close()
    }
  }

  async joinGroupChat(userId, accessKey) {
    const session = neo4jClient.getSession()
    try {
      const result = await session.run(
        `
        MATCH (u:User {id: $userId})
        MATCH (g:GroupChat {accessKey: $accessKey})
        WHERE NOT EXISTS((u)-[:MEMBER_OF]->(g))
        CREATE (u)-[:MEMBER_OF {joinedAt: datetime(), role: 'member'}]->(g)
        RETURN g
        `,
        { userId, accessKey }
      )

      if (result.records.length === 0) {
        const checkResult = await session.run(
          `
          MATCH (u:User {id: $userId})-[:MEMBER_OF]->(g:GroupChat {accessKey: $accessKey})
          RETURN g
          `,
          { userId, accessKey }
        )

        if (checkResult.records.length > 0) {
          return { error: 'Already a member of this group' }
        }
        return { error: 'Invalid access key' }
      }

      return result.records[0]?.get('g').properties
    } finally {
      await session.close()
    }
  }

  async getGroupChats(userId) {
    const session = neo4jClient.getSession()
    try {
      const result = await session.run(
        `
        MATCH (u:User {id: $userId})-[r:MEMBER_OF]->(g:GroupChat)
        RETURN g, r.role as role, r.joinedAt as joinedAt
        ORDER BY r.joinedAt DESC
        `,
        { userId }
      )

      return result.records.map(record => ({
        ...record.get('g').properties,
        role: record.get('role'),
        joinedAt: record.get('joinedAt')
      }))
    } finally {
      await session.close()
    }
  }

  async getGroupChat(groupId, userId) {
    const session = neo4jClient.getSession()
    try {
      const result = await session.run(
        `
        MATCH (u:User {id: $userId})-[r:MEMBER_OF]->(g:GroupChat {id: $groupId})
        OPTIONAL MATCH (g)<-[:MEMBER_OF]-(member:User)
        WITH g, r, collect({
          id: member.id,
          email: member.email,
          joinedAt: [(member)-[mr:MEMBER_OF]->(g) | mr.joinedAt][0]
        }) as members
        RETURN g, r.role as role, members
        `,
        { groupId, userId }
      )

      if (result.records.length === 0) {
        return null
      }

      const record = result.records[0]
      return {
        ...record.get('g').properties,
        role: record.get('role'),
        members: record.get('members')
      }
    } finally {
      await session.close()
    }
  }

  // Message Management
  async createMessage(groupId, userId, content, parentMessageId = null) {
    const session = neo4jClient.getSession()
    try {
      const messageId = uuidv4()
      let query = `
        MATCH (u:User {id: $userId})-[:MEMBER_OF]->(g:GroupChat {id: $groupId})
        CREATE (m:Message {
          id: $messageId,
          content: $content,
          createdAt: datetime(),
          createdBy: $userId,
          groupId: $groupId,
          edited: false
        })
        CREATE (g)-[:CONTAINS]->(m)
        CREATE (u)-[:POSTED]->(m)
      `

      const params = {
        messageId,
        groupId,
        userId,
        content
      }

      if (parentMessageId) {
        query += `
          WITH m
          MATCH (parent:Message {id: $parentMessageId})
          CREATE (m)-[:REPLY_TO]->(parent)
        `
        params.parentMessageId = parentMessageId
      }

      query += `
        RETURN m, u.email as userEmail
      `

      const result = await session.run(query, params)

      if (result.records.length === 0) {
        return { error: 'Not authorized or group not found' }
      }

      return {
        ...result.records[0].get('m').properties,
        userEmail: result.records[0].get('userEmail')
      }
    } finally {
      await session.close()
    }
  }

  async getMessages(groupId, userId, limit = 50, skip = 0) {
    const session = neo4jClient.getSession()
    try {
      const result = await session.run(
        `
        MATCH (u:User {id: $userId})-[:MEMBER_OF]->(g:GroupChat {id: $groupId})
        MATCH (g)-[:CONTAINS]->(m:Message)
        MATCH (author:User)-[:POSTED]->(m)
        OPTIONAL MATCH (m)-[:REPLY_TO]->(parent:Message)
        RETURN m, author.email as userEmail, parent.id as parentId
        ORDER BY m.createdAt DESC
        SKIP $skip
        LIMIT $limit
        `,
        { groupId, userId, skip: parseInt(skip), limit: parseInt(limit) }
      )

      return result.records.map(record => ({
        ...record.get('m').properties,
        userEmail: record.get('userEmail'),
        parentId: record.get('parentId')
      }))
    } finally {
      await session.close()
    }
  }

  async getThreadMessages(parentMessageId, userId) {
    const session = neo4jClient.getSession()
    try {
      const result = await session.run(
        `
        MATCH (parent:Message {id: $parentMessageId})<-[:CONTAINS]-(g:GroupChat)
        MATCH (u:User {id: $userId})-[:MEMBER_OF]->(g)
        MATCH (m:Message)-[:REPLY_TO]->(parent)
        MATCH (author:User)-[:POSTED]->(m)
        RETURN m, author.email as userEmail
        ORDER BY m.createdAt ASC
        `,
        { parentMessageId, userId }
      )

      return result.records.map(record => ({
        ...record.get('m').properties,
        userEmail: record.get('userEmail')
      }))
    } finally {
      await session.close()
    }
  }

  async editMessage(messageId, userId, newContent) {
    const session = neo4jClient.getSession()
    try {
      const result = await session.run(
        `
        MATCH (u:User {id: $userId})-[:POSTED]->(m:Message {id: $messageId})
        SET m.content = $newContent,
            m.edited = true,
            m.editedAt = datetime()
        RETURN m
        `,
        { messageId, userId, newContent }
      )

      if (result.records.length === 0) {
        return { error: 'Message not found or not authorized' }
      }

      return result.records[0].get('m').properties
    } finally {
      await session.close()
    }
  }

  async deleteMessage(messageId, userId) {
    const session = neo4jClient.getSession()
    try {
      const result = await session.run(
        `
        MATCH (u:User {id: $userId})-[:POSTED]->(m:Message {id: $messageId})
        OPTIONAL MATCH (m)<-[:REPLY_TO]-(reply:Message)
        WITH m, count(reply) as replyCount
        WHERE replyCount = 0
        DETACH DELETE m
        RETURN count(m) as deleted
        `,
        { messageId, userId }
      )

      const deleted = result.records[0]?.get('deleted').toNumber()
      if (deleted === 0) {
        return { error: 'Cannot delete message with replies or not authorized' }
      }

      return { success: true }
    } finally {
      await session.close()
    }
  }

  // AI Integration
  async generateAIResponse(groupId, userId, context) {
    const session = neo4jClient.getSession()
    try {
      // Verify user is member of group
      const memberCheck = await session.run(
        `
        MATCH (u:User {id: $userId})-[:MEMBER_OF]->(g:GroupChat {id: $groupId})
        RETURN g.name as groupName
        `,
        { groupId, userId }
      )

      if (memberCheck.records.length === 0) {
        return { error: 'Not authorized' }
      }

      // Get recent messages for context
      const recentMessages = await this.getMessages(groupId, userId, 10, 0)

      // Format context for AI
      const conversationContext = recentMessages
        .reverse()
        .map(msg => `${msg.userEmail}: ${msg.content}`)
        .join('\n')

      // TODO: Replace with actual AI API call
      // This is a placeholder for AI integration
      const aiResponse = {
        content: `AI Response based on context: "${context}" and recent conversation`,
        role: 'ai_assistant'
      }

      // Save AI response as a message
      const aiUserId = 'ai_assistant' // Special AI user ID
      const aiMessage = await session.run(
        `
        MATCH (g:GroupChat {id: $groupId})
        CREATE (m:Message {
          id: $messageId,
          content: $content,
          createdAt: datetime(),
          createdBy: $aiUserId,
          groupId: $groupId,
          isAI: true
        })
        CREATE (g)-[:CONTAINS]->(m)
        RETURN m
        `,
        {
          messageId: uuidv4(),
          groupId,
          content: aiResponse.content,
          aiUserId
        }
      )

      return {
        ...aiMessage.records[0].get('m').properties,
        userEmail: 'AI Assistant'
      }
    } finally {
      await session.close()
    }
  }

  // Member Management
  async updateMemberRole(groupId, adminId, targetUserId, newRole) {
    const session = neo4jClient.getSession()
    try {
      const result = await session.run(
        `
        MATCH (admin:User {id: $adminId})-[ar:MEMBER_OF {role: 'admin'}]->(g:GroupChat {id: $groupId})
        MATCH (target:User {id: $targetUserId})-[tr:MEMBER_OF]->(g)
        WHERE admin.id <> target.id
        SET tr.role = $newRole
        RETURN target, tr
        `,
        { groupId, adminId, targetUserId, newRole }
      )

      if (result.records.length === 0) {
        return { error: 'Not authorized or user not found' }
      }

      return { success: true }
    } finally {
      await session.close()
    }
  }

  async removeMember(groupId, adminId, targetUserId) {
    const session = neo4jClient.getSession()
    try {
      const result = await session.run(
        `
        MATCH (admin:User {id: $adminId})-[ar:MEMBER_OF {role: 'admin'}]->(g:GroupChat {id: $groupId})
        MATCH (target:User {id: $targetUserId})-[tr:MEMBER_OF]->(g)
        WHERE admin.id <> target.id
        DELETE tr
        RETURN count(tr) as removed
        `,
        { groupId, adminId, targetUserId }
      )

      const removed = result.records[0]?.get('removed').toNumber()
      if (removed === 0) {
        return { error: 'Not authorized or user not found' }
      }

      return { success: true }
    } finally {
      await session.close()
    }
  }

  async leaveGroup(groupId, userId) {
    const session = neo4jClient.getSession()
    try {
      const result = await session.run(
        `
        MATCH (u:User {id: $userId})-[r:MEMBER_OF]->(g:GroupChat {id: $groupId})
        WHERE r.role <> 'admin' OR EXISTS((other:User)-[:MEMBER_OF {role: 'admin'}]->(g)) AND other.id <> u.id
        DELETE r
        RETURN count(r) as left
        `,
        { groupId, userId }
      )

      const left = result.records[0]?.get('left').toNumber()
      if (left === 0) {
        return { error: 'Cannot leave: you are the only admin' }
      }

      return { success: true }
    } finally {
      await session.close()
    }
  }
}

export default new GroupChatService()