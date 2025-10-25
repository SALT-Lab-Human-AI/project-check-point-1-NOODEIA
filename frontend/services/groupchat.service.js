import { v4 as uuidv4 } from 'uuid'
import { neo4jService as neo4jClient, neo4j } from '../lib/neo4j'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

class GroupChatService {
  // Helper to convert Neo4j integers to JS numbers
  toNumber(value) {
    if (value === null || value === undefined) return 0
    if (typeof value === 'number') return value
    if (value.toNumber) return value.toNumber()
    return 0
  }

  // Group Chat Management
  async createGroupChat(name, description, accessKey, createdBy) {
    const session = neo4jClient.getSession()
    try {
      const groupId = uuidv4()

      // First ensure the user exists
      await session.run(
        `MERGE (u:User {id: $userId})
         ON CREATE SET u.createdAt = datetime()`,
        { userId: createdBy }
      )

      // Then create the group and add user as admin
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
    } catch (error) {
      console.error('Error creating group chat:', error)
      throw error
    } finally {
      await session.close()
    }
  }

  async joinGroupChat(userId, accessKey) {
    const session = neo4jClient.getSession()
    try {
      // First ensure the user exists
      await session.run(
        `MERGE (u:User {id: $userId})
         ON CREATE SET u.createdAt = datetime()`,
        { userId }
      )
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
          return checkResult.records[0]?.get('g').properties
        }
        return { error: 'Invalid access key' }
      }

