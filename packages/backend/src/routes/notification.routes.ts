import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate, adminRequired, authRequired } from '../middleware/auth.middleware';
import { PrismaClient } from '@prisma/client';

const router: Router = Router();

// Initialize notification controller
const prisma = new PrismaClient();
const notificationController = new NotificationController(prisma);

// Notification management routes (admin only)
router.post('/send', adminRequired, notificationController.sendNotification);
router.post('/send-bulk', adminRequired, notificationController.sendBulkNotifications);
router.get('/services/status', adminRequired, notificationController.getServicesStatus);

// Direct service routes (admin only)
router.post('/email/send', adminRequired, notificationController.sendEmail);
router.post('/sms/send', adminRequired, notificationController.sendSMS);
router.post('/push/send', adminRequired, notificationController.sendPushNotification);

// User notification routes
router.get('/user/:userId?', authRequired, notificationController.getUserNotifications);
router.get('/stats', authRequired, notificationController.getNotificationStats);
router.put('/preferences', authRequired, notificationController.updatePreferences);

// Notification actions
router.patch('/:notificationId/read', authRequired, notificationController.markAsRead);
router.patch('/mark-all-read', authRequired, notificationController.markAllAsRead);

// Device management
router.post('/device/register', authRequired, notificationController.registerDeviceToken);

export { router as notificationRoutes };