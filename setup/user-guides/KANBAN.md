# ✅ Kanban Board - User Guide

Guide to using the Todo/Task management system in Noodeia.

---

## 🎯 What is the Kanban Board?

The Kanban board helps you organize tasks and manage your time.

**Features:**
- ✅ Create tasks with title, description, priority
- 📋 Drag-and-drop between columns
- 🔄 Reorder tasks within columns
- 💎 Earn XP when completing tasks
- 🎨 Glass morphism design matching app aesthetic

**Access at**: http://localhost:3000/todo

---

## 🚀 Getting Started

### Create Your First Task

1. Navigate to `/todo`
2. See horizontal "Create New Task" bar below the 3 columns
3. Fill in fields:
   - **Task Title** (required): "Complete math homework"
   - **Description** (optional): "Chapters 3-5 problems"
   - **Priority**: Click Low/Medium/High button
4. Click "Add Task" or press Enter

**Task appears instantly** in "To Do" column!

### Task Priority Levels

**High Priority** 🚩 (Red):
- Urgent tasks
- Due soon
- Important work

**Medium Priority** 🚩 (Orange):
- Standard tasks
- Normal importance

**Low Priority** ⚪ (Green):
- Can wait
- Less urgent
- Nice to have

---

## 📋 The Three Columns

### To Do 📝

**Purpose**: Tasks you haven't started yet

