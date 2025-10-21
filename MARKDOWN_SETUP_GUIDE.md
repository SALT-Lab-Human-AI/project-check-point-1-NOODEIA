# Markdown Panel Setup & Usage Guide

## Quick Start

The markdown panel feature is **already integrated** and ready to use! Here's what you need to know:

### 1. The Feature is Live
- The markdown editor panel is built into the AI Tutor interface
- Click the **FileText icon** (📄) in the header to open it
- No additional setup required to use the feature

### 2. Database Schema Setup (Optional but Recommended)

The markdown notes are stored in Neo4j. To enable persistence:

```bash
cd frontend
npm run setup-markdown
```

**If the script fails with "Database connection error":**
- This means your Neo4j AuraDB instance is currently offline or unreachable
- The markdown feature will **still work locally** during development
- Notes won't be saved to the database until it comes back online
- Try the script again when the database is accessible

### 3. Using the Markdown Panel

1. **Open the panel**
   - Click the FileText (📄) icon in the top-right header
   - Panel slides in from the right side

2. **Three tabs available**
   - **Editor**: Write markdown with formatting toolbar
   - **Preview**: See formatted HTML output
   - **Mind Map**: View as interactive visualization

3. **Editor features**
   - Auto-saves after 2 seconds (indicator shows save status)
   - Toolbar buttons for quick formatting:
     - **H1**: Headers
     - **B**: Bold
     - **I**: Italic
     - **List**: Bullet points
     - **Link**: Hyperlinks
     - **Code**: Code blocks
     - **Table**: Markdown tables

4. **Mind Map tab**
   - Auto-generated from your markdown structure
   - Zoom controls (Zoom In/Out/Fit)
   - Export as SVG
   - Color-coded by nesting depth
   - Click nodes to expand/collapse

5. **Export options**
   - **Export button**: Download markdown as .md file
   - **Mind Map Export**: Download visualization as SVG

## Database Connection Troubleshooting

### Issue: "Could not perform discovery" error

**Cause**: Neo4j AuraDB instance is not accessible

**Solutions**:

1. **Check your Neo4j credentials** in `.env.local`:
   ```bash
   NEXT_PUBLIC_NEO4J_URI=neo4j+s://xxxxx.databases.neo4j.io
   NEXT_PUBLIC_NEO4J_USERNAME=neo4j
   NEXT_PUBLIC_NEO4J_PASSWORD=your-password
   ```

