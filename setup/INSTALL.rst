==================================
Noodeia AI Tutor - Quick Setup Guide
==================================

.. contents:: Table of Contents
   :local:
   :depth: 2

Overview
--------

Noodeia is a personalized AI tutor chat application that runs entirely in the browser using Supabase for data persistence and GitHub Pages for hosting.

Prerequisites
-------------

* Node.js 18+ installed
* Git installed
* GitHub account
* Supabase account (free tier)

Quick Start (5 Minutes)
-----------------------

1. **Clone & Install**

   .. code-block:: bash

      git clone https://github.com/your-username/project-check-point-1-noodiea.git
      cd project-check-point-1-noodiea/frontend
      npm install --legacy-peer-deps

2. **Set Up Supabase**

   a. Create account at https://supabase.com
   b. Create new project (free tier)
   c. Get credentials from Settings → API:

      * Project URL
      * anon public key

3. **Configure Environment**

   Create ``frontend/.env.local``:

   .. code-block:: text

      NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
      NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

4. **Create Database Tables**

   In Supabase SQL Editor, run the SQL script from the detailed guides (see below).

5. **Test Locally**

   .. code-block:: bash

      npm run dev
      # Open http://localhost:3000

6. **Deploy to GitHub Pages**

   .. code-block:: bash

      npm run deploy
      # Enable GitHub Pages in repository settings

Your app will be live at: ``https://[username].github.io/project-check-point-1-noodiea``

Detailed Setup Guides
---------------------

For comprehensive step-by-step instructions, refer to:

**Complete Installation Guide**
   ``frontend/INSTALL.md`` - Full setup documentation with troubleshooting

**Supabase Setup Guide**
   ``frontend/SUPABASE_SETUP.md`` - Detailed Supabase configuration and SQL scripts

Key Features
------------

* 💬 Real-time chat interface
* 🗂️ Multiple conversation management
* 💾 Cloud-based persistence
* 🌓 Dark/Light theme
* 📱 Responsive design
* 🚀 No server required

Project Structure
-----------------

::

   project-check-point-1-noodiea/
   ├── frontend/                 # Main application
   │   ├── app/                 # Next.js pages
   │   ├── components/          # React components
   │   ├── lib/                 # Utilities
   │   ├── public/              # Static assets
   │   ├── INSTALL.md          # Detailed setup guide
   │   └── SUPABASE_SETUP.md   # Supabase configuration
   ├── setup/                   # Setup documentation
   │   └── INSTALL.rst         # This file
   └── README.md               # Project overview

Common Commands
---------------

.. code-block:: bash

   # Development
   npm run dev              # Start dev server
   npm run build            # Build for production

   # Deployment
   npm run deploy           # Deploy to GitHub Pages

   # Dependencies
   npm install --legacy-peer-deps   # Install with peer deps resolution

Troubleshooting Quick Fixes
---------------------------

**Supabase connection issues:**
   - Check ``.env.local`` exists and has correct values
   - Verify tables were created in Supabase dashboard

**GitHub Pages 404:**
   - Wait 10-20 minutes for initial deployment
   - Check gh-pages branch exists
   - Verify GitHub Pages is enabled in settings

**Build failures:**
   - Use ``npm install --legacy-peer-deps``
   - Clear ``.next`` folder and rebuild
   - Ensure Node.js 18+ is installed

Need Help?
----------

1. Check ``frontend/INSTALL.md`` for detailed troubleshooting
2. Review ``frontend/SUPABASE_SETUP.md`` for database issues
3. Open an issue on GitHub for bugs

