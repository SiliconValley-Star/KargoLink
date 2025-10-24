import { PrismaClient } from '@prisma/client';
import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

// Extend global types for Jest
declare global {
  var __PRISMA__: PrismaClient;
}

// Test Prisma instance
export const testPrisma = global.__PRISMA__;

/**
 * Test Data Factory
 */
export class TestDataFactory {
  static async createUser(overrides: any = {}): Promise<any> {
    const userData = {
      email: `test-${randomBytes(4).toString('hex')}@example.com`,
      password: await bcrypt.hash('password123', 10),
      firstName: 'Test',
      lastName: 'User',
      phone: '+905551234567',
      emailVerified: true,
      phoneVerified: false,
      isActive: true,
      ...overrides,
    };

    return await testPrisma.user.create({
      data: userData,
    });
  }

  static async createAddress(userId: string, overrides: any = {}): Promise<any> {
    const addressData = {
      userId,
      type: 'HOME',
      title: 'Test Address',
      fullName: 'Test User',
      phone: '+905551234567',
      addressLine1: 'Test Address Line 1',
      addressLine2: 'Test Address Line 2',
      city: 'Istanbul',
      district: 'Besiktas',
      postalCode: '34353',
      country: 'Turkey',
      isDefault: true,
      ...overrides,
    };

    return await testPrisma.address.create({
      data: addressData,
    });
  }

  static async createShipment(
    userId: string,
    overrides: any = {}
  ): Promise<any> {
    // Create addresses if not provided
    let pickupAddress, deliveryAddress;
    
    if (!overrides.pickupAddressId) {
      pickupAddress = await this.createAddress(userId, { title: 'Pickup Address' });
      overrides.pickupAddressId = pickupAddress.id;
    }
    
    if (!overrides.deliveryAddressId) {
      deliveryAddress = await this.createAddress(userId, { title: 'Delivery Address' });
      overrides.deliveryAddressId = deliveryAddress.id;
    }

    const shipmentData = {
      senderId: userId,
      trackingNumber: `CL${randomBytes(6).toString('hex').toUpperCase()}`,
      packages: [
        {
          weight: 2.5,
          dimensions: { width: 20, height: 15, length: 30 },
          description: 'Test package'
        }
      ],
      totalWeight: 2.5,
      totalValue: 100,
      currency: 'TRY',
      category: 'GENERAL',
      serviceType: 'STANDARD',
      specialServices: {},
      pickupPreference: {},
      deliveryPreference: {},
      instructions: 'Handle with care',
      status: 'DRAFT',
      ...overrides,
    };

    return await testPrisma.shipment.create({
      data: shipmentData,
    });
  }

  static async createTrackingEvent(
    shipmentId: string,
    overrides: any = {}
  ): Promise<any> {
    const eventData = {
      shipmentId,
      status: 'IN_TRANSIT',
      title: 'Package in transit',
      description: 'Your package is on the way',
      timestamp: new Date(),
      location: {
        name: 'Istanbul Hub',
        coordinates: { lat: 41.0082, lng: 28.9784 }
      },
      images: [],
      metadata: {},
      ...overrides,
    };

    return await testPrisma.trackingEvent.create({
      data: eventData,
    });
  }

  static generateJWT(userId: string, expiresIn: string = '1h'): string {
    const secret = process.env.JWT_SECRET || 'test-secret-key';
    const payload = { userId, type: 'access' };
    const options = { expiresIn } as any;
    return jwt.sign(payload, secret, options);
  }

  static generateRefreshToken(userId: string): string {
    const secret = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-key';
    const payload = { userId, type: 'refresh' };
    const options = { expiresIn: '7d' } as any;
    return jwt.sign(payload, secret, options);
  }
}

/**
 * Test Helpers
 */
export class TestHelpers {
  /**
   * Clean up database after each test
   */
  static async cleanup(): Promise<void> {
    try {
      await testPrisma.$transaction([
        testPrisma.shipment.deleteMany(),
        testPrisma.address.deleteMany(),
        testPrisma.user.deleteMany(),
      ]);
    } catch (error) {
      console.log('Database cleanup error (this is normal for some tests):', error);
    }
  }

  /**
   * Create authorization header for tests
   */
  static createAuthHeader(token: string): Record<string, string> {
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Wait for async operations
   */
  static async wait(ms: number = 100): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate random email
   */
  static randomEmail(): string {
    return `test-${randomBytes(4).toString('hex')}@example.com`;
  }

  /**
   * Generate random phone
   */
  static randomPhone(): string {
    const number = Math.floor(Math.random() * 9000000000) + 1000000000;
    return `+90${number}`;
  }

  /**
   * Generate random tracking number
   */
  static randomTrackingNumber(): string {
    return `TRK${randomBytes(8).toString('hex').toUpperCase()}`;
  }

  /**
   * Assert response structure
   */
  static assertApiResponse(response: any, expectedStatus: number = 200) {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toHaveProperty('success');
    
    if (expectedStatus >= 200 && expectedStatus < 300) {
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('data');
    } else {
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    }
  }

  /**
   * Assert pagination structure
   */
  static assertPaginatedResponse(response: any) {
    this.assertApiResponse(response);
    
    const { data } = response.body;
    expect(data).toHaveProperty('items');
    expect(data).toHaveProperty('pagination');
    expect(data.pagination).toHaveProperty('page');
    expect(data.pagination).toHaveProperty('limit');
    expect(data.pagination).toHaveProperty('total');
    expect(data.pagination).toHaveProperty('pages');
    
    expect(Array.isArray(data.items)).toBe(true);
    expect(typeof data.pagination.page).toBe('number');
    expect(typeof data.pagination.limit).toBe('number');
    expect(typeof data.pagination.total).toBe('number');
    expect(typeof data.pagination.pages).toBe('number');
  }
}

/**
 * Test constants
 */
export const TEST_CONSTANTS = {
  TEST_USER_EMAIL: 'test@example.com',
  TEST_USER_PASSWORD: 'password123',
  TEST_PHONE: '+905551234567',
  INVALID_UUID: '00000000-0000-0000-0000-000000000000',
  INVALID_EMAIL: 'invalid-email',
  INVALID_PHONE: 'invalid-phone',
};