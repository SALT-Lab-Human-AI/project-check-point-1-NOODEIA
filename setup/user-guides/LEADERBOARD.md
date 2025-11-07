# 🏆 Leaderboard - User Guide

Guide to rankings, competition, and tracking your progress against other students.

---

## 🎯 What is the Leaderboard?

The leaderboard shows rankings of all Noodeia users based on:
- **XP Rankings**: Total experience points earned
- **Accuracy Rankings**: Overall quiz accuracy percentage

**Access at**: http://localhost:3000/leaderboard

**Also visible**: Achievements page shows your current rank

---

## 📊 Leaderboard Types

### XP Leaderboard (Default)

**Ranks by**: Total XP earned

**What it shows:**
- User's rank (1st, 2nd, 3rd, etc.)
- User name and avatar
- Total XP
- Current level

**Best for**: Seeing who's most active and engaged

**Good for students who:**
- Use AI tutor frequently
- Complete many tasks
- Take lots of quizzes
- Play vocabulary games regularly

### Accuracy Leaderboard

**Ranks by**: Overall quiz accuracy percentage

**Formula:**
```
Accuracy = (Sum of all scores / Sum of all total questions) × 100
```

**Example:**
- Student A: 3 quizzes, 27/30 correct = 90% accuracy
- Student B: 1 quiz, 9/10 correct = 90% accuracy
- Tied at 90%!

**Best for**: Seeing who's best at assessments

**Good for students who:**
- Take quizzes carefully
- Focus on quality over quantity
- Want to show mastery

### Switching Between Types

**Toggle button** (top right):
- Click "XP" to see XP rankings
- Click "Accuracy" to see quiz accuracy rankings
- Selection persists during session

---

## ⏰ Timeframe Filters

### Daily Leaderboard

**Shows**: XP or accuracy from past 24 hours

**Use for:**
- See today's top performers
- Daily competition
- Recent activity
- Short-term goals

**Example**: "I want to be #1 today!"

### Weekly Leaderboard

**Shows**: XP or accuracy from past 7 days

**Use for:**
- Weekly challenges
- Track weekly winners
- Medium-term competition
- School week performance

**Example**: "Top 5 this week!"

### Monthly Leaderboard

**Shows**: XP or accuracy from past 30 days

**Use for:**
- Monthly competitions
- Long-term tracking
- Consistent performers
- Monthly rewards programs

**Example**: "Student of the month"

### All-Time Leaderboard

**Shows**: Total XP or overall accuracy across all time

**Use for:**
- Lifetime achievement
- Overall rankings
- Historical performance
- Long-term dedication

**Example**: "Top learner of all time"

### Switching Timeframes

**Button row** (below header):
- Click: Daily | Weekly | Monthly | All-Time
- Active button highlighted in purple
- Rankings update immediately
- Works with both XP and Accuracy modes

---

## 👑 Top 3 Star Players

### Special Display for Top 3

**Podium Layout:**
```
    🥈        👑        🥉
    2nd       1st       3rd
```

**Rank 1** (First Place):
- **Crown** 👑 above card
- **Largest card** (360px height)
- Purple-pink gradient background
- Golden crown with particles
- "1st" badge in yellow

**Rank 2** (Second Place):
- **Silver Medal** 🥈 above card
- **Medium card** (300px height)
- Blue-indigo gradient background
- Silver medal with glow
- "2nd" badge in gray

**Rank 3** (Third Place):
- **Bronze Medal** 🥉 above card
- **Smaller card** (280px height)
- Orange-rose gradient background
- Bronze medal with shimmer
- "3rd" badge in orange

**All include:**
- User name and avatar
- XP or accuracy value
- Current level
- Animated entrance (fade-in, rotate)
- Continuous floating animation
- Sparkles around card

---

## 📋 Top Players (Ranks 4-20)

### Player List Display

**Shows ranks 4-23** (up to 20 players total):
- Sequential numbering: 4, 5, 6, 7...
- User avatar (emoji or initials)
- User name
- XP or accuracy value
- Current level

**Visual design:**
- Clean list format
- Glass morphism cards
- Alternating subtle backgrounds
- Easy to scan

**Your highlight:**
- If you're in ranks 4-20, your card is highlighted
- Helps you find yourself quickly

---

## 🎯 Your Rank Card

### Always Visible

**Located**: Bottom of leaderboard page

**Shows:**
- Your current rank (e.g., "Rank #12")
- Your avatar
- Your name
- Your XP or accuracy
- Your level

**Purpose:**
- Quick reference to your position
- See rank without scrolling
- Track improvement over time

**Visual:**
- Highlighted border if you're top 20
- Standard card if outside top 20
- Glass morphism design

---

## 🎮 Using the Leaderboard

### For Students

**Set Goals:**
- "I want to reach top 10"
- "Beat my friend's rank"
- "Improve my accuracy to 90%"

**Track Progress:**
- Check daily timeframe to see today's performance
- Check all-time to see overall rank
- Compare XP vs Accuracy rankings
- See how close to next rank

**Stay Motivated:**
- Visual feedback with top 3 animations
- See improvement over time
- Friendly competition with classmates

**Tips:**
- Focus on one timeframe (daily, weekly, or all-time)
- Balance XP (activity) and Accuracy (quality)
- Use leaderboard to set weekly goals
- Celebrate improvements, not just rank

