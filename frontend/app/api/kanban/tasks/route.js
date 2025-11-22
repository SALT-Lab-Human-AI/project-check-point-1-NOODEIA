import { NextResponse } from 'next/server';
import neo4j from 'neo4j-driver';

// Initialize Neo4j driver
const driver = neo4j.driver(
  process.env.NEXT_PUBLIC_NEO4J_URI,
  neo4j.auth.basic(
    process.env.NEXT_PUBLIC_NEO4J_USERNAME,
    process.env.NEXT_PUBLIC_NEO4J_PASSWORD
  ),
  { disableLosslessIntegers: true }
);

// GET /api/kanban/tasks - Get all tasks for a user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const session = driver.session();

    try {
      // Get all tasks for user, ordered by creation date
      const result = await session.run(
        `
        MATCH (u:User {id: $userId})-[:HAS_TASK]->(t:Task)
        RETURN t
        ORDER BY t.createdAt DESC
        `,
        { userId }
      );

      const tasks = result.records.map(record => {
        const task = record.get('t').properties;
        return {
          id: task.id,
          title: task.title,
          description: task.description || '',
          priority: task.priority || 'medium',
          status: task.status || 'todo',
          dueDate: task.dueDate ? task.dueDate.toISOString() : null,
          createdAt: task.createdAt ? task.createdAt.toString() : new Date().toISOString(),
          completedAt: task.completedAt ? task.completedAt.toString() : null
        };
      });

      return NextResponse.json({ tasks }, { status: 200 });
    } finally {
      await session.close();
    }
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST /api/kanban/tasks - Create a new task
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, title, description, priority, status, dueDate } = body;

    if (!userId || !title) {
      return NextResponse.json(
        { error: 'User ID and title required' },
        { status: 400 }
      );
    }

    const session = driver.session();

    try {
      const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const result = await session.run(
        `
        MATCH (u:User {id: $userId})
        CREATE (t:Task {
          id: $taskId,
          title: $title,
          description: $description,
          priority: $priority,
          status: $status,
          dueDate: $dueDate,
          createdAt: datetime(),
          completedAt: null
        })
        CREATE (u)-[:HAS_TASK]->(t)
        RETURN t
        `,
        {
          userId,
          taskId,
          title,
          description: description || '',
          priority: priority || 'medium',
          status: status || 'todo',
          dueDate: dueDate || null
        }
      );

      const task = result.records[0].get('t').properties;

      return NextResponse.json(
        {
          task: {
            id: task.id,
            title: task.title,
            description: task.description || '',
            priority: task.priority,
            status: task.status,
            dueDate: task.dueDate,
            createdAt: task.createdAt.toString(),
            completedAt: null
          }
        },
        { status: 201 }
      );
    } finally {
      await session.close();
    }
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
