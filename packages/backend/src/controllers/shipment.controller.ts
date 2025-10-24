import { Request, Response } from 'express';
import { getPrismaClient } from '../config/database';
import { AppError, HTTP_STATUS } from '../middleware/errorHandler';

const prisma = getPrismaClient();

export class ShipmentController {
  /**
   * Create new shipment
   */
  static async createShipment(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;
      if (!currentUser) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const {
        pickupAddress,
        deliveryAddress,
        packages,
        category,
        serviceType,
        totalValue,
        specialServices = {},
        pickupPreference,
        deliveryPreference,
        instructions,
        requiresCustoms = false
      } = req.body;

      // Validate required fields
      if (!pickupAddress || !deliveryAddress || !packages || !category || !serviceType) {
        throw new AppError('Missing required fields', HTTP_STATUS.BAD_REQUEST);
      }

      // Calculate total weight from packages
      const totalWeight = packages.reduce((sum: number, pkg: any) => sum + (pkg.weight || 0), 0);

      // Generate tracking number
      const trackingNumber = `CL${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      // Create pickup and delivery addresses
      const createdPickupAddress = await prisma.address.create({
        data: {
          userId: currentUser.userId,
          ...pickupAddress
        }
      });

      const createdDeliveryAddress = await prisma.address.create({
        data: {
          userId: currentUser.userId,
          ...deliveryAddress
        }
      });

      // Create shipment
      const shipment = await prisma.shipment.create({
        data: {
          trackingNumber,
          senderId: currentUser.userId,
          pickupAddressId: createdPickupAddress.id,
          deliveryAddressId: createdDeliveryAddress.id,
          packages: JSON.stringify(packages),
          totalWeight,
          totalValue: totalValue || 0,
          category: category.toUpperCase(),
          serviceType: serviceType.toUpperCase(),
          specialServices: JSON.stringify(specialServices),
          pickupPreference: JSON.stringify(pickupPreference || { date: null, timeSlot: null, isFlexible: true }),
          deliveryPreference: JSON.stringify(deliveryPreference || { date: null, timeSlot: null, isFlexible: true }),
          instructions,
          requiresCustoms,
          invoices: JSON.stringify([]), // Empty array as JSON string
          otherDocuments: JSON.stringify([]), // Empty array as JSON string
          status: 'DRAFT'
        },
        include: {
          pickupAddress: true,
          deliveryAddress: true,
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          }
        }
      });

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Shipment created successfully',
        data: {
          shipment: {
            ...shipment,
            category: shipment.category.toLowerCase(),
            serviceType: shipment.serviceType.toLowerCase(),
            status: shipment.status.toLowerCase(),
            createdAt: shipment.createdAt.toISOString(),
            updatedAt: shipment.updatedAt.toISOString()
          }
        }
      });
    } catch (error: any) {
      const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to create shipment'
      });
    }
  }

  /**
   * Get user shipments
   */
  static async getUserShipments(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;
      if (!currentUser) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const { page = 1, limit = 10, status, category, search } = req.query;
      
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Build where clause
      const where: any = {
        deletedAt: null
      };

      // If not admin or adminAll flag not set, filter by user
      if (currentUser.role !== 'admin' && !req.query.adminAll) {
        where.OR = [
          { senderId: currentUser.userId },
          { selectedCarrierId: currentUser.userId }
        ];
      }

      if (status) {
        where.status = (status as string).toUpperCase();
      }

      if (category) {
        where.category = (category as string).toUpperCase();
      }

      if (search) {
        where.trackingNumber = { contains: search as string, mode: 'insensitive' };
      }

      const [shipments, total] = await Promise.all([
        prisma.shipment.findMany({
          where,
          skip,
          take,
          include: {
            pickupAddress: true,
            deliveryAddress: true,
            sender: {
              select: { id: true, firstName: true, lastName: true, email: true }
            },
            selectedCarrier: {
              select: { id: true, firstName: true, lastName: true, email: true }
            },
            selectedCargoCompany: {
              select: { id: true, name: true, logo: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.shipment.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          shipments: shipments.map(shipment => ({
            ...shipment,
            category: shipment.category.toLowerCase(),
            serviceType: shipment.serviceType.toLowerCase(),
            status: shipment.status.toLowerCase(),
            createdAt: shipment.createdAt.toISOString(),
            updatedAt: shipment.updatedAt.toISOString(),
            estimatedPickupDate: shipment.estimatedPickupDate?.toISOString(),
            estimatedDeliveryDate: shipment.estimatedDeliveryDate?.toISOString(),
            actualPickupDate: shipment.actualPickupDate?.toISOString(),
            actualDeliveryDate: shipment.actualDeliveryDate?.toISOString()
          })),
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error: any) {
      const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to fetch shipments'
      });
    }
  }

  /**
   * Get shipment by ID or tracking number
   */
  static async getShipment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;

      // Find by ID or tracking number
      const shipment = await prisma.shipment.findFirst({
        where: {
          OR: [
            { id },
            { trackingNumber: id }
          ],
          deletedAt: null
        },
        include: {
          pickupAddress: true,
          deliveryAddress: true,
          sender: {
            select: { id: true, firstName: true, lastName: true, email: true, phone: true }
          },
          recipient: {
            select: { id: true, firstName: true, lastName: true, email: true, phone: true }
          },
          selectedCarrier: {
            select: { id: true, firstName: true, lastName: true, email: true, phone: true }
          },
          selectedCargoCompany: {
            select: { id: true, name: true, logo: true, website: true }
          },
          selectedQuote: true,
          trackingEvents: {
            orderBy: { createdAt: 'desc' }
          },
          payments: {
            select: {
              id: true,
              amount: true,
              currency: true,
              status: true,
              method: true,
              paidAt: true
            }
          }
        }
      });

      if (!shipment) {
        throw new AppError('Shipment not found', HTTP_STATUS.NOT_FOUND);
      }

      // Check access permissions
      const hasAccess = !currentUser || 
        currentUser.userId === shipment.senderId ||
        currentUser.userId === shipment.recipientId ||
        currentUser.userId === shipment.selectedCarrierId ||
        currentUser.role === 'admin';

      if (currentUser && !hasAccess) {
        throw new AppError('Access denied', HTTP_STATUS.FORBIDDEN);
      }

      res.json({
        success: true,
        data: {
          shipment: {
            ...shipment,
            category: shipment.category.toLowerCase(),
            serviceType: shipment.serviceType.toLowerCase(),
            status: shipment.status.toLowerCase(),
            paymentStatus: shipment.paymentStatus.toLowerCase(),
            createdAt: shipment.createdAt.toISOString(),
            updatedAt: shipment.updatedAt.toISOString(),
            estimatedPickupDate: shipment.estimatedPickupDate?.toISOString(),
            estimatedDeliveryDate: shipment.estimatedDeliveryDate?.toISOString(),
            actualPickupDate: shipment.actualPickupDate?.toISOString(),
            actualDeliveryDate: shipment.actualDeliveryDate?.toISOString(),
            paidAt: shipment.paidAt?.toISOString(),
            cancelledAt: shipment.cancelledAt?.toISOString(),
            returnedAt: shipment.returnedAt?.toISOString(),
            trackingEvents: shipment.trackingEvents.map(event => ({
              ...event,
              status: event.status.toLowerCase(),
              timestamp: event.timestamp.toISOString(),
              createdAt: event.createdAt.toISOString()
            }))
          }
        }
      });
    } catch (error: any) {
      const statusCode = error.statusCode || HTTP_STATUS.NOT_FOUND;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to fetch shipment'
      });
    }
  }

  /**
   * Update shipment status (Carrier/Admin only)
   */
  static async updateShipmentStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, location, description, images } = req.body;
      const currentUser = (req as any).user;

      if (!currentUser) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const shipment = await prisma.shipment.findUnique({
        where: { id, deletedAt: null }
      });

      if (!shipment) {
        throw new AppError('Shipment not found', HTTP_STATUS.NOT_FOUND);
      }

      // Check permissions
      const canUpdate = currentUser.role === 'admin' || 
        currentUser.userId === shipment.selectedCarrierId ||
        currentUser.userId === shipment.senderId;

      if (!canUpdate) {
        throw new AppError('Access denied', HTTP_STATUS.FORBIDDEN);
      }

      // Update shipment status
      const updatedShipment = await prisma.shipment.update({
        where: { id },
        data: {
          status: status.toUpperCase(),
          updatedAt: new Date(),
          ...(status === 'PICKED_UP' && { actualPickupDate: new Date() }),
          ...(status === 'DELIVERED' && { actualDeliveryDate: new Date() })
        }
      });

      // Create tracking event
      if (id) {
        await prisma.trackingEvent.create({
          data: {
            shipmentId: id,
            status: status.toUpperCase(),
            title: `Shipment ${status.toLowerCase()}`,
            description: description || `Shipment status updated to ${status.toLowerCase()}`,
            location: JSON.stringify(location),
            images: JSON.stringify(images || []),
            timestamp: new Date()
          }
        });
      }

      res.json({
        success: true,
        message: 'Shipment status updated successfully',
        data: {
          shipment: {
            ...updatedShipment,
            category: updatedShipment.category.toLowerCase(),
            serviceType: updatedShipment.serviceType.toLowerCase(),
            status: updatedShipment.status.toLowerCase(),
            paymentStatus: updatedShipment.paymentStatus.toLowerCase(),
            updatedAt: updatedShipment.updatedAt.toISOString()
          }
        }
      });
    } catch (error: any) {
      const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to update shipment status'
      });
    }
  }

  /**
   * Cancel shipment
   */
  static async cancelShipment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const currentUser = (req as any).user;

      if (!currentUser) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const shipment = await prisma.shipment.findUnique({
        where: { id, deletedAt: null }
      });

      if (!shipment) {
        throw new AppError('Shipment not found', HTTP_STATUS.NOT_FOUND);
      }

      // Check permissions
      const canCancel = currentUser.role === 'admin' || 
        currentUser.userId === shipment.senderId;

      if (!canCancel) {
        throw new AppError('Access denied', HTTP_STATUS.FORBIDDEN);
      }

      // Check if shipment can be cancelled
      const cancellableStatuses = ['DRAFT', 'PENDING_QUOTES', 'QUOTES_RECEIVED', 'CARRIER_SELECTED', 'PAYMENT_PENDING'];
      if (!cancellableStatuses.includes(shipment.status)) {
        throw new AppError('Shipment cannot be cancelled in current status', HTTP_STATUS.BAD_REQUEST);
      }

      // Cancel shipment
      const cancelledShipment = await prisma.shipment.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancellationReason: reason,
          cancelledBy: currentUser.userId,
          cancelledAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Create tracking event
      if (id) {
        await prisma.trackingEvent.create({
          data: {
            shipmentId: id,
            status: 'CANCELLED',
            title: 'Shipment cancelled',
            description: reason || 'Shipment has been cancelled',
            images: JSON.stringify([]), // Empty array as JSON string
            timestamp: new Date()
          }
        });
      }

      res.json({
        success: true,
        message: 'Shipment cancelled successfully',
        data: {
          shipment: {
            ...cancelledShipment,
            category: cancelledShipment.category.toLowerCase(),
            serviceType: cancelledShipment.serviceType.toLowerCase(),
            status: cancelledShipment.status.toLowerCase(),
            paymentStatus: cancelledShipment.paymentStatus.toLowerCase(),
            updatedAt: cancelledShipment.updatedAt.toISOString(),
            cancelledAt: cancelledShipment.cancelledAt?.toISOString()
          }
        }
      });
    } catch (error: any) {
      const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to cancel shipment'
      });
    }
  }

  /**
   * Get shipment statistics (Admin only)
   */
  static async getShipmentStats(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;

      if (!currentUser) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      if (currentUser.role !== 'admin') {
        throw new AppError('Access denied', HTTP_STATUS.FORBIDDEN);
      }

      const [
        totalShipments,
        activeShipments,
        deliveredShipments,
        cancelledShipments,
        recentShipments
      ] = await Promise.all([
        prisma.shipment.count({ where: { deletedAt: null } }),
        prisma.shipment.count({ 
          where: { 
            status: { in: ['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'] }, 
            deletedAt: null 
          } 
        }),
        prisma.shipment.count({ where: { status: 'DELIVERED', deletedAt: null } }),
        prisma.shipment.count({ where: { status: 'CANCELLED', deletedAt: null } }),
        prisma.shipment.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            },
            deletedAt: null
          }
        })
      ]);

      res.json({
        success: true,
        data: {
          stats: {
            totalShipments,
            activeShipments,
            deliveredShipments,
            cancelledShipments,
            recentShipments,
            deliveryRate: totalShipments > 0 ? (deliveredShipments / totalShipments * 100).toFixed(1) : 0
          }
        }
      });
    } catch (error: any) {
      const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to fetch shipment statistics'
      });
    }
  }
}