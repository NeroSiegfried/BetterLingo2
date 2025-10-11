# Quick Start Guide

## Getting Started in 5 Minutes

### 1. Prerequisites
- Node.js 18+ installed
- npm or yarn
- A code editor (VS Code recommended)

### 2. Installation
Already done! Dependencies are installed.

### 3. Start Development Server
The server is currently running at http://localhost:3000

If you need to restart:
```bash
npm run dev
```

### 4. Test the Application

#### Flow 1: Complete User Journey
1. Open http://localhost:3000
2. Click "Get Started"
3. Fill out signup form
4. Select "Spanish" from courses
5. Choose "Beginner" skill level
6. View lesson roadmap
7. Click on "Lesson 3" (current lesson)
8. Interact with chat interface
9. Try bottom navigation

#### Flow 2: Voice Lesson
1. Navigate to course dashboard
2. Click on "Lesson 2" (voice lesson)
3. Observe audio visualization
4. Click microphone button
5. Watch recording animation

#### Flow 3: Word Bank
1. Click "Word Bank" in bottom nav
2. Scroll through words
3. Click speaker icon for pronunciation
4. Click "Practice" button
5. Match words with translations

#### Flow 4: Custom Scenario
1. Click "Custom" in bottom nav
2. Choose text or voice
3. Enter scenario title
4. Select topics
5. Start practice

## Key Pages to Test

### Landing Page
URL: http://localhost:3000
Features: Get Started, Login buttons

### Sign Up
URL: http://localhost:3000/signup
Test: Form validation, navigation to courses

### Courses
URL: http://localhost:3000/courses
Test: Horizontal scroll, click language icons

### Skill Level
URL: http://localhost:3000/skill-level?language=spanish
Test: Radio button selection, continue button

### Course Dashboard
URL: http://localhost:3000/course/spanish
Test: 
- Course dropdown (click flag icon)
- Lesson roadmap (curved lines, colors)
- Auto-scroll to current lesson
- Bottom navigation

### Text Lesson
URL: http://localhost:3000/lesson/spanish/3
Test:
- Chat bubbles
- Send messages
- Typing indicator
- Exit modal

### Voice Lesson
URL: http://localhost:3000/lesson/spanish/2/voice
Test:
- Audio bars animation
- Microphone button
- Recording state

### Word Bank
URL: http://localhost:3000/word-bank/spanish
Test:
- Word list scrolling
- Pronunciation button
- Practice button

### Word Practice
URL: http://localhost:3000/word-bank/spanish/practice
Test:
- Matching game
- Score tracking
- Completion

### Custom Scenario
URL: http://localhost:3000/custom-scenario/spanish
Test:
- Type selection
- Topic pills
- Form submission

### Profile
URL: http://localhost:3000/profile
Test:
- Stats display
- Logout button

## Development Tips

### Hot Reload
The app automatically reloads when you save files. No need to manually refresh.

### Viewing on Mobile
1. Find your local IP: `ifconfig` or `ipconfig`
2. Ensure mobile is on same network
3. Visit: http://YOUR_IP:3000

Or use your phone's browser developer tools to simulate mobile.

### Debugging
- Open browser DevTools (F12)
- Check Console for errors
- Use React DevTools extension
- Network tab for API calls (when implemented)

### Making Changes

#### Modify Colors
Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      'brand-blue': '#3B82F6',
      'brand-green': '#10B981',
    }
  }
}
```

#### Add New Page
1. Create file in `app/` directory
2. Export default component
3. File name becomes route
4. Example: `app/about/page.tsx` → `/about`

#### Modify Existing Page
1. Find page in `app/` directory
2. Edit component
3. Save and see changes immediately

#### Add New Component
1. Create file in `components/` directory
2. Follow naming convention: `PascalCase.tsx`
3. Import and use in pages

## Common Tasks

### Change Language List
Edit `lib/languages.ts`:
```typescript
export const languages = [
  { id: 'english', name: 'English', flag: '🇬🇧', countryCode: 'GB' },
  // Add more languages...
];
```

### Modify Lessons
Edit `lib/lessons.ts`:
```typescript
export const getLessonsForCourse = (languageId: string, level: string) => {
  return [
    { id: 1, type: 'text', title: 'Your Lesson', ... },
    // Add more lessons...
  ];
};
```

### Customize Styling
Global styles in `app/globals.css`:
```css
body {
  font-family: 'Your Font', sans-serif;
}
```

Component-specific: Use Tailwind classes inline:
```tsx
<div className="bg-blue-500 text-white p-4 rounded-lg">
  Your content
</div>
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
npm run dev -- -p 3001
```

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### TypeScript Errors
Check `tsconfig.json` is properly configured. Most errors are caught at development time.

## Next Steps

### 1. Customize Design
- Adjust colors in Tailwind config
- Modify spacing and typography
- Add your branding

### 2. Add Backend (Follow DATABASE.md)
- Set up database
- Create API routes
- Implement authentication

### 3. Integrate AI (Follow DEVELOPMENT.md)
- Get API keys
- Implement conversation logic
- Add speech recognition

### 4. Deploy
```bash
# Build for production
npm run build

# Test production build
npm start

# Deploy to Vercel
vercel deploy
```

## Need Help?

- **Documentation**: Check README.md, DEVELOPMENT.md, DATABASE.md
- **Components**: See components/README.md
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind Docs**: https://tailwindcss.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs

## Project Status

✅ **Frontend Complete** - All UI/UX implemented
🔧 **Backend Pending** - Need to add database and APIs
🤖 **AI Pending** - Need to integrate Gemini and speech APIs
🚀 **Ready for Development** - Solid foundation to build upon

---

**Current Version**: 1.0.0-MVP
**Server**: http://localhost:3000
**Status**: Running ✅

Happy coding! 🎉
