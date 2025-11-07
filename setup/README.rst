==================================
Noodeia AI Tutor - Setup Guide
==================================

.. contents:: Table of Contents
   :local:
   :depth: 2

Overview
--------

Noodeia is a personalized AI tutor application with gamification, making learning addictive in the best possible way.

**Core Technologies:**

* **Frontend**: Next.js 15.2.4 with App Router + React 19
* **Authentication**: Supabase Auth (JWT tokens)
* **Database**: Neo4j AuraDB (Graph Database)
* **AI Engine**: Google Gemini 2.5 Flash + LangGraph + ACE Memory System
* **Real-time**: Pusher (optional)
* **Deployment**: Render (migrated from Vercel for better Python and timeout support)

**Key Features:**

* 🤖 AI Tutor with personalized memory (learns from each student)
* 👥 Group Chat with Slack-style threading and @ai mentions
* 🎮 Gamification with XP, levels, and rewards
* 📝 Quiz System with gacha-style rewards
* ✅ Kanban/Todo task management
* 🏆 Leaderboard with XP and accuracy rankings
* 🎯 Vocabulary Games for kids (4 game modes, 108 words)
* 🎨 4 theme options with customizable avatars
* 📓 Markdown notes and mind maps per conversation

Prerequisites
-------------

**System Requirements:**

* Node.js 18+ (20 recommended)
* Python 3.10+ (required for ACE agent)
* Git

**Required Accounts** (all have free tiers):

* Supabase account - for authentication
* Neo4j AuraDB account - for data storage
* Google AI Studio account - for Gemini API key
* Render account - for deployment

**Optional Accounts:**

* Pusher account - for real-time messaging
* Tavily account - for web search tool

**Detailed Guide:** See ``getting-started/01_PREREQUISITES.md`` for complete account setup instructions.

Quick Start (15 Minutes)
-------------------------

1. **Clone & Install**

   .. code-block:: bash

      git clone https://github.com/SALT-Lab-Human-AI/project-check-point-1-NOODEIA.git
      cd project-check-point-1-NOODEIA/frontend
      npm install --legacy-peer-deps
      pip3 install -r requirements.txt

2. **Configure Environment**

   .. code-block:: bash

      cp .env.local.example .env.local
      # Edit .env.local with your credentials

   **Required credentials:**

   * Supabase: URL and anon key
   * Neo4j: URI, username, password
   * Gemini: API key

   **Complete guide:** See ``getting-started/03_CONFIGURATION.md``

3. **Initialize Database**

   .. code-block:: bash

      npm run setup-neo4j       # Core database schema
      npm run setup-groupchat   # Group chat feature
      npm run setup-markdown    # Markdown notes feature
      npm run setup-quiz        # Quiz system feature

   **Detailed guide:** See ``getting-started/04_DATABASE_SETUP.md``

4. **Test Python ACE Agent**

   .. code-block:: bash

      cd frontend/scripts
      export GEMINI_API_KEY="your-key"
      python3 run_ace_agent.py <<'EOF'
      {"messages":[{"role":"user","content":"Help me with 2 + 2"}]}
      EOF

   **Complete guide:** See ``getting-started/05_PYTHON_ACE_SETUP.md``

5. **Start Development Server**

   .. code-block:: bash

      cd frontend
      npm run dev
      # Open http://localhost:3000

   **Usage guide:** See ``getting-started/06_LOCAL_DEVELOPMENT.md``

Architecture
------------

**Hybrid Architecture:**

* **Supabase**: User authentication only (no data storage)
* **Neo4j AuraDB**: ALL application data in graph format
* **Google Gemini + LangGraph + ACE**: AI agent with memory-enhanced reasoning
* **Pusher**: Real-time messaging (optional)

**Database Graph Structures:**

**AI Tutor** (1-on-1):
  ``(:User)-[:HAS]->(:Session)-[:OCCURRED]->(:Chat)-[:NEXT]->(:Chat)``

**Group Chat** (Multi-user):
  ``(:User)-[:MEMBER_OF]->(:GroupChat)-[:CONTAINS]->(:Message)-[:REPLY_TO]->(:Message)``

