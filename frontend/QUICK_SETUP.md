# Quick Setup Guide - Noodeia Frontend with AWS Database

## Prerequisites
- Node.js installed
- AWS account with RDS PostgreSQL database created

## 5-Minute Setup

### 1. Install Dependencies
```bash
cd frontend
npm install --legacy-peer-deps
```

### 2. Configure Database Connection
Create two files with your AWS RDS connection string:

**.env** (for Prisma CLI):
```
DATABASE_URL="postgresql://USERNAME:PASSWORD@your-rds-endpoint.amazonaws.com:5432/noodeia_db?schema=public"
```

**.env.local** (for Next.js):
```
DATABASE_URL="postgresql://USERNAME:PASSWORD@your-rds-endpoint.amazonaws.com:5432/noodeia_db?schema=public"
```

⚠️ **IMPORTANT**:
- Replace USERNAME with your RDS master username
- Replace PASSWORD with your RDS password
- Replace endpoint with your actual RDS endpoint
- NO BRACKETS in the actual values!

### 3. Create Database Tables
```bash
npx prisma db push
```

### 4. Run the Application
```bash
npm run dev
```

Your app is now running at http://localhost:3000 with cloud database! 🎉

## Verify It's Working
1. Open the app in your browser
2. Send a chat message
3. Refresh the page - your message persists!
4. (Optional) View data: `npx prisma studio`

## Common Issues

**Can't connect to database?**
- Check AWS RDS security group allows your IP
- Verify "Public accessibility" is "Yes" in RDS settings
- Make sure username/password are correct (check RDS Console → Configuration)

**Authentication error?**
- Master username might not be 'postgres' - check RDS Console
- Password is case-sensitive
- Remove any brackets from connection string

**Environment variable not found?**
- Make sure BOTH .env and .env.local files exist
- Both need the same DATABASE_URL

## What This Setup Gives You
✅ Each user gets unique ID (stored in browser)
✅ All chats saved to AWS cloud database
✅ Messages persist across page refreshes
✅ Multiple users have separate chat histories
✅ Production-ready database architecture

For detailed setup instructions, see `AWS_RDS_SETUP.md`