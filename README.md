# BetterLingo - AI-Powered Language Learning Platform

BetterLingo is a mobile-first language learning application that uses AI-powered conversational practice to help users achieve true fluency. Unlike traditional flashcard-based apps, BetterLingo focuses on contextual learning through realistic text and voice conversations.

## Features Implemented

### Authentication
- Sign up page with name, email, and password
- Login page
- Form validation

### Course Management
- Language selection page with circular flag icons
- Horizontally scrolling language carousel
- Skill level selection (Beginner, Intermediate, Advanced)
- Course dashboard with persistent top navbar
- Course dropdown for switching between languages

### Lessons
- Roadmap-style lesson display with curved dotted lines
- Auto-scroll to current lesson
- Different lesson types: Text, Voice, and Checkpoints
- Color-coded lesson status (completed, current, locked)

### Text Conversation Lessons
- WhatsApp-like chat interface
- Chat bubbles with stems
- Typing indicator
- Word highlighting for new vocabulary
- Modal explanations for words
- Error corrections with highlights
- Exit confirmation modal

### Voice Conversation Lessons
- Audio visualization with animated bars
- Circular microphone button
- Recording state indication
- Curved bar around microphone button

### Word Bank
- List of learned words with translations
- Text-to-speech pronunciation
- Weakness indicators
- Practice games (word matching)

### Custom Scenarios
- Custom scenario builder
- Topic selection
- Text/Voice mode selection
- Personalized practice sessions

### Profile
- User statistics
- Settings access
- Logout functionality

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: File-based routing with dynamic routes

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Navigate to the project directory:
```bash
cd /path/to/BetterLingo2
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
BetterLingo2/
├── app/
│   ├── course/[languageId]/      # Course dashboard
│   ├── courses/                   # Language selection
│   ├── custom-scenario/           # Custom practice builder
│   ├── lesson/[languageId]/[lessonId]/  # Lesson pages
│   ├── login/                     # Login page
│   ├── profile/                   # User profile
│   ├── signup/                    # Sign up page
│   ├── skill-level/               # Skill level selection
│   ├── word-bank/                 # Word bank and practice
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Home page
│   └── globals.css                # Global styles
├── components/
│   ├── BottomNav.tsx              # Bottom navigation bar
│   ├── CourseDropdown.tsx         # Course switcher dropdown
│   └── LessonRoadmap.tsx          # Lesson roadmap display
├── lib/
│   ├── languages.ts               # Language definitions
│   └── lessons.ts                 # Lesson data structure
├── next.config.js                 # Next.js configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
└── package.json                   # Dependencies
```

## Key Pages

### Authentication Flow
1. `/` - Landing page with Get Started and Login buttons
2. `/signup` - User registration
3. `/login` - User authentication
4. `/courses` - Language selection (post-login)

### Learning Flow
1. `/courses` - Select a language
2. `/skill-level?language={id}` - Choose skill level
3. `/course/{languageId}` - View lesson roadmap
4. `/lesson/{languageId}/{lessonId}` - Complete text lesson
5. `/lesson/{languageId}/{lessonId}/voice` - Complete voice lesson

### Additional Features
- `/word-bank/{languageId}` - View learned words
- `/word-bank/{languageId}/practice` - Practice with games
- `/custom-scenario/{languageId}` - Create custom practice
- `/profile` - View stats and settings

## Next Steps for Production

### Backend Integration
- Set up authentication API (NextAuth.js or custom)
- Implement email confirmation flow
- Create database schema (Firestore or PostgreSQL)
- Build API routes for:
  - User management
  - Course progress tracking
  - Word bank CRUD operations
  - Lesson completion tracking

### AI Integration
- Integrate Gemini API for conversational AI
- Implement Google Cloud Speech-to-Text
- Implement Google Cloud Text-to-Speech
- Create context-aware correction system
- Build adaptive curriculum engine

### Features to Add
- Real-time AI conversation responses
- Speech recognition for pronunciation
- Progress tracking and analytics
- Gamification (XP, streaks, badges)
- Social features (leaderboards, friends)
- Offline mode
- Push notifications

### UI/UX Enhancements
- Add loading states
- Implement error boundaries
- Add animations and transitions
- Improve accessibility (ARIA labels, keyboard navigation)
- Add dark mode support
- Optimize for various screen sizes

### Performance
- Implement code splitting
- Add image optimization
- Set up caching strategies
- Implement service workers for offline support

## Design Principles

- **Mobile-First**: All interfaces are designed for mobile devices first
- **Clean & Simple**: No unnecessary gradients or decorative elements
- **Functional**: Every element serves a purpose
- **Accessible**: Clear navigation and readable text
- **Responsive**: Works on all screen sizes

## Contributing

This is a hackathon project. For production use, please ensure proper testing, security measures, and backend implementation.

## License

MIT
