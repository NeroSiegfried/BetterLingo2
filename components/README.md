# BetterLingo Components

This directory contains reusable React components used throughout the BetterLingo application.

## Component Overview

### BottomNav.tsx
**Purpose**: Fixed bottom navigation bar for the main learning interface

**Props**:
- `languageId: string` - Current language ID for navigation links

**Features**:
- Fixed positioning at bottom of screen
- Four navigation buttons:
  - Lessons (home icon)
  - Word Bank (book icon)
  - Custom (edit icon)
  - Profile (user icon)
- Active state highlighting with blue color
- SVG icons for each button
- Icon + text label layout

**Usage**:
```tsx
<BottomNav languageId="spanish" />
```

**Styling**:
- White background with top border
- Maximum width container for large screens
- Flexbox layout with space-around
- Active state: `text-blue-600`
- Inactive state: `text-gray-600`

---

### CourseDropdown.tsx
**Purpose**: Dropdown menu for switching between active language courses

**Props**:
- `currentLanguage: Language` - Currently selected language object
- `userCourses: string[]` - Array of language IDs user is enrolled in
- `onCourseSelect: (languageId: string) => void` - Callback when course selected
- `onAddCourse: () => void` - Callback for adding new course

**Features**:
- Circular flag button as trigger
- Dropdown with horizontal scrolling
- Shows all active courses
- "+ Add" button at end
- Click outside to close
- Visual feedback on hover

**Usage**:
```tsx
<CourseDropdown
  currentLanguage={currentLanguage}
  userCourses={['spanish', 'french']}
  onCourseSelect={(id) => router.push(`/course/${id}`)}
  onAddCourse={() => router.push('/courses')}
/>
```

**Styling**:
- White background with shadow
- Border on hover
- Current course has reduced opacity
- Rectangular course cards with flags
- Dashed border for "+ Add" button

---

### LessonRoadmap.tsx
**Purpose**: Visual roadmap of lessons with curved connecting lines

**Props**:
- `lessons: Lesson[]` - Array of lesson objects
- `languageId: string` - Current language ID for navigation

**Features**:
- SVG curved paths between lessons
- Alternating left/right layout
- Auto-scroll to current lesson
- Status-based coloring:
  - Green: Completed
  - Blue: Current
  - Gray: Locked
- Click to start lesson (if unlocked)
- Checkpoint flag icon
- Hover scale effect

**Usage**:
```tsx
const lessons = getLessonsForCourse('spanish', 'beginner');
<LessonRoadmap lessons={lessons} languageId="spanish" />
```

**Lesson Object Structure**:
```typescript
interface Lesson {
  id: number;
  type: 'text' | 'voice' | 'checkpoint';
  title: string;
  scenario?: string;
  status: 'completed' | 'current' | 'locked';
}
```

**Styling**:
- SVG paths with stroke-dasharray for dotted lines
- Circular lesson nodes (64px diameter)
- Shadow and border effects
- Responsive spacing
- Smooth transitions

---

## Creating New Components

### Component Template
```tsx
'use client';

import { /* imports */ } from 'react';

interface ComponentNameProps {
  // Define props
}

export default function ComponentName({ /* props */ }: ComponentNameProps) {
  // Component logic

  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### Best Practices

1. **'use client' Directive**
   - Add at top of file for interactive components
   - Required for useState, useEffect, event handlers

2. **TypeScript Props**
   - Always define interface for props
   - Use meaningful names
   - Add JSDoc comments for complex props

3. **Styling**
   - Use Tailwind CSS classes
   - Follow mobile-first approach
   - Maintain consistent spacing
   - Use theme colors

4. **Accessibility**
   - Add aria labels
   - Use semantic HTML
   - Keyboard navigation support
   - Focus states

5. **Performance**
   - Memoize expensive computations
   - Use useCallback for handlers
   - Lazy load when appropriate

### Example: Creating a Button Component

```tsx
'use client';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  fullWidth?: boolean;
}

export default function Button({ 
  children, 
  onClick, 
  variant = 'primary',
  disabled = false,
  fullWidth = false 
}: ButtonProps) {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${disabledClass}`}
    >
      {children}
    </button>
  );
}
```

---

## Component Patterns

### Modal Component Pattern
```tsx
'use client';

import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
```

### Loading Spinner Pattern
```tsx
export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizes[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}></div>
    </div>
  );
}
```

---

## Future Components to Add

### Priority Components

1. **Modal.tsx**
   - Reusable modal for word explanations, confirmations
   - Props: isOpen, onClose, title, children

2. **Button.tsx**
   - Standardized button component
   - Variants: primary, secondary, danger
   - Sizes: small, medium, large

3. **Input.tsx**
   - Form input with validation
   - Error states
   - Label and helper text

4. **Card.tsx**
   - Container component
   - Consistent padding and borders
   - Optional title and actions

5. **LoadingSpinner.tsx**
   - Loading state indicator
   - Different sizes
   - Optional text

### Nice-to-Have Components

6. **ProgressBar.tsx**
   - Visual progress indicator
   - Used for XP, lesson completion

7. **Badge.tsx**
   - Achievement badges
   - Status indicators
   - Small labeled pills

8. **Toast.tsx**
   - Notification system
   - Success, error, info variants
   - Auto-dismiss

9. **Dropdown.tsx**
   - Generic dropdown menu
   - Reusable for various purposes

10. **Avatar.tsx**
    - User profile pictures
    - Fallback initials
    - Status indicators

---

## Testing Components

### Manual Testing Checklist
- [ ] Renders correctly on mobile (320px+)
- [ ] Renders correctly on tablet (768px+)
- [ ] Renders correctly on desktop (1024px+)
- [ ] All interactive elements are clickable
- [ ] Hover states work properly
- [ ] Focus states are visible
- [ ] Loading states display correctly
- [ ] Error states display correctly
- [ ] Component unmounts cleanly
- [ ] No console errors or warnings

### Unit Testing (Future)
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

---

## Component Library Integration (Future)

Consider integrating with:
- **Radix UI** - Unstyled, accessible components
- **Headless UI** - Tailwind CSS optimized
- **shadcn/ui** - Copy-paste component library

---

## Contributing

When adding new components:
1. Create file in `/components` directory
2. Follow naming convention: PascalCase.tsx
3. Export as default
4. Add TypeScript interfaces for props
5. Document in this README
6. Add example usage
7. Test on multiple screen sizes
