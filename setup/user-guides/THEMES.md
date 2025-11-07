# 🎨 Themes & Customization - User Guide

Guide to personalizing your Noodeia experience with themes and avatars.

---

## 🌈 Theme System

Noodeia offers 4 beautiful color themes to personalize your learning environment.

**Available Themes:**
- 🟡 **Cream** (Default) - Warm beige tones
- 🟣 **Lilac** - Soft purple
- 🌸 **Rose** - Gentle pink
- 🔵 **Sky** - Light blue

**All use light mode** with different color palettes (no dark mode).

---

## 🎨 The Four Themes

### Cream Theme (Default)

**Colors:**
- Background: `#FEFCE8` (Pale yellow-cream)
- Panels: Slightly darker cream
- Accents: Brown and tan

**Best for:**
- Warm, calming atmosphere
- Default comfortable experience
- Long study sessions

**Feel**: Professional, academic, welcoming

---

### Lilac Theme

**Colors:**
- Background: `#EAD9FF` (Pale purple)
- Panels: Darker purple tones
- Accents: Purple and violet

**Best for:**
- Creative, inspiring atmosphere
- Purple lovers
- Unique aesthetic

**Feel**: Playful, imaginative, creative

---

### Rose Theme

**Colors:**
- Background: `#FAD1E8` (Pale pink)
- Panels: Darker pink tones
- Accents: Pink and rose

**Best for:**
- Soft, gentle atmosphere
- Pink enthusiasts
- Calm studying

**Feel**: Gentle, friendly, approachable

---

### Sky Theme

**Colors:**
- Background: `#E6F0FF` (Pale blue)
- Panels: Darker blue tones
- Accents: Blue and cyan

**Best for:**
- Cool, focused atmosphere
- Blue lovers
- Clarity and concentration

**Feel**: Clear, peaceful, focused

---

## 🔄 Changing Themes

### Theme Cycle Button

**Location**: Top right corner of most pages
- AI Tutor interface
- Group Chat
- Kanban board
- Other main pages

**How to use:**
1. Click the theme cycle button (color palette icon)
2. Theme changes immediately
3. Cycles through: Cream → Lilac → Rose → Sky → Cream
4. Theme persists across pages and sessions

**Visual indicator:**
- Button shows current theme color
- Smooth transition animations
- All UI elements update together

### Theme Persistence

**Your theme choice:**
- Saved in browser localStorage
- Persists across sessions
- Applies to all pages
- Same on all your devices (once set on each)

**Not synced:**
- Theme is per-browser, not per-account
- Set separately on phone, tablet, desktop
- Other users don't see your theme choice

---

## 🎭 Avatar Customization

### Two Avatar Types

#### Initials Avatar

**Shows**: First and last name initials

**Example:**
- Name: "John Doe" → Shows "JD"
- Name: "Sarah" → Shows "SA"
- Background color customizable

**Customization:**
1. Click profile button in header
2. Settings modal opens
3. Select "Initials" tab
4. Choose background color:
   - 12 preset colors, OR
   - Custom color picker (hex color)
5. Preview in 3 sizes
6. Click "Save Changes"

