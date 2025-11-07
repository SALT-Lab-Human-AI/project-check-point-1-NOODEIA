# 📝 Quiz System - User Guide

Complete guide to taking quizzes and earning rewards in Noodeia.

---

## 🎯 What are Quizzes?

Quizzes in Noodeia are:
- **10 multiple-choice questions** per quiz
- **Educational assessment** of knowledge
- **Gacha-style rewards** based on performance
- **XP earning opportunity** (up to 30 XP per quiz)
- **Fun and engaging** with animations

**Goal**: Test knowledge while earning rewards!

---

## 🚀 Taking a Quiz

### Step 1: Start Quiz

1. Navigate to http://localhost:3000/quiz or click "Quiz" in navigation
2. See quiz menu with reward cards (Common, Rare, Legendary)
3. Click "Start New Quiz" button

### Step 2: Answer Questions

**For each question:**
1. Read the question
2. See 4 multiple-choice options
3. Click your answer
4. Get immediate feedback:
   - ✅ **Correct**: Green highlight + confetti + points
   - ❌ **Incorrect**: Red highlight (no penalty)
5. Automatically advances to next question

**Features:**
- **Streak tracking**: Consecutive correct answers
- **Visual feedback**: Colors and animations
- **Progress indicator**: Shows question X of 10
- **No time limit**: Take your time

### Step 3: Complete Quiz

After 10 questions:
1. See results summary:
   - Total score (e.g., "8/10")
   - Highest streak
   - Performance percentage
2. **Node reward determined**:
   - 100% (10/10) → Legendary 👑
   - 80-99% (8-9/10) → Rare 💎
   - 30-79% (3-7/10) → Common ⭐
   - <30% (0-2/10) → No reward

### Step 4: Open Reward

**Gacha-Style Animation:**

1. **3D Shaking Orb** appears:
   - Continuous shaking (Pokemon GO style)
   - Color matches reward type:
     - Gold (Common)
     - Pink (Rare)
     - Hot Pink (Legendary)
   - Glow rings pulsing
   - 16 orbiting sparkles

2. **Click Orb to Open**:
   - Orb scales and glows
   - Burst particles explode (24 particles)
   - Orb fades away

3. **Card Flip Reveal**:
   - 720° rotation (two full spins)
   - Scales and pulses
   - Brightness flashes
   - Duration: 2.5 seconds

4. **Reward Display**:
   - Shows node type earned
   - Displays XP awarded
   - Shows your new total XP
   - Animated XP bar update

**400-Particle Confetti Celebration:**
- 200 particles from center
- 100 particles from left
- 100 particles from right
- Gold, orange, pink, cyan colors
- Dramatic explosion effect

---

## 🎁 Reward System

### Node Types

#### Legendary Node 👑 (Perfect Score)

**Requirements:**
- 100% accuracy (10/10 correct)
- All questions answered correctly

**Rewards:**
- **XP**: 25-30 (random)
- **Node**: Legendary (hot pink with crown)
- **Pride**: Perfect score achievement!

