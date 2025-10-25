import { neo4jService } from '../lib/neo4j.js'
import { v4 as uuidv4 } from 'uuid'

class Neo4jDataService {
  async createUser(id, email, name) {
    const session = neo4jService.getSession()
    try {
      const result = await session.run(
        `
        CREATE (u:User {
          id: $id,
          email: $email,
          name: $name,
          created_at: datetime(),
          updated_at: datetime()
        })
        RETURN u
        `,
        { id, email, name }
      )

      return neo4jService.nodeToObject(result.records[0].get('u'))
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    } finally {
      await session.close()
    }
  }

  async getUserByEmail(email) {
    const session = neo4jService.getSession()
    try {
      const result = await session.run(
        `
        MATCH (u:User {email: $email})
        RETURN u
        `,
        { email }
      )

      if (result.records.length === 0) return null
      return neo4jService.nodeToObject(result.records[0].get('u'))
    } catch (error) {
      console.error('Error getting user by email:', error)
      throw error
    } finally {
      await session.close()
    }
  }

  async getUserById(userId) {
    const session = neo4jService.getSession()
    try {
      const result = await session.run(
        `
        MATCH (u:User {id: $userId})
        RETURN u
        `,
        { userId }
      )

      if (result.records.length === 0) return null
      return neo4jService.nodeToObject(result.records[0].get('u'))
    } catch (error) {
      console.error('Error getting user by ID:', error)
      throw error
    } finally {
      await session.close()
    }
  }

  async updateUser(userId, updates) {
    const session = neo4jService.getSession()
    try {
      const setClauses = Object.keys(updates)
        .map((key) => `u.${key} = $${key}`)
        .join(', ')

      const result = await session.run(
        `
        MATCH (u:User {id: $userId})
        SET ${setClauses}, u.updated_at = datetime()
        RETURN u
        `,
        { userId, ...updates }
      )

      return neo4jService.nodeToObject(result.records[0].get('u'))
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    } finally {
      await session.close()
    }
  }

  async createSession(userId, title) {
    const session = neo4jService.getSession()
    try {
      const sessionId = uuidv4()
      const result = await session.run(
        `
        MATCH (u:User {id: $userId})
        CREATE (s:Session {
          id: $sessionId,
          title: $title,
          created_at: datetime(),
          updated_at: datetime()
        })
        CREATE (u)-[:HAS]->(s)
        RETURN s
        `,
        { userId, sessionId, title }
      )

      return neo4jService.nodeToObject(result.records[0].get('s'))
    } catch (error) {
      console.error('Error creating session:', error)
      throw error
    } finally {
      await session.close()
    }
  }

  async getUserSessions(userId) {
    const session = neo4jService.getSession()
    try {
      const result = await session.run(
        `
        MATCH (u:User {id: $userId})-[:HAS]->(s:Session)
        RETURN s
        ORDER BY s.updated_at DESC
        `,
        { userId }
      )

      return result.records.map((record) =>
        neo4jService.nodeToObject(record.get('s'))
      )
    } catch (error) {
      console.error('Error getting user sessions:', error)
      throw error
    } finally {
      await session.close()
    }
  }

  async getSessionById(sessionId) {
    const session = neo4jService.getSession()
    try {
      const result = await session.run(
        `
        MATCH (s:Session {id: $sessionId})
        RETURN s
        `,
        { sessionId }
      )

      if (result.records.length === 0) return null
      return neo4jService.nodeToObject(result.records[0].get('s'))
    } catch (error) {
      console.error('Error getting session by ID:', error)
      throw error
    } finally {
      await session.close()
    }
  }

  async updateSession(sessionId, title) {
    const session = neo4jService.getSession()
    try {
      const result = await session.run(
        `
        MATCH (s:Session {id: $sessionId})
        SET s.title = $title, s.updated_at = datetime()
        RETURN s
        `,
        { sessionId, title }
      )

      return neo4jService.nodeToObject(result.records[0].get('s'))
    } catch (error) {
      console.error('Error updating session:', error)
      throw error
    } finally {
      await session.close()
    }
  }

  async touchSession(sessionId) {
    const session = neo4jService.getSession()
    try {
      await session.run(
        `
        MATCH (s:Session {id: $sessionId})
        SET s.updated_at = datetime()
        `,
        { sessionId }
      )
    } catch (error) {
      console.error('Error touching session:', error)
      throw error
    } finally {
      await session.close()
    }
  }

  async deleteSession(sessionId) {
    const session = neo4jService.getSession()
    try {
      await session.run(
        `
        MATCH (s:Session {id: $sessionId})
        OPTIONAL MATCH (s)-[:OCCURRED]->(c:Chat)
        DETACH DELETE s, c
        `,
        { sessionId }
      )

      return true
    } catch (error) {
      console.error('Error deleting session:', error)
      throw error
    } finally {
      await session.close()
    }
  }

