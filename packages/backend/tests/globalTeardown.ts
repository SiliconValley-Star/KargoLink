import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

export default async (): Promise<void> => {
  console.log('🧹 Cleaning up test environment...');
  
  try {
    // Test database URL'i environment variable'dan al
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.log('⚠️  DATABASE_URL is not set, skipping cleanup');
      return;
    }
    
    // Prisma client oluştur
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });
    
    try {
      // Database'e bağlan
      await prisma.$connect();
      
      // Test verilerini temizle
      console.log('🗑️  Cleaning up test data...');
      
      // Tüm tabloları temizle (foreign key sıralamasına dikkat et)
      await prisma.$transaction([
        prisma.shipment.deleteMany(),
        prisma.address.deleteMany(),
        prisma.user.deleteMany(),
      ]);
      
      console.log('✅ Test data cleaned up successfully');
      
    } catch (error) {
      console.warn('⚠️  Warning: Could not clean up test data:', error);
    } finally {
      // Bağlantıyı kapat
      await prisma.$disconnect();
    }
    
    console.log('🏁 Test environment cleanup completed');
    
  } catch (error) {
    console.error('❌ Error during test environment cleanup:', error);
    // Cleanup hatası test sonuçlarını etkilemesin
  }
};