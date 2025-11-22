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

// PATCH /api/kanban/tasks/[taskId]/move - Move task to different column
export async function PATCH(request, { params }) {
  try {
    const { taskId } = await params;
    const body = await request.json();
    const { userId, status } = body;

    if (!userId || !status) {
      return NextResponse.json(
        { error: 'User ID and status required' },
        { status: 400 }
      );
    }

    const session = driver.session();

    try {
      // Update task status and set completedAt if moving to done
      const result = await session.run(
        `
        MATCH (u:User {id: $userId})-[:HAS_TASK]->(t:Task {id: $taskId})
        SET t.status = $status
        SET t.completedAt = CASE
          WHEN $status = 'done' AND t.completedAt IS NULL THEN datetime()
          WHEN $status <> 'done' THEN null
          ELSE t.completedAt
        END
        RETURN t
        `,
        { userId, taskId, status }
      );

      if (result.records.length === 0) {
        return NextResponse.json(
          { error: 'Task not found or not authorized' },
          { status: 404 }
        );
      }

      const task = result.records[0].get('t').properties;

      return NextResponse.json(
        {
          task: {
            id: task.id,
            status: task.status,
            completedAt: task.completedAt ? task.completedAt.toString() : null
          }
        },
        { status: 200 }
      );
    } finally {
      await session.close();
    }
  } catch (error) {
    console.error('Error moving task:', error);
    return NextResponse.json(
      { error: 'Failed to move task' },
      { status: 500 }
    );
  }
}