**ACE Memory** (Per-learner):
  ``(:User)-[:HAS_ACE_MEMORY]->(:AceMemoryState)``

**Complete schema:** See ``technical/DATABASE_SCHEMA.md``

Detailed Setup Guides
---------------------

For comprehensive step-by-step instructions:

**Getting Started** (In order):
   1. ``getting-started/00_OVERVIEW.md`` - Project overview and architecture
   2. ``getting-started/01_PREREQUISITES.md`` - System requirements and accounts
   3. ``getting-started/02_INSTALLATION.md`` - Install Node.js and Python dependencies
   4. ``getting-started/03_CONFIGURATION.md`` - Configure environment variables
   5. ``getting-started/04_DATABASE_SETUP.md`` - Initialize Neo4j database
   6. ``getting-started/05_PYTHON_ACE_SETUP.md`` - Setup and test ACE agent
   7. ``getting-started/06_LOCAL_DEVELOPMENT.md`` - Run and test locally
   8. ``getting-started/07_DEPLOYMENT.md`` - Deploy to production
   9. ``getting-started/08_COMPLETE_SETUP.md`` - All-in-one comprehensive guide

**Deployment:**
   * ``deployment/RENDER.md`` - Complete Render deployment guide (recommended platform)

**Technical References:**
   * ``technical/PYTHON_SETUP.md`` - Python environment and dependencies
   * ``technical/DATABASE_SCHEMA.md`` - Complete Neo4j schema reference
   * ``technical/API_REFERENCE.md`` - All API endpoints documented
   * ``technical/ACE_README.md`` - ACE memory system architecture (existing)
   * ``technical/AGENT.md`` - LangGraph agent architecture (existing)

**User Guides:**
   * ``user-guides/GAMIFICATION.md`` - XP, leveling, rewards system
   * ``user-guides/QUIZ_SYSTEM.md`` - Quiz taking and rewards
   * ``user-guides/KANBAN.md`` - Todo/task management
   * ``user-guides/LEADERBOARD.md`` - Rankings and competition
   * ``user-guides/VOCABULARY_GAMES.md`` - 4 game modes for kids
   * ``user-guides/GROUP_CHAT.md`` - Multi-user collaboration
   * ``user-guides/THEMES.md`` - Theme customization

**Troubleshooting:**
   * ``TROUBLESHOOTING.md`` - Common issues and solutions

Project Structure
-----------------

::

   project-check-point-1-NOODEIA/
   ├── frontend/                   # Main application
   │   ├── app/                   # Next.js app router
   │   │   ├── page.tsx          # Landing page
   │   │   ├── ai/               # AI tutor interface
   │   │   ├── login/            # Authentication
   │   │   ├── home/             # User dashboard
   │   │   ├── achievements/     # Achievements page
   │   │   ├── leaderboard/      # Rankings
   │   │   ├── quiz/             # Quiz system
   │   │   ├── games/            # Vocabulary games
   │   │   ├── todo/             # Kanban board
   │   │   ├── settings/         # User settings
   │   │   ├── groupchat/        # Group collaboration
   │   │   └── api/              # API routes (11+ route groups)
   │   ├── components/            # React components (30+ files)
   │   ├── lib/                   # Core utilities
   │   │   ├── neo4j.js          # Neo4j driver
   │   │   ├── supabase.js       # Supabase auth client
   │   │   └── database-adapter.js # Database abstraction
   │   ├── services/
   │   │   ├── neo4j.service.js  # Neo4j operations
   │   │   ├── groupchat.service.js # Group chat logic
   │   │   └── gemini.service.js # Google Gemini client
   │   ├── scripts/
   │   │   ├── ace_memory.py     # ACE memory system
   │   │   ├── ace_components.py # Reflector/Curator
   │   │   ├── langgraph_agent_ace.py # LangGraph agent
   │   │   ├── run_ace_agent.py  # Agent runner
   │   │   ├── setup-*.js        # Database initialization scripts
   │   │   └── text2audio.py     # Text-to-speech
   │   ├── utils/
   │   │   └── levelingSystem.js # XP/leveling calculations
   │   ├── .env.local            # Environment variables (create this)
   │   ├── requirements.txt      # Python dependencies
   │   └── package.json
   ├── setup/                     # Setup documentation (you are here)
   ├── docs/                      # Testing and observability
   ├── unitTests/                 # Automated test suites
   ├── prompts/                   # AI system prompts
   ├── railway.toml              # Railway config (alternative to Render)
   ├── render.yaml               # Render deployment config
   └── README.md                 # Project overview

