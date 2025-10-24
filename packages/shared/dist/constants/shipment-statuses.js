"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusHelpers = exports.ESTIMATED_DELIVERY_TIMES = exports.STATUS_NOTIFICATIONS = exports.STATUS_TIMELINE = exports.STATUS_GROUPS = exports.SHIPMENT_STATUS_CONFIG = void 0;
exports.SHIPMENT_STATUS_CONFIG = {
    draft: {
        label: 'Taslak',
        description: 'Gönderi henüz tamamlanmadı',
        color: 'gray',
        icon: 'draft',
        isActive: false,
        allowCancel: true,
        allowEdit: true,
        nextStatuses: ['pending_quotes']
    },
    pending_quotes: {
        label: 'Teklif Bekleniyor',
        description: 'Kargo firmalarından teklifler bekleniyor',
        color: 'blue',
        icon: 'clock',
        isActive: true,
        allowCancel: true,
        allowEdit: true,
        nextStatuses: ['quotes_received', 'cancelled']
    },
    quotes_received: {
        label: 'Teklifler Alındı',
        description: 'Kargo firması teklifleri alındı, seçim yapılabilir',
        color: 'green',
        icon: 'list',
        isActive: true,
        allowCancel: true,
        allowEdit: false,
        nextStatuses: ['carrier_selected', 'cancelled']
    },
    carrier_selected: {
        label: 'Taşıyıcı Seçildi',
        description: 'Kargo firması seçildi, ödeme bekleniyor',
        color: 'orange',
        icon: 'user-check',
        isActive: true,
        allowCancel: true,
        allowEdit: false,
        nextStatuses: ['payment_pending', 'cancelled']
    },
    payment_pending: {
        label: 'Ödeme Bekleniyor',
        description: 'Ödeme işlemi bekleniyor',
        color: 'yellow',
        icon: 'credit-card',
        isActive: true,
        allowCancel: true,
        allowEdit: false,
        nextStatuses: ['payment_completed', 'cancelled']
    },
    payment_completed: {
        label: 'Ödeme Tamamlandı',
        description: 'Ödeme başarıyla tamamlandı',
        color: 'green',
        icon: 'check-circle',
        isActive: true,
        allowCancel: false,
        allowEdit: false,
        nextStatuses: ['pickup_scheduled']
    },
    pickup_scheduled: {
        label: 'Alım Planlandı',
        description: 'Gönderi alım tarihi planlandı',
        color: 'blue',
        icon: 'calendar',
        isActive: true,
        allowCancel: false,
        allowEdit: false,
        nextStatuses: ['picked_up', 'delivery_failed']
    },
    picked_up: {
        label: 'Alındı',
        description: 'Gönderi alım adresinden alındı',
        color: 'indigo',
        icon: 'package',
        isActive: true,
        allowCancel: false,
        allowEdit: false,
        nextStatuses: ['in_transit']
    },
    in_transit: {
        label: 'Yolda',
        description: 'Gönderi teslim adresine doğru yolda',
        color: 'blue',
        icon: 'truck',
        isActive: true,
        allowCancel: false,
        allowEdit: false,
        nextStatuses: ['out_for_delivery', 'delivery_failed']
    },
    out_for_delivery: {
        label: 'Dağıtımda',
        description: 'Gönderi teslim için dağıtımda',
        color: 'orange',
        icon: 'map-pin',
        isActive: true,
        allowCancel: false,
        allowEdit: false,
        nextStatuses: ['delivered', 'delivery_failed']
    },
    delivered: {
        label: 'Teslim Edildi',
        description: 'Gönderi başarıyla teslim edildi',
        color: 'green',
        icon: 'check-circle',
        isActive: false,
        allowCancel: false,
        allowEdit: false,
        nextStatuses: []
    },
    delivery_failed: {
        label: 'Teslimat Başarısız',
        description: 'Teslimat başarısız oldu, yeniden deneme yapılacak',
        color: 'red',
        icon: 'x-circle',
        isActive: true,
        allowCancel: false,
        allowEdit: false,
        nextStatuses: ['out_for_delivery', 'returned', 'cancelled']
    },
    returned: {
        label: 'İade Edildi',
        description: 'Gönderi gönderen adresine iade edildi',
        color: 'gray',
        icon: 'rotate-ccw',
        isActive: false,
        allowCancel: false,
        allowEdit: false,
        nextStatuses: []
    },
    cancelled: {
        label: 'İptal Edildi',
        description: 'Gönderi iptal edildi',
        color: 'red',
        icon: 'x',
        isActive: false,
        allowCancel: false,
        allowEdit: false,
        nextStatuses: []
    },
    dispute: {
        label: 'Anlaşmazlık',
        description: 'Gönderi ile ilgili anlaşmazlık var',
        color: 'purple',
        icon: 'alert-triangle',
        isActive: true,
        allowCancel: false,
        allowEdit: false,
        nextStatuses: ['delivered', 'refunded']
    },
    refunded: {
        label: 'İade Edildi',
        description: 'Ödeme iade edildi',
        color: 'gray',
        icon: 'arrow-left',
        isActive: false,
        allowCancel: false,
        allowEdit: false,
        nextStatuses: []
    }
};
exports.STATUS_GROUPS = {
    PENDING: ['draft', 'pending_quotes', 'quotes_received', 'carrier_selected'],
    PAYMENT: ['payment_pending', 'payment_completed'],
    ACTIVE: ['pickup_scheduled', 'picked_up', 'in_transit', 'out_for_delivery'],
    COMPLETED: ['delivered'],
    FAILED: ['delivery_failed', 'returned', 'cancelled', 'refunded'],
    PROBLEM: ['dispute', 'delivery_failed']
};
exports.STATUS_TIMELINE = [
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
];
exports.STATUS_NOTIFICATIONS = {
    pickup_scheduled: {
        title: 'Alım Planlandı',
        message: 'Gönderiniz için alım tarihi planlandı',
        channels: ['push', 'email'],
        priority: 'normal'
    },
    picked_up: {
        title: 'Gönderi Alındı',
        message: 'Gönderiniz alım adresinden alındı',
        channels: ['push', 'email', 'sms'],
        priority: 'normal'
    },
    in_transit: {
        title: 'Gönderi Yolda',
        message: 'Gönderiniz teslim adresine doğru yolda',
        channels: ['push'],
        priority: 'low'
    },
    out_for_delivery: {
        title: 'Dağıtımda',
        message: 'Gönderiniz teslim için kurye ile yolda',
        channels: ['push', 'email', 'sms'],
        priority: 'high'
    },
    delivered: {
        title: 'Teslim Edildi',
        message: 'Gönderiniz başarıyla teslim edildi',
        channels: ['push', 'email', 'sms'],
        priority: 'high'
    },
    delivery_failed: {
        title: 'Teslimat Başarısız',
        message: 'Teslimat başarısız oldu, yeniden deneme yapılacak',
        channels: ['push', 'email', 'sms'],
        priority: 'urgent'
    },
    delayed: {
        title: 'Teslimat Gecikmesi',
        message: 'Gönderinizin teslimatında gecikme yaşanıyor',
        channels: ['push', 'email'],
        priority: 'high'
    }
};
exports.ESTIMATED_DELIVERY_TIMES = {
    same_day: { min: 2, max: 8 },
    next_day: { min: 16, max: 24 },
    express: { min: 24, max: 48 },
    standard: { min: 72, max: 120 },
    scheduled: { min: 48, max: 168 },
    white_glove: { min: 48, max: 168 }
};
exports.StatusHelpers = {
    isTransitionAllowed(from, to) {
        return exports.SHIPMENT_STATUS_CONFIG[from].nextStatuses.includes(to);
    },
    getNextStatuses(current) {
        return exports.SHIPMENT_STATUS_CONFIG[current].nextStatuses;
    },
    canCancel(status) {
        return exports.SHIPMENT_STATUS_CONFIG[status].allowCancel;
    },
    canEdit(status) {
        return exports.SHIPMENT_STATUS_CONFIG[status].allowEdit;
    },
    isActive(status) {
        return exports.SHIPMENT_STATUS_CONFIG[status].isActive;
    },
    getStatusesByGroup(group) {
        return exports.STATUS_GROUPS[group];
    },
    getStatusInfo(status) {
        return exports.SHIPMENT_STATUS_CONFIG[status];
    },
    getProgressPercentage(status) {
        const index = exports.STATUS_TIMELINE.indexOf(status);
        if (index === -1)
            return 0;
        return Math.round((index / (exports.STATUS_TIMELINE.length - 1)) * 100);
    }
};
//# sourceMappingURL=shipment-statuses.js.map