**Visual:**
- Hot pink gradient (#F58FA8 → #FAB9CA)
- Crown indicator 👑
- Largest celebration

#### Rare Node 💎 (High Score)

**Requirements:**
- 80-99% accuracy (8-9/10 correct)
- Strong performance

**Rewards:**
- **XP**: 12-15 (random)
- **Node**: Rare (pink)
- **Recognition**: Above average!

**Visual:**
- Pink gradient (#FAB9CA → #F8C8E2)
- Diamond/gem indicator
- Medium celebration

#### Common Node ⭐ (Passing Score)

**Requirements:**
- 30-79% accuracy (3-7/10 correct)
- Minimum passing score

**Rewards:**
- **XP**: 3-7 (random)
- **Node**: Common (gold)
- **Progress**: You're learning!

**Visual:**
- Gold gradient (#E4B953 → #F8EAC1)
- Star indicator
- Standard celebration

#### No Reward ❌

**If score < 30%:**
- No node earned
- No XP awarded
- Encouraged to try again

---

## 📊 Quiz Statistics

### Track Your Progress

**Achievements Page** (`/achievements`):
- Total quizzes completed
- Common nodes earned
- Rare nodes earned
- Legendary nodes earned
- Total quiz XP

**Leaderboard** (`/leaderboard`):
- **Accuracy rankings**: Overall accuracy across all quizzes
- **XP rankings**: Total XP (includes quiz rewards)
- Timeframes: Daily, Weekly, Monthly, All-Time

### Accuracy Calculation

**Overall Accuracy Formula:**
```
Accuracy = (Sum of all scores / Sum of all total questions) × 100
```

**Example:**
- Quiz 1: 8/10 = 80%
- Quiz 2: 9/10 = 90%
- Quiz 3: 10/10 = 100%
- **Overall**: (8+9+10)/(10+10+10) = 27/30 = 90%

**Not** average of percentages (80+90+100)/3 = 90%

**Why?** Accounts for different quiz lengths more accurately.

---

## 🎮 Strategy Tips

### Earn Legendary Nodes

**Requirements:**
- Answer all 10 questions correctly
- No mistakes allowed

**Tips:**
- Take your time (no time limit)
- Read questions carefully
- Think before clicking
- Review concepts before quiz

### Improve Accuracy

**Study strategies:**
- Review wrong answers
- Use AI tutor for concepts you struggle with
- Practice with vocabulary games
- Complete quizzes regularly

**During quiz:**
- Read all options before answering
- Eliminate obviously wrong answers
- Trust your first instinct
- Stay focused

### Maximize XP

**High-value activities:**
1. Aim for legendary nodes (25-30 XP each)
2. If struggling, common nodes still give 3-7 XP
3. Use AI tutor to prepare for quizzes
4. Take multiple quizzes per day (no limit)

---

## 🎨 Visual Experience

### Quiz Interface

**Clean design:**
- Large, readable questions
- Clear answer buttons
- Progress indicator
- Streak counter
- Visual feedback on selection

**Animations:**
- Smooth transitions between questions
- Confetti on correct answers
- Shake effect on wrong answers
- Celebratory effects at completion

### Reward Reveal

**Professional quality:**
- 3D shaking orb (60fps animation)
- Interactive click-to-open
- Spectacular confetti (400 particles)
- Smooth card flip (720° rotation)
- XP bar animation matching gamification system

**Inspired by:**
- Genshin Impact wish system
- Pokemon GO pokeball capture
- Duolingo chest opening

---

## 📈 Quiz History

### View Past Quizzes

**In Achievements:**
- Total quizzes completed
- Node type distribution
- Average performance

**In Neo4j** (for developers):
```cypher
MATCH (u:User {id: $userId})-[:COMPLETED]->(qs:QuizSession)
RETURN qs.score, qs.totalQuestions, qs.nodeType, qs.xpEarned, qs.completedAt
ORDER BY qs.completedAt DESC
LIMIT 10
```

### Statistics Tracked

**Per Quiz:**
- Score (correct answers)
- Total questions
- Highest streak
- Node type earned
- XP awarded
- Completion timestamp

**Aggregate:**
- Total quizzes completed
- Best streak ever
- Total XP from quizzes
- Common/Rare/Legendary counts

---

## 🎯 For Different Users

### For Students

**Benefits:**
- Test your knowledge
- Earn big XP rewards
- Compete with friends
- Track improvement over time
- Fun reward animations

**Tips:**
- Take quizzes after studying
- Aim for legendary nodes
- Use mistakes to learn
- Check leaderboard to compare

### For Parents

**Benefits:**
- See child's assessment results
- Track learning progress
- Encourage quiz-taking
- Monitor accuracy trends

**What to look for:**
- Increasing accuracy over time
- More legendary nodes
- Consistent quiz completion
- Leaderboard ranking

### For Teachers/Staff

**Benefits:**
- Assign quizzes to students
- Track completion rates
- Identify struggling students (low accuracy)
- Reward high achievers
- Generate progress reports

**Admin Dashboard:**
- View all student quiz results
- See accuracy distributions
- Track participation rates
- Export data for reporting

---

## ❓ Frequently Asked Questions

**Q: How many quizzes can I take?**
A: Unlimited! Take as many as you want, whenever you want.

**Q: Can I retake quizzes?**
A: Yes, start a new quiz anytime. Each attempt is independent.

**Q: Do wrong answers hurt my score?**
A: No negative points. Just affects percentage and node type earned.

**Q: What if I get exactly 8/10?**
A: 80% = Rare node (12-15 XP). Need 100% for Legendary.

**Q: Can I skip questions?**
A: No, must answer all 10 questions to complete quiz.

**Q: How long does a quiz take?**
A: 5-10 minutes average. No time limit.

**Q: Do quiz scores affect my grade?**
A: Depends on teacher settings. Check with your teacher/program.

**Q: Can I see correct answers after?**
A: Currently no review mode. Focus is on forward progress and learning from AI tutor.

---

## 🚀 Start Quizzing!

Ready to test your knowledge and earn rewards?

1. Go to http://localhost:3000/quiz
2. Click "Start New Quiz"
3. Answer 10 questions
4. Earn your reward!
5. Check leaderboard to see your rank

Aim for that legendary node! 👑✨
