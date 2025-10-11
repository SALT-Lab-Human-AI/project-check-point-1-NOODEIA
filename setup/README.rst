==================================
Noodeia AI Tutor - Setup Guide
==================================

.. contents:: Table of Contents
   :local:
   :depth: 2

Overview
--------

Noodeia is a personalized AI tutor chat application with:

* **Frontend**: Next.js 15.2.4 with App Router
* **Authentication**: Supabase Auth (JWT tokens)
* **Database**: Neo4j AuraDB (Graph Database)
* **AI Model**: Google Gemini 2.5 Pro
* **Real-time**: Pusher (optional)
* **Deployment**: Railway / Render (migrated from Vercel on 2025-10-10)

Prerequisites
-------------

* Node.js 18+ installed
* Git installed
* Supabase account (free tier) - for authentication
* Neo4j AuraDB account (free tier) - for data storage
* Vercel account (free tier) - for deployment

Quick Start (10 Minutes)
-------------------------

1. **Clone & Install**

   .. code-block:: bash

      git clone https://github.com/SALT-Lab-Human-AI/project-check-point-1-NOODEIA.git
      cd project-check-point-1-NOODEIA/frontend
      npm install --legacy-peer-deps

2. **Set Up Supabase (Authentication)**

   a. Create account at https://supabase.com
   b. Create new project (free tier)
   c. Get credentials from Settings → API:

      * Project URL
      * anon public key

   Note: Supabase is only used for authentication. No database tables needed.

