# BetterLingo Development Guide

## Overview

This document provides detailed information about the BetterLingo application structure, components, and development workflow.

## Application Flow

### 1. Landing Page (`/`)
- Entry point with "Get Started" and "Login" buttons
- Simple, clean design

### 2. Authentication
- **Sign Up** (`/signup`): Collects name, email, password
- **Login** (`/login`): Email and password authentication
- Validation implemented on the frontend
- TODO: Backend integration for actual authentication

### 3. Course Selection (`/courses`)
- Horizontally scrolling list of languages
- Circular flag icons for each language
- Centered layout
- User can swipe/scroll through options

### 4. Skill Level Selection (`/skill-level`)
- Receives language ID from query parameters
- Three radio button options: Beginner, Intermediate, Advanced
- Vertically centered layout

### 5. Course Dashboard (`/course/[languageId]`)
Main learning interface with three sections:

#### Top Navbar
- Course dropdown (left) - circular flag icon
- Language name (center, uppercase)
- Allows switching between active courses
- "+ Add" button to add new courses

#### Main Content - Lesson Roadmap
- Lessons displayed as circles with numbers
- Curved, dotted lines connecting lessons
- Alternating left/right layout
- Color coding:
  - Green: Completed lessons
  - Blue: Current lesson
  - Gray: Locked lessons
- Checkpoint lessons show flag icon
- Auto-scrolls to current lesson on load
- Each lesson shows:
  - Lesson number/flag
  - Title
  - Scenario description
  - Type (Text Chat/Voice Chat)

#### Bottom Navbar
- **Lessons**: Return to roadmap
- **Word Bank**: View learned vocabulary
- **Custom**: Create custom scenarios
- **Profile**: User settings and stats

### 6. Text Conversation Lesson (`/lesson/[languageId]/[lessonId]`)

#### Features
- WhatsApp-style chat interface
- Top navbar shows lesson/scenario name
- Exit button with confirmation modal
- Chat bubbles with stems:
  - Left-aligned: AI messages
  - Right-aligned: User messages
- Typing indicator (three animated dots)
- Word highlighting:
  - Yellow: New vocabulary
  - Red: Errors/corrections
- Click highlighted words for explanations
- Bottom input area with send button

#### Word Interaction
- New words are automatically highlighted
- Clicking opens modal with:
  - Word definition
  - Usage example
  - "Got it" button to close

### 7. Voice Conversation Lesson (`/lesson/[languageId]/[lessonId]/voice`)

#### Features
- Audio visualization (5 vertical bars)
- Bars animate when AI speaks
- Circular microphone button at bottom
- Button size = bar height (20px radius)
- Bar curves around button (25px radius)
- States:
  - Idle: Blue button, static bars
  - Recording: Red pulsing button
  - AI Speaking: Blue button, animated bars

### 8. Word Bank (`/word-bank/[languageId]`)

#### Features
- Top navbar shows "Word Bank"
- Heading: "[X] words" where X = count
- Vertical scrolling list of words
- Each word card shows:
  - Word in target language (heading)
  - Translation (subheading)
  - Speaker icon button for pronunciation
  - "Needs practice" tag for weaknesses
- Bottom button: "Practice" 

### 9. Word Practice (`/word-bank/[languageId]/practice`)

#### Matching Game
- Two columns of items
- Left: Words in target language
- Right: Translations (shuffled)
- Tap left, then right to match
- Correct matches turn green
- Incorrect matches flash and reset
- Score tracking
- Completion message

### 10. Custom Scenario Builder (`/custom-scenario/[languageId]`)

#### Features
- Select scenario type (Text/Voice)
- Enter scenario title
- Optional description
- Select topics from predefined list
- Topics: Travel, Food, Shopping, Work, etc.
- "Start Practice" button launches custom lesson

### 11. Profile (`/profile`)

#### Sections
- User information (avatar, name, email)
- Statistics:
  - Day streak
  - Lessons completed
  - Words learned
  - Practice time
- Settings menu
- Logout button

## Components

### `CourseDropdown.tsx`
- Displays active courses in dropdown
- Horizontal scrolling for overflow
- Rectangular course icons with flags
- "+ Add" button at end
- Props:
  - `currentLanguage`: Current language object
  - `userCourses`: Array of language IDs
  - `onCourseSelect`: Callback for selection
  - `onAddCourse`: Callback for adding course

### `BottomNav.tsx`
- Fixed bottom navigation
- Four buttons: Lessons, Word Bank, Custom, Profile
- Active state highlighting
- Icon + text for each button
- Props:
  - `languageId`: Current language ID

### `LessonRoadmap.tsx`
- Renders lesson path with SVG curves
- Auto-scrolls to current lesson
- Handles lesson click navigation
- Props:
  - `lessons`: Array of lesson objects
  - `languageId`: Current language ID

## Data Structures

### Language Object
```typescript
{
  id: string;           // 'english', 'spanish', etc.
  name: string;         // 'English', 'Spanish', etc.
  flag: string;         // Flag emoji
  countryCode: string;  // 'GB', 'ES', etc.
}
```

### Lesson Object
```typescript
{
  id: number;
  type: 'text' | 'voice' | 'checkpoint';
  title: string;
  scenario?: string;
  status: 'completed' | 'current' | 'locked';
}
```

