import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Use direct connection to avoid prepared statement cache issues with pooling
    datasourceUrl: process.env.DIRECT_URL,
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