3. **Set Up Neo4j AuraDB (Database)**

   a. Create account at https://console.neo4j.io/
   b. Create new AuraDB instance (free tier)
   c. Save your credentials:

      * Connection URI (e.g., neo4j+s://xxxxx.databases.neo4j.io)
      * Username (default: neo4j)
      * Password (generated during setup)

4. **Configure Environment**

   Copy the example file and add your credentials:

   .. code-block:: bash

      cd frontend
      cp .env.local.example .env.local

   Then edit ``frontend/.env.local`` with your actual credentials:

   .. code-block:: text

      # Supabase - Authentication Only
      NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
      NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

      # Neo4j AuraDB - All Data Storage
      NEXT_PUBLIC_NEO4J_URI=neo4j+s://xxxxx.databases.neo4j.io
      NEXT_PUBLIC_NEO4J_USERNAME=neo4j
      NEXT_PUBLIC_NEO4J_PASSWORD=your-password

      # Google Gemini AI - Required for AI features
      GEMINI_API_KEY=your-gemini-api-key
      # Get your key from: https://aistudio.google.com/app/apikey

5. **Initialize Neo4j Database**

   .. code-block:: bash

      npm run setup-neo4j
      npm run setup-groupchat  # (Optional) Setup group chat feature

   This creates the required constraints and indexes in your Neo4j database.

6. **Install Python Dependencies (Optional - for TTS feature)**

   .. code-block:: bash

      cd frontend
      pip3 install -r requirements.txt
      # This installs gtts==2.5.0 for Text-to-Speech functionality

   Note: Python3 must be installed on your system for TTS to work.

7. **Test Locally**

   .. code-block:: bash

      npm run dev
      # Open http://localhost:3000

8. **Deploy to Vercel (Recommended)**

   a. Go to https://vercel.com and sign up with GitHub
   b. Click "Add New Project" and import this repository

   c. **IMPORTANT: Configure Root Directory**

      * Click "Edit" next to Root Directory
      * Enter: ``frontend``
      * Click "Save"

   d. Configure Build Settings:

      * Install Command: ``npm install --legacy-peer-deps``
      * (Click "Override" to set the install command)

   e. Add all 5 environment variables from ``.env.local``

      * Check: Production, Preview, Development for each variable

   f. Click "Deploy"

Your app will be live at: ``https://your-project.vercel.app``

**Detailed Guide:** See ``setup/VERCEL_DEPLOYMENT.md`` for complete instructions

Architecture
------------

**Hybrid Architecture:**

* **Supabase**: Handles user authentication (signup/login)
* **Neo4j AuraDB**: Stores all application data in graph format
* **Google Gemini 2.5 Pro**: Powers AI tutor responses (upgraded from 2.0 Flash)
* **Pusher**: Real-time messaging (optional, configured but can be disabled)

**AI Tutor Graph Structure:**
  ``(:User)-[:HAS]->(:Session)-[:OCCURRED]->(:Chat)-[:NEXT]->(:Chat)``

  * Users own Sessions (conversations)
  * Sessions contain Chats (messages)
  * Chats link to next Chat via NEXT relationship

**Group Chat Graph Structure:**
  ``(:User)-[:MEMBER_OF]->(:GroupChat)-[:CONTAINS]->(:Message)-[:REPLY_TO]->(:Message)``

  * Users join GroupChats with access keys
  * GroupChats contain Messages
  * Messages can reply to other Messages (Slack-style threading)
  * AI Assistant can be invoked with ``@ai`` mentions

Detailed Setup Guides
---------------------

For comprehensive instructions, refer to:

**Neo4j Setup Guide**
   ``setup/NEO4J_SETUP.md`` - Complete Neo4j configuration and graph model

**Project Configuration**
   ``README.md`` - Architecture notes and configuration details

Project Structure
-----------------

::

   project-check-point-1-NOODEIA/
   ├── frontend/                   # Main application
   │   ├── app/                   # Next.js app router
   │   ├── components/            # React components (10 files)
   │   │   ├── ui/               # UI primitives (4 files: button, card, input, label)
   │   │   ├── AIAssistantUI.jsx
   │   │   ├── AuthForm.jsx
   │   │   ├── ChatPane.jsx
   │   │   ├── GroupChat.jsx
   │   │   ├── GroupChatList.jsx
   │   │   ├── GroupChatAccessModal.jsx
   │   │   ├── ThreadedMessage.jsx
   │   │   ├── ThreadPanel.jsx
   │   │   ├── Composer.jsx
   │   │   ├── ConversationRow.jsx
   │   │   ├── Header.jsx
   │   │   ├── Message.jsx
   │   │   ├── Sidebar.jsx
   │   │   ├── ThemeToggle.jsx
   │   │   └── utils.js
   │   ├── lib/                   # Core utilities
   │   │   ├── neo4j.js          # Neo4j driver service
   │   │   ├── database-adapter.js # Database abstraction
   │   │   ├── supabase.js       # Supabase auth client
   │   │   ├── pusher.js         # Pusher real-time client
   │   │   └── utils.ts          # Helper functions
   │   ├── services/
   │   │   ├── neo4j.service.js  # Neo4j CRUD operations
   │   │   ├── groupchat.service.js # Group chat operations
   │   │   └── gemini.service.js # Google Gemini AI client
   │   ├── scripts/
   │   │   ├── setup-neo4j.js    # Database initialization
   │   │   └── text2audio.py     # Python TTS script
   │   ├── hooks/                # React hooks
   │   ├── .env.local            # Environment variables (create this)
   │   ├── requirements.txt      # Python dependencies (gtts==2.5.0)
   │   └── package.json
   ├── setup/                     # Setup documentation
   │   ├── README.rst            # This file
   │   └── NEO4J_SETUP.md        # Detailed Neo4j guide
   └── README.md                 # Project overview

Key Features
------------

* 💬 Real-time chat interface with AI tutor (Gemini 2.5 Pro)
* 👥 Group chat with Slack-style threading
* 🤖 AI assistant with @ai mentions (works in main channel and thread replies)
* 🗂️ Multiple conversation management
* 💾 Graph database storage (Neo4j)
* 🔐 Secure authentication (Supabase)
* 🌓 Dark/Light theme
* 📱 Responsive design
* 🚀 Serverless deployment (Vercel)
* ✏️ Edit and delete messages with cascade delete for threads
* 🔄 Edit and resend messages with real AI responses (not mock)
* 🔄 Server-side @ai detection for reliable AI responses

Using the Application
---------------------

**AI Tutor:**

1. Create account or login via Supabase Auth
2. Start chatting - AI responds to every message using Gemini 2.5 Pro
3. AI uses Socratic teaching method (guides with questions rather than direct answers)
4. Create multiple conversations from the sidebar
5. Delete conversations by clicking the delete button in sidebar
6. **Edit messages**: Click the three-dot menu to edit your message and get a new AI response
7. **Resend messages**: Click resend to regenerate the AI response without editing your message

**Group Chat:**

1. Click "New Group Chat" in the sidebar
2. **Create** a new group with a name and access key, or **Join** existing group with access key
3. Send messages in the main channel
4. **Reply to messages**: Click "Reply" or the reply count to open thread panel
5. **Threading**: Slack-style side panel shows parent message and all replies
6. **Invoke AI**: Type ``@ai`` in any message (main channel or thread reply) to get AI response

   - AI responds in a thread when mentioned in main channel
   - AI responds in the same thread when mentioned in a reply
   - AI reads full thread context before responding
   - AI greets users with @mention (e.g., "@John, Hi!")
   - AI shows complete thread context including parent message

7. **Edit/Delete**: Click the three-dot menu on your own messages

   - Deleting a parent message cascades to all replies
   - Edited messages show "(edited)" indicator

8. **Leave group**: Click the logout icon in the header

Common Commands
---------------

.. code-block:: bash

   # Development
   npm run dev              # Start dev server
   npm run build            # Build for production
   npm run setup-neo4j      # Initialize Neo4j database
   npm run setup-groupchat  # Setup group chat schema (optional)

   # Dependencies
   npm install --legacy-peer-deps   # Install Node.js dependencies

   # Python Dependencies (for Text-to-Speech feature)
   pip3 install -r requirements.txt     # Install Python dependencies (gtts)
   # OR manually install:
   pip3 install gtts                    # Google Text-to-Speech library

Troubleshooting
---------------

**"Cannot read properties of null (reading 'session')" error:**
   - Ensure ``.env.local`` file exists with all Neo4j variables
   - Restart dev server after editing ``.env.local``
   - Run ``npm run setup-neo4j`` to initialize database
   - Check browser console for detailed error messages

**Supabase connection issues:**
   - Verify ``.env.local`` has correct Supabase credentials
   - Only authentication is needed - no database tables required

**Neo4j connection issues:**
   - Test connection with ``npm run setup-neo4j``
   - Verify Neo4j AuraDB instance is running
   - Check credentials in ``.env.local``
   - Ensure URI starts with ``neo4j+s://``

**Build failures:**
   - Use ``npm install --legacy-peer-deps``
   - Delete ``.next`` and ``node_modules`` folders, reinstall
   - Ensure Node.js 18+ is installed

**App loads but shows "Creating new chat" error:**
   - Open browser console to see detailed error
   - Most likely Neo4j connection issue
   - Verify all environment variables are set correctly

**AI not responding:**
   - Verify ``GEMINI_API_KEY`` is set in ``.env.local``
   - Get API key from https://aistudio.google.com/app/apikey
   - Check server console for Gemini API errors
   - Ensure API key has no extra spaces or quotes

**Group chat messages not showing:**
   - Run ``npm run setup-groupchat`` to initialize group chat schema
   - Verify Neo4j connection is working
   - Check browser console for API errors

**Thread panel not opening:**
   - Ensure message has ``replyCount`` property in Neo4j
   - Check for JavaScript errors in browser console
   - Verify ThreadPanel component is imported in GroupChat.jsx

**Pusher errors (400 status code):**
   - Verify Pusher credentials in ``.env.local`` are correct
   - Check that ``PUSHER_SECRET`` and ``NEXT_PUBLIC_PUSHER_KEY`` are not swapped
   - Format should be:

     - ``PUSHER_SECRET=`` (the secret value)
     - ``NEXT_PUBLIC_PUSHER_KEY=`` (the key value)
     - ``NEXT_PUBLIC_PUSHER_CLUSTER=`` (e.g., us2)

   - Restart dev server after changing Pusher credentials
   - Pusher is optional and can be disabled by commenting out variables

**@ai not responding in group chat:**
   - Ensure ``GEMINI_API_KEY`` is set in ``.env.local``
   - Check server terminal for AI-related errors (look for 🤖 emoji logs)
   - Verify AI detection is working: should see "AI mention detected" in terminal
   - Server-side detection means browser cache won't affect @ai functionality
   - AI responses are now asynchronous (fire-and-forget) for better performance

**AI responses not showing up without refresh:**
   - Fixed in latest version with real-time Pusher broadcasting
   - AI responses now appear instantly via Pusher in both main channel and thread panel
   - ThreadPanel now subscribes to Pusher for real-time thread updates
   - Message nodes include ``parentId`` property for proper filtering

**Text-to-Speech (TTS) failed error:**
   - Install Python3 if not already installed
   - Install Google Text-to-Speech library: ``pip3 install gtts``
   - The ``requirements.txt`` file in ``frontend/`` contains: ``gtts==2.5.0``
   - TTS uses a Python script located at ``frontend/scripts/text2audio.py``
   - Only one audio can play at a time (previous audio stops when new one starts)

**Cannot leave group - only admin error:**
   - If you're the only admin AND there are other members, you cannot leave
   - If you're the only member (even as admin), you can leave (group becomes empty)
   - To leave as the only admin with other members, promote another member to admin first

**Next.js viewport metadata warning:**
   - Fixed by moving viewport settings to separate ``viewport`` export
   - Now uses ``export const viewport: Viewport = {}`` instead of including in metadata

Environment Variables Reference
--------------------------------

Required variables in ``frontend/.env.local``:

.. code-block:: text

   # Supabase (Authentication)
   NEXT_PUBLIC_SUPABASE_URL=        # From Supabase dashboard → Settings → API
   NEXT_PUBLIC_SUPABASE_ANON_KEY=   # From Supabase dashboard → Settings → API

   # Neo4j AuraDB (Database)
   NEXT_PUBLIC_NEO4J_URI=           # From Neo4j console (format: neo4j+s://xxxxx.databases.neo4j.io)
   NEXT_PUBLIC_NEO4J_USERNAME=      # Usually "neo4j"
   NEXT_PUBLIC_NEO4J_PASSWORD=      # Password created during Neo4j setup

   # Google Gemini AI (Required for AI features)
   GEMINI_API_KEY=                  # From Google AI Studio (https://aistudio.google.com/app/apikey)

   # Pusher (Optional - for real-time group chat)
   PUSHER_APP_ID=                   # From Pusher dashboard
   PUSHER_SECRET=                   # From Pusher dashboard
   NEXT_PUBLIC_PUSHER_KEY=          # From Pusher dashboard
   NEXT_PUBLIC_PUSHER_CLUSTER=      # From Pusher dashboard (e.g., us2)

**Note**: Variables starting with ``NEXT_PUBLIC_`` are available in the browser.
``GEMINI_API_KEY`` and ``PUSHER_SECRET`` are server-only (no ``NEXT_PUBLIC_`` prefix).

Need Help?
----------

1. Check ``setup/NEO4J_SETUP.md`` for database setup details
2. Review ``README.md`` for architecture and configuration notes
3. Check browser console for detailed error messages
4. Open an issue on GitHub for bugs

Development Notes
-----------------

* Application uses ES6 modules (``"type": "module"`` in package.json)
* Static export only - no server-side rendering
* Neo4j driver connection uses singleton pattern
* Database adapter provides abstraction layer for easy rollback if needed
* Supabase Auth user IDs are used as Node IDs in Neo4j

Deployment
----------

The application can be deployed on Railway or Render. Vercel is no longer supported due to timeout limitations.

**Railway Deployment** (Recommended for AI/Voice Features):

* Supports long-running processes (60+ second timeouts)
* Python environment for voice cloning
* Better for AI workloads
* See ``RAILWAY_DEPLOYMENT.md`` and ``RAILWAY_CLI_DEPLOY.md`` for details

**Render Deployment** (Alternative):

* Better Next.js build compatibility
* Easier setup and deployment
* Auto-deploy on git push
* See ``setup/RENDER_DEPLOYMENT.md`` for details

**Configuration Files**:

* ``railway.toml`` - Railway configuration
* ``nixpacks.toml`` - Build environment (Node.js 20 + Python 3.11)
* ``Procfile`` - Start command
* ``render.yaml`` - Render configuration

Recent Updates (2025-10-11)
----------------------------

**Infinite Scroll**:
   * Messages now load 50 at a time
   * Scroll to top to automatically load older messages
   * Efficient pagination for groups with 100+ messages

**AI Message Persistence**:
   * Fixed bug where AI responses disappeared when reopening threads
   * AI messages now properly load with ``OPTIONAL MATCH`` in Cypher queries

**Deployment Migration**:
   * Migrated from Vercel to Railway/Render
   * Removed all Vercel-specific configuration
   * Added Python support for future voice cloning features

**UI Improvements**:
   * Removed unnecessary refresh button (everything is real-time)
   * All messages update via Pusher in real-time
   * Cleaner interface

