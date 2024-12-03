// src/data/mockData.ts

export interface User {
    name: string;
    email: string;
    role: 'student' | 'instructor';
  }
  
  export interface Feedback {
    id: number;
    user: {
      name: string;
    };
    content: string;
    createdAt: string;
  }
  
  export const mockUser: User = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'student', // Change to 'instructor' to test instructor view
  };
  
  export const mockFeedbacks: Feedback[] = [
    {
      id: 1,
      user: {
        name: 'Student A',
      },
      content: 'I really enjoyed the lecture on React hooks.',
      createdAt: '2023-10-10',
    },
    {
      id: 2,
      user: {
        name: 'Student B',
      },
      content: 'Could we have more examples in the next class?',
      createdAt: '2023-10-11',
    },
  ];
  