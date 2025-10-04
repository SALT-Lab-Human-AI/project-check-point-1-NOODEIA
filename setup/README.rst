==================================
Noodeia AI Tutor - Setup Guide
==================================

.. contents:: Table of Contents
   :local:
   :depth: 2

Overview
--------

Noodeia is a personalized AI tutor chat application with:

* **Frontend**: Next.js 15
* **Authentication**: Supabase Auth
* **Database**: Neo4j AuraDB (Graph Database)
* **Deployment**: Vercel

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

5. **Initialize Neo4j Database**

   .. code-block:: bash

      npm run setup-neo4j

   This creates the required constraints and indexes in your Neo4j database.

6. **Test Locally**

   .. code-block:: bash

      npm run dev
      # Open http://localhost:3000

7. **Deploy to Vercel (Recommended)**

   a. Go to https://vercel.com and sign up with GitHub
   b. Click "Add New Project" and import this repository
   c. Configure project:

      * Root Directory: ``frontend``
      * Install Command: ``npm install --legacy-peer-deps``

   d. Add all 5 environment variables from ``.env.local``
   e. Click "Deploy"

Your app will be live at: ``https://your-project.vercel.app``

**Detailed Guide:** See ``setup/VERCEL_DEPLOYMENT.md`` for complete instructions

Architecture
------------

**Hybrid Architecture:**

* **Supabase**: Handles user authentication (signup/login)
* **Neo4j AuraDB**: Stores all application data in graph format

  * Graph Structure: ``(:User)-[:HAS]->(:Session)-[:OCCURRED]->(:Chat)-[:NEXT]->(:Chat)``
  * Users own Sessions (conversations)
  * Sessions contain Chats (messages)
  * Chats link to next Chat via NEXT relationship

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
   │   │   └── utils.ts          # Helper functions
   │   ├── services/
   │   │   └── neo4j.service.js  # Neo4j CRUD operations
   │   ├── scripts/
   │   │   └── setup-neo4j.js    # Database initialization
   │   ├── hooks/                # React hooks
   │   ├── .env.local            # Environment variables (create this)
   │   └── package.json
   ├── setup/                     # Setup documentation
   │   ├── README.rst            # This file
   │   └── NEO4J_SETUP.md        # Detailed Neo4j guide
   └── README.md                 # Project overview

Key Features
------------

* 💬 Real-time chat interface
* 🗂️ Multiple conversation management
* 💾 Graph database storage (Neo4j)
* 🔐 Secure authentication (Supabase)
* 🌓 Dark/Light theme
* 📱 Responsive design
* 🚀 Serverless deployment (Vercel)

Common Commands
---------------

.. code-block:: bash

   # Development
   npm run dev              # Start dev server
   npm run build            # Build for production
   npm run setup-neo4j      # Initialize Neo4j database

   # Dependencies
   npm install --legacy-peer-deps   # Install dependencies

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

All variables must start with ``NEXT_PUBLIC_`` to be available in the browser.

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