### Word Object
```typescript
{
  id: string;
  word: string;
  translation: string;
  isWeakness?: boolean;
}
```

## Styling Guidelines

### Colors
- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Error: Red (#EF4444)
- Warning: Orange (#F59E0B)
- Background: Gray-50 (#F9FAFB)
- White: #FFFFFF
- Text: Gray-900 (#111827)

### Mobile-First Approach
- Base styles for mobile (320px+)
- Responsive breakpoints:
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px

### No Emojis
- No emoji characters in UI text
- Only flag emojis used for country representation

### Clean Design
- No unnecessary gradients
- Minimal decorative elements
- Functional, purposeful design
- Clear hierarchy
- Readable typography

## TODO: Backend Integration

### Authentication
1. Set up NextAuth.js or custom auth
2. Implement JWT tokens
3. Create protected routes
4. Add email verification
5. Password reset functionality

### Database Schema

#### Users Table
- id, name, email, password_hash
- created_at, updated_at
- email_verified

#### Courses Table
- id, user_id, language_id, skill_level
- current_lesson_id, created_at

#### Lessons Table
- id, course_id, lesson_number
- type, title, scenario
- status, completed_at

#### Words Table
- id, user_id, language_id
- word, translation, is_weakness
- learned_at, practiced_at

#### Progress Table
- id, user_id, course_id
- xp, streak_days, total_time
- last_practice_date

### API Routes Needed

#### Authentication
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/verify-email`
- `POST /api/auth/logout`

#### Courses
- `GET /api/courses` - Get user's courses
- `POST /api/courses` - Create new course
- `GET /api/courses/[id]` - Get course details
- `PATCH /api/courses/[id]` - Update course progress

#### Lessons
- `GET /api/lessons/[courseId]` - Get all lessons
- `GET /api/lessons/[courseId]/[lessonId]` - Get lesson details
- `POST /api/lessons/[courseId]/[lessonId]/complete` - Mark complete

#### Word Bank
- `GET /api/words/[languageId]` - Get all words
- `POST /api/words` - Add new word
- `PATCH /api/words/[id]` - Update word (mark weakness)
- `DELETE /api/words/[id]` - Remove word

#### AI Conversation
- `POST /api/conversation/message` - Send message, get AI response
- `POST /api/conversation/voice` - Send audio, get transcription + response

### AI Integration

#### Gemini API Setup
1. Get API key from Google AI Studio
2. Create conversation context manager
3. Implement system prompts for:
   - Language level adaptation
   - Scenario context
   - Error correction
   - Vocabulary introduction

#### Speech APIs
1. Google Cloud Speech-to-Text
   - Real-time transcription
   - Language-specific models
2. Google Cloud Text-to-Speech
   - Natural voices
   - Multiple languages
   - Pronunciation accuracy

## Testing the Application

### Development Server
```bash
npm run dev
```
Visit http://localhost:3000

### Test Flow
1. Click "Get Started" on landing page
2. Fill out signup form
3. Submit to go to courses page
4. Select a language (e.g., Spanish)
5. Choose skill level
6. View lesson roadmap
7. Click on a lesson to start
8. Test chat interface
9. Navigate to word bank
10. Try practice game
11. Create custom scenario
12. View profile

## Known Limitations (MVP)

- No actual backend/database
- Mock data for lessons and words
- No real AI conversation (simulated)
- No actual speech recognition
- Basic text-to-speech (browser API)
- No user persistence
- No progress saving
- No real email confirmation

## Future Enhancements

### Phase 1: Core Backend
- Authentication system
- Database setup
- User data persistence
- Course progress tracking

### Phase 2: AI Integration
- Gemini API integration
- Real-time conversation
- Context-aware corrections
- Adaptive difficulty

### Phase 3: Speech Features
- Voice recognition
- Pronunciation scoring
- Accent adaptation
- Real-time feedback

### Phase 4: Gamification
- XP and leveling system
- Achievement badges
- Leaderboards
- Daily challenges
- Streak rewards

### Phase 5: Social Features
- Friend system
- Study groups
- Shared scenarios
- Competition mode

### Phase 6: Advanced Features
- Offline mode
- Custom vocabulary lists
- Grammar explanations
- Culture lessons
- Native speaker matching

## Performance Optimization

### Current
- Client-side rendering for interactive components
- Server components where possible
- Tailwind CSS for minimal bundle size

### Future
- Image optimization
- Code splitting
- Lazy loading
- Service workers
- API response caching
- Database query optimization
- CDN for static assets

## Deployment

### Recommended Platforms
- **Vercel**: Best for Next.js (zero config)
- **Netlify**: Good alternative
- **Railway**: For full-stack with database

### Environment Variables
```
NEXTAUTH_URL=
NEXTAUTH_SECRET=
DATABASE_URL=
GEMINI_API_KEY=
GOOGLE_CLOUD_CREDENTIALS=
```

### Build Command
```bash
npm run build
```

### Production Start
```bash
npm start
```

## Support

For issues or questions during development:
1. Check Next.js documentation
2. Review Tailwind CSS docs
3. Consult TypeScript handbook
4. Check component implementation
5. Review this guide

## Conclusion

This application provides a solid foundation for a language learning platform. The UI/UX is complete and functional. The next critical step is backend integration with real authentication, database, and AI services to make it a production-ready application.