Key Features Overview
---------------------

**For Students:**

* **AI Tutor**: 1-on-1 tutoring with memory (remembers your struggles)
* **Group Study**: Collaborate with classmates, @ai for help
* **Gamification**: Earn XP, level up, unlock rewards
* **Quizzes**: Test knowledge, earn rare/legendary nodes
* **Vocabulary Games**: 4 fun games to learn 108+ words
* **Task Management**: Organize homework with Kanban board

**For Teachers/Staff:**

* **Leaderboard**: Track student progress and competition
* **Admin Dashboard**: View all student activity and statistics
* **Group Management**: Create study groups, monitor conversations
* **Analytics**: Detailed insights into learning patterns

Common Commands
---------------

.. code-block:: bash

   # Development
   npm run dev              # Start development server
   npm run build            # Build for production
   npm start                # Start production server

   # Database Setup
   npm run setup-neo4j      # Initialize core schema
   npm run setup-groupchat  # Setup group chat feature
   npm run setup-markdown   # Setup notes feature
   npm run setup-quiz       # Setup quiz system

   # Dependencies
   npm install --legacy-peer-deps   # Install Node.js packages
   pip3 install -r requirements.txt # Install Python packages (ACE agent)

   # Python ACE Agent
   cd frontend/scripts
   python3 run_ace_agent.py         # Test AI agent
   python3 analyze_ace_memory.py    # Inspect learned memory

   # Testing
   cd unitTests
   ./run_all_tests.sh               # Run all automated tests

Troubleshooting
---------------

**For common issues and solutions, see:** ``TROUBLESHOOTING.md``

**Quick Fixes:**

**"Cannot read properties of null (reading 'session')":**
   * Ensure ``.env.local`` exists with all variables
   * Restart dev server after editing ``.env.local``
   * Run ``npm run setup-neo4j`` to initialize database

**AI not responding:**
   * Verify ``GEMINI_API_KEY`` is set in ``.env.local``
   * Get key from: https://aistudio.google.com/app/apikey
   * Check server console for errors
   * Ensure no extra spaces or quotes in key

**Neo4j connection failed:**
   * Verify URI format: ``neo4j+s://xxxxx.databases.neo4j.io``
   * Check Neo4j instance is running in Aura console
   * Test connection: ``npm run setup-neo4j``

**Python/ACE agent errors:**
   * Verify Python 3.10+ installed: ``python3 --version``
   * Install dependencies: ``pip3 install -r frontend/requirements.txt``
   * Check ``GEMINI_API_KEY`` is exported

**Build failures:**
   * Use ``npm install --legacy-peer-deps`` (React 19 compatibility)
   * Delete ``.next`` and ``node_modules``, reinstall
   * Ensure Node.js 18+ installed

Environment Variables Reference
--------------------------------

**Required Variables:**

.. code-block:: text

   # Authentication
   NEXT_PUBLIC_SUPABASE_URL=        # From Supabase dashboard → API
   NEXT_PUBLIC_SUPABASE_ANON_KEY=   # From Supabase dashboard → API

   # Database
   NEXT_PUBLIC_NEO4J_URI=           # Format: neo4j+s://xxxxx.databases.neo4j.io
   NEXT_PUBLIC_NEO4J_USERNAME=      # Usually "neo4j"
   NEXT_PUBLIC_NEO4J_PASSWORD=      # From Neo4j setup

   # AI Model
   GEMINI_API_KEY=                  # From Google AI Studio

**Optional Variables:**

