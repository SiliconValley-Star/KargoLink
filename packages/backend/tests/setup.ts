import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { randomBytes } from 'crypto';

// Test database
const generateDatabaseUrl = (): string => {
  const schema = `test_${randomBytes(8).toString('hex')}`;
  return `postgresql://berhudanbascan@localhost:5432/cargolink_test?schema=${schema}`;
};

// Mock environment variables
(process.env as any).NODE_ENV = 'test';
(process.env as any).JWT_SECRET = 'test-jwt-secret-key-for-testing-32-characters-minimum';
(process.env as any).JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing-32-characters-min';
(process.env as any).DATABASE_URL = generateDatabaseUrl();
process.env.REDIS_URL = 'redis://localhost:6379/1'; // Test Redis DB
process.env.AWS_REGION = 'eu-west-1';
process.env.AWS_ACCESS_KEY_ID = 'test-access-key';
process.env.AWS_SECRET_ACCESS_KEY = 'test-secret-key';
process.env.AWS_S3_BUCKET = 'test-bucket';

// Global test utilities
declare global {
  var __PRISMA__: PrismaClient;
  var __TEST_DATABASE_URL__: string;
  var restoreConsole: () => void;
}

// Initialize Prisma client for tests
global.__TEST_DATABASE_URL__ = process.env.DATABASE_URL!;
global.__PRISMA__ = new PrismaClient({
  datasources: {
    db: {
      url: global.__TEST_DATABASE_URL__,
    },
  },
});

// Console override for cleaner test output
const originalConsole = console;
global.console = {
  ...originalConsole,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Restore console for specific tests if needed
global.restoreConsole = () => {
  global.console = originalConsole;
};

// Mock external services
jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');
jest.mock('@aws-sdk/lib-storage');
jest.mock('nodemailer');
jest.mock('axios');

// Timeout for async operations
jest.setTimeout(30000);