2. **Verify database is running**
   - Log into [aura.neo4j.io](https://aura.neo4j.io)
   - Check if your instance is active
   - If stopped, click "Resume" to bring it online

3. **Test connection locally**
   ```bash
   npm run setup-neo4j  # Test Neo4j setup script
   ```

4. **Try the markdown setup again**
   ```bash
   npm run setup-markdown
   ```

### Issue: Markdown panel shows but notes don't save

**Cause**: Database connection lost after startup

**Solution**:
1. Check if your Neo4j instance is still online
2. Restart the Next.js development server
3. Try opening the panel again

## Development Notes

### How it Works

1. **Frontend** (`components/MarkdownPanel.jsx`)
   - User writes markdown
   - Auto-saves to backend API
   - Displays preview and mind map

2. **Backend** (`app/api/markdown/[conversationId]/route.js`)
   - Handles save/load/delete operations
   - Stores in Neo4j with conversation association

3. **Database** (Neo4j)
   ```
   (:Session)-[:HAS_NOTES]->(:MarkdownNote {id, content, lastModified, userId})
   ```

4. **Mind Map Generation** (`app/api/markdown/mindmap/route.js`)
   - Parses markdown structure
   - Converts to hierarchical tree
   - Uses markmap-lib to render

### Running Locally Without Database

The markdown panel works fine without database connectivity:
- Write and edit markdown ✅
- Preview markdown ✅
- Generate mind maps ✅
- Export markdown/SVG ✅
- **Save notes**: ❌ (will fail if DB unavailable)

### Testing the Feature

1. **Start the app**
   ```bash
   npm run dev
   ```

2. **Open markdown panel**
   - Click FileText (📄) icon in header

3. **Write sample markdown**
   ```markdown
   # Machine Learning Concepts

   ## Supervised Learning
   * Training with labeled data
   * Examples: classification, regression

   ## Unsupervised Learning
   * Finding patterns in unlabeled data
   * Examples: clustering, dimensionality reduction
   ```

4. **Switch tabs**
   - Preview shows formatted HTML
   - Mind Map shows tree structure

5. **Test mind map export**
   - Click "Export" button in mind map controls
   - Downloads as SVG file

## Architecture Overview

```
┌─────────────────────────────────────┐
│      AI Tutor Interface             │
│                                     │
│  [Header] ← FileText Button         │
│  [Main Chat]  [Markdown Panel]      │
│              ┌────────────────────┐ │
│              │ Editor | Preview   │ │
│              │ Mind Map Tab       │ │
│              │ [Auto-save status] │ │
│              │ [Export buttons]   │ │
│              └────────────────────┘ │
└─────────────────────────────────────┘
         │
         ↓ API calls
┌─────────────────────────────────────┐
│      Next.js Backend                │
│                                     │
│ /api/markdown/[conversationId]      │
│ - GET: Fetch notes                  │
│ - POST: Save notes                  │
│ - DELETE: Remove notes              │
│                                     │
│ /api/markdown/mindmap               │
│ - POST: Generate mind map           │
│ - GET: Retrieve saved mind map      │
└─────────────────────────────────────┘
         │
         ↓ Query/Store
┌─────────────────────────────────────┐
│      Neo4j AuraDB                   │
│                                     │
│ (:Session)-[:HAS_NOTES]->           │
│   (:MarkdownNote {                  │
│     id, content,                    │
│     lastModified, userId            │
│   })                                │
└─────────────────────────────────────┘
```

## Files & Structure

### Components
- `components/MarkdownPanel.jsx` - Main editor component
- `components/MindMapViewer.jsx` - Mind map visualization
- `components/Header.jsx` - Header with panel button

### Services
- `services/markdown.service.js` - Frontend API client

### API Routes
- `app/api/markdown/[conversationId]/route.js` - CRUD operations
- `app/api/markdown/mindmap/route.js` - Mind map generation

### Scripts
- `scripts/setup-markdown.js` - Neo4j schema initialization

## FAQ

**Q: Do I need to run setup-markdown?**
A: No, but recommended for database persistence. The feature works without it.

**Q: Where are notes stored?**
A: In Neo4j, associated with each conversation session.

**Q: Can I use the markdown panel without the database?**
A: Yes! You can write, preview, and generate mind maps. Notes won't persist between sessions.

**Q: How do I export notes?**
A: Click "Export" button in the markdown panel to download as .md file.

**Q: How do I export the mind map?**
A: In the Mind Map tab, use the export controls to download as SVG.

**Q: Can multiple users edit the same notes?**
A: Currently no - notes are per-user per-conversation. Future enhancement planned.

**Q: What markdown features are supported?**
A: Headers, lists, bold, italic, links, code blocks, tables (standard Markdown).

## Next Steps

### For Immediate Use
1. Click the FileText icon to open the panel
2. Start taking notes during your AI conversations
3. Use the mind map to visualize your notes

### For Database Persistence
1. Ensure Neo4j AuraDB is running
2. Run `npm run setup-markdown`
3. Restart the dev server
4. Notes will now persist automatically

### For Future Enhancements
- Collaborate on markdown notes with other users
- AI-assisted note summaries
- Multiple export formats (PDF, PNG, JPG)
- Custom mind map themes
- Integration with external Markmap MCP server

---

**Questions?** Check the main `MARKDOWN_PANEL_DOCUMENTATION.md` for more details.
