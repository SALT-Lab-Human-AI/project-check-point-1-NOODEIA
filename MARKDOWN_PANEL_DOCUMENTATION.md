# Markdown Panel & Mind Map Integration Documentation

## Overview
This document describes the new Markdown Panel feature added to the Noodeia AI Tutor application on 2025-10-21. This feature allows users to take notes during their AI tutoring sessions and visualize them as interactive mind maps.

## Feature Description

### Purpose
- **Note-taking**: Allow users to document key insights from AI conversations
- **Visualization**: Transform markdown notes into interactive mind maps
- **Persistence**: Store notes in Neo4j database, associated with each conversation
- **Export**: Download notes as markdown files or mind maps as SVG

### Components Created

#### 1. MarkdownPanel Component
**File**: `frontend/components/MarkdownPanel.jsx`
- Main side panel that slides in from the right
- Three-tab interface: Editor, Preview, Mind Map
- Auto-save functionality (2-second debounce)
- Markdown toolbar with quick insert buttons
- Fullscreen mode support
- Export functionality

#### 2. MindMapViewer Component
**File**: `frontend/components/MindMapViewer.jsx`
- Interactive mind map visualization using markmap library
- Zoom controls (in/out/fit)
- Export to SVG
- Color-coded nodes
- Lazy-loaded to avoid SSR issues

#### 3. Markdown Service
**File**: `frontend/services/markdown.service.js`
- Frontend service for markdown operations
- Methods for CRUD operations
- Mind map generation
- Markdown parsing utilities
- Auto-generate summaries from chat messages

### API Endpoints

#### 1. Markdown CRUD Endpoint
**File**: `frontend/app/api/markdown/[conversationId]/route.js`
- `GET /api/markdown/[conversationId]` - Fetch markdown for a conversation
- `POST /api/markdown/[conversationId]` - Save/update markdown
- `DELETE /api/markdown/[conversationId]` - Delete markdown

#### 2. Mind Map Generation Endpoint
**File**: `frontend/app/api/markdown/mindmap/route.js`
- `POST /api/markdown/mindmap` - Generate mind map from markdown
- `GET /api/markdown/mindmap?conversationId=...` - Retrieve saved mind map

### Database Schema

#### Neo4j Structure
```cypher
// Markdown notes relationship
(:Session)-[:HAS_NOTES]->(n:MarkdownNote {
  id: String,
  content: String,
  lastModified: DateTime,
  userId: String
})

// Mind map relationship
(:Session)-[:HAS_MINDMAP]->(m:MindMap {
  id: String,
  data: String,        // JSON structure
  markdown: String,    // Source markdown
  lastGenerated: DateTime
})
```

#### Setup Script
**File**: `frontend/scripts/setup-markdown.js`
- Creates indexes for performance
- Adds constraints for data integrity
- Initializes sample data
- Run with: `npm run setup-markdown`

## Usage Instructions

### For Users

1. **Open the Panel**
   - Click the FileText icon in the header (next to the user profile)
   - Panel slides in from the right side

2. **Editor Tab**
   - Write markdown notes about your conversation
   - Use toolbar buttons for quick formatting:
     - H1: Insert heading
     - B: Bold text
     - I: Italic text
     - List: Bullet points
     - Link: Hyperlinks
     - Code: Code blocks
     - Table: Markdown tables
   - Auto-saves after 2 seconds of inactivity

3. **Preview Tab**
   - See formatted markdown
   - Basic HTML rendering
   - Links open in new tabs

4. **Mind Map Tab**
   - Interactive visualization of your markdown
   - Controls:
     - Zoom In/Out: Adjust view scale
     - Fit: Auto-fit to container
     - Export: Download as SVG
   - Click nodes to expand/collapse
   - Color-coded by depth level

5. **Additional Features**
   - Fullscreen mode: Maximize panel for better editing
   - Export markdown: Download as .md file
   - Session persistence: Notes saved per conversation
   - Real-time save indicator