      return result.records[0]?.get('g').properties
    } catch (error) {
      console.error('Error joining group chat:', error)
      throw error
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
        OPTIONAL MATCH (g)<-[:MEMBER_OF]-(member:User)
        WITH g, r, collect(member) as members
        RETURN g, r.role as role, r.joinedAt as joinedAt, size(members) as memberCount
        ORDER BY r.joinedAt DESC
        `,
        { userId }
      )

      return result.records.map(record => ({
        ...record.get('g').properties,
        role: record.get('role'),
        joinedAt: record.get('joinedAt'),
        members: Array(this.toNumber(record.get('memberCount'))).fill(null)
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
      const isAI = userId === 'ai_assistant'


      let query = ''
      if (isAI) {
        // AI doesn't need membership check
        query = `
          MATCH (g:GroupChat {id: $groupId})
          MERGE (u:User {id: $userId})
          ON CREATE SET u.name = 'AI Assistant', u.email = 'ai@assistant', u.createdAt = datetime()
          CREATE (m:Message {
            id: $messageId,
            content: $content,
            createdAt: datetime(),
            createdBy: $userId,
            groupId: $groupId,
            edited: false,
            isAI: true,
            parentId: $parentMessageId
          })
          CREATE (g)-[:CONTAINS]->(m)
          CREATE (u)-[:POSTED]->(m)
        `
      } else {
        // Regular users need membership
        query = `
          MATCH (u:User {id: $userId})-[:MEMBER_OF]->(g:GroupChat {id: $groupId})
          CREATE (m:Message {
            id: $messageId,
            content: $content,
            createdAt: datetime(),
            createdBy: $userId,
            groupId: $groupId,
            edited: false,
            parentId: $parentMessageId
          })
          CREATE (g)-[:CONTAINS]->(m)
          CREATE (u)-[:POSTED]->(m)
        `
      }

      const params = {
        messageId,
        groupId,
        userId,
        content,
        parentMessageId: parentMessageId || null
      }

      if (parentMessageId) {
        query += `
          WITH m, u, g
          MATCH (parent:Message {id: $parentMessageId})
          CREATE (m)-[:REPLY_TO]->(parent)
          RETURN m, u.name as userName, u.email as userEmail, g.id as verifyGroupId, parent.id as verifyParentId
        `
        params.parentMessageId = parentMessageId
      } else {
        query += `
          RETURN m, u.name as userName, u.email as userEmail, g.id as verifyGroupId
        `
      }

      const result = await session.run(query, params)

      if (result.records.length === 0) {
        console.error('❌ Failed to create message: Group not found or user not authorized')
        return { error: 'Not authorized or group not found' }
      }

      const message = result.records[0].get('m').properties

      return {
        ...message,
        createdAt: message.createdAt ? new Date(message.createdAt).toISOString() : new Date().toISOString(),
        userName: result.records[0].get('userName'),
        userEmail: result.records[0].get('userEmail')
      }
    } catch (error) {
      console.error('❌ Error creating message:', error)
      throw error
    } finally {
      await session.close()
    }
  }

  async getMessage(messageId, userId) {
    const session = neo4jClient.getSession()
    try {
      const result = await session.run(
        `
        MATCH (m:Message {id: $messageId})
        OPTIONAL MATCH (author:User)-[:POSTED]->(m)
        RETURN m,
               author.name as userName,
               author.email as userEmail
        `,
        { messageId }
      )

      if (result.records.length === 0) {
        return null
      }

      const record = result.records[0]
      const message = record.get('m').properties
      return {
        ...message,
        createdAt: message.createdAt ? new Date(message.createdAt).toISOString() : new Date().toISOString(),
        userName: record.get('userName'),
        userEmail: record.get('userEmail')
      }
    } catch (error) {
      console.error('❌ Error fetching message:', error)
      throw error
    } finally {
      await session.close()
    }
  }

  async getMessages(groupId, userId, limit = 50, skip = 0) {
    const session = neo4jClient.getSession()
    try {
      // First check if user is a member
      const memberCheck = await session.run(
        `MATCH (u:User {id: $userId})-[:MEMBER_OF]->(g:GroupChat {id: $groupId})
         RETURN g`,
        { groupId, userId }
      )

      if (memberCheck.records.length === 0) {
        return []
      }

      // Ensure skip and limit are integers using neo4j.int()
      const skipInt = neo4j.int(skip)
      const limitInt = neo4j.int(limit)

      const result = await session.run(
        `
        MATCH (g:GroupChat {id: $groupId})
        OPTIONAL MATCH (g)-[:CONTAINS]->(m:Message)
        OPTIONAL MATCH (author:User)-[:POSTED]->(m)
        OPTIONAL MATCH (m)-[:REPLY_TO]->(parent:Message)
        OPTIONAL MATCH (parentAuthor:User)-[:POSTED]->(parent)
        OPTIONAL MATCH (m)<-[:REPLY_TO]-(reply:Message)
        WHERE m IS NOT NULL
        WITH m, author, parent, parentAuthor, count(DISTINCT reply) as replyCount
        RETURN m,
               author.name as userName,
               author.email as userEmail,
               parent.id as parentId,
               parent.content as parentContent,
               parentAuthor.name as parentAuthorName,
               parentAuthor.email as parentAuthorEmail,
               replyCount
        ORDER BY m.createdAt DESC
        SKIP $skip
        LIMIT $limit
        `,
        { groupId, skip: skipInt, limit: limitInt }
      )

      // Filter out null messages and return with formatted dates
      return result.records
        .filter(record => record.get('m'))
        .map(record => {
          const message = record.get('m').properties
          return {
            ...message,
            createdAt: message.createdAt ? new Date(message.createdAt).toISOString() : new Date().toISOString(),
            editedAt: message.editedAt ? new Date(message.editedAt).toISOString() : null,
            userName: record.get('userName'),
            userEmail: record.get('userEmail'),
            parentId: record.get('parentId'),
            parentContent: record.get('parentContent'),
            parentAuthorName: record.get('parentAuthorName'),
            parentAuthorEmail: record.get('parentAuthorEmail'),
            replyCount: this.toNumber(record.get('replyCount'))
          }
        })
    } catch (error) {
      console.error('Error in getMessages:', error)
      return []
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
        OPTIONAL MATCH (author:User)-[:POSTED]->(m)
        OPTIONAL MATCH (parentAuthor:User)-[:POSTED]->(parent)
        OPTIONAL MATCH (m)<-[:REPLY_TO]-(reply:Message)
        WITH m, author, parent, parentAuthor, count(DISTINCT reply) as replyCount
        RETURN m,
               coalesce(author.name, m.createdBy) as userName,
               coalesce(author.email, m.createdBy + '@assistant.com') as userEmail,
               parent.id as parentId,
               parentAuthor.name as parentAuthorName,
               parentAuthor.email as parentAuthorEmail,
               replyCount
        ORDER BY m.createdAt ASC
        `,
        { parentMessageId, userId }
      )

      return result.records.map(record => {
        const message = record.get('m').properties
        return {
          ...message,
          createdAt: message.createdAt ? new Date(message.createdAt).toISOString() : new Date().toISOString(),
          editedAt: message.editedAt ? new Date(message.editedAt).toISOString() : null,
          userName: record.get('userName'),
          userEmail: record.get('userEmail'),
          parentId: record.get('parentId'),
          parentAuthorName: record.get('parentAuthorName'),
          parentAuthorEmail: record.get('parentAuthorEmail'),
          replyCount: this.toNumber(record.get('replyCount'))
        }
      })
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
      // First check if user owns this message
      const ownerCheck = await session.run(
        `
        MATCH (u:User {id: $userId})-[:POSTED]->(m:Message {id: $messageId})
        RETURN m
        `,
        { messageId, userId }
      )

      if (ownerCheck.records.length === 0) {
        return { error: 'Not authorized to delete this message' }
      }

      // Delete the message and cascade delete all replies
      await session.run(
        `
        MATCH (m:Message {id: $messageId})
        OPTIONAL MATCH (m)<-[:REPLY_TO*]-(reply:Message)
        DETACH DELETE reply, m
        `,
        { messageId }
      )

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

      // AI response (actual AI integration handled in API routes)
      const aiResponse = {
        content: `AI Response based on context: "${conversationContext}"`,
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

      const removed = this.toNumber(result.records[0]?.get('removed'))
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
      // First check if user is a member
      const memberCheck = await session.run(
        `MATCH (u:User {id: $userId})-[r:MEMBER_OF]->(g:GroupChat {id: $groupId})
         RETURN r, r.role as role`,
        { groupId, userId }
      )

      if (memberCheck.records.length === 0) {
        return { error: 'User is not a member of this group' }
      }

      const userRole = memberCheck.records[0].get('role')

      // If user is admin, check if there are other members who need an admin
      if (userRole === 'admin') {
        // Check if there are other admins
        const adminCountResult = await session.run(
          `MATCH (:User)-[r:MEMBER_OF {role: 'admin'}]->(g:GroupChat {id: $groupId})
           RETURN count(r) as adminCount`,
          { groupId }
        )

        const adminCount = this.toNumber(adminCountResult.records[0]?.get('adminCount'))

        // Only prevent leaving if you're the only admin AND there are other non-admin members
        if (adminCount <= 1) {
          // Check if there are other members
          const memberCountResult = await session.run(
            `MATCH (:User)-[r:MEMBER_OF]->(g:GroupChat {id: $groupId})
             RETURN count(r) as memberCount`,
            { groupId }
          )

          const memberCount = this.toNumber(memberCountResult.records[0]?.get('memberCount'))

          // If there are other members besides the admin, prevent leaving
          if (memberCount > 1) {
            return { error: 'Cannot leave: you are the only admin and there are other members. Please promote another member to admin first.' }
          }
          // If you're the only member (memberCount == 1), allow leaving (group becomes empty)
        }
      }

      // Delete the membership relationship
      await session.run(
        `MATCH (u:User {id: $userId})-[r:MEMBER_OF]->(g:GroupChat {id: $groupId})
         DELETE r`,
        { groupId, userId }
      )

      return { success: true }
    } catch (error) {
      console.error('Error leaving group:', error)
      throw error
    } finally {
      await session.close()
    }
  }
}

export default new GroupChatService()