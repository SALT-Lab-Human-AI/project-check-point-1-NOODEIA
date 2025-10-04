import { neo4jDataService } from '../services/neo4j.service.js'

const USE_NEO4J = true

class DatabaseAdapter {
  constructor() {
    this.useNeo4j = USE_NEO4J
  }

  async createUser(id, email, name) {
    if (!this.useNeo4j) {
      throw new Error('Supabase user creation no longer supported. Use Neo4j.')
    }

    return await neo4jDataService.createUser(id, email, name)
  }

  async getUserByEmail(email) {
    if (!this.useNeo4j) {
      throw new Error('Supabase queries no longer supported. Use Neo4j.')
    }

    return await neo4jDataService.getUserByEmail(email)
  }

  async getUserById(userId) {
    if (!this.useNeo4j) {
      throw new Error('Supabase queries no longer supported. Use Neo4j.')
    }

    return await neo4jDataService.getUserById(userId)
  }

  async updateUser(userId, updates) {
    if (!this.useNeo4j) {
      throw new Error('Supabase updates no longer supported. Use Neo4j.')
    }

    return await neo4jDataService.updateUser(userId, updates)
  }

  async createSession(userId, title) {
    if (!this.useNeo4j) {
      throw new Error('Supabase session creation no longer supported. Use Neo4j.')
    }

    return await neo4jDataService.createSession(userId, title)
  }

  async getUserSessions(userId) {
    if (!this.useNeo4j) {
      throw new Error('Supabase queries no longer supported. Use Neo4j.')
    }

    return await neo4jDataService.getUserSessions(userId)
  }

  async getSessionById(sessionId) {
    if (!this.useNeo4j) {
      throw new Error('Supabase queries no longer supported. Use Neo4j.')
    }
    return await neo4jDataService.getSessionById(sessionId)
  }

  async getSessionWithChats(sessionId) {
    if (!this.useNeo4j) {
      throw new Error('Supabase queries no longer supported. Use Neo4j.')
    }
    return await neo4jDataService.getSessionWithChats(sessionId)
  }

  async updateSession(sessionId, title) {
    if (!this.useNeo4j) {
      throw new Error('Supabase updates no longer supported. Use Neo4j.')
    }
    return await neo4jDataService.updateSession(sessionId, title)
  }

  async deleteSession(sessionId) {
    if (!this.useNeo4j) {
      throw new Error('Supabase deletes no longer supported. Use Neo4j.')
    }
    return await neo4jDataService.deleteSession(sessionId)
  }

  async createChat(sessionId, role, content) {
    if (!this.useNeo4j) {
      throw new Error('Supabase chat creation no longer supported. Use Neo4j.')
    }
    return await neo4jDataService.createChat(sessionId, role, content)
  }

  async getSessionChats(sessionId) {
    if (!this.useNeo4j) {
      throw new Error('Supabase queries no longer supported. Use Neo4j.')
    }
    return await neo4jDataService.getSessionChats(sessionId)
  }

  async updateChat(chatId, content) {
    if (!this.useNeo4j) {
      throw new Error('Supabase updates no longer supported. Use Neo4j.')
    }
    return await neo4jDataService.updateChat(chatId, content)
  }

  async deleteChat(chatId) {
    if (!this.useNeo4j) {
      throw new Error('Supabase deletes no longer supported. Use Neo4j.')
    }
    return await neo4jDataService.deleteChat(chatId)
  }

  async deleteChatsAfter(sessionId, chatId) {
    if (!this.useNeo4j) {
      throw new Error('Supabase deletes no longer supported. Use Neo4j.')
    }
    return await neo4jDataService.deleteChatsAfter(sessionId, chatId)
  }

  async getUserStats(userId) {
    if (!this.useNeo4j) {
      throw new Error('Supabase queries no longer supported. Use Neo4j.')
    }
    return await neo4jDataService.getUserStats(userId)
  }

  async searchSessions(userId, searchTerm) {
    if (!this.useNeo4j) {
      throw new Error('Supabase queries no longer supported. Use Neo4j.')
    }
    return await neo4jDataService.searchSessions(userId, searchTerm)
  }

  getActiveDatabase() {
    return this.useNeo4j ? 'Neo4j' : 'Supabase'
  }

  switchDatabase(useNeo4j) {
    this.useNeo4j = useNeo4j
  }
}

export const databaseAdapter = new DatabaseAdapter()
