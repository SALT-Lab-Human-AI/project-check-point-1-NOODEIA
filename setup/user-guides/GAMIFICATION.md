# 🎮 Gamification System - User Guide

Complete guide to Noodeia's XP, leveling, and rewards system.

---

## 🌟 What is Gamification?

Noodeia makes learning fun through game-like rewards:
- **Earn XP** (Experience Points) for learning activities
- **Level up** as you accumulate XP
- **Compete** on leaderboards
- **Unlock rewards** through quizzes
- **Track progress** with visual feedback

**Goal**: Make learning addictive in the best possible way!

---

## ⭐ Earning XP

### How to Earn XP

**AI Tutor Messages** (1.01-1.75 XP each):
- Send message to AI tutor
- Get AI response
- Earn random XP between 1.01-1.75
- XP animation appears above send button

**Completing Tasks** (1.01-1.75 XP each):
- Drag task to "Done" column in Kanban board
- Confetti celebration
- XP awarded automatically

**Quiz Rewards** (Variable XP):
- Legendary node (100% accuracy): 25-30 XP
- Rare node (80-99% accuracy): 12-15 XP
- Common node (30-79% accuracy): 3-7 XP

**Vocabulary Games** (2-25 XP per round):
- Word Match: 8-11 XP
- Spelling Bee: 21-24 XP
- Memory Cards: 2-5 XP per pair
- Word Builder: 14-17 XP

### XP Animation

When you earn XP, you'll see:
- **Floating badge** appears (lightning bolt icon ⚡)
- Shows "+X.XX XP" amount
- **Spring animation** - pops up with bounce
- Pink gradient background
- Automatically disappears after 2 seconds

**Location:**
- **AI Tutor**: Above send button
- **Kanban**: Center of screen when task completed
- **Quiz**: After opening reward orb
- **Games**: Center of screen after correct answer

---

## 📈 Leveling System

### How Leveling Works

**Formula**: Level X requires `((X-1)² + 4)²` total XP

**Why exponential?**
- Early levels are easy to achieve
- Later levels require dedication
- Creates long-term goals
- Prevents gaming the system

### Level Requirements

| Level | Total XP Needed | XP to Next Level |
|-------|----------------|------------------|
| 1 | 0 | +25 |
| 2 | 25 | +39 |
| 3 | 64 | +105 |
| 4 | 169 | +231 |
| 5 | 400 | +441 |
| 6 | 841 | +759 |
| 7 | 1,600 | +1,200 |
| 8 | 2,800 | +1,800 |
| 9 | 4,600 | +2,600 |
| 10 | 7,200 | +4,425 |
| 15 | 43,681 | +22,544 |
| 20 | 148,225 | +79,524 |
| 30 | 722,500 | - |

### Level Up Celebration

When you reach a new level:
- **Sparkles animation** ✨ on gamification bar
- **Level badge updates** with new number
- **XP bar resets** to 0% for next level
- **Trophy icon** pulses with glow effect

**Example:**
- You're at Level 2 with 63 XP
- You earn 1.5 XP
- Total becomes 64.5 XP
- You level up to Level 3!
- Sparkles animation plays

---

## 📊 Gamification Bar

### Location

The gamification bar appears in the **sidebar** of:
- AI Tutor interface
- Any page with sidebar navigation

### What It Shows

**Level Badge** (top left):
- Trophy icon 🏆
- "Lvl X" text
- Gradient background (brown to pink)
- Sparkles when you level up

**XP Progress Bar** (middle):
- Horizontal bar with 6-color gradient
- Fills from 0% to 100% as you earn XP
- Shimmer effect (animated shine)
- Smooth animation when XP increases

**XP Counter** (below bar):
- Format: "Current XP / Next Level XP"
- Example: "45 / 169" (at Level 3)
- Large numbers show with K suffix (e.g., "7.2K")

**Total XP** (bottom):
- Total lifetime XP earned
- Award icon 🏆
- Shows cumulative progress

### Visual Design

