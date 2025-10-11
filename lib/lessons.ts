export type LessonType = 'text' | 'voice' | 'checkpoint';

export interface Lesson {
  id: number;
  type: LessonType;
  title: string;
  scenario?: string;
  status: 'completed' | 'current' | 'locked';
}

export const getLessonsForCourse = (languageId: string, level: string): Lesson[] => {
  // Mock lesson data - in production, this would come from the backend
  return [
    { id: 1, type: 'text', title: 'Greetings', scenario: 'Meeting someone new', status: 'completed' },
    { id: 2, type: 'voice', title: 'Introductions', scenario: 'Introducing yourself', status: 'completed' },
    { id: 3, type: 'text', title: 'Ordering Coffee', scenario: 'Ordering at a cafe', status: 'current' },
    { id: 4, type: 'voice', title: 'Asking Directions', scenario: 'Finding your way', status: 'locked' },
    { id: 5, type: 'checkpoint', title: 'Checkpoint 1', status: 'locked' },
    { id: 6, type: 'text', title: 'At the Restaurant', scenario: 'Ordering food', status: 'locked' },
    { id: 7, type: 'voice', title: 'Shopping', scenario: 'Buying clothes', status: 'locked' },
    { id: 8, type: 'text', title: 'Making Plans', scenario: 'Arranging to meet', status: 'locked' },
    { id: 9, type: 'voice', title: 'Hotel Check-in', scenario: 'Checking into a hotel', status: 'locked' },
    { id: 10, type: 'checkpoint', title: 'Checkpoint 2', status: 'locked' },
  ];
};
