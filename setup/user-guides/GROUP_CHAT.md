# 👥 Group Chat - User Guide

Complete guide to multi-user collaboration and @ai assistance in Noodeia.

---

## 🎯 What is Group Chat?

Group Chat enables students to:
- **Collaborate** with classmates in study groups
- **Ask AI for help** using @ai mentions
- **Thread conversations** Slack-style
- **Share ideas** in real-time
- **Learn together** with AI guidance

**Access at**: http://localhost:3000/groupchat

---

## 🚀 Getting Started

### Create a Group

1. Go to http://localhost:3000/groupchat
2. Click "New Group" button in sidebar
3. Fill in group details:
   - **Group Name**: "Math Study Group"
   - **Access Key**: "MATH2025" (create unique key)
4. Click "Create Group"

**You are now:**
- Group creator (admin role)
- First member
- Can invite others with access key

### Join a Group

1. Go to http://localhost:3000/groupchat
2. Click "Join Group" button in sidebar
3. Enter access key given by group creator
4. Click "Join"

**You are now:**
- Group member
- Can see all messages
- Can participate immediately

**Access keys:**
- Case-sensitive
- Shared by group creator
- One key per group
- Permanent (doesn't change)

---

## 💬 Sending Messages

### Main Channel Messages

1. Type message in input box at bottom
2. Press Enter or click send button
3. Message appears instantly for you (optimistic update)
4. Other members see message in real-time (with Pusher)

**Features:**
- Instant visual feedback
- Real-time sync across devices
- User name and avatar shown
- Timestamp displayed

### Thread Replies (Slack-Style)

**Why threads?**
- Keep conversations organized
- Discuss specific topics
- Don't clutter main channel

**How to create thread:**
1. Hover over any message
2. Click "Reply" button OR click reply count
3. **Thread panel opens** on right side
4. See parent message at top
5. Type reply in thread input
6. Send reply

**Thread panel shows:**
- Parent message (what you're replying to)
- All replies chronologically
- Reply input at bottom
- Close button (X) to exit thread

### Real-Time Updates

**With Pusher configured:**
- Messages appear instantly for all members
- No page refresh needed
- Thread replies update live
- Typing indicators (optional feature)

**Without Pusher:**
- Must refresh page to see new messages
- Still works, just not real-time

---

## 🤖 AI Assistant (@ai Mentions)

### How to Get AI Help

**In main channel:**
1. Type: "@ai Can you help me with fractions?"
2. Send message
3. AI creates a new thread with response
4. AI analyzes context and provides guidance

**In thread reply:**
1. Open any thread
2. Type: "@ai I'm still confused"
3. Send reply
4. AI responds in same thread
5. AI reads full thread context

### AI Behavior

**Socratic Teaching:**
- AI asks guiding questions
- Doesn't give direct answers
- Helps you think critically
- Encourages problem-solving

**Example:**

**Student**: "@ai What's 1/2 + 1/3?"

**AI Response**:
> @StudentName, Hi! Great question about adding fractions!
>
> Before we add, what do you notice about the denominators (the bottom numbers)?
> Are they the same or different?

**Personalized:**
- AI greets you with @mention
- Uses your name
- Adapts to your level
- Remembers your struggles (ACE memory)

**Context-Aware:**
- Reads entire thread before responding
- Shows what messages it reviewed
- Understands conversation flow
- Relevant to discussion

### @ai Mention Features

**Triggers AI response when:**
- Message contains "@ai" anywhere
- Case-sensitive (must be lowercase)
- Works in main channel and threads

**AI shows:**
- **Thread context**: Lists messages it read
- **Greeting**: "@YourName, Hi!"
- **Guidance**: Socratic questions
- **Helpfulness**: Educational, not just answers

**Response time:**
- 5-15 seconds typical
- Depends on context complexity
- May take longer for deep reasoning

---

## ✏️ Message Actions

### Edit Your Messages

**For your own messages only:**
1. Hover over your message
2. Click three-dot menu (⋯)
3. Click "Edit"
4. Modify text
5. Click save or press Enter
6. Message updates with "(edited)" indicator

**Notes:**
- Can only edit your own messages
- Edited messages marked as "(edited)"
- Edit history not shown (just latest version)
- Other members see update in real-time

### Delete Messages

**For your own messages only:**
1. Hover over your message
2. Click three-dot menu (⋯)
3. Click "Delete"
4. Confirm deletion

**Cascade delete:**
- If you delete parent message, **all thread replies are also deleted**
- Prevents orphaned conversations
- Be careful when deleting messages with replies!

**Cannot delete:**
- Other users' messages
- AI assistant messages

---

## 🚪 Group Management

### Leave Group

1. Click "Back to AI Tutor" or home button
2. In group list, hover over group
3. Click leave/logout icon
4. Confirm leaving

**Rules:**
- **Last person**: Can leave (group becomes empty)
- **Only admin with other members**: Cannot leave (must promote another admin first)
- **Regular member**: Can always leave

### Admin Privileges

**Group creator is admin by default:**
- Cannot leave if only admin with other members
- Can promote other members to admin (future feature)
- Can manage group settings (future feature)

---

## 🎨 Visual Features

### Message Display

**User Messages:**
- User avatar (emoji or initials)
- User name above message
- Timestamp
- Glass morphism bubble
- Right side alignment (your messages)
- Left side alignment (others' messages)

**AI Messages:**
- "AI Assistant" label
- AI icon/avatar
- Distinct styling
- Shows thread context reviewed
- Educational tone

**Thread Indicators:**
- Reply count badge (e.g., "3 replies")
- Click to open thread panel
- Purple highlight when thread active

### Glass Morphism Design

**Modern aesthetic:**
- Semi-transparent backgrounds
- Backdrop blur effects
- Subtle borders and shadows
- Smooth animations
- Matches app theme

**Theme integration:**
- Uses current theme colors (Cream/Lilac/Rose/Sky)
- Surface hierarchy (darker panels, lighter bubbles)
- Consistent with AI tutor interface

---

## 💡 Best Practices

### Effective Group Study

**Good practices:**
- Stay on topic
- Use threads for specific questions
- @ai for help when stuck
- Be respectful to other members
- Share helpful resources

**Avoid:**
- Spamming messages
- Off-topic chatter
- Posting answers without explanation
- Deleting important messages

### Using @ai Effectively

**Good @ai questions:**
- "@ai Can you explain this concept?"
- "@ai I don't understand this step"
- "@ai What's another way to solve this?"
- "@ai Can you verify my answer?"

**Less effective:**
- "@ai What's the answer?" (AI will guide, not answer directly)
- "@ai Do my homework" (AI won't do work for you)

**Best results:**
- Ask specific questions
- Show your thinking
- Use in context of discussion
- Follow up based on AI guidance

---

## 🔍 Privacy & Safety

### What Others Can See

**Visible to all group members:**
- All messages in group
- Your name and avatar
- Your message timestamps
- Your thread replies

**Private (not visible):**
- Your XP and level (visible only on leaderboard)
- Your other groups
- Your AI tutor conversations
- Your quiz scores

### Safe Collaboration

**Built-in safety:**
- Can only edit/delete your own messages
- Can leave group anytime (with rules)
- No private messaging (all in group)
- Admin oversight

**Teacher monitoring:**
- Admin dashboard shows all group activity
- Can review conversations
- Can identify issues
- Can manage groups

---

## 🎯 Use Cases

### Homework Help

**Scenario**: Math homework collaboration

1. Create group: "Math Homework - Chapter 5"
2. Invite classmates with access key
3. Post question: "I'm stuck on problem #12"
4. Classmate responds with hint
5. You ask: "@ai Can you guide me through this?"
6. AI provides Socratic guidance
7. You solve it with help!

### Study Sessions

**Scenario**: Test preparation

1. Join study group
2. Topic threads for each subject
3. Share challenging questions
4. @ai for explanations
5. Quiz each other
6. Review together

### Project Collaboration

**Scenario**: Group project

1. Create project group
2. Assign tasks to members
3. Share progress updates
4. Use @ai for research questions
5. Thread discussions by topic
6. Coordinate work

---

## 📊 Technical Details

### Database Schema

```cypher
(:User)-[:MEMBER_OF {role, joinedAt}]->(GroupChat)-[:CONTAINS]->(Message)
(:User)-[:POSTED]->(Message)
(:Message)-[:REPLY_TO]->(Message)
```

**Node properties:**
- GroupChat: id, name, accessKey, createdBy, createdAt
- Message: id, content, createdBy, createdAt, parentId, edited

### API Endpoints

- GET `/api/groupchat` - List user's groups
- POST `/api/groupchat` - Create group
- GET `/api/groupchat/[groupId]/messages` - Get messages
- POST `/api/groupchat/[groupId]/messages` - Send message (+ @ai detection)
- POST `/api/groupchat/[groupId]/ai` - AI response generation

**Reference**: See [../technical/API_REFERENCE.md](../technical/API_REFERENCE.md)

---

## ❓ FAQ

**Q: How many members per group?**
A: Unlimited! Groups scale to your needs.

**Q: Can I be in multiple groups?**
A: Yes! Join as many groups as you want.

**Q: Are messages private?**
A: Messages are visible to all group members only.

**Q: Does @ai work in threads?**
A: Yes! AI reads full thread context.

**Q: Can AI see main channel when responding in thread?**
A: Yes, AI reviews entire conversation history.

**Q: Can I rename a group?**
A: Currently not supported. Create new group if needed.

**Q: What if I forget access key?**
A: Ask group creator for the key.

**Q: Can I change access key after creation?**
A: No, access keys are permanent.

**Q: How do I know if someone read my message?**
A: No read receipts currently. Rely on replies.

---

## 🎯 Start Collaborating!

Ready to learn with friends?

1. Create or join a study group
2. Start discussing
3. Use threads for organization
4. @ai when you need help
5. Learn together!

**Collaboration makes learning better!** 👥✨