**Colors (Gradient):**
1. `#A57E56` (Brown)
2. `#F3E0B0` (Tan)
3. `#FFFDD0` (Cream Yellow)
4. `#F7DBEC` (Light Pink)
5. `#F8C8E2` (Pink)
6. `#F6B3DC` (Hot Pink)

**Glass Morphism:**
- Semi-transparent white background
- Backdrop blur effect
- Subtle border and shadow
- Modern iOS-style design

---

## 🏆 Using Gamification

### For Students

**Set Personal Goals:**
- "I want to reach Level 5 this week"
- "I'll complete 10 quizzes to earn 200 XP"
- "I want to beat my friend's XP score"

**Track Progress:**
- Check gamification bar daily
- See how close to next level
- Monitor total XP growth

**Stay Motivated:**
- Visual feedback on every action
- Celebrations when leveling up
- Compare with friends on leaderboard

### For Parents

**Monitor Engagement:**
- Higher XP = more learning activity
- Level increases show consistent use
- Quiz XP shows assessment participation

**Encourage Progress:**
- Set XP goals with your child
- Celebrate level milestones
- Use leaderboard for friendly competition

### For Teachers/Staff

**Track Participation:**
- View leaderboard to see most active students
- Identify students who need encouragement
- Reward high achievers
- Set class goals (e.g., "Everyone reach Level 5")

**Analyze Activity:**
- XP trends show engagement over time
- Quiz XP shows assessment completion
- Task completion XP shows organization skills

---

## 🎯 Tips & Strategies

### Earn XP Efficiently

**Best XP Sources:**
1. **Quizzes**: 25-30 XP for perfect score (fastest)
2. **Spelling Bee**: 21-24 XP per word
3. **Word Builder**: 14-17 XP per word
4. **AI Tutor**: 1.01-1.75 XP per message (most frequent)

**Strategy:**
- Take quizzes for big XP boosts
- Use AI tutor daily for consistent growth
- Complete tasks to earn bonus XP
- Play vocabulary games during breaks

### Level Up Faster

**Consistency beats intensity:**
- 10 AI messages/day = ~15 XP/day = Level 5 in ~26 days
- 1 quiz + 5 messages/day = ~35 XP/day = Level 5 in ~11 days

**Diversify activities:**
- Don't just farm one activity
- Mix AI tutoring, quizzes, games, tasks
- Varied learning is better for retention

### Compete on Leaderboard

**XP Leaderboard:**
- Shows total XP earned
- Timeframes: Daily, Weekly, Monthly, All-Time
- Great for tracking overall activity

**Accuracy Leaderboard:**
- Shows quiz accuracy percentage
- Rewards quality over quantity
- Encourages careful quiz-taking

---

## 🔢 Technical Details

### XP Calculation

**Random ranges prevent gaming:**
- AI messages: 1.01-1.75 (JavaScript Math.random())
- Task completion: 1.01-1.75
- Quiz legendary: 25-30 (random in range)

**Why random?**
- Prevents exact XP farming strategies
- Adds element of surprise
- Makes earning XP more game-like

### Leveling Formula

```javascript
// Get total XP needed for level X
function getTotalXPForLevel(level) {
  if (level <= 1) return 0;
  const mainStat = (level - 1) ** 2 + 4;
  return mainStat ** 2;
}

// Get current level from total XP
function getLevelFromXP(totalXP) {
  let level = 1;
  while (getTotalXPForLevel(level + 1) <= totalXP) {
    level++;
  }
  return level;
}
```

**Implementation**: `frontend/utils/levelingSystem.js`

### Storage

**Neo4j User Node:**
```cypher
(:User {
  id: "user-123",
  xp: 150,      # Total XP
  level: 3      # Current level
})
```

**API Endpoint**: `/api/user/xp`
- POST: Award XP
- GET: Fetch current XP and level

---

## 📱 Where to See Your Stats

### Gamification Bar (Sidebar)
- **Pages**: AI Tutor, Group Chat, Home, etc.
- **Shows**: Current level, progress to next level, total XP

