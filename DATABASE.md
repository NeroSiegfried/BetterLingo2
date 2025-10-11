# Database Schema Design for BetterLingo

## Overview
This document outlines the database schema for BetterLingo. You can use either Firestore (NoSQL) or PostgreSQL (SQL). Below are schemas for both.

---

## PostgreSQL Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

### User Courses Table
```sql
CREATE TABLE user_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    language_id VARCHAR(50) NOT NULL,
    skill_level VARCHAR(20) NOT NULL CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
    current_lesson_id INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    last_practice_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, language_id)
);

CREATE INDEX idx_user_courses_user ON user_courses(user_id);
```

### Lessons Table
```sql
CREATE TABLE lessons (
    id SERIAL PRIMARY KEY,
    language_id VARCHAR(50) NOT NULL,
    skill_level VARCHAR(20) NOT NULL,
    lesson_number INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('text', 'voice', 'checkpoint')),
    title VARCHAR(255) NOT NULL,
    scenario VARCHAR(255),
    difficulty INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lessons_language ON lessons(language_id, skill_level);
```

### Lesson Progress Table
```sql
CREATE TABLE lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES user_courses(id) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES lessons(id),
    status VARCHAR(20) DEFAULT 'locked' CHECK (status IN ('locked', 'current', 'completed')),
    confidence_score DECIMAL(3,2),
    completed_at TIMESTAMP,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_lesson_progress_user ON lesson_progress(user_id, course_id);
```

### Word Bank Table
```sql
CREATE TABLE word_bank (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    language_id VARCHAR(50) NOT NULL,
    word VARCHAR(255) NOT NULL,
    translation VARCHAR(255) NOT NULL,
    context TEXT,
    is_weakness BOOLEAN DEFAULT FALSE,
    times_practiced INTEGER DEFAULT 0,
    last_practiced_at TIMESTAMP,
    learned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_word_bank_user ON word_bank(user_id, language_id);
CREATE INDEX idx_word_bank_weakness ON word_bank(user_id, is_weakness);
```

### Conversation History Table
```sql
CREATE TABLE conversation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES lessons(id),
    message_type VARCHAR(10) CHECK (message_type IN ('user', 'ai')),
    message_text TEXT NOT NULL,
    corrections JSONB,
    new_words JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conversation_user ON conversation_history(user_id, lesson_id);
```

### Custom Scenarios Table
```sql
CREATE TABLE custom_scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    language_id VARCHAR(50) NOT NULL,
    type VARCHAR(10) CHECK (type IN ('text', 'voice')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    topics TEXT[],
    times_practiced INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_custom_scenarios_user ON custom_scenarios(user_id);
```

### Achievements Table
```sql
CREATE TABLE achievements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    requirement_type VARCHAR(50),
    requirement_value INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id INTEGER REFERENCES achievements(id),
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);
```

---

## Firestore Schema

### Collections Structure

#### users
```javascript
{
  userId: "auto-generated-id",
  name: "John Doe",
  email: "john@example.com",
  passwordHash: "hashed-password",
  emailVerified: false,
  verificationToken: "token",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### userCourses
```javascript
{
  courseId: "auto-generated-id",
  userId: "user-id",
  languageId: "spanish",
  skillLevel: "beginner",
  currentLessonId: 3,
  xp: 250,
  streakDays: 5,
  lastPracticeDate: Timestamp,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### lessons
```javascript
{
  lessonId: "auto-generated-id",
  languageId: "spanish",
  skillLevel: "beginner",
  lessonNumber: 1,
  type: "text",
  title: "Greetings",
  scenario: "Meeting someone new",
  difficulty: 1,
  createdAt: Timestamp
}
```

#### lessonProgress
```javascript
{
  progressId: "auto-generated-id",
  userId: "user-id",
  courseId: "course-id",
  lessonId: "lesson-id",
  status: "completed",
  confidenceScore: 0.85,
  completedAt: Timestamp,
  attempts: 2,
  createdAt: Timestamp
}
```

#### wordBank
```javascript
{
  wordId: "auto-generated-id",
  userId: "user-id",
  languageId: "spanish",
  word: "Hola",
  translation: "Hello",
  context: "Used as a greeting",
  isWeakness: false,
  timesPracticed: 5,
  lastPracticedAt: Timestamp,
  learnedAt: Timestamp,
  createdAt: Timestamp
}
```

#### conversationHistory
```javascript
{
  messageId: "auto-generated-id",
  userId: "user-id",
  lessonId: "lesson-id",
  messageType: "user",
  messageText: "Hola, como estas?",
  corrections: [
    {
      word: "estas",
      correction: "estás",
      explanation: "Missing accent mark"
    }
  ],
  newWords: [
    {
      word: "como",
      translation: "how",
      explanation: "Question word"
    }
  ],
  timestamp: Timestamp
}
```

#### customScenarios
```javascript
{
  scenarioId: "auto-generated-id",
  userId: "user-id",
  languageId: "spanish",
  type: "text",
  title: "Planning a vacation",
  description: "Practice booking hotels and flights",
  topics: ["travel", "accommodation"],
  timesPracticed: 3,
  createdAt: Timestamp
}
```

#### achievements
```javascript
{
  achievementId: "auto-generated-id",
  name: "Fluent Five",
  description: "Complete a 5-minute conversation without errors",
  icon: "trophy",
  requirementType: "conversation_duration",
  requirementValue: 300,
  createdAt: Timestamp
}
```

#### userAchievements
```javascript
{
  userAchievementId: "auto-generated-id",
  userId: "user-id",
  achievementId: "achievement-id",
  earnedAt: Timestamp
}
```

---

## API Endpoints Design

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/logout` - End user session

### Courses
- `GET /api/courses` - Get all user courses
- `POST /api/courses` - Create new course
- `GET /api/courses/:id` - Get course details
- `PATCH /api/courses/:id` - Update course progress
- `DELETE /api/courses/:id` - Delete course

### Lessons
- `GET /api/lessons?languageId=&skillLevel=` - Get lessons for language/level
- `GET /api/lessons/:id` - Get lesson details
- `POST /api/lessons/:id/start` - Start a lesson
- `POST /api/lessons/:id/complete` - Mark lesson complete
- `GET /api/lessons/:id/progress` - Get user progress for lesson

### Word Bank
- `GET /api/words?languageId=` - Get all words for language
- `POST /api/words` - Add new word
- `PATCH /api/words/:id` - Update word (mark weakness)
- `DELETE /api/words/:id` - Remove word
- `GET /api/words/weaknesses?languageId=` - Get words needing practice

### AI Conversation
- `POST /api/conversation/message` - Send message, get AI response
  ```json
  {
    "lessonId": "lesson-id",
    "message": "Hola, como estas?",
    "languageId": "spanish",
    "skillLevel": "beginner"
  }
  ```
  Response:
  ```json
  {
    "response": "Muy bien, gracias. Y tu?",
    "corrections": [...],
    "newWords": [...],
    "confidenceScore": 0.85
  }
  ```

- `POST /api/conversation/voice` - Upload audio, get transcription + response
  ```json
  {
    "audio": "base64-encoded-audio",
    "lessonId": "lesson-id",
    "languageId": "spanish"
  }
  ```

### Custom Scenarios
- `GET /api/scenarios` - Get user's custom scenarios
- `POST /api/scenarios` - Create custom scenario
- `GET /api/scenarios/:id` - Get scenario details
- `DELETE /api/scenarios/:id` - Delete scenario

### Progress & Stats
- `GET /api/progress` - Get overall user progress
- `GET /api/progress/streak` - Get streak information
- `GET /api/progress/xp` - Get XP history
- `GET /api/achievements` - Get user achievements

---

## Data Relationships

### User → UserCourses (One-to-Many)
- A user can have multiple courses (different languages)
- Each course belongs to one user

### UserCourse → LessonProgress (One-to-Many)
- A course has progress for multiple lessons
- Each progress entry belongs to one course

### User → WordBank (One-to-Many)
- A user has multiple words in their word bank
- Each word belongs to one user (per language)

### Lesson → ConversationHistory (One-to-Many)
- A lesson can have multiple conversation messages
- Each message belongs to one lesson session

### User → CustomScenarios (One-to-Many)
- A user can create multiple custom scenarios
- Each scenario belongs to one user

---

## Indexes for Performance

### PostgreSQL
```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);

