import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

export default async (): Promise<void> => {
  console.log('🔧 Setting up test environment...');
  
  try {
    // Test database URL'i environment variable'dan al
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not set for tests');
    }
    
    // Prisma client oluştur
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });
    
    // Database'i sıfırla ve schema'yı oluştur
    console.log('🗄️  Creating test database schema...');
    execSync('npx prisma db push --force-reset', {
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
      },
      stdio: 'inherit',
    });
    
    // Database bağlantısını test et
    console.log('🔌 Testing database connection...');
    await prisma.$connect();
    await prisma.$disconnect();
    
    console.log('✅ Test environment setup completed');
    
  } catch (error) {
    console.error('❌ Failed to setup test environment:', error);
    process.exit(1);
  }
};