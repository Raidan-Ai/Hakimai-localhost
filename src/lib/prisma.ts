import { PrismaClient } from '@prisma/client';

/**
 * Hakim AI - Dynamic Database Strategy
 * 
 * This utility initializes the Prisma client based on the current environment.
 * - Cloud (Vercel): Connects to the managed PostgreSQL instance.
 * - Local (Laptop/Desktop): Falls back to a local SQLite database (medical.db).
 */

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const isCloud = process.env.VERCEL === '1' || !!process.env.DATABASE_URL?.includes('postgres');

// Determine the connection string dynamically if not set
const getDatabaseUrl = () => {
  if (isCloud) {
    return process.env.DATABASE_URL;
  }
  // Local SQLite fallback
  return 'file:./medical.db';
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