**Visual:**
- Blue gradient header (#3B82F6 → #2563EB)
- 📝 Emoji indicator
- Task count badge

**Tasks here:**
- New tasks you created
- Planned work
- Waiting to start

### In Progress 🔥

**Purpose**: Tasks you're actively working on

**Visual:**
- Orange gradient header (#F59E0B → #EA580C)
- 🔥 Emoji indicator
- Task count badge

**Tasks here:**
- Currently working on
- Active assignments
- In the middle of doing

### Done ✅

**Purpose**: Completed tasks

**Visual:**
- Green gradient header (#10B981 → #059669)
- 🎉 Emoji indicator
- Task count badge

**Tasks here:**
- Finished tasks
- Crossed-out text
- Green checkmark icon ✅
- **Cannot be edited or deleted**
- **Cannot be dragged** (final state)

---

## 🎯 Using the Kanban Board

### Moving Tasks Between Columns

**Drag-and-Drop:**
1. Click and hold task card
2. Drag to target column
3. Purple drop indicator line shows where task will land
4. Release mouse to drop
5. Task moves instantly

**Between columns:**
- To Do → In Progress: Starting work
- In Progress → Done: Completing task (**Earns XP!** 🎊)
- Done → Cannot move (final state)

**Within same column:**
- Drag up/down to reorder
- Prioritize tasks
- Purple indicator shows insertion point

### Completing Tasks (Earning XP)

**When you drag task to "Done":**

1. **Confetti celebration** 🎊
   - 50 gold/orange/pink particles
   - Bursts from center of screen
   - Origin: 70% down screen

2. **XP Animation** ⚡
   - "+1.XX XP" badge appears
   - Trophy and sparkles icons
   - Pink gradient background
   - Floats upward from center
   - 2-second display

3. **XP Awarded**:
   - Random: 1.01-1.75 XP
   - Updates your total XP
   - May trigger level up

4. **Task Updates**:
   - Status changed to "done"
   - Text crossed out
   - Green checkmark added
   - No longer draggable
   - Timestamp recorded

### Deleting Tasks

**Active tasks only** (To Do, In Progress):
1. Hover over task card
2. Trash icon appears (right side)
3. Click trash icon
4. Task deleted instantly

**Done tasks**: Cannot be deleted (permanent record)

---

## 🎨 Task Card Design

### Visual Elements

**Priority Badge:**
- **Low**: Green circle ⚪
- **Medium**: Orange flag 🚩
- **High**: Red filled flag 🚩
- Positioned at bottom right

**Task Content:**
- **Title**: Bold, gray-800
- **Description**: Smaller text, gray-600, max 2 lines
- **Due Date**: (If set) Bottom left badge

**Hover Effects:**
- Border highlight
- Shadow intensifies
- Grip icon appears (≡) for dragging
- Trash icon appears (for deletion)

**Glass Morphism:**
- Semi-transparent white background
- Backdrop blur effect
- Subtle border
- Modern iOS-style design

---

## 📊 Task Management

### Organization Tips

**Use all three columns:**
- **To Do**: Plan ahead, add all tasks
- **In Progress**: Limit to 2-3 active tasks (stay focused)
- **Done**: Watch accomplishments grow

**Use priorities:**
- High: Do today
- Medium: This week
- Low: When you have time

**Reorder within columns:**
- Drag up/down to prioritize
- Top = most important
- Bottom = less urgent

### Workflow Examples

**Homework Workflow:**
1. Create task: "Math homework Chapter 5"
2. Set priority: High (due tomorrow)
3. Move to "In Progress" when starting
4. Move to "Done" when finished → Earn XP!

**Study Workflow:**
1. Create multiple tasks:
   - "Review Chapter 1"
   - "Practice problems"
   - "Make flashcards"
2. Work through them one by one
3. Move each to Done as completed
4. Earn XP for each completion

---

## 🎯 For Different Users

### For Students

**Use Kanban to:**
- Organize homework assignments
- Track study tasks
- Plan project work
- Earn XP for productivity
- Build time management skills

**Tips:**
- Add all tasks at start of week
- Update status as you work
- Earn XP rewards for completion
- Use as daily checklist

### For Parents

**Benefits:**
- See what child is working on
- Monitor task completion
- Encourage organization skills
- Track productivity via XP

**How to help:**
- Review child's task list daily
- Help prioritize (high/medium/low)
- Celebrate XP earned from task completion
- Encourage using all three columns

### For Teachers/Staff

**Benefits:**
- Assign tasks to students
- Track completion rates
- Teach time management
- Encourage organization

**Suggestions:**
- Have students create tasks for homework
- Review task lists during check-ins
- Use as accountability tool
- Reward students with most completed tasks

---

## 💡 Power User Tips

### Drag-and-Drop Mastery

**Click vs Drag:**
- **Quick click**: Select task (if implemented)
- **Click and hold**: Initiate drag
- **Drag**: Move between columns or reorder

**Drop indicators:**
- **Purple line**: Shows exact insertion point
- **Dashed border**: End of column drop zone
- Provides visual feedback

**Keyboard shortcuts** (future):
- Arrow keys to navigate
- Enter to move forward
- Delete to remove

### Task Descriptions

**Write clear descriptions:**
- What needs to be done
- When it's due
- Resources needed
- Success criteria

**Example:**
```
Title: Complete Science Lab Report
Description: Write lab report for volcano experiment. Include hypothesis, procedure, results. Due Friday. Need photos from phone.
Priority: High
```

---

## 📊 Technical Details

### Data Storage

**Neo4j Schema:**
```cypher
(:User)-[:HAS_TASK]->(:Task {
  id: "task-xxx",
  title: "Complete homework",
  description: "Math problems 1-20",
  status: "todo", // or "inprogress", "done"
  priority: "high", // or "medium", "low"
  createdAt: datetime(),
  completedAt: datetime() // when moved to done
})
```

### API Endpoints

**Create task**: POST `/api/kanban/tasks`
**List tasks**: GET `/api/kanban/tasks?userId=xxx`
**Move task**: PATCH `/api/kanban/tasks/[taskId]/move`
**Delete task**: DELETE `/api/kanban/tasks/[taskId]`

**Reference**: See [../technical/API_REFERENCE.md](../technical/API_REFERENCE.md)

---

## ❓ FAQ

**Q: How many tasks can I create?**
A: Unlimited! Create as many as you need.

**Q: Can I edit task after creation?**
A: Currently no inline editing. Delete and recreate if needed.

**Q: Can I undo moving to Done?**
A: No, Done is final state. Be sure before moving!

**Q: Do I earn XP for moving to In Progress?**
A: No, only when moving to Done column.

**Q: Can I assign due dates?**
A: Property exists but UI not yet implemented. Coming soon!

**Q: Can I share tasks with others?**
A: Not yet. Tasks are per-user currently.

**Q: What happens to completed tasks?**
A: Stay in Done column as permanent record. Can view anytime.

---

## 🎯 Start Organizing!

Ready to manage your time better?

1. Go to http://localhost:3000/todo
2. Create your first task
3. Drag it through the workflow
4. Earn XP when completing!

**Stay organized and earn rewards!** 📋✨
