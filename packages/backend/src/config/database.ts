import { PrismaClient } from '@prisma/client';
import { config } from './environment';

declare global {
  var __prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

const createPrismaClient = () => {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  if (config.nodeEnv === 'production') {
    return new PrismaClient({
      log: ['error'],
      errorFormat: 'minimal',
    });
  } else {
    return new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
      errorFormat: 'pretty',
    });
  }
};

if (config.nodeEnv === 'production') {
  prisma = createPrismaClient();
} else {
  if (!global.__prisma) {
    global.__prisma = createPrismaClient();
  }
  prisma = global.__prisma;
}

// Graceful shutdown
async function gracefulShutdown() {
  try {
    await prisma.$disconnect();
    console.log('📦 Database connection closed');
  } catch (error) {
    console.error('❌ Error during database shutdown:', error);
  }
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

/**
 * Get Prisma client instance
 */
export const getPrismaClient = (): PrismaClient => {
  return prisma;
};

/**
 * Connect to database
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

/**
 * Disconnect from database
 */
export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
};

/**
 * Check database health
 */
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return false;
  }
};

/**
 * Database transaction wrapper
 */
export const withTransaction = async <T>(
  callback: (prisma: any) => Promise<T>
): Promise<T> => {
  return await prisma.$transaction(callback);
};

/**
 * Seed database with initial data
 */
export const seedDatabase = async (): Promise<void> => {
  try {
    console.log('🌱 Seeding database...');
    
    // Add seed logic here when needed
    
    console.log('✅ Database seeded successfully');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
};

export default prisma;