-- Course queries
CREATE INDEX idx_user_courses_user ON user_courses(user_id);
CREATE INDEX idx_user_courses_language ON user_courses(language_id);

-- Lesson queries
CREATE INDEX idx_lessons_language_level ON lessons(language_id, skill_level);
CREATE INDEX idx_lesson_progress_user_course ON lesson_progress(user_id, course_id);

-- Word bank queries
CREATE INDEX idx_word_bank_user_language ON word_bank(user_id, language_id);
CREATE INDEX idx_word_bank_weakness ON word_bank(user_id, is_weakness);

-- Conversation history
CREATE INDEX idx_conversation_user_lesson ON conversation_history(user_id, lesson_id);
CREATE INDEX idx_conversation_timestamp ON conversation_history(timestamp);
```

### Firestore
```javascript
// Composite indexes in Firestore
// Add these to firestore.indexes.json

{
  "indexes": [
    {
      "collectionGroup": "userCourses",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "languageId", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "wordBank",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "languageId", "order": "ASCENDING" },
        { "fieldPath": "isWeakness", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "lessonProgress",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    }
  ]
}
```

---

## Security Rules

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /userCourses/{courseId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    match /wordBank/{wordId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Lessons are read-only
    match /lessons/{lessonId} {
      allow read: if request.auth != null;
      allow write: if false;
    }
    
    match /lessonProgress/{progressId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    match /customScenarios/{scenarioId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## Seed Data

### Sample Lessons (Spanish, Beginner)
```sql
INSERT INTO lessons (language_id, skill_level, lesson_number, type, title, scenario) VALUES
('spanish', 'beginner', 1, 'text', 'Greetings', 'Meeting someone new'),
('spanish', 'beginner', 2, 'voice', 'Introductions', 'Introducing yourself'),
('spanish', 'beginner', 3, 'text', 'Ordering Coffee', 'Ordering at a cafe'),
('spanish', 'beginner', 4, 'voice', 'Asking Directions', 'Finding your way'),
('spanish', 'beginner', 5, 'checkpoint', 'Checkpoint 1', NULL),
('spanish', 'beginner', 6, 'text', 'At the Restaurant', 'Ordering food'),
('spanish', 'beginner', 7, 'voice', 'Shopping', 'Buying clothes'),
('spanish', 'beginner', 8, 'text', 'Making Plans', 'Arranging to meet'),
('spanish', 'beginner', 9, 'voice', 'Hotel Check-in', 'Checking into a hotel'),
('spanish', 'beginner', 10, 'checkpoint', 'Checkpoint 2', NULL);
```

---

## Migration Strategy

1. **Start with PostgreSQL** if you need:
   - Complex queries
   - Transactions
   - Strong consistency
   - Relational data

2. **Start with Firestore** if you need:
   - Real-time updates
   - Easy scalability
   - Simple setup
   - Offline support

3. **Hybrid Approach**:
   - Use PostgreSQL for user data, courses, lessons
   - Use Firestore for real-time conversation history
   - Use Redis for caching

---

This schema provides a solid foundation for the BetterLingo application with room for growth and optimization.