  async createChat(sessionId, role, content) {
    const session = neo4jService.getSession()
    try {
      const chatId = uuidv4()

      console.log('💬 Creating Chat:', {
        sessionId: sessionId.substring(0, 8) + '...',
        chatId: chatId.substring(0, 8) + '...',
        role,
        contentPreview: content.substring(0, 50) + '...'
      })

      // Create the chat and NEXT relationship in a single transaction
      const result = await session.run(
        `
        MATCH (s:Session {id: $sessionId})

        // Find the last chat in this session
        OPTIONAL MATCH (s)-[:OCCURRED]->(lastChat:Chat)
        WITH s, lastChat
        ORDER BY lastChat.created_at DESC
        LIMIT 1
        WITH s, lastChat

        // Create new chat
        CREATE (c:Chat {
          id: $chatId,
          role: $role,
          content: $content,
          created_at: datetime()
        })
        CREATE (s)-[:OCCURRED]->(c)

        // Create NEXT relationship if there was a previous chat
        FOREACH (prev IN CASE WHEN lastChat IS NOT NULL THEN [lastChat] ELSE [] END |
          CREATE (prev)-[:NEXT]->(c)
        )

        RETURN c, s.id as verifySessionId, lastChat.id as prevChatId
        `,
        { sessionId, chatId, role, content }
      )

      if (result.records.length === 0) {
        console.error('❌ Failed to create chat: Session not found')
        throw new Error('Session not found')
      }

      const record = result.records[0]
      const newChat = neo4jService.nodeToObject(record.get('c'))
      const verifySessionId = record.get('verifySessionId')
      const prevChatId = record.get('prevChatId')

      console.log('✅ Chat created successfully')
      console.log('✅ OCCURRED relationship: Session', verifySessionId.substring(0, 8) + '... -> Chat', chatId.substring(0, 8) + '...')

      if (prevChatId) {
        console.log('✅ NEXT relationship: Chat', prevChatId.substring(0, 8) + '... -> Chat', chatId.substring(0, 8) + '...')
      } else {
        console.log('📎 No previous chat - this is the first message in session')
      }

      await this.touchSession(sessionId)

      return newChat
    } catch (error) {
      console.error('❌ Error creating chat:', error)
      throw error
    } finally {
      await session.close()
    }
  }

  async getSessionChats(sessionId) {
    const session = neo4jService.getSession()
    try {
      const result = await session.run(
        `
        MATCH (s:Session {id: $sessionId})-[:OCCURRED]->(c:Chat)
        RETURN c
        ORDER BY c.created_at ASC
        `,
        { sessionId }
      )

      return result.records.map((record) =>
        neo4jService.nodeToObject(record.get('c'))
      )
    } catch (error) {
      console.error('Error getting session chats:', error)
      throw error
    } finally {
      await session.close()
    }
  }

  async getSessionWithChats(sessionId) {
    const session = neo4jService.getSession()
    try {
      const result = await session.run(
        `
        MATCH (s:Session {id: $sessionId})
        OPTIONAL MATCH (s)-[:OCCURRED]->(c:Chat)
        WITH s, c
        ORDER BY c.created_at ASC
        RETURN s, collect(c) as chats
        `,
        { sessionId }
      )

      if (result.records.length === 0) return null

      const record = result.records[0]
      return {
        session: neo4jService.nodeToObject(record.get('s')),
        chats: record
          .get('chats')
          .map((c) => neo4jService.nodeToObject(c))
          .filter(Boolean),
      }
    } catch (error) {
      console.error('Error getting session with chats:', error)
      throw error
    } finally {
      await session.close()
    }
  }

  async updateChat(chatId, content) {
    const session = neo4jService.getSession()
    try {
      const result = await session.run(
        `
        MATCH (c:Chat {id: $chatId})
        SET c.content = $content
        RETURN c
        `,
        { chatId, content }
      )

      return neo4jService.nodeToObject(result.records[0].get('c'))
    } catch (error) {
      console.error('Error updating chat:', error)
      throw error
    } finally {
      await session.close()
    }
  }

  async deleteChat(chatId) {
    const session = neo4jService.getSession()
    try {
      await session.run(
        `
        MATCH (c:Chat {id: $chatId})
        DETACH DELETE c
        `,
        { chatId }
      )

      return true
    } catch (error) {
      console.error('Error deleting chat:', error)
      throw error
    } finally {
      await session.close()
    }
  }

  async deleteChatsAfter(sessionId, chatId) {
    const session = neo4jService.getSession()
    try {
      await session.run(
        `
        MATCH (s:Session {id: $sessionId})-[:OCCURRED]->(start:Chat {id: $chatId})
        MATCH (start)-[:NEXT*]->(c:Chat)
        DETACH DELETE c
        `,
        { sessionId, chatId }
      )

      return true
    } catch (error) {
      console.error('Error deleting chats after:', error)
      throw error
    } finally {
      await session.close()
    }
  }

  async getUserStats(userId) {
    const session = neo4jService.getSession()
    try {
      const result = await session.run(
        `
        MATCH (u:User {id: $userId})-[:HAS]->(s:Session)
        OPTIONAL MATCH (s)-[:OCCURRED]->(c:Chat)
        RETURN
          count(DISTINCT s) as totalSessions,
          count(c) as totalChats,
          sum(CASE WHEN c.role = 'user' THEN 1 ELSE 0 END) as userChats,
          sum(CASE WHEN c.role = 'assistant' THEN 1 ELSE 0 END) as assistantChats
        `,
        { userId }
      )

      const record = result.records[0]
      return {
        totalSessions: neo4jService.toNumber(record.get('totalSessions')),
        totalChats: neo4jService.toNumber(record.get('totalChats')),
        userChats: neo4jService.toNumber(record.get('userChats')),
        assistantChats: neo4jService.toNumber(record.get('assistantChats')),
      }
    } catch (error) {
      console.error('Error getting user stats:', error)
      throw error
    } finally {
      await session.close()
    }
  }

  async searchSessions(userId, searchTerm) {
    const session = neo4jService.getSession()
    try {
      const result = await session.run(
        `
        MATCH (u:User {id: $userId})-[:HAS]->(s:Session)
        WHERE toLower(s.title) CONTAINS toLower($searchTerm)
        RETURN s
        ORDER BY s.updated_at DESC
        `,
        { userId, searchTerm }
      )

      return result.records.map((record) =>
        neo4jService.nodeToObject(record.get('s'))
      )
    } catch (error) {
      console.error('Error searching sessions:', error)
      throw error
    } finally {
      await session.close()
    }
  }
}

export const neo4jDataService = new Neo4jDataService()