.. code-block:: text

   # Real-time messaging
   PUSHER_APP_ID=
   PUSHER_SECRET=
   NEXT_PUBLIC_PUSHER_KEY=
   NEXT_PUBLIC_PUSHER_CLUSTER=

   # Web search tool
   TAVILY_API_KEY=

   # ACE agent tuning
   GEMINI_MODEL=gemini-2.5-flash
   ACE_LLM_TEMPERATURE=0.2
   ACE_CURATOR_USE_LLM=false

**Complete guide:** See ``getting-started/03_CONFIGURATION.md``

Deployment
----------

The application is designed to be deployed on **Render**.

**Why Render:**

* Supports Python (required for ACE agent)
* No timeout limits (AI requests can take 10+ minutes)
* Auto-deploy on git push
* Better Next.js integration
* Free tier available

**Deployment Guide:** See ``deployment/RENDER.md`` for complete instructions.

**Alternative Platforms:**

* Railway: Also supported, see ``railway.toml`` configuration
* Vercel: Not recommended (10s timeout limit, no Python support)

Need Help?
----------

**Documentation:**

* **Quick Start**: ``QUICKSTART.md`` - 5-minute setup for experienced developers
* **Getting Started**: ``getting-started/`` - Step-by-step guides (numbered 00-08)
* **User Guides**: ``user-guides/`` - How to use each feature
* **Technical Docs**: ``technical/`` - Deep-dive references
* **Troubleshooting**: ``TROUBLESHOOTING.md`` - Common issues and solutions

**Support:**

1. Check ``TROUBLESHOOTING.md`` for your issue
2. Review relevant documentation in ``getting-started/``
3. Check browser console for detailed errors
4. Review server logs for backend errors
5. Open GitHub issue for bugs

Development Notes
-----------------

* Application uses ES6 modules (``"type": "module"`` in package.json)
* Neo4j driver connection uses singleton pattern
* Database adapter provides abstraction layer
* Supabase Auth user IDs are used as Node IDs in Neo4j
* ACE agent runs as Python subprocess spawned by API routes
* XP leveling uses formula: ((level-1)² + 4)²
* Memory system learns from every student interaction

Recent Updates
--------------

**ACE Memory System:**
   * Per-learner memory isolation with Neo4j storage
   * Structured bullet storage with semantic/episodic/procedural types
   * Automatic learning from every interaction
   * Neo4j-only storage (JSON fallback removed for consistency)

**Security Improvements:**
   * Calculator tool uses AST parser (secure, no code execution)
   * Enhanced trigger keywords for tool activation
   * Simplified storage architecture (fail-fast on errors)

**Gamification:**
   * XP rewards on all interactions (1.01-1.75 per action)
   * Advanced leveling system with exponential progression
   * Leaderboard with daily/weekly/monthly/all-time rankings
   * Quiz rewards with gacha-style opening animations

**User Experience:**
   * Real-time optimistic updates (messages appear instantly)
   * Theme system with 4 color options
   * Customizable user avatars (emojis and colors)
   * Smooth animations and glass morphism UI

For Developers
--------------

**First Time Setup:**

1. Follow ``getting-started/`` guides in order (01 → 08)
2. Start with ``01_PREREQUISITES.md`` to create accounts
3. Complete ``03_CONFIGURATION.md`` to set environment variables
4. Run database initialization scripts
5. Test Python ACE agent
6. Start development with ``06_LOCAL_DEVELOPMENT.md``

**Quick Reference:**

* **API Routes**: See ``technical/API_REFERENCE.md`` (11+ endpoint groups)
* **Database Schema**: See ``technical/DATABASE_SCHEMA.md`` (complete graph model)
* **Python Setup**: See ``technical/PYTHON_SETUP.md`` (ACE agent dependencies)

**Testing:**

* **Automated Tests**: ``cd unitTests && ./run_all_tests.sh``
* **Manual Tests**: See ``docs/minimalTest/useCase.md``
* **ACE Agent**: ``cd frontend/scripts && python3 run_ace_agent.py``

**Comprehensive Setup:**

For a complete, all-in-one setup guide, see:
``getting-started/08_COMPLETE_SETUP.md``

This guide consolidates all steps from prerequisites through deployment in a single document.
