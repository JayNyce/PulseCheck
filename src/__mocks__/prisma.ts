// __mocks__/prisma.ts

import { PrismaClient } from '@prisma/client';

const prismaMock = {
  user: {
    findUnique: jest.fn(), // Explicitly define findUnique
    update: jest.fn(),      // Explicitly define update
  },
};

export default prismaMock as unknown as PrismaClient;

// __mocks__/prisma.ts
/*
const prismaMock = {
  feedback: {
    groupBy: jest.fn(), // Explicitly mock groupBy
    // Other feedback methods, e.g., findMany
  },
  topic: {
    findMany: jest.fn(),
  },
  // Other models and methods as needed
};

export default prismaMock;
*/