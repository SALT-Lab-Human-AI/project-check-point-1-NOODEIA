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
      console.error('Neo4j credentials not configured')
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
      console.log('✅ Neo4j driver initialized')
    } catch (error) {
      console.error('❌ Failed to initialize Neo4j driver:', error)
      throw error
    }
  }

  getSession() {
    if (!this.driver) {
      this.initialize()
    }
    return this.driver.session({ database: 'neo4j' })
  }

  async verifyConnectivity() {
    const session = this.getSession()
    try {
      const result = await session.run('RETURN 1 as test')
      const value = result.records[0].get('test')
      console.log('✅ Neo4j AuraDB connection successful, test value:', value)
      return true
    } catch (error) {
      console.error('❌ Neo4j connection failed:', error)
      throw error
    } finally {
      await session.close()
    }
  }

  async close() {
    if (this.driver) {
      await this.driver.close()
      this.isInitialized = false
      console.log('Neo4j driver closed')
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
