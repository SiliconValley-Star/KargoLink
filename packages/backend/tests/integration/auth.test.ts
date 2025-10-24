import request from 'supertest';
import { Application } from 'express';
import { TestDataFactory, TestHelpers } from '../utils/testUtils';

describe('Auth Integration Tests', () => {
  let app: Application;

  beforeAll(async () => {
    // Import app after environment setup
    const { default: createApp } = await import('../../src/app');
    app = createApp();
  });

  afterEach(async () => {
    await TestHelpers.cleanup();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: TestHelpers.randomEmail(),
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phone: TestHelpers.randomPhone(),
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      TestHelpers.assertApiResponse(response, 201);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('tokens');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.firstName).toBe(userData.firstName);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should return validation error for invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+905551234567',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      TestHelpers.assertApiResponse(response, 400);
      expect(response.body.error).toContain('email');
    });

    it('should return error for duplicate email', async () => {
      const user = await TestDataFactory.createUser();
      
      const userData = {
        email: user.email,
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+905551234567',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(409);

      TestHelpers.assertApiResponse(response, 409);
      expect(response.body.error).toContain('already exists');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login user with valid credentials', async () => {
      const user = await TestDataFactory.createUser();
      
      const loginData = {
        email: user.email,
        password: 'password123', // Default password from factory
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('tokens');
      expect(response.body.data.user.id).toBe(user.id);
      expect(response.body.data.tokens).toHaveProperty('access');
      expect(response.body.data.tokens).toHaveProperty('refresh');
    });

    it('should return error for invalid credentials', async () => {
      const user = await TestDataFactory.createUser();
      
      const loginData = {
        email: user.email,
        password: 'wrongpassword',
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);

      TestHelpers.assertApiResponse(response, 401);
      expect(response.body.error).toContain('Invalid');
    });

    it('should return error for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);

      TestHelpers.assertApiResponse(response, 401);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh tokens with valid refresh token', async () => {
      const user = await TestDataFactory.createUser();
      const refreshToken = TestDataFactory.generateRefreshToken(user.id);
      
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
      expect(response.body.data).toHaveProperty('tokens');
      expect(response.body.data.tokens).toHaveProperty('access');
      expect(response.body.data.tokens).toHaveProperty('refresh');
    });

    it('should return error for invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      TestHelpers.assertApiResponse(response, 401);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout user successfully', async () => {
      const user = await TestDataFactory.createUser();
      const token = TestDataFactory.generateJWT(user.id);
      
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set(TestHelpers.createAuthHeader(token))
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
      expect(response.body.data.message).toContain('logged out');
    });

    it('should return error without auth token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .expect(401);

      TestHelpers.assertApiResponse(response, 401);
    });
  });

  describe('GET /api/v1/auth/profile', () => {
    it('should get user profile with valid token', async () => {
      const user = await TestDataFactory.createUser();
      const token = TestDataFactory.generateJWT(user.id);
      
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set(TestHelpers.createAuthHeader(token))
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
      expect(response.body.data.user.id).toBe(user.id);
      expect(response.body.data.user.email).toBe(user.email);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should return error without auth token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .expect(401);

      TestHelpers.assertApiResponse(response, 401);
    });

    it('should return error with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set(TestHelpers.createAuthHeader('invalid-token'))
        .expect(401);

      TestHelpers.assertApiResponse(response, 401);
    });
  });
});