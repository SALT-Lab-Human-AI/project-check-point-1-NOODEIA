# 📦 Installation Guide

Step-by-step guide to installing Noodeia and all dependencies.

---

## ✅ Before You Begin

Ensure you have completed:
- ✅ [01_PREREQUISITES.md](./01_PREREQUISITES.md) - All accounts created and credentials saved

---

## 📥 Step 1: Clone Repository

### Clone from GitHub

```bash
git clone https://github.com/SALT-Lab-Human-AI/project-check-point-1-NOODEIA.git
cd project-check-point-1-NOODEIA
```

### Verify Clone

```bash
ls -la
# Should see: frontend/, setup/, docs/, unitTests/, README.md, etc.
```

---

## 📦 Step 2: Install Node.js Dependencies

### Navigate to Frontend

```bash
cd frontend
```

### Install Packages

**Important**: Must use `--legacy-peer-deps` flag for React 19 compatibility:

```bash
npm install --legacy-peer-deps
```

**Why `--legacy-peer-deps`?**
- React 19 is newer than some dependency expectations
- Flag tells npm to ignore peer dependency conflicts
- Required for successful installation

**Installation time**: 2-5 minutes depending on internet speed

### Verify Node Installation

```bash
npm list | head -20
```

**Should see** (among others):
```
noodeia-frontend@0.1.0
├── @radix-ui/react-label@2.1.1
├── @radix-ui/react-slot@1.1.1
├── @supabase/supabase-js@2.58.0
├── canvas-confetti@1.9.2
├── framer-motion@latest
├── neo4j-driver@6.0.0
├── next@15.2.4
├── react@19
└── react-dom@19
```

### Common Installation Issues

**Issue**: `npm ERR! code ERESOLVE`

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Try again with legacy peer deps
npm install --legacy-peer-deps
```

**Issue**: `Permission denied` on macOS/Linux

**Solution**:
```bash
# Don't use sudo! Fix permissions instead:
sudo chown -R $(whoami) ~/.npm
npm install --legacy-peer-deps
```

**Issue**: `Node.js version too old`

**Solution**:
```bash
# Check version
node --version

# If less than v18, update Node.js:
# macOS: brew upgrade node
# Windows: Download from nodejs.org
# Linux: Use nvm or package manager
```

---

## 🐍 Step 3: Install Python Dependencies

### Verify Python Version

```bash
python3 --version
```

**Must show Python 3.10.0 or higher**

If not:
- **macOS**: `brew install python@3.11`
- **Windows**: Download from python.org
- **Linux**: `sudo apt install python3.11` (Ubuntu/Debian)

### Install Python Packages

```bash
pip3 install -r requirements.txt
```

**Installs:**
```
gtts==2.5.0                    # Text-to-speech
langgraph>=0.2.0               # Agent workflow framework
langchain>=0.2.0               # LLM framework
langchain-community>=0.2.0     # Community integrations
langchain-core>=0.2.0          # Core LangChain
langchain-google-genai>=0.1.0  # Gemini integration
tavily-python>=0.3.4           # Web search tool
neo4j>=5.20.0                  # Database driver
requests>=2.31.0               # HTTP client
python-dotenv>=1.0.0           # Environment variables
mcp>=0.3.0                     # Model Context Protocol
```

**Installation time**: 3-10 minutes

### Verify Python Installation

```bash
pip3 list | grep -E "(langgraph|langchain|gemini)"
```

**Should see:**
```
langgraph                0.2.45
langchain                0.3.7
langchain-community      0.3.5
langchain-core           0.3.15
langchain-google-genai   2.0.5
```

### Common Python Installation Issues

**Issue**: `pip3: command not found`

**Solution**:
```bash
# macOS: Install pip
python3 -m ensurepip --upgrade

# Linux: Install pip package
sudo apt install python3-pip

# Windows: Reinstall Python with pip option checked
```

**Issue**: `Permission denied` when installing packages

**Solution**:
```bash
# Use user install (recommended)
pip3 install --user -r requirements.txt

# Or use virtual environment (better)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip3 install -r requirements.txt
```

**Issue**: `No matching distribution found`

**Solution**:
```bash
# Upgrade pip
pip3 install --upgrade pip

# Try install again
pip3 install -r requirements.txt
```

---

## 🧪 Step 4: Verify Installation

### Check Node.js

```bash
node --version      # Should be v18.0.0 or higher
npm --version       # Should be 9.0.0 or higher
```

### Check Python

```bash
python3 --version   # Should be 3.10.0 or higher
pip3 --version      # Should show pip version
```

### Check Key Packages

**Node.js packages:**
```bash
npm list next neo4j-driver @supabase/supabase-js
```

**Python packages:**
```bash
pip3 show langgraph langchain-google-genai neo4j
```

### Directory Structure Check

```bash
ls -la
```

**Should see:**
```
app/              # Next.js pages
components/       # React components
lib/              # Utilities
services/         # Business logic
scripts/          # Python ACE agent + setup scripts
.env.local        # (You'll create this next)
package.json      # Node dependencies
requirements.txt  # Python dependencies
```

---

## 🎯 Installation Complete!

✅ Repository cloned
✅ Node.js dependencies installed
✅ Python dependencies installed
✅ Installation verified

---

## 📚 Next Steps

1. **Configure Environment**: [03_CONFIGURATION.md](./03_CONFIGURATION.md)
2. **Setup Database**: [04_DATABASE_SETUP.md](./04_DATABASE_SETUP.md)
3. **Test ACE Agent**: [05_PYTHON_ACE_SETUP.md](./05_PYTHON_ACE_SETUP.md)

---

## ❓ Need Help?

**Installation issues?**
- Check Node.js and Python versions meet requirements
- Try clearing caches and reinstalling
- See [../TROUBLESHOOTING.md](../TROUBLESHOOTING.md)

**Missing prerequisites?**
- Go back to [01_PREREQUISITES.md](./01_PREREQUISITES.md)
- Ensure all software and accounts are ready

**Ready to configure?**
- Proceed to [03_CONFIGURATION.md](./03_CONFIGURATION.md)
