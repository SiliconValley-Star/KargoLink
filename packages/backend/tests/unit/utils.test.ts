import { TestHelpers, TEST_CONSTANTS } from '../utils/testUtils';

describe('TestHelpers Unit Tests', () => {
  describe('randomEmail()', () => {
    it('should generate valid email format', () => {
      const email = TestHelpers.randomEmail();
      
      expect(email).toMatch(/^test-[a-f0-9]{8}@example\.com$/);
      expect(email).toContain('@');
      expect(email).toContain('example.com');
    });

    it('should generate unique emails', () => {
      const email1 = TestHelpers.randomEmail();
      const email2 = TestHelpers.randomEmail();
      
      expect(email1).not.toBe(email2);
    });
  });

  describe('randomPhone()', () => {
    it('should generate valid Turkish phone number', () => {
      const phone = TestHelpers.randomPhone();
      
      expect(phone).toMatch(/^\+90\d{10}$/);
      expect(phone).toHaveLength(13);
      expect(phone.startsWith('+90')).toBe(true);
    });

    it('should generate unique phone numbers', () => {
      const phone1 = TestHelpers.randomPhone();
      const phone2 = TestHelpers.randomPhone();
      
      expect(phone1).not.toBe(phone2);
    });
  });

  describe('randomTrackingNumber()', () => {
    it('should generate valid tracking number format', () => {
      const trackingNumber = TestHelpers.randomTrackingNumber();
      
      expect(trackingNumber).toMatch(/^TRK[A-F0-9]{16}$/);
      expect(trackingNumber).toHaveLength(19);
      expect(trackingNumber.startsWith('TRK')).toBe(true);
    });

    it('should generate unique tracking numbers', () => {
      const tracking1 = TestHelpers.randomTrackingNumber();
      const tracking2 = TestHelpers.randomTrackingNumber();
      
      expect(tracking1).not.toBe(tracking2);
    });
  });

  describe('createAuthHeader()', () => {
    it('should create valid authorization header', () => {
      const token = 'test-token-123';
      const header = TestHelpers.createAuthHeader(token);
      
      expect(header).toHaveProperty('Authorization');
      expect(header.Authorization).toBe(`Bearer ${token}`);
    });
  });

  describe('assertApiResponse()', () => {
    it('should assert successful response structure', () => {
      const mockResponse = {
        status: 200,
        body: {
          success: true,
          data: { message: 'test' }
        }
      };

      expect(() => {
        TestHelpers.assertApiResponse(mockResponse, 200);
      }).not.toThrow();
    });

    it('should assert error response structure', () => {
      const mockResponse = {
        status: 400,
        body: {
          success: false,
          error: 'Validation error'
        }
      };

      expect(() => {
        TestHelpers.assertApiResponse(mockResponse, 400);
      }).not.toThrow();
    });
  });

  describe('wait()', () => {
    it('should wait for specified time', async () => {
      const start = Date.now();
      await TestHelpers.wait(50);
      const end = Date.now();
      
      expect(end - start).toBeGreaterThanOrEqual(45); // Allow some tolerance
    });
  });

  describe('TEST_CONSTANTS', () => {
    it('should have valid constant values', () => {
      expect(TEST_CONSTANTS.TEST_USER_EMAIL).toBe('test@example.com');
      expect(TEST_CONSTANTS.TEST_USER_PASSWORD).toBe('password123');
      expect(TEST_CONSTANTS.TEST_PHONE).toBe('+905551234567');
      expect(TEST_CONSTANTS.INVALID_UUID).toBe('00000000-0000-0000-0000-000000000000');
      expect(TEST_CONSTANTS.INVALID_EMAIL).toBe('invalid-email');
      expect(TEST_CONSTANTS.INVALID_PHONE).toBe('invalid-phone');
    });
  });
});