### Achievements Page
- **Route**: `/achievements`
- **Shows**:
  - Total XP earned
  - Current level
  - Total quizzes completed
  - Quiz node distribution (common/rare/legendary)

### Leaderboard
- **Route**: `/leaderboard`
- **Shows**:
  - Your rank among all users
  - Top 20 players
  - XP or accuracy rankings
  - Timeframe filters

### Home Dashboard
- **Route**: `/home`
- **Shows**:
  - Level progress circle
  - Recent activity
  - Quick stats

---

## 🎨 Visual Feedback

### XP Gain Animation

**Appearance:**
- Pink gradient badge (#F6B3DC → #F8C8E2)
- Lightning bolt icon ⚡
- Large bold text "+X.XX"
- Smooth spring physics animation

**Behavior:**
- Starts small and below center
- Springs up to full size
- Floats upward while fading
- Duration: 2 seconds

### Level Up Animation

**Appearance:**
- Sparkles icon ✨ next to level badge
- Pulsing glow effect
- Rotating and scaling animation
- Pink color matching XP gradient

**Behavior:**
- Appears when level increases
- Rotates from -180° to 0°
- Scales from 0 to 1
- Stays visible for 2 seconds
- Pulses and fades out

### Progress Bar Animation

**Appearance:**
- Smooth width transition (spring physics)
- Shimmer effect (diagonal gradient sweep)
- Multi-color gradient fills
- Subtle shine overlay

**Behavior:**
- Animates from old % to new % when XP earned
- Spring physics (bouncy, satisfying)
- Stiffness: 100, Damping: 20
- Duration: ~0.5-1 second depending on change

---

## ❓ Frequently Asked Questions

**Q: Can I lose XP or levels?**
A: No! XP only goes up, never down. Levels are permanent.

**Q: What's the maximum level?**
A: There's no hard cap. The formula works infinitely, but Level 30+ requires dedication.

**Q: Do I earn XP for wrong quiz answers?**
A: No. You must score at least 30% (3/10) to earn XP rewards.

**Q: Can I see other students' XP?**
A: Yes, on the leaderboard! But only their rank and XP, not their activity details.

**Q: How do I level up faster?**
A: Take quizzes for big XP boosts, use AI tutor daily for consistent growth.

**Q: What happens when I level up?**
A: Visual celebration (sparkles), badge updates, XP bar resets for next level.

**Q: Is XP shared across features?**
A: Yes! XP from AI tutor, quizzes, tasks, and games all count toward your total.

**Q: Can teachers/parents see my XP?**
A: Yes, via leaderboard and admin dashboard (if enabled).

---

## 🎯 Gamification Goals

### Short-term Goals (Week 1)
- [ ] Reach Level 2 (25 XP)
- [ ] Complete first quiz
- [ ] Earn 50 total XP
- [ ] Appear on daily leaderboard

### Medium-term Goals (Month 1)
- [ ] Reach Level 5 (400 XP)
- [ ] Earn first legendary quiz node
- [ ] Complete 10 quizzes
- [ ] Top 10 on weekly leaderboard

### Long-term Goals (Semester)
- [ ] Reach Level 10 (7,200 XP)
- [ ] Maintain top 5 on all-time leaderboard
- [ ] Earn 10+ legendary nodes
- [ ] 90%+ overall quiz accuracy

---

## 📚 Related Features

**Leaderboard:**
- See [LEADERBOARD.md](./LEADERBOARD.md) for ranking details

**Quiz System:**
- See [QUIZ_SYSTEM.md](./QUIZ_SYSTEM.md) for quiz rewards

**Vocabulary Games:**
- See [VOCABULARY_GAMES.md](./VOCABULARY_GAMES.md) for game XP

**Kanban:**
- See [KANBAN.md](./KANBAN.md) for task completion XP

---

## 🎯 Start Earning XP!

Ready to level up?
1. Go to AI Tutor and start chatting
2. Take a quiz
3. Play vocabulary games
4. Complete tasks

Watch your XP grow and see yourself climb the leaderboard! 🚀
