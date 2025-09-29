# Noodeia - AI Tutor Chat Interface

A personalized AI tutor chat application built with Next.js, Supabase, and deployed on GitHub Pages.

## Features

- 💬 Real-time chat interface with AI responses
- 🗂️ Multiple conversation management
- 💾 Persistent chat history in the cloud
- 🌓 Dark/Light theme support
- 📱 Responsive design
- 🔒 User-specific data isolation
- 🚀 Static site deployment (no server required)

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Hosting**: GitHub Pages
- **UI Components**: Radix UI, Lucide Icons

## Complete Setup Guide

### Prerequisites

- Node.js 18+ installed
- Git installed
- GitHub account
- Supabase account (free)

### Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/your-username/project-check-point-1-noodiea.git
cd project-check-point-1-noodiea/frontend

# Install dependencies
npm install --legacy-peer-deps
```

### Step 2: Set Up Supabase Database

#### 2.1 Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/login with GitHub
3. Click **"New project"**
4. Configure your project:
   - **Project name**: `noodeia`
   - **Database password**: Choose a strong password (save it!)
   - **Region**: Select closest to your location
   - **Pricing Plan**: Free tier (sufficient for this project)
5. Click **"Create new project"** (takes 2-3 minutes)

#### 2.2 Get API Credentials

1. Once project is ready, go to **Settings** → **API**
2. Copy these values (you'll need them later):
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### 2.3 Create Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy and paste this entire SQL script:

```sql
-- Create users table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create conversations table
CREATE TABLE conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create messages table
CREATE TABLE messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX idx_messages_created_at ON messages(created_at ASC);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (demo mode)
-- In production, implement proper authentication
CREATE POLICY "Enable all operations for all users" ON users
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for all users" ON conversations
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for all users" ON messages
    FOR ALL USING (true) WITH CHECK (true);
```

4. Click **"Run"** button
5. You should see "Success. No rows returned" message
6. Verify tables were created by going to **Table Editor** - you should see 3 tables: users, conversations, messages

### Step 3: Configure Environment Variables

1. Create `.env.local` file in the frontend directory:

```bash
# In frontend directory
touch .env.local
```

2. Open `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important**: Replace the values with your actual Supabase project URL and anon key from Step 2.2

### Step 4: Test Locally

```bash
# Start development server
npm run dev
```

1. Open [http://localhost:3000](http://localhost:3000)
2. Send a test message
3. Refresh the page - your message should persist
4. Check Supabase dashboard → **Table Editor** to see your data

### Step 5: Deploy to GitHub Pages

#### 5.1 Prepare Repository

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit with Supabase integration"

# Add your GitHub repository as origin
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main
```

#### 5.2 Deploy to GitHub Pages

```bash
# Build and deploy to GitHub Pages
npm run deploy
```

This command will:
- Build the static site
- Create/update `gh-pages` branch
- Push to GitHub Pages

#### 5.3 Enable GitHub Pages

1. Go to your GitHub repository
2. Navigate to **Settings** → **Pages**
3. Under "Source", select:
   - **Source**: Deploy from a branch
   - **Branch**: `gh-pages`
   - **Folder**: `/ (root)`
4. Click **Save**

#### 5.4 Access Your Site

Your site will be available at:
```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME
```

**Note**: Initial deployment may take 10-20 minutes. You can check deployment status in the Actions tab.

## Project Structure

```
frontend/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── AIAssistantUI.jsx # Main chat interface
│   ├── ChatPane.jsx      # Chat messages area
│   ├── Composer.jsx      # Message input
│   ├── Header.jsx        # App header
│   └── Sidebar.jsx       # Conversations sidebar
├── lib/                   # Utility functions
│   ├── supabase.js       # Supabase client
│   └── utils.ts          # Helper functions
├── public/                # Static assets
└── styles/               # Global styles
```

## Usage

### For End Users

1. **First Visit**: A unique user ID is automatically created and stored in your browser
2. **Start Chatting**: Type a message and press Enter or click Send
3. **Multiple Conversations**: Click "New Chat" to start a new conversation
4. **Switch Conversations**: Use the sidebar to switch between conversations
5. **Theme Toggle**: Click the theme button to switch between light/dark mode
6. **Keyboard Shortcuts**:
   - `Ctrl/Cmd + N`: New chat
   - `Escape`: Close sidebar

### For Developers

#### Local Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

#### Database Management

- View data: Supabase Dashboard → Table Editor
- Run queries: Supabase Dashboard → SQL Editor
- Monitor usage: Supabase Dashboard → Database → Statistics

#### Customization

1. **Change repository name**: Update `basePath` in `next.config.mjs`
2. **Modify AI responses**: Edit the response logic in `AIAssistantUI.jsx`
3. **Add authentication**: Implement Supabase Auth and update RLS policies
4. **Custom styling**: Modify Tailwind classes or update `globals.css`

## Troubleshooting

### Common Issues

#### "Supabase credentials not found"
- Ensure `.env.local` exists and contains correct values
- No quotes needed around the environment variable values
- Restart dev server after changing `.env.local`

#### Data not persisting
- Check browser console for errors (F12)
- Verify Supabase URL and anon key are correct
- Ensure tables were created (check Table Editor in Supabase)
- Check if Row Level Security policies are enabled

#### GitHub Pages shows 404
- Wait 10-20 minutes for initial deployment
- Verify `gh-pages` branch exists in your repository
- Check GitHub Pages is enabled in repository settings
- Ensure you're using the correct URL format

#### Build fails
- Run `npm install --legacy-peer-deps` to resolve peer dependencies
- Clear `.next` folder and rebuild: `rm -rf .next && npm run build`
- Check Node.js version (should be 18+)

### Getting Help

- Check browser console for detailed error messages
- Review Supabase logs: Dashboard → Logs → API
- GitHub deployment status: Repository → Actions tab
- Create an issue in the repository for bugs

## Limitations

### Free Tier Limits

**Supabase Free Tier:**
- 500MB database storage
- 2GB bandwidth/month
- 50,000 monthly active users
- Pauses after 1 week of inactivity (can be reactivated)

**GitHub Pages:**
- 100GB bandwidth/month
- 1GB repository size
- Static sites only (no server-side rendering)

### Application Limitations

- Demo AI responses (not connected to real AI service)
- No real-time sync between multiple browser tabs
- User data tied to browser (clearing browser data loses user ID)
- No user authentication (anyone can access any conversation if they have the ID)

## Future Enhancements

- [ ] Integrate with OpenAI/Anthropic API for real AI responses
- [ ] Add user authentication with Supabase Auth
- [ ] Implement real-time updates with Supabase Realtime
- [ ] Add file upload support
- [ ] Export conversations to PDF/Markdown
- [ ] Add conversation search functionality
- [ ] Implement conversation sharing
- [ ] Add typing indicators
- [ ] Support for code syntax highlighting
- [ ] Mobile app with React Native

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is part of an academic course (IS492) and is for educational purposes.

## Acknowledgments

- Next.js team for the amazing framework
- Supabase for the generous free tier
- Radix UI for accessible component primitives
- The IS492 course instructors and team members

## Support

For issues, questions, or suggestions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Search existing [GitHub Issues](https://github.com/your-username/your-repo/issues)
3. Create a new issue with detailed information

---

Built with ❤️ for IS492 Project