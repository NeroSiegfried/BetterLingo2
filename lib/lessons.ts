export type LessonType = 'text' | 'voice' | 'checkpoint';

export interface Lesson {
  id: number;
  type: LessonType;
  title: string;
  scenario?: string;
  status: 'completed' | 'current' | 'locked';
}

export const getLessonsForCourse = (languageId: string, level: string): Lesson[] => {
  // Comprehensive lesson progression with detailed scenarios
  return [
    { 
      id: 1, 
      type: 'text', 
      title: 'Lesson 1 (Greetings)', 
      scenario: 'You meet a friendly local named Maria at a café. Practice saying hello, asking how someone is, and basic polite expressions. Maria will greet you warmly and help you practice common greetings like "hello", "good morning", "how are you", and "nice to meet you".', 
      status: 'current' 
    },
    { 
      id: 2, 
      type: 'voice', 
      title: 'Lesson 2 (Introductions)', 
      scenario: 'You are introducing yourself to a new classmate named Carlos. Share your name, where you are from, what you do, and practice asking the same questions. This conversation focuses on "My name is...", "I am from...", "What is your name?", and similar personal introduction phrases.', 
      status: 'locked' 
    },
    { 
      id: 3, 
      type: 'text', 
      title: 'Lesson 3 (Numbers & Time)', 
      scenario: 'You need to tell time and understand numbers at the train station. Practice numbers 1-100, asking "What time is it?", telling time, and understanding departure/arrival times. The station agent will help you practice.', 
      status: 'locked' 
    },
    { 
      id: 4, 
      type: 'voice', 
      title: 'Lesson 4 (Ordering Coffee)', 
      scenario: 'You are at a café and want to order a drink and snack. Practice ordering items, asking for prices, saying please and thank you. The barista will take your order and help you with menu vocabulary like coffee, tea, water, sandwich, pastry, etc.', 
      status: 'locked' 
    },
    { 
      id: 5, 
      type: 'checkpoint', 
      title: 'Checkpoint 1', 
      scenario: 'Review: Greetings, introductions, numbers, and basic ordering', 
      status: 'locked' 
    },
    { 
      id: 6, 
      type: 'text', 
      title: 'Lesson 6 (Asking Directions)', 
      scenario: 'You are lost in the city and need to find your hotel. Practice asking "Where is...?", "How do I get to...?", understanding directions (left, right, straight, near, far), and location vocabulary (street, corner, building, metro station).', 
      status: 'locked' 
    },
    { 
      id: 7, 
      type: 'voice', 
      title: 'Lesson 7 (At the Restaurant)', 
      scenario: 'You are dining at a restaurant. Practice reading a menu, ordering appetizers, main courses, desserts, and drinks. Ask about ingredients, request recommendations, and practice restaurant etiquette. The waiter will guide you through the menu.', 
      status: 'locked' 
    },
    { 
      id: 8, 
      type: 'text', 
      title: 'Lesson 8 (Shopping for Clothes)', 
      scenario: 'You are shopping for clothes at a boutique. Practice asking about sizes, colors, prices, trying things on, and expressing preferences. Learn vocabulary for clothing items (shirt, pants, shoes, dress) and descriptive words (big, small, expensive, cheap, beautiful).', 
      status: 'locked' 
    },
    { 
      id: 9, 
      type: 'voice', 
      title: 'Lesson 9 (Making Plans)', 
      scenario: 'You want to make plans with a friend to meet up. Practice suggesting activities, proposing times and places, accepting or declining invitations politely, and confirming details. Discuss activities like going to the movies, dinner, or a concert.', 
      status: 'locked' 
    },
    { 
      id: 10, 
      type: 'checkpoint', 
      title: 'Checkpoint 2', 
      scenario: 'Review: Directions, dining, shopping, and social plans', 
      status: 'locked' 
    },
    { 
      id: 11, 
      type: 'text', 
      title: 'Lesson 11 (At the Doctor)', 
      scenario: 'You are not feeling well and visit a doctor. Practice describing symptoms (headache, fever, cough), body parts, understanding medical advice, and asking about medication. The doctor will help you explain what hurts and give recommendations.', 
      status: 'locked' 
    },
    { 
      id: 12, 
      type: 'voice', 
      title: 'Lesson 12 (Hotel Check-in)', 
      scenario: 'You are checking into a hotel. Practice making a reservation, providing personal information, asking about amenities (wifi, breakfast, parking), requesting extra items (towels, pillows), and understanding room details. The receptionist will assist you.', 
      status: 'locked' 
    },
    { 
      id: 13, 
      type: 'text', 
      title: 'Lesson 13 (Public Transport)', 
      scenario: 'You need to navigate the bus and metro system. Practice buying tickets, asking about routes and schedules, understanding announcements, and asking fellow passengers for help. Learn transport vocabulary (bus, train, ticket, platform, stop).', 
      status: 'locked' 
    },
    { 
      id: 14, 
      type: 'voice', 
      title: 'Lesson 14 (At the Market)', 
      scenario: 'You are shopping for fresh produce at a local market. Practice asking for quantities (kilo, pound, piece), negotiating prices, learning names of fruits and vegetables, and interacting with vendors in a traditional market setting.', 
      status: 'locked' 
    },
    { 
      id: 15, 
      type: 'checkpoint', 
      title: 'Checkpoint 3', 
      scenario: 'Review: Health, accommodation, transport, and shopping', 
      status: 'locked' 
    },
  ];
};