### For Parents

**Monitor Engagement:**
- Check child's rank regularly
- See activity level via XP rank
- See performance via accuracy rank
- Compare with other students

**Encourage:**
- Set achievable rank goals
- Celebrate moving up ranks
- Focus on improvement, not just being #1
- Use timeframes to set goals (e.g., "Top 5 this week")

**Red flags:**
- Rank dropping significantly
- Low accuracy despite high XP (rushing through quizzes)
- No activity (rank absent from daily/weekly)

### For Teachers/Staff

**Class Management:**
- See most active students (XP leaderboard)
- See top performers (Accuracy leaderboard)
- Identify students who need support (low ranks)
- Create friendly competition

**Set Challenges:**
- "Everyone get 100 XP this week"
- "Top 5 get rewards"
- "Improve your rank by 3 positions"
- "90%+ accuracy club"

**Use Timeframes:**
- Daily: Quick challenges
- Weekly: Week-long competitions
- Monthly: Extended challenges
- All-Time: Semester/year recognition

---

## 🎨 Visual Design

### Top 3 Cards

**Animations:**
- **Entrance**: Fade-in with rotation and scale
- **Continuous**: Gentle floating motion
- **Shimmer**: Diagonal gradient sweep across card
- **Border Glow**: Pulsing glow effect

**3D Effects:**
- Medal/crown positioned outside card (depth)
- Particles floating around rank 1 crown
- Sparkles rotating around cards
- Shadow effects for depth perception

**Gacha-Style Polish:**
- Inspired by Genshin Impact
- Smooth 60fps animations
- Professional quality
- Rewarding to view

### Theme Integration

**Matches app theme:**
- Uses current color theme (Cream/Lilac/Rose/Sky)
- Glass morphism throughout
- Consistent typography
- Smooth transitions

---

## 📈 Ranking Calculations

### XP Rankings

**All-Time XP:**
```
Rank by: u.xp (total XP from User node)
Order: Descending (highest first)
```

**Timeframe XP** (Daily/Weekly/Monthly):
```
Calculate: Sum of QuizSession.xpEarned within timeframe
Plus: XP from other sources (AI tutor, tasks, games)
Order: Descending
```

### Accuracy Rankings

**Formula:**
```
Overall Accuracy = (Total Correct / Total Questions) × 100
```

**Calculation:**
```
Sum all quiz scores
Sum all quiz total questions
Divide and multiply by 100
```

**Example:**
- Quiz 1: 8/10
- Quiz 2: 9/10
- Quiz 3: 7/10
- Total: 24/30 = 80% accuracy

**Timeframe filtering** applies to quiz completion dates.

---

## 🚀 Improving Your Rank

### Climb XP Leaderboard

**Strategies:**
1. **Use AI tutor daily**: 1.01-1.75 XP per message
2. **Take quizzes**: 25-30 XP for legendary nodes
3. **Complete tasks**: 1.01-1.75 XP per task
4. **Play vocabulary games**: 2-24 XP per round
5. **Stay consistent**: Daily activity adds up

**Fastest XP gain:**
- Take multiple quizzes (aim for legendary)
- Play Spelling Bee games (21-24 XP each)
- Complete many small tasks

### Climb Accuracy Leaderboard

**Strategies:**
1. **Study before quizzes**: Use AI tutor to prepare
2. **Take time**: No time limit, think carefully
3. **Review concepts**: Use vocabulary games to practice
4. **Focus on understanding**: Not memorization
5. **Aim for legendary nodes**: 100% scores only

**Quality over quantity:**
- Better to take fewer quizzes with high accuracy
- One perfect quiz (100%) better than three medium scores (70%)

---

## 📊 Statistics & Records

### Personal Records

**Track your:**
- Highest rank achieved
- Most XP in one day
- Best quiz accuracy
- Longest winning streak
- Level achievements

**View in:**
- Achievements page
- Leaderboard (your rank card)
- Admin dashboard (for teachers)

### Class Records (For Teachers)

**Admin dashboard shows:**
- Highest XP student
- Highest accuracy student
- Most improved student
- Most active student
- Class average XP
- Class average accuracy

---

## ❓ FAQ

**Q: How often does leaderboard update?**
A: Instantly! Rankings update in real-time as students earn XP.

**Q: Can I see other students' detailed stats?**
A: No, only their rank, name, XP/accuracy, and level. Activity details are private.

**Q: What if two students have same XP?**
A: Ranked by who earned it first (earlier = higher rank).

**Q: Do I need to take quizzes to rank?**
A: For accuracy leaderboard, yes. For XP leaderboard, any XP source counts.

**Q: Can I reset my rank?**
A: No, ranks are cumulative. All-time rank shows lifetime performance.

**Q: What if I'm not in top 20?**
A: Your rank still shown at bottom! Everyone is ranked.

**Q: How do daily/weekly rankings work?**
A: Calculate XP earned only within that timeframe (rolling window).

**Q: Can teachers see the leaderboard?**
A: Yes, same leaderboard plus admin analytics dashboard.

---

## 🎯 Start Competing!

Ready to climb the ranks?

1. Go to http://localhost:3000/leaderboard
2. See your current rank
3. Set a goal (e.g., "Top 10")
4. Earn XP through learning activities
5. Check back to see your progress!

**Competition makes learning fun!** 🏆✨
