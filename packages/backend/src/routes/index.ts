import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import { shipmentRoutes } from './shipment.routes';
import { cargoRoutes } from './cargo.routes';
import { createPaymentRoutes } from './payment.routes';
import uploadRoutes from './upload.routes';
import { notificationRoutes } from './notification.routes';
import { healthRoutes } from './health.routes';

const router: Router = Router();

// API v1 routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/shipments', shipmentRoutes);
router.use('/cargo', cargoRoutes);
router.use('/upload', uploadRoutes);
router.use('/notifications', notificationRoutes);
router.use('/', healthRoutes);

// Payment routes - get controller from global
const paymentController = (global as any).paymentController;
if (paymentController) {
  router.use('/payments', createPaymentRoutes(paymentController));
}

// Basic health endpoint is now handled by healthRoutes

// API documentation endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CargoLink API v1',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      shipments: '/api/v1/shipments',
      cargo: '/api/v1/cargo',
      payments: '/api/v1/payments',
      upload: '/api/v1/upload',
      notifications: '/api/v1/notifications',
      health: '/api/v1/health'
    },
    documentation: 'https://docs.cargolink.com/api',
    timestamp: new Date().toISOString()
  });
});

export { router as apiRoutes };