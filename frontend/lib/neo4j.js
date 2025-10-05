import neo4j from 'neo4j-driver'

class Neo4jService {
  constructor() {
    this.driver = null
    this.isInitialized = false
  }

  initialize() {
    if (this.isInitialized) {
      return
    }

    const uri = process.env.NEXT_PUBLIC_NEO4J_URI
    const username = process.env.NEXT_PUBLIC_NEO4J_USERNAME
    const password = process.env.NEXT_PUBLIC_NEO4J_PASSWORD

    if (!uri || !username || !password) {
      console.error('Neo4j credentials not configured. Missing:', {
        uri: !uri ? 'NEXT_PUBLIC_NEO4J_URI' : 'ok',
        username: !username ? 'NEXT_PUBLIC_NEO4J_USERNAME' : 'ok',
        password: !password ? 'NEXT_PUBLIC_NEO4J_PASSWORD' : 'ok'
      })
      return
    }

    try {
      this.driver = neo4j.driver(
        uri,
        neo4j.auth.basic(username, password),
        {
          maxConnectionLifetime: 3 * 60 * 60 * 1000,
          maxConnectionPoolSize: 50,
          connectionAcquisitionTimeout: 2 * 60 * 1000,
          disableLosslessIntegers: true,
        }
      )

      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize Neo4j driver:', error)
      throw error
    }
  }

  getSession() {
    if (!this.driver) {
      this.initialize()
    }
    if (!this.driver) {
      throw new Error('Neo4j driver not initialized. Check your environment variables.')
    }
    return this.driver.session({ database: 'neo4j' })
  }

  async verifyConnectivity() {
    const session = this.getSession()
    try {
      await session.run('RETURN 1 as test')
      return true
    } catch (error) {
      console.error('Neo4j connection failed:', error)
      throw error
    } finally {
      await session.close()
    }
  }

  async close() {
    if (this.driver) {
      await this.driver.close()
      this.isInitialized = false
    }
  }

  toNumber(value) {
    if (value && typeof value === 'object' && 'toNumber' in value) {
      return value.toNumber()
    }
    return value
  }

  nodeToObject(node) {
    if (!node) return null
    const props = node.properties

    const converted = {}
    for (const [key, value] of Object.entries(props)) {
      converted[key] = this.toNumber(value)
    }

    return converted
  }
}

export const neo4jService = new Neo4jService()