### For Developers

#### Installation
```bash
# Install dependencies
npm install markmap-lib markmap-view --legacy-peer-deps

# Run database setup
npm run setup-markdown
```

#### Integration Points

**AIAssistantUI.jsx modifications**:
```jsx
// Import the panel
import MarkdownPanel from "./MarkdownPanel"

// Add state
const [markdownPanelOpen, setMarkdownPanelOpen] = useState(false)
const [currentMarkdown, setCurrentMarkdown] = useState("")

// Add to Header props
<Header
  onMarkdownClick={() => setMarkdownPanelOpen(true)}
/>

// Add panel component
<MarkdownPanel
  isOpen={markdownPanelOpen}
  onClose={() => setMarkdownPanelOpen(false)}
  conversationId={selectedId}
  userId={userId}
  initialContent={currentMarkdown}
  onSave={(content) => setCurrentMarkdown(content)}
/>
```

#### Markdown to Mind Map Conversion

The system parses markdown hierarchically:
- Headers (`#`, `##`, `###`) become parent nodes
- Lists (`*`, `-`, `+`) become child nodes
- Paragraphs add descriptions to nodes
- Nested lists create sub-branches

Example:
```markdown
# Main Topic
## Subtopic 1
* Point A
* Point B
## Subtopic 2
### Detail
* Item 1
* Item 2
```

Becomes a tree structure with "Main Topic" as root, two main branches, and nested items.

## Technical Details

### Dependencies
- `markmap-lib`: Markdown parsing and transformation
- `markmap-view`: Interactive SVG rendering
- Neo4j driver: Database persistence
- React lazy loading: Performance optimization

### Performance Considerations
- Lazy loading of MindMapViewer to avoid SSR issues
- Debounced auto-save (2 seconds)
- Indexed Neo4j queries
- SVG rendering optimized for large documents

### Security
- Authentication required for all API endpoints
- User-scoped markdown storage
- Sanitized markdown rendering
- Protected export functionality

## Future Enhancements

### Planned Features
1. **Markmap MCP Server Integration**
   - Connect to external Markmap MCP server
   - Advanced mind map generation options
   - Multi-format export (PNG, JPG)

2. **Collaboration**
   - Share markdown notes with other users
   - Real-time collaborative editing
   - Version history

3. **AI-Assisted Notes**
   - Auto-generate summaries from conversations
   - Suggest key points to document
   - Smart markdown formatting

4. **Advanced Visualization**
   - Different mind map styles
   - Custom themes and colors
   - Animation controls

## Troubleshooting

### Common Issues

1. **Mind map not rendering**
   - Check browser console for errors
   - Ensure markmap libraries are installed
   - Try refreshing the page

2. **Auto-save not working**
   - Check Neo4j connection
   - Verify authentication token
   - Check browser network tab for errors

3. **Export failing**
   - Ensure proper permissions
   - Check browser download settings
   - Try different export format

### Debug Mode
Enable debug logging in browser console:
```javascript
localStorage.setItem('debug_markdown', 'true')
```

## Testing

### Manual Test Cases
1. Open markdown panel
2. Write sample markdown
3. Switch between tabs
4. Verify auto-save
5. Export markdown
6. Generate mind map
7. Export SVG
8. Close and reopen panel
9. Verify persistence

### API Testing
```bash
# Test markdown save
curl -X POST http://localhost:3000/api/markdown/test-session \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "# Test", "userId": "test-user"}'

# Test mind map generation
curl -X POST http://localhost:3000/api/markdown/mindmap \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"markdown": "# Test\n## Sub", "conversationId": "test"}'
```

## Support

For issues or questions:
1. Check this documentation
2. Review error messages in browser console
3. Check Neo4j connection status
4. Report issues in GitHub repository

---

*Last updated: 2025-10-21*
*Author: AI Assistant for Noodeia Project*