**Color options:**
- Red, orange, yellow, green, blue, purple
- Plus 6 more preset colors
- Or any hex color (#FF5733)

#### Emoji Avatar

**Shows**: Selected emoji character

**Customization:**
1. Click profile button in header
2. Settings modal opens
3. Select "Emoji" tab
4. Choose emoji:
   - **48 popular emojis** in grid (🎮🎨🎯🎪🎭🎬🎸🎹🎺...)
   - OR type custom emoji in input
5. Preview in 3 sizes
6. Click "Save Changes"

**Popular emojis included:**
- Gaming: 🎮🎯🎲🎰
- Art: 🎨🖌️🖍️
- Sports: ⚽🏀🏈⛳
- Animals: 🐱🐶🐼🦊
- Food: 🍕🍔🍦🎂
- Nature: 🌸🌺🌻🌷
- Objects: 📚💡🎁🏆
- And 20+ more!

**Custom emoji:**
- Type any emoji character
- Copy from emoji picker
- Use emoji keyboard (Cmd+Ctrl+Space on Mac, Win+. on Windows)

---

## 🎨 Surface Hierarchy

### Visual Depth System

**Three surface levels** create visual depth:

**Surface 0 (Background):**
- Main page background
- Lightest color
- Base layer

**Surface 1 (Chat Bubbles, Cards):**
- 6% darker than background
- Medium depth
- Content containers

**Surface 2 (Side Panels):**
- 10% darker than background
- Deepest layer
- Sidebar, markdown panel, thread panel

**Why it matters:**
- Creates visual hierarchy
- Distinguishes UI sections
- Professional design
- Easy to understand layout

**Color mixing:**
Uses OKLab color space for perceptually uniform darkening.

---

## 👤 Avatar Display

### Where Avatars Appear

**Your avatar shows in:**
- Header (top right)
- AI tutor messages
- Group chat messages
- Thread replies
- Leaderboard
- Achievements page
- Anywhere your name appears

**Avatar sizes:**
- **xs**: 24px (small indicators)
- **sm**: 32px (message headers)
- **md**: 40px (default)
- **lg**: 48px (profile display)
- **xl**: 64px (settings modal)

### AI Assistant Avatar

**Special avatar** for AI:
- Shows "AI" text
- Purple gradient background
- Distinct from user avatars
- Consistent across app

---

## 🎯 Using Themes Effectively

### Choose Your Theme

**Based on preference:**
- **Cream**: Classic, professional
- **Lilac**: Creative, unique
- **Rose**: Gentle, friendly
- **Sky**: Cool, focused

**Based on time:**
- Morning: Sky (fresh start)
- Afternoon: Cream (warm focus)
- Evening: Lilac or Rose (relaxing)

**Based on activity:**
- Studying: Sky (concentration)
- Creative work: Lilac (imagination)
- Group chat: Rose (friendly)
- Long sessions: Cream (comfortable)

### Avatar Tips

**Choose emoji that:**
- Represents you
- Is easy to recognize
- Stands out from others
- You like seeing

**Choose colors that:**
- Match your personality
- Are easy to see
- Contrast with theme
- You find appealing

**For initials:**
- Pick bright colors for visibility
- Dark colors work on light themes
- Avoid colors too similar to theme

---

## 🔧 Technical Details

### Theme Implementation

**CSS Variables:**
```css
[data-theme="cream"] {
  --surface-0: #FEFCE8;
  --surface-1: color-mix(in oklab, #FEFCE8 100%, black 6%);
  --surface-2: color-mix(in oklab, #FEFCE8 100%, black 10%);
}
```

**Applied via:**
- Document attribute: `data-theme="cream"`
- Tailwind arbitrary values: `bg-[var(--surface-0)]`
- Global CSS variables

### Avatar Storage

**Neo4j User Node:**
```cypher
(:User {
  iconType: "emoji",
  iconEmoji: "🎮",
  iconColor: "#FF5733"
})
```

**API Endpoint:**
- PATCH `/api/user/profile` - Update avatar

---

## ❓ FAQ

**Q: Can I use dark mode?**
A: Not currently. All themes are light mode with different colors.

**Q: Will my theme affect others?**
A: No, theme is personal. Others see their own chosen theme.

**Q: Can I create custom themes?**
A: Not in UI. Developers can add themes in code.

**Q: Do emojis look same on all devices?**
A: Mostly, but slight variations between iOS, Android, Windows.

**Q: Can I change avatar anytime?**
A: Yes! Change as often as you like in settings.

**Q: Will avatar show in old messages?**
A: Yes, avatar is linked to your account, updates everywhere.

**Q: What if I can't find emoji I want?**
A: Use custom emoji input to type any emoji character.

**Q: Can I upload custom image as avatar?**
A: Not currently. Limited to emojis and initials.

---

## 🌟 Accessibility

### Color Contrast

**All themes meet:**
- WCAG AA standards
- Good contrast ratios
- Readable text on all surfaces
- Clear visual hierarchy

**Text colors:**
- Dark gray on light backgrounds
- High contrast for readability
- Consistent across themes

### Avatar Accessibility

**Considerations:**
- Emojis may not render well in screen readers
- Initials always readable
- Color-blind friendly (text labels present)

---

## 🎯 Personalize Your Experience!

Make Noodeia feel like yours:

1. **Choose theme** that inspires you
2. **Customize avatar** to express yourself
3. **Enjoy personalized** learning environment!

**Your theme, your style, your learning journey!** 🎨✨
