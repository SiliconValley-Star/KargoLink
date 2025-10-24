import request from 'supertest';
import { Application } from 'express';
import { TestDataFactory, TestHelpers } from '../utils/testUtils';
import { ShipmentStatus, ServiceType } from '@prisma/client';

describe('Shipment Integration Tests', () => {
  let app: Application;
  let authToken: string;
  let testUser: any;

  beforeAll(async () => {
    const { createApp } = await import('../../src/app');
    app = createApp();
    
    // Create test user and get auth token
    testUser = await TestDataFactory.createUser();
    authToken = TestDataFactory.generateJWT(testUser.id);
  });

  afterEach(async () => {
    await TestHelpers.cleanup();
  });

  describe('POST /api/shipments', () => {
    it('should create a new shipment successfully', async () => {
      const pickupAddress = await TestDataFactory.createAddress(testUser.id);
      const deliveryAddress = await TestDataFactory.createAddress(testUser.id);
      
      const shipmentData = {
        pickupAddressId: pickupAddress.id,
        deliveryAddressId: deliveryAddress.id,
        packages: [
          {
            weight: 2.5,
            dimensions: { length: 30, width: 20, height: 10 },
            description: 'Test package'
          }
        ],
        totalWeight: 2.5,
        totalValue: 100,
        category: 'GENERAL',
        serviceType: ServiceType.STANDARD,
        instructions: 'Handle with care'
      };

      const response = await request(app)
        .post('/api/shipments')
        .set(TestHelpers.createAuthHeader(authToken))
        .send(shipmentData)
        .expect(201);

      TestHelpers.assertApiResponse(response, 201);
      expect(response.body.data.shipment).toHaveProperty('id');
      expect(response.body.data.shipment).toHaveProperty('trackingNumber');
      expect(response.body.data.shipment.status).toBe(ShipmentStatus.DRAFT);
      expect(response.body.data.shipment.senderId).toBe(testUser.id);
    });

    it('should return validation error for missing required fields', async () => {
      const response = await request(app)
        .post('/api/shipments')
        .set(TestHelpers.createAuthHeader(authToken))
        .send({})
        .expect(400);

      TestHelpers.assertApiResponse(response, 400);
      expect(response.body.error).toContain('validation');
    });

    it('should return error for invalid address IDs', async () => {
      const shipmentData = {
        pickupAddressId: 'invalid-id',
        deliveryAddressId: 'invalid-id',
        packages: [{ weight: 1, dimensions: {}, description: 'Test' }],
        totalWeight: 1,
        totalValue: 50
      };

      const response = await request(app)
        .post('/api/shipments')
        .set(TestHelpers.createAuthHeader(authToken))
        .send(shipmentData)
        .expect(400);

      TestHelpers.assertApiResponse(response, 400);
    });
  });

  describe('GET /api/shipments', () => {
    it('should get user shipments successfully', async () => {
      const shipment = await TestDataFactory.createShipment(testUser.id);
      
      const response = await request(app)
        .get('/api/shipments')
        .set(TestHelpers.createAuthHeader(authToken))
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
      expect(Array.isArray(response.body.data.shipments)).toBe(true);
      expect(response.body.data.shipments.length).toBeGreaterThan(0);
      expect(response.body.data.shipments[0]).toHaveProperty('trackingNumber');
    });

    it('should support pagination', async () => {
      // Create multiple shipments
      for (let i = 0; i < 3; i++) {
        await TestDataFactory.createShipment(testUser.id);
      }

      const response = await request(app)
        .get('/api/shipments?page=1&limit=2')
        .set(TestHelpers.createAuthHeader(authToken))
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
      expect(response.body.data.shipments).toHaveLength(2);
      expect(response.body.data.pagination).toHaveProperty('total');
      expect(response.body.data.pagination).toHaveProperty('totalPages');
    });

    it('should filter by status', async () => {
      await TestDataFactory.createShipment(testUser.id, { status: ShipmentStatus.DELIVERED });
      await TestDataFactory.createShipment(testUser.id, { status: ShipmentStatus.IN_TRANSIT });

      const response = await request(app)
        .get('/api/shipments?status=DELIVERED')
        .set(TestHelpers.createAuthHeader(authToken))
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
      expect(response.body.data.shipments.every((s: any) => s.status === 'DELIVERED')).toBe(true);
    });
  });

  describe('GET /api/shipments/:id', () => {
    it('should get shipment details successfully', async () => {
      const shipment = await TestDataFactory.createShipment(testUser.id);
      
      const response = await request(app)
        .get(`/api/shipments/${shipment.id}`)
        .set(TestHelpers.createAuthHeader(authToken))
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
      expect(response.body.data.shipment.id).toBe(shipment.id);
      expect(response.body.data.shipment).toHaveProperty('pickupAddress');
      expect(response.body.data.shipment).toHaveProperty('deliveryAddress');
      expect(response.body.data.shipment).toHaveProperty('trackingEvents');
    });

    it('should return 404 for non-existent shipment', async () => {
      const response = await request(app)
        .get(`/api/shipments/non-existent-id`)
        .set(TestHelpers.createAuthHeader(authToken))
        .expect(404);

      TestHelpers.assertApiResponse(response, 404);
    });

    it('should return 403 for unauthorized access', async () => {
      const otherUser = await TestDataFactory.createUser();
      const shipment = await TestDataFactory.createShipment(otherUser.id);
      
      const response = await request(app)
        .get(`/api/shipments/${shipment.id}`)
        .set(TestHelpers.createAuthHeader(authToken))
        .expect(403);

      TestHelpers.assertApiResponse(response, 403);
    });
  });

  describe('PUT /api/shipments/:id/status', () => {
    it('should update shipment status successfully', async () => {
      const shipment = await TestDataFactory.createShipment(testUser.id, {
        status: ShipmentStatus.PICKED_UP
      });
      
      const response = await request(app)
        .put(`/api/shipments/${shipment.id}/status`)
        .set(TestHelpers.createAuthHeader(authToken))
        .send({
          status: ShipmentStatus.IN_TRANSIT,
          message: 'Package is now in transit'
        })
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
      expect(response.body.data.shipment.status).toBe(ShipmentStatus.IN_TRANSIT);
    });

    it('should create tracking event on status update', async () => {
      const shipment = await TestDataFactory.createShipment(testUser.id);
      
      await request(app)
        .put(`/api/shipments/${shipment.id}/status`)
        .set(TestHelpers.createAuthHeader(authToken))
        .send({
          status: ShipmentStatus.PICKED_UP,
          message: 'Package picked up'
        })
        .expect(200);

      const updatedShipment = await request(app)
        .get(`/api/shipments/${shipment.id}`)
        .set(TestHelpers.createAuthHeader(authToken))
        .expect(200);

      expect(updatedShipment.body.data.shipment.trackingEvents).toHaveLength(1);
      expect(updatedShipment.body.data.shipment.trackingEvents[0].status).toBe(ShipmentStatus.PICKED_UP);
    });
  });

  describe('GET /api/shipments/:id/tracking', () => {
    it('should get shipment tracking information', async () => {
      const shipment = await TestDataFactory.createShipment(testUser.id);
      await TestDataFactory.createTrackingEvent(shipment.id, {
        status: ShipmentStatus.PICKED_UP,
        title: 'Package Picked Up',
        description: 'Your package has been picked up'
      });
      
      const response = await request(app)
        .get(`/api/shipments/${shipment.id}/tracking`)
        .set(TestHelpers.createAuthHeader(authToken))
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
      expect(Array.isArray(response.body.data.trackingEvents)).toBe(true);
      expect(response.body.data.trackingEvents).toHaveLength(1);
      expect(response.body.data.trackingEvents[0].status).toBe(ShipmentStatus.PICKED_UP);
    });
  });

  describe('POST /api/shipments/:id/cancel', () => {
    it('should cancel shipment successfully', async () => {
      const shipment = await TestDataFactory.createShipment(testUser.id, {
        status: ShipmentStatus.PENDING_QUOTES
      });
      
      const response = await request(app)
        .post(`/api/shipments/${shipment.id}/cancel`)
        .set(TestHelpers.createAuthHeader(authToken))
        .send({
          reason: 'Customer request'
        })
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
      expect(response.body.data.shipment.status).toBe(ShipmentStatus.CANCELLED);
      expect(response.body.data.shipment.cancellationReason).toBe('Customer request');
    });

    it('should not allow cancellation of delivered shipments', async () => {
      const shipment = await TestDataFactory.createShipment(testUser.id, {
        status: ShipmentStatus.DELIVERED
      });
      
      const response = await request(app)
        .post(`/api/shipments/${shipment.id}/cancel`)
        .set(TestHelpers.createAuthHeader(authToken))
        .send({
          reason: 'Customer request'
        })
        .expect(400);

      TestHelpers.assertApiResponse(response, 400);
      expect(response.body.error).toContain('cannot be cancelled');
    });
  });

  describe('GET /api/shipments/tracking/:trackingNumber', () => {
    it('should get shipment by tracking number', async () => {
      const shipment = await TestDataFactory.createShipment(testUser.id);
      
      const response = await request(app)
        .get(`/api/shipments/tracking/${shipment.trackingNumber}`)
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
      expect(response.body.data.shipment.id).toBe(shipment.id);
      expect(response.body.data.shipment.trackingNumber).toBe(shipment.trackingNumber);
    });

    it('should return 404 for invalid tracking number', async () => {
      const response = await request(app)
        .get('/api/shipments/tracking/INVALID123')
        .expect(404);

      TestHelpers.assertApiResponse(response, 404);
    });
  });
});