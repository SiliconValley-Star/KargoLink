import { ShipmentStatus } from '../types/shipment.types';

/**
 * Shipment status definitions with display information
 */
export const SHIPMENT_STATUS_CONFIG = {
  draft: {
    label: 'Taslak',
    description: 'Gönderi henüz tamamlanmadı',
    color: 'gray',
    icon: 'draft',
    isActive: false,
    allowCancel: true,
    allowEdit: true,
    nextStatuses: ['pending_quotes'] as ShipmentStatus[]
  },
  
  pending_quotes: {
    label: 'Teklif Bekleniyor',
    description: 'Kargo firmalarından teklifler bekleniyor',
    color: 'blue',
    icon: 'clock',
    isActive: true,
    allowCancel: true,
    allowEdit: true,
    nextStatuses: ['quotes_received', 'cancelled'] as ShipmentStatus[]
  },
  
  quotes_received: {
    label: 'Teklifler Alındı',
    description: 'Kargo firması teklifleri alındı, seçim yapılabilir',
    color: 'green',
    icon: 'list',
    isActive: true,
    allowCancel: true,
    allowEdit: false,
    nextStatuses: ['carrier_selected', 'cancelled'] as ShipmentStatus[]
  },
  
  carrier_selected: {
    label: 'Taşıyıcı Seçildi',
    description: 'Kargo firması seçildi, ödeme bekleniyor',
    color: 'orange',
    icon: 'user-check',
    isActive: true,
    allowCancel: true,
    allowEdit: false,
    nextStatuses: ['payment_pending', 'cancelled'] as ShipmentStatus[]
  },
  
  payment_pending: {
    label: 'Ödeme Bekleniyor',
    description: 'Ödeme işlemi bekleniyor',
    color: 'yellow',
    icon: 'credit-card',
    isActive: true,
    allowCancel: true,
    allowEdit: false,
    nextStatuses: ['payment_completed', 'cancelled'] as ShipmentStatus[]
  },
  
  payment_completed: {
    label: 'Ödeme Tamamlandı',
    description: 'Ödeme başarıyla tamamlandı',
    color: 'green',
    icon: 'check-circle',
    isActive: true,
    allowCancel: false,
    allowEdit: false,
    nextStatuses: ['pickup_scheduled'] as ShipmentStatus[]
  },
  
  pickup_scheduled: {
    label: 'Alım Planlandı',
    description: 'Gönderi alım tarihi planlandı',
    color: 'blue',
    icon: 'calendar',
    isActive: true,
    allowCancel: false,
    allowEdit: false,
    nextStatuses: ['picked_up', 'delivery_failed'] as ShipmentStatus[]
  },
  
  picked_up: {
    label: 'Alındı',
    description: 'Gönderi alım adresinden alındı',
    color: 'indigo',
    icon: 'package',
    isActive: true,
    allowCancel: false,
    allowEdit: false,
    nextStatuses: ['in_transit'] as ShipmentStatus[]
  },
  
  in_transit: {
    label: 'Yolda',
    description: 'Gönderi teslim adresine doğru yolda',
    color: 'blue',
    icon: 'truck',
    isActive: true,
    allowCancel: false,
    allowEdit: false,
    nextStatuses: ['out_for_delivery', 'delivery_failed'] as ShipmentStatus[]
  },
  
  out_for_delivery: {
    label: 'Dağıtımda',
    description: 'Gönderi teslim için dağıtımda',
    color: 'orange',
    icon: 'map-pin',
    isActive: true,
    allowCancel: false,
    allowEdit: false,
    nextStatuses: ['delivered', 'delivery_failed'] as ShipmentStatus[]
  },
  
  delivered: {
    label: 'Teslim Edildi',
    description: 'Gönderi başarıyla teslim edildi',
    color: 'green',
    icon: 'check-circle',
    isActive: false,
    allowCancel: false,
    allowEdit: false,
    nextStatuses: [] as ShipmentStatus[]
  },
  
  delivery_failed: {
    label: 'Teslimat Başarısız',
    description: 'Teslimat başarısız oldu, yeniden deneme yapılacak',
    color: 'red',
    icon: 'x-circle',
    isActive: true,
    allowCancel: false,
    allowEdit: false,
    nextStatuses: ['out_for_delivery', 'returned', 'cancelled'] as ShipmentStatus[]
  },
  
  returned: {
    label: 'İade Edildi',
    description: 'Gönderi gönderen adresine iade edildi',
    color: 'gray',
    icon: 'rotate-ccw',
    isActive: false,
    allowCancel: false,
    allowEdit: false,
    nextStatuses: [] as ShipmentStatus[]
  },
  
  cancelled: {
    label: 'İptal Edildi',
    description: 'Gönderi iptal edildi',
    color: 'red',
    icon: 'x',
    isActive: false,
    allowCancel: false,
    allowEdit: false,
    nextStatuses: [] as ShipmentStatus[]
  },
  
  dispute: {
    label: 'Anlaşmazlık',
    description: 'Gönderi ile ilgili anlaşmazlık var',
    color: 'purple',
    icon: 'alert-triangle',
    isActive: true,
    allowCancel: false,
    allowEdit: false,
    nextStatuses: ['delivered', 'refunded'] as ShipmentStatus[]
  },
  
  refunded: {
    label: 'İade Edildi',
    description: 'Ödeme iade edildi',
    color: 'gray',
    icon: 'arrow-left',
    isActive: false,
    allowCancel: false,
    allowEdit: false,
    nextStatuses: [] as ShipmentStatus[]
  }
} as const;

