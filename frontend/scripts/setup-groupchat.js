import { neo4jService } from '../lib/neo4j.js';

async function setupGroupChat() {
  const session = neo4jService.getSession();

  try {
    await session.run(`
      CREATE CONSTRAINT groupchat_id_unique IF NOT EXISTS
      FOR (g:GroupChat) REQUIRE g.id IS UNIQUE
    `);

    await session.run(`
      CREATE CONSTRAINT groupchat_key_unique IF NOT EXISTS
      FOR (g:GroupChat) REQUIRE g.access_key IS UNIQUE
    `);

    await session.run(`
      CREATE CONSTRAINT message_id_unique IF NOT EXISTS
      FOR (m:Message) REQUIRE m.id IS UNIQUE
    `);

    await session.run(`
      CREATE INDEX groupchat_access_key_idx IF NOT EXISTS
      FOR (g:GroupChat) ON (g.access_key)
    `);

    await session.run(`
      CREATE INDEX message_created_idx IF NOT EXISTS
      FOR (m:Message) ON (m.created_at)
    `);

    await session.run(`
      CREATE INDEX groupchat_created_idx IF NOT EXISTS
      FOR (g:GroupChat) ON (g.created_at)
    `);

  } catch (error) {
    console.error('Error setting up group chat schema:', error);
    throw error;
  } finally {
    await session.close();
    neo4jService.close();
  }
}

setupGroupChat()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });