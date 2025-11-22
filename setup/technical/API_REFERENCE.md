# Noodeia API Routes Documentation

Complete reference for all API endpoints in the Noodeia application.

---

## Table of Contents

1. [AI Chat APIs](#ai-chat-apis)
2. [User Profile & XP APIs](#user-profile--xp-apis)
3. [Group Chat APIs](#group-chat-apis)
4. [Quiz APIs](#quiz-apis)
5. [Kanban/Task APIs](#kanbantask-apis)
6. [Leaderboard APIs](#leaderboard-apis)
7. [Achievements APIs](#achievements-apis)
8. [Markdown/Notes APIs](#markdownnotes-apis)
9. [Pusher Real-time APIs](#pusher-real-time-apis)
10. [TTS (Text-to-Speech) APIs](#tts-text-to-speech-apis)
11. [Administrator APIs](#administrator-apis)

---

## AI Chat APIs

### POST /api/ai/chat

**Purpose**: Submit message to ACE-enhanced AI tutor with LangGraph reasoning pipeline

**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "message": "Help me solve 1/2 + 1/3",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Previous message"
    },
    {
      "role": "assistant",
      "content": "Previous response"
    }
  ],
  "conversationId": "session-uuid" // optional
}
```

**Response**:
```json
{
  "response": "AI tutor response using Socratic method",
  "contextCount": 5,
  "metadata": {
    "mode": "cot", // or "tot", "react"
    "scratch": {
      "learner_id": "user-id",
      "conversation_id": "session-id"
    },
    "conversationId": "session-id",
    "userId": "user-id"
  }
}
```

**Features**:
- Spawns Python subprocess to run `scripts/run_ace_agent.py`
- Uses ACE (Agentic Context Engineering) memory system
- LangGraph routing: COT (Chain of Thought), TOT (Tree of Thought), ReAct (Reasoning + Acting)
- Socratic teaching method (guides with questions, not direct answers)
- 50-word response limit
- Verifies conversation ownership before processing
- Integrates with Neo4j for memory persistence

**Error Codes**:
- 400: Missing message
- 401: Unauthorized (no token or invalid token)
- 403: Conversation not found or unauthorized
- 500: GEMINI_API_KEY not configured or ACE agent error

---

## User Profile & XP APIs

### GET /api/user/profile?userId=xxx

**Purpose**: Fetch user profile from Neo4j

**Authentication**: None (relies on userId parameter)

**Query Parameters**:
- `userId` (required): User ID to fetch

**Response**:
```json
{
  "id": "user-id",
  "name": "User Name",
  "email": "user@example.com",
  "xp": 150,
  "level": 3,
  "iconType": "emoji",
  "iconEmoji": "🎮",
  "iconColor": "#FF5733",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

**Error Codes**:
- 400: User ID required
- 404: User not found
- 500: Internal server error

---

### PATCH /api/user/profile

**Purpose**: Update user profile (icon customization)

**Authentication**: Optional (can use Bearer token or userId in body)

**Request Body**:
```json
{
  "userId": "user-id", // required if no auth header
  "iconType": "emoji", // "initials" or "emoji"
  "iconEmoji": "🎮", // if type is emoji
  "iconColor": "#FF5733" // if type is initials
}
```

**Response**:
```json
{
  "id": "user-id",
  "name": "User Name",
  "iconType": "emoji",
  "iconEmoji": "🎮",
  "iconColor": "#FF5733"
}
```

**Error Codes**:
- 400: User ID required
- 401: Unauthorized (if using auth header with invalid token)
- 500: Database error or internal server error

---

### POST /api/user/xp

**Purpose**: Award XP to user and update level

**Authentication**: None

**Request Body**:
```json
{
  "userId": "user-id",
  "xpGained": 5.5 // float value between 1.01-1.75 typically
}
```

**Response**:
```json
{
  "id": "user-id",
  "xp": 155,
  "level": 3,
  "xpGained": 5.5
}
```

**Features**:
- Calculates new level based on leveling formula: `((level-1)² + 4)²`
- Auto-creates user if doesn't exist
- Updates both XP and level in Neo4j

**Error Codes**:
- 400: User ID required or invalid XP amount
- 500: Failed to update XP

---

### GET /api/user/xp?userId=xxx

**Purpose**: Fetch user's current XP and level

**Authentication**: None

**Query Parameters**:
- `userId` (required): User ID

**Response**:
```json
{
  "id": "user-id",
  "xp": 150,
  "level": 3,
  "name": "User Name",
  "email": "user@example.com"
}
```

**Features**:
- Returns 0 XP and level 1 if user not found (instead of 404)

**Error Codes**:
- 400: User ID required
- 500: Failed to fetch XP

---

## Group Chat APIs

### GET /api/groupchat

**Purpose**: Get all group chats user is a member of

**Authentication**: Required (Bearer token)

**Response**:
```json
[
  {
    "id": "group-id",
    "name": "Study Group",
    "description": "Math study group",
    "accessKey": "GROUP123",
    "memberCount": 5,
    "createdBy": "user-id",
    "createdAt": "2025-01-01T00:00:00Z"
  }
]
```

**Error Codes**:
- 401: Unauthorized
- 500: Failed to fetch group chats

---

### POST /api/groupchat

**Purpose**: Create new group chat

**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "name": "Study Group",
  "description": "Math study group", // optional
  "accessKey": "GROUP123"
}
```

**Response**:
```json
{
  "id": "group-id",
  "name": "Study Group",
  "description": "Math study group",
  "accessKey": "GROUP123",
  "createdBy": "user-id",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

**Error Codes**:
- 400: Name and access key required
- 401: Unauthorized
- 500: Failed to create group chat

---

### GET /api/groupchat/[groupId]/messages?limit=50&skip=0

**Purpose**: Get messages in group chat (top-level messages only, no thread replies)

**Authentication**: Required (Bearer token)

**Query Parameters**:
- `limit` (optional): Number of messages to fetch (default: 50)
- `skip` (optional): Number of messages to skip for pagination (default: 0)

**Response**:
```json
[
  {
    "id": "message-id",
    "content": "Hello everyone!",
    "createdBy": "user-id",
    "userName": "John Doe",
    "userEmail": "john@example.com",
    "createdAt": "2025-01-01T00:00:00Z",
    "edited": false,
    "parentId": null,
    "replyCount": 3
  }
]
```

**Error Codes**:
- 401: Unauthorized
- 500: Failed to fetch messages

---

### POST /api/groupchat/[groupId]/messages

**Purpose**: Send new message or thread reply in group chat

**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "content": "Hello everyone!",
  "parentMessageId": "message-id" // optional, for thread replies
}
```

**Response**:
```json
{
  "id": "message-id",
  "content": "Hello everyone!",
  "createdBy": "user-id",
  "userName": "John Doe",
  "userEmail": "john@example.com",
  "createdAt": "2025-01-01T00:00:00Z",
  "edited": false,
  "parentId": null,
  "replyCount": 0
}
```

**Special Features**:
- **@ai Mention Detection**: If message contains "@ai", triggers AI assistant response
  - AI analyzes full thread context
  - Creates response in same thread
  - Broadcasts via Pusher in real-time
  - Uses Socratic teaching method
  - Greets user with @mention (e.g., "@John, Hi!")
- Broadcasts message to all group members via Pusher
- Supports threading (parentMessageId)

**Error Codes**:
- 400: Message content required
- 401: Unauthorized
- 500: Failed to send message

---

### GET /api/groupchat/[groupId]/messages/[messageId]/thread

**Purpose**: Get all replies to a specific message (thread)

**Authentication**: Required (Bearer token)

**Response**:
```json
[
  {
    "id": "reply-id",
    "content": "Reply content",
    "createdBy": "user-id",
    "userName": "Jane Smith",
    "userEmail": "jane@example.com",
    "createdAt": "2025-01-01T00:00:00Z",
    "edited": false,
    "parentId": "message-id"
  }
]
```

---

### PATCH /api/groupchat/[groupId]/messages/[messageId]

**Purpose**: Edit message content

**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "content": "Updated message content"
}
```

**Response**:
```json
{
  "id": "message-id",
  "content": "Updated message content",
  "edited": true,
  "createdBy": "user-id"
}
```

**Error Codes**:
- 400: Content required
- 401: Unauthorized or not message owner
- 500: Failed to edit message

---

### DELETE /api/groupchat/[groupId]/messages/[messageId]

**Purpose**: Delete message and all its replies (cascade delete)

**Authentication**: Required (Bearer token)

**Response**:
```json
{
  "success": true
}
```

**Features**:
- Cascade deletes all nested replies
- Uses Cypher: `OPTIONAL MATCH (m)<-[:REPLY_TO*]-(reply:Message) DETACH DELETE reply, m`

**Error Codes**:
- 401: Unauthorized or not message owner
- 500: Failed to delete message

---

### POST /api/groupchat/[groupId]/ai

**Purpose**: Trigger AI response in group chat thread

**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "parentMessageId": "message-id" // optional
}
```

**Response**:
```json
{
  "id": "ai-message-id",
  "content": "AI response with thread context",
  "createdBy": "ai_assistant",
  "userName": "AI Assistant"
}
```

**Features**:
- Loads full thread context
- Generates Socratic teaching response
- Creates new message as AI Assistant
- Broadcasts via Pusher

---

### DELETE /api/groupchat/[groupId]

**Purpose**: Leave group chat

**Authentication**: Required (Bearer token)

**Response**:
```json
{
  "success": true
}
```

**Features**:
- Removes user from group membership
- Only allows leaving if you're not the only admin OR if there are other members

**Error Codes**:
- 401: Unauthorized
- 403: Cannot leave (only admin with other members)
- 500: Failed to leave group

---

### POST /api/groupchat/join

**Purpose**: Join existing group chat with access key

**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "accessKey": "GROUP123"
}
```

**Response**:
```json
{
  "id": "group-id",
  "name": "Study Group",
  "memberCount": 6
}
```

**Error Codes**:
- 400: Access key required
- 401: Unauthorized
- 404: Group not found with that access key
- 500: Failed to join group

---

## Quiz APIs

### POST /api/quiz/start

**Purpose**: Start new quiz session

**Authentication**: None

**Request Body**:
```json
{
  "userId": "user-id"
}
```

**Response**:
```json
{
  "sessionId": "quiz-session-id",
  "userId": "user-id",
  "startedAt": "2025-01-01T00:00:00Z"
}
```

---

### POST /api/quiz/submit

**Purpose**: Submit completed quiz and calculate rewards

**Authentication**: None

**Request Body**:
```json
{
  "userId": "user-id",
  "sessionId": "quiz-session-id",
  "score": 10,
  "totalQuestions": 10,
  "streak": 5,
  "answers": [0, 1, 2, 3, 0, 1, 2, 3, 0, 1]
}
```

**Response (Success)**:
```json
{
  "canOpen": true,
  "nodeType": "legendary", // "common", "rare", or "legendary"
  "xpEarned": 27,
  "oldXP": 100,
  "newXP": 127,
  "currentLevel": 2,
  "newLevel": 2,
  "xpInLevel": 0,
  "newXpInLevel": 27,
  "percentage": "100",
  "score": 10,
  "totalQuestions": 10
}
```

**Response (Below 30%)**:
```json
{
  "canOpen": false,
  "percentage": "20",
  "required": 30,
  "message": "You need at least 30% to earn a node! You got 20%. Try again!"
}
```

**Node Type Logic**:
- **Legendary** (100%): 25-30 XP - Perfect score only (score === totalQuestions)
- **Rare** (80-99%): 12-15 XP - High accuracy
- **Common** (30-79%): 3-7 XP - Decent accuracy
- **None** (0-29%): 0 XP - Below threshold

**Features**:
- Updates `QuizProgress` node with statistics
- Creates `QuizSession` node with results
- Awards XP via `/api/user/xp` endpoint
- Uses strict equality (===) for perfect score detection

**Error Codes**:
- 400: Missing required fields
- 500: Failed to submit quiz

---

## Kanban/Task APIs

### GET /api/kanban/tasks?userId=xxx

**Purpose**: Get all tasks for user

**Authentication**: None (uses userId parameter)

**Query Parameters**:
- `userId` (required): User ID

**Response**:
```json
{
  "tasks": [
    {
      "id": "task-id",
      "title": "Complete homework",
      "description": "Math homework chapter 5",
      "priority": "high", // "low", "medium", "high"
      "status": "inprogress", // "todo", "inprogress", "done"
      "dueDate": "2025-01-15T00:00:00Z",
      "createdAt": "2025-01-01T00:00:00Z",
      "completedAt": null
    }
  ]
}
```

**Error Codes**:
- 400: User ID required
- 500: Failed to fetch tasks

---

### POST /api/kanban/tasks

**Purpose**: Create new task

**Authentication**: None

**Request Body**:
```json
{
  "userId": "user-id",
  "title": "Complete homework",
  "description": "Math homework chapter 5", // optional
  "priority": "high", // optional, default: "medium"
  "status": "todo", // optional, default: "todo"
  "dueDate": "2025-01-15T00:00:00Z" // optional
}
```

**Response**:
```json
{
  "task": {
    "id": "task-id",
    "title": "Complete homework",
    "description": "Math homework chapter 5",
    "priority": "high",
    "status": "todo",
    "dueDate": "2025-01-15T00:00:00Z",
    "createdAt": "2025-01-01T00:00:00Z",
    "completedAt": null
  }
}
```

**Error Codes**:
- 400: User ID and title required
- 500: Failed to create task

---

### DELETE /api/kanban/tasks/[taskId]

**Purpose**: Delete task

**Authentication**: None (verifies ownership via userId in body)

**Request Body**:
```json
{
  "userId": "user-id"
}
```

**Response**:
```json
{
  "success": true
}
```

**Features**:
- Verifies task ownership before deleting
- Uses Cypher: `MATCH (u:User {id: $userId})-[:HAS_TASK]->(t:Task {id: $taskId})`

**Error Codes**:
- 400: User ID required
- 403: Not task owner
- 500: Failed to delete task

---

### PATCH /api/kanban/tasks/[taskId]/move

**Purpose**: Move task between columns (todo/inprogress/done)

**Authentication**: None (verifies ownership)

**Request Body**:
```json
{
  "userId": "user-id",
  "status": "done" // "todo", "inprogress", "done"
}
```

**Response**:
```json
{
  "success": true
}
```

**Features**:
- Sets `completedAt` timestamp when moved to "done"
- Awards XP when task completed (1.01-1.75 XP range)

**Error Codes**:
- 400: User ID and status required
- 403: Not task owner
- 500: Failed to move task

---

## Leaderboard APIs

### GET /api/leaderboard?userId=xxx&timeframe=daily&type=xp

**Purpose**: Get leaderboard rankings with timeframe filtering

**Authentication**: None

**Query Parameters**:
- `userId` (required): Current user ID
- `timeframe` (optional): "daily", "weekly", "monthly", "all-time" (default: "all-time")
- `type` (optional): "xp" or "accuracy" (default: "xp")

**Response**:
```json
{
  "rankings": [
    {
      "rank": 1,
      "userId": "user-id",
      "name": "Top Player",
      "xp": 500,
      "level": 6,
      "attempts": 10,
      "iconType": "emoji",
      "iconEmoji": "👑",
      "iconColor": "#FFD700"
    }
  ],
  "userRank": {
    "rank": 15,
    "userId": "current-user-id",
    "name": "Current User",
    "xp": 150,
    "level": 3
  },
  "totalUsers": 50,
  "timeframe": "daily",
  "type": "xp"
}
```

**Timeframe Logic**:
- **daily**: Past 24 hours (uses `datetime() - duration({days: 1})`)
- **weekly**: Past 7 days (uses `datetime() - duration({days: 7})`)
- **monthly**: Past 30 days (uses `datetime() - duration({days: 30})`)
- **all-time**: Total XP or overall accuracy

**Type Options**:
- **xp**: Rankings by XP earned
- **accuracy**: Rankings by quiz accuracy (sum of scores / sum of total questions * 100)

**Features**:
- Always includes top 3 players
- Returns top 10 users
- Includes user's rank even if outside top 10 (with 2 users before and after for context)
- All users shown even with 0 XP/accuracy

**Error Codes**:
- 400: Missing userId parameter
- 500: Failed to fetch leaderboard

---

## Achievements APIs

### GET /api/achievements?userId=xxx

**Purpose**: Get user achievements and statistics

**Authentication**: None

**Query Parameters**:
- `userId` (required): User ID

**Response**:
```json
{
  "totalXP": 150,
  "level": 3,
  "quizzesCompleted": 5,
  "commonCompleted": 2,
  "rareCompleted": 2,
  "legendaryCompleted": 1,
  "tasksCompleted": 10,
  "currentStreak": 3,
  "bestStreak": 5
}
```

---

## Markdown/Notes APIs

### GET /api/markdown/[conversationId]

**Purpose**: Get markdown notes for conversation

**Authentication**: None

**Response**:
```json
{
  "content": "# My Notes\n\nMarkdown content here",
  "lastModified": "2025-01-01T00:00:00Z",
  "conversationId": "session-id"
}
```

---

### POST /api/markdown/[conversationId]

**Purpose**: Save markdown notes for conversation

**Authentication**: None

**Request Body**:
```json
{
  "content": "# My Notes\n\nMarkdown content here",
  "userId": "user-id"
}
```

**Response**:
```json
{
  "success": true,
  "lastModified": "2025-01-01T00:00:00Z"
}
```

**Features**:
- Auto-saves every 2 seconds in UI
- Creates or updates MarkdownNote node
- Relationship: `(:Session)-[:HAS_NOTES]->(:MarkdownNote)`

---

### POST /api/markdown/mindmap

**Purpose**: Generate mind map from markdown content

**Authentication**: None

**Request Body**:
```json
{
  "markdown": "# Main Topic\n\n## Subtopic 1\n\n## Subtopic 2"
}
```

**Response**:
```json
{
  "mindmap": "mindmap-formatted-content"
}
```

---

## Pusher Real-time APIs

### POST /api/pusher/auth

**Purpose**: Authenticate Pusher private channel subscription

**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "socket_id": "pusher-socket-id",
  "channel_name": "private-group-chat-xxx"
}
```

**Response**:
```json
{
  "auth": "pusher-auth-signature"
}
```

---

### POST /api/pusher/typing

**Purpose**: Broadcast typing indicator

**Authentication**: None

**Request Body**:
```json
{
  "groupId": "group-id",
  "userId": "user-id",
  "userName": "User Name"
}
```

**Response**:
```json
{
  "success": true
}
```

---

### POST /api/pusher/typing/stop

**Purpose**: Stop typing indicator

**Authentication**: None

**Request Body**:
```json
{
  "groupId": "group-id",
  "userId": "user-id"
}
```

**Response**:
```json
{
  "success": true
}
```

---

## TTS (Text-to-Speech) APIs

### POST /api/tts

**Purpose**: Convert text to speech audio (MP3)

**Authentication**: None

**Request Body**:
```json
{
  "text": "Hello, this is text to speech"
}
```

**Response**:
- **Content-Type**: `audio/mpeg`
- **Body**: Binary MP3 audio data

**Features**:
- Uses gTTS (Google Text-to-Speech) Python library
- Generates MP3 audio file
- Streams audio directly to client

**Error Codes**:
- 400: Text required
- 500: Failed to generate audio

---

## Administrator APIs

### POST /api/administrator/auth

**Purpose**: Authenticate administrator access

**Authentication**: None (validates hardcoded credentials)

**Request Body**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response**:
```json
{
  "success": true,
  "token": "admin-token"
}
```

---

### GET /api/administrator/quiz

**Purpose**: Get quiz analytics (admin only)

**Authentication**: Required (admin token)

**Response**:
```json
{
  "totalQuizzes": 100,
  "averageScore": 75.5,
  "nodeTypeDistribution": {
    "common": 40,
    "rare": 35,
    "legendary": 25
  }
}
```

---

## Common Response Patterns

### Error Response Format

All API errors follow this format:
```json
{
  "error": "Error message describing what went wrong"
}
```

Some endpoints may include additional details:
```json
{
  "error": "Error message",
  "details": "Additional error information"
}
```

### Success Response Format

Success responses vary by endpoint but typically include:
- Status code 200 (OK) or 201 (Created)
- JSON body with relevant data
- No "error" field

---

## Authentication Patterns

### Bearer Token Authentication

Endpoints requiring authentication expect:
```
Authorization: Bearer {supabase-jwt-token}
```

Tokens are validated via Supabase:
```javascript
const { data: { user }, error } = await supabase.auth.getUser(token)
```

### No Authentication

Many endpoints don't require authentication but rely on userId parameter. These should be protected at the application level by only allowing authenticated users to make requests.

---

## Database Architecture

### Neo4j Nodes

- **User**: User profiles with XP, level, icons
- **Session**: AI chat conversations
- **Chat**: Individual messages in AI tutor
- **GroupChat**: Group chat rooms
- **Message**: Messages in group chat with threading
- **Task**: Kanban tasks
- **QuizSession**: Quiz completion records
- **QuizProgress**: Aggregate quiz statistics
- **MarkdownNote**: Markdown notes per conversation
- **MindMap**: Mind map visualizations
- **AceMemoryState**: ACE memory bullets per user

### Key Relationships

- `(:User)-[:HAS]->(:Session)` - User owns AI chat sessions
- `(:Session)-[:OCCURRED]->(:Chat)` - Session contains chat messages
- `(:Chat)-[:NEXT]->(:Chat)` - Sequential message chain
- `(:User)-[:MEMBER_OF]->(:GroupChat)` - Group chat membership
- `(:GroupChat)-[:CONTAINS]->(:Message)` - Group contains messages
- `(:User)-[:POSTED]->(:Message)` - User posted message
- `(:Message)-[:REPLY_TO]->(:Message)` - Thread replies
- `(:User)-[:HAS_TASK]->(:Task)` - User owns task
- `(:User)-[:COMPLETED]->(:QuizSession)` - User completed quiz
- `(:User)-[:HAS_QUIZ_PROGRESS]->(:QuizProgress)` - Quiz statistics
- `(:Session)-[:HAS_NOTES]->(:MarkdownNote)` - Notes per conversation
- `(:User)-[:HAS_ACE_MEMORY]->(:AceMemoryState)` - Per-learner memory

---

## Rate Limiting & Performance

### No Rate Limiting

Currently, there is no rate limiting implemented. In production, consider adding:
- Rate limiting middleware
- Request throttling
- DDoS protection

### Performance Considerations

- **Pagination**: Group chat messages support limit/skip pagination
- **Neo4j Connection Pooling**: Driver initialized once, sessions created per request
- **Pusher Broadcasting**: Asynchronous, non-blocking
- **AI Responses**: Use Python subprocess, may take 5-60 seconds
- **Memory Caching**: ACE memory loaded once per session

---

## Environment Variables Required

### Essential
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXT_PUBLIC_NEO4J_URI` - Neo4j database URI
- `NEXT_PUBLIC_NEO4J_USERNAME` - Neo4j username
- `NEXT_PUBLIC_NEO4J_PASSWORD` - Neo4j password
- `GEMINI_API_KEY` - Google Gemini API key

### Optional
- `GEMINI_MODEL` - Gemini model (default: "gemini-2.5-flash")
- `ACE_LLM_TEMPERATURE` - LLM temperature (default: "0.2")
- `PUSHER_APP_ID` - Pusher app ID
- `PUSHER_SECRET` - Pusher secret key
- `NEXT_PUBLIC_PUSHER_KEY` - Pusher public key
- `NEXT_PUBLIC_PUSHER_CLUSTER` - Pusher cluster (e.g., "us2")
- `TAVILY_API_KEY` - Tavily search API key (for web search tool)

---

## API Testing

### Using cURL

```bash
# AI Chat
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Help me solve 2+2"}'

# Get User XP
curl http://localhost:3000/api/user/xp?userId=USER_ID

# Create Task
curl -X POST http://localhost:3000/api/kanban/tasks \
  -H "Content-Type: application/json" \
  -d '{"userId": "USER_ID", "title": "Test Task", "priority": "high"}'

# Get Leaderboard
curl "http://localhost:3000/api/leaderboard?userId=USER_ID&timeframe=daily&type=xp"
```

### Using Frontend Fetch

```javascript
// AI Chat
const response = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'Help me solve 2+2',
    conversationHistory: []
  })
})

// Get User Profile
const profile = await fetch(`/api/user/profile?userId=${userId}`)
const data = await profile.json()
```

---

## Changelog

### January 2025
- Added comprehensive API documentation
- Documented all 26+ API endpoints
- Added request/response examples
- Documented authentication patterns
- Added database architecture overview

---

## Support & Contact

For issues or questions about these APIs:
- Check the CLAUDE.md file for implementation details
- Review the setup/README.rst for environment setup
- Consult docs/minimalTest/useCase.md for test scenarios
- See docs/telemetryAndObservability/log.md for debugging

---

**Last Updated**: January 30, 2025
