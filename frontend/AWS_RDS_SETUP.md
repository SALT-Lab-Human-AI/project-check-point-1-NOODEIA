# AWS RDS PostgreSQL Setup Guide

## Step 1: Create RDS PostgreSQL Instance

1. **Login to AWS Console**
   - Navigate to RDS service
   - Click "Create database"

2. **Database Configuration**:
   ```
   Engine options:
   - Engine type: PostgreSQL
   - Version: PostgreSQL 15.x (latest)

   Templates:
   - Free tier (for development)

   Settings:
   - DB instance identifier: noodeia-db
   - Master username: NOODEIA (or your choice - REMEMBER THIS!)
   - Master password: [Choose a strong password - SAVE THIS!]

   Instance configuration:
   - DB instance class: db.t3.micro (free tier)

   Storage:
   - Storage type: General Purpose SSD (gp3)
   - Allocated storage: 20 GB

   Connectivity:
   - VPC: Default VPC
   - Public access: Yes (REQUIRED for local development)
   - VPC security group: Create new
     * Name: noodeia-db-sg
   - Database port: 5432

   Database authentication:
   - Password authentication

   Additional configuration:
   - Initial database name: noodeia_db (IMPORTANT!)
   - ✅ Enable automated backups
   - Backup retention: 7 days
   ```

3. **Click "Create database"** (takes 5-10 minutes)

## Step 2: Configure Security Group

1. **After RDS instance is created**:
   - Click on your database instance
   - Go to "Connectivity & security" tab
   - Click on the VPC security group link

2. **Edit Inbound Rules**:
   ```
   Add Rule:
   - Type: PostgreSQL
   - Protocol: TCP
   - Port: 5432
   - Source: Choose one:
     * My IP (safest for development)
     * 0.0.0.0/0 (allows all IPs - use only for testing)
     * Custom: Your specific IP address
   - Description: Local development access
   ```

3. **Save rules**

## Step 3: Get Connection Details

1. **In RDS Console**, click on your database
2. **Find Endpoint & Port**:
   ```
   Endpoint: noodeia-db.xxxxxxxxxxxxx.us-east-1.rds.amazonaws.com
   Port: 5432
   ```

3. **Build your connection string**:
   ```
   DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@[ENDPOINT]:5432/noodeia_db?schema=public&sslmode=require"
   ```

## Step 4: Update Local Environment

1. **Create/Update `.env` file** (for Prisma CLI):
   ```bash
   DATABASE_URL="postgresql://[USERNAME]:[PASSWORD]@[ENDPOINT]:5432/noodeia_db?schema=public"
   ```

2. **Create/Update `.env.local` file** (for Next.js runtime):
   ```bash
   DATABASE_URL="postgresql://[USERNAME]:[PASSWORD]@[ENDPOINT]:5432/noodeia_db?schema=public"
   ```

   **IMPORTANT**:
   - Replace [USERNAME] with your master username (e.g., NOODEIA)
   - Replace [PASSWORD] with your password (no brackets!)
   - Replace [ENDPOINT] with your RDS endpoint (no brackets!)
   - Both files need the same connection string

## Step 5: Set Up Database Schema

```bash
# Push schema to create tables in AWS RDS
npx prisma db push

# This will:
# - Create all tables (User, Conversation, Message)
# - Generate Prisma Client
# - Sync your database with the schema

# Verify with Prisma Studio (optional)
npx prisma studio
# Opens at http://localhost:5555
```

## Step 6: Test Connection

1. **Start your local app**:
   ```bash
   npm run dev
   ```

2. **Test features**:
   - Create a new chat
   - Send messages
   - Refresh page to verify persistence
   - Check Prisma Studio to see data in AWS RDS

## Troubleshooting

### Connection Timeout
- Check security group allows your IP (add "My IP" in inbound rules)
- Verify "Public accessibility" is set to "Yes"
- Confirm endpoint URL is correct (no brackets!)

### Authentication Failed (P1000 Error)
- **Check master username** in RDS Console → Configuration tab
- Username might not be 'postgres' (could be custom like 'NOODEIA')
- Password is case-sensitive
- Remove any brackets from connection string

### Database Not Found (P1003 Error)
- This is normal for new databases!
- Just run `npx prisma db push` to create tables

### Environment Variable Not Found
- Make sure both `.env` and `.env.local` files exist
- Both need the DATABASE_URL variable
- Prisma CLI reads from `.env`
- Next.js reads from `.env.local`

## Security Best Practices

1. **For Production**:
   - Set Public access: No
   - Use VPC peering or VPN
   - Rotate passwords regularly
   - Enable encryption at rest

2. **Connection String Security**:
   - Never commit .env files to Git
   - Use AWS Secrets Manager for production
   - Restrict IP access in security groups

## Cost Management

**Free Tier Includes**:
- 750 hours of db.t3.micro instance
- 20 GB of storage
- 20 GB of backup storage

**To Stay in Free Tier**:
- Use only one RDS instance
- Don't exceed 20 GB storage
- Delete old backups regularly
- Stop instance when not in use (for development)

## Next Steps

After database is working:
1. ✅ Local app connects to AWS RDS
2. ✅ Data persists in cloud
3. ✅ Multiple users can have separate conversations

Your app is now using a cloud database! The frontend runs locally but all data is stored in AWS RDS.