/**
 * Status groups for filtering and display
 */
export const STATUS_GROUPS = {
  PENDING: ['draft', 'pending_quotes', 'quotes_received', 'carrier_selected'] as ShipmentStatus[],
  PAYMENT: ['payment_pending', 'payment_completed'] as ShipmentStatus[],
  ACTIVE: ['pickup_scheduled', 'picked_up', 'in_transit', 'out_for_delivery'] as ShipmentStatus[],
  COMPLETED: ['delivered'] as ShipmentStatus[],
  FAILED: ['delivery_failed', 'returned', 'cancelled', 'refunded'] as ShipmentStatus[],
  PROBLEM: ['dispute', 'delivery_failed'] as ShipmentStatus[]
} as const;

/**
 * Status progression timeline
 */
export const STATUS_TIMELINE = [
  'draft',
  'pending_quotes',
  'quotes_received',
  'carrier_selected',
  'payment_pending',
  'payment_completed',
  'pickup_scheduled',
  'picked_up',
  'in_transit',
  'out_for_delivery',
  'delivered'
] as const;

/**
 * Status notifications configuration
 */
export const STATUS_NOTIFICATIONS = {
  pickup_scheduled: {
    title: 'Alım Planlandı',
    message: 'Gönderiniz için alım tarihi planlandı',
    channels: ['push', 'email'] as const,
    priority: 'normal'
  },
  
  picked_up: {
    title: 'Gönderi Alındı',
    message: 'Gönderiniz alım adresinden alındı',
    channels: ['push', 'email', 'sms'] as const,
    priority: 'normal'
  },
  
  in_transit: {
    title: 'Gönderi Yolda',
    message: 'Gönderiniz teslim adresine doğru yolda',
    channels: ['push'] as const,
    priority: 'low'
  },
  
  out_for_delivery: {
    title: 'Dağıtımda',
    message: 'Gönderiniz teslim için kurye ile yolda',
    channels: ['push', 'email', 'sms'] as const,
    priority: 'high'
  },
  
  delivered: {
    title: 'Teslim Edildi',
    message: 'Gönderiniz başarıyla teslim edildi',
    channels: ['push', 'email', 'sms'] as const,
    priority: 'high'
  },
  
  delivery_failed: {
    title: 'Teslimat Başarısız',
    message: 'Teslimat başarısız oldu, yeniden deneme yapılacak',
    channels: ['push', 'email', 'sms'] as const,
    priority: 'urgent'
  },
  
  delayed: {
    title: 'Teslimat Gecikmesi',
    message: 'Gönderinizin teslimatında gecikme yaşanıyor',
    channels: ['push', 'email'] as const,
    priority: 'high'
  }
} as const;

/**
 * Estimated delivery time by service type (in hours)
 */
export const ESTIMATED_DELIVERY_TIMES = {
  same_day: { min: 2, max: 8 },
  next_day: { min: 16, max: 24 },
  express: { min: 24, max: 48 },
  standard: { min: 72, max: 120 },
  scheduled: { min: 48, max: 168 },
  white_glove: { min: 48, max: 168 }
} as const;

/**
 * Helper functions for status management
 */
export const StatusHelpers = {
  /**
   * Check if a status transition is allowed
   */
  isTransitionAllowed(from: ShipmentStatus, to: ShipmentStatus): boolean {
    return SHIPMENT_STATUS_CONFIG[from].nextStatuses.includes(to);
  },
  
  /**
   * Get the next possible statuses
   */
  getNextStatuses(current: ShipmentStatus): ShipmentStatus[] {
    return SHIPMENT_STATUS_CONFIG[current].nextStatuses;
  },
  
  /**
   * Check if status allows cancellation
   */
  canCancel(status: ShipmentStatus): boolean {
    return SHIPMENT_STATUS_CONFIG[status].allowCancel;
  },
  
  /**
   * Check if status allows editing
   */
  canEdit(status: ShipmentStatus): boolean {
    return SHIPMENT_STATUS_CONFIG[status].allowEdit;
  },
  
  /**
   * Check if status is active (shipment is being processed)
   */
  isActive(status: ShipmentStatus): boolean {
    return SHIPMENT_STATUS_CONFIG[status].isActive;
  },
  
  /**
   * Get status by group
   */
  getStatusesByGroup(group: keyof typeof STATUS_GROUPS): ShipmentStatus[] {
    return STATUS_GROUPS[group];
  },
  
  /**
   * Get status display information
   */
  getStatusInfo(status: ShipmentStatus) {
    return SHIPMENT_STATUS_CONFIG[status];
  },
  
  /**
   * Calculate progress percentage based on status
   */
  getProgressPercentage(status: ShipmentStatus): number {
    const index = STATUS_TIMELINE.indexOf(status as any);
    if (index === -1) return 0;
    return Math.round((index / (STATUS_TIMELINE.length - 1)) * 100);
  }
} as const;