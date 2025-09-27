# Database Setup Instructions

## Prerequisites
1. Install PostgreSQL on your local machine
2. Make sure PostgreSQL service is running

## Setup Steps

### 1. Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE noodeia_db;

# Exit psql
\q
```

### 2. Update Environment Variables
Update the `.env.local` file with your PostgreSQL credentials:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/noodeia_db?schema=public"
```

### 3. Run Prisma Migration
```bash
# Generate Prisma client
npx prisma generate

# Create tables in database
npx prisma migrate dev --name init
```

### 4. Verify Database Setup
```bash
# Open Prisma Studio to view data
npx prisma studio
```

## What Was Implemented

### Database Schema
- **Users**: Stores user information (id, email, name)
- **Conversations**: Stores chat conversations linked to users
- **Messages**: Stores individual messages in conversations

### API Routes
- `POST /api/users` - Create or find user
- `GET /api/conversations?userId={id}` - Get user's conversations
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations/[id]` - Get specific conversation
- `POST /api/conversations/[id]/messages` - Add message to conversation

### Frontend Integration
- Automatic user creation with unique email
- Conversations persist to database
- Messages save to database on send
- Chat history loads on page refresh

## Testing
1. Start the development server: `npm run dev`
2. Open the app and send messages
3. Refresh the page - your conversations will persist
4. Check Prisma Studio to see data in database