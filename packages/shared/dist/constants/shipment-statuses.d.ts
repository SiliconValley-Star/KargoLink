import { ShipmentStatus } from '../types/shipment.types';
export declare const SHIPMENT_STATUS_CONFIG: {
    readonly draft: {
        readonly label: "Taslak";
        readonly description: "Gönderi henüz tamamlanmadı";
        readonly color: "gray";
        readonly icon: "draft";
        readonly isActive: false;
        readonly allowCancel: true;
        readonly allowEdit: true;
        readonly nextStatuses: ShipmentStatus[];
    };
    readonly pending_quotes: {
        readonly label: "Teklif Bekleniyor";
        readonly description: "Kargo firmalarından teklifler bekleniyor";
        readonly color: "blue";
        readonly icon: "clock";
        readonly isActive: true;
        readonly allowCancel: true;
        readonly allowEdit: true;
        readonly nextStatuses: ShipmentStatus[];
    };
    readonly quotes_received: {
        readonly label: "Teklifler Alındı";
        readonly description: "Kargo firması teklifleri alındı, seçim yapılabilir";
        readonly color: "green";
        readonly icon: "list";
        readonly isActive: true;
        readonly allowCancel: true;
        readonly allowEdit: false;
        readonly nextStatuses: ShipmentStatus[];
    };
    readonly carrier_selected: {
        readonly label: "Taşıyıcı Seçildi";
        readonly description: "Kargo firması seçildi, ödeme bekleniyor";
        readonly color: "orange";
        readonly icon: "user-check";
        readonly isActive: true;
        readonly allowCancel: true;
        readonly allowEdit: false;
        readonly nextStatuses: ShipmentStatus[];
    };
    readonly payment_pending: {
        readonly label: "Ödeme Bekleniyor";
        readonly description: "Ödeme işlemi bekleniyor";
        readonly color: "yellow";
        readonly icon: "credit-card";
        readonly isActive: true;
        readonly allowCancel: true;
        readonly allowEdit: false;
        readonly nextStatuses: ShipmentStatus[];
    };
    readonly payment_completed: {
        readonly label: "Ödeme Tamamlandı";
        readonly description: "Ödeme başarıyla tamamlandı";
        readonly color: "green";
        readonly icon: "check-circle";
        readonly isActive: true;
        readonly allowCancel: false;
        readonly allowEdit: false;
        readonly nextStatuses: ShipmentStatus[];
    };
    readonly pickup_scheduled: {
        readonly label: "Alım Planlandı";
        readonly description: "Gönderi alım tarihi planlandı";
        readonly color: "blue";
        readonly icon: "calendar";
        readonly isActive: true;
        readonly allowCancel: false;
        readonly allowEdit: false;
        readonly nextStatuses: ShipmentStatus[];
    };
    readonly picked_up: {
        readonly label: "Alındı";
        readonly description: "Gönderi alım adresinden alındı";
        readonly color: "indigo";
        readonly icon: "package";
        readonly isActive: true;
        readonly allowCancel: false;
        readonly allowEdit: false;
        readonly nextStatuses: ShipmentStatus[];
    };
    readonly in_transit: {
        readonly label: "Yolda";
        readonly description: "Gönderi teslim adresine doğru yolda";
        readonly color: "blue";
        readonly icon: "truck";
        readonly isActive: true;
        readonly allowCancel: false;
        readonly allowEdit: false;
        readonly nextStatuses: ShipmentStatus[];
    };
    readonly out_for_delivery: {
        readonly label: "Dağıtımda";
        readonly description: "Gönderi teslim için dağıtımda";
        readonly color: "orange";
        readonly icon: "map-pin";
        readonly isActive: true;
        readonly allowCancel: false;
        readonly allowEdit: false;
        readonly nextStatuses: ShipmentStatus[];
    };
    readonly delivered: {
        readonly label: "Teslim Edildi";
        readonly description: "Gönderi başarıyla teslim edildi";
        readonly color: "green";
        readonly icon: "check-circle";
        readonly isActive: false;
        readonly allowCancel: false;
        readonly allowEdit: false;
        readonly nextStatuses: ShipmentStatus[];
    };
    readonly delivery_failed: {
        readonly label: "Teslimat Başarısız";
        readonly description: "Teslimat başarısız oldu, yeniden deneme yapılacak";
        readonly color: "red";
        readonly icon: "x-circle";
        readonly isActive: true;
        readonly allowCancel: false;
        readonly allowEdit: false;
        readonly nextStatuses: ShipmentStatus[];
    };
    readonly returned: {
        readonly label: "İade Edildi";
        readonly description: "Gönderi gönderen adresine iade edildi";
        readonly color: "gray";
        readonly icon: "rotate-ccw";
        readonly isActive: false;
        readonly allowCancel: false;
        readonly allowEdit: false;
        readonly nextStatuses: ShipmentStatus[];
    };
    readonly cancelled: {
        readonly label: "İptal Edildi";
        readonly description: "Gönderi iptal edildi";
        readonly color: "red";
        readonly icon: "x";
        readonly isActive: false;
        readonly allowCancel: false;
        readonly allowEdit: false;
        readonly nextStatuses: ShipmentStatus[];
    };
    readonly dispute: {
        readonly label: "Anlaşmazlık";
        readonly description: "Gönderi ile ilgili anlaşmazlık var";
        readonly color: "purple";
        readonly icon: "alert-triangle";
        readonly isActive: true;
        readonly allowCancel: false;
        readonly allowEdit: false;
        readonly nextStatuses: ShipmentStatus[];
    };
    readonly refunded: {
        readonly label: "İade Edildi";
        readonly description: "Ödeme iade edildi";
        readonly color: "gray";
        readonly icon: "arrow-left";
        readonly isActive: false;
        readonly allowCancel: false;
        readonly allowEdit: false;
        readonly nextStatuses: ShipmentStatus[];
    };
};
export declare const STATUS_GROUPS: {
    readonly PENDING: ShipmentStatus[];
    readonly PAYMENT: ShipmentStatus[];
    readonly ACTIVE: ShipmentStatus[];
    readonly COMPLETED: ShipmentStatus[];
    readonly FAILED: ShipmentStatus[];
    readonly PROBLEM: ShipmentStatus[];
};
export declare const STATUS_TIMELINE: readonly ["draft", "pending_quotes", "quotes_received", "carrier_selected", "payment_pending", "payment_completed", "pickup_scheduled", "picked_up", "in_transit", "out_for_delivery", "delivered"];
export declare const STATUS_NOTIFICATIONS: {
    readonly pickup_scheduled: {
        readonly title: "Alım Planlandı";
        readonly message: "Gönderiniz için alım tarihi planlandı";
        readonly channels: readonly ["push", "email"];
        readonly priority: "normal";
    };
    readonly picked_up: {
        readonly title: "Gönderi Alındı";
        readonly message: "Gönderiniz alım adresinden alındı";
        readonly channels: readonly ["push", "email", "sms"];
        readonly priority: "normal";
    };
    readonly in_transit: {
        readonly title: "Gönderi Yolda";
        readonly message: "Gönderiniz teslim adresine doğru yolda";
        readonly channels: readonly ["push"];
        readonly priority: "low";
    };
    readonly out_for_delivery: {
        readonly title: "Dağıtımda";
        readonly message: "Gönderiniz teslim için kurye ile yolda";
        readonly channels: readonly ["push", "email", "sms"];
        readonly priority: "high";
    };
    readonly delivered: {
        readonly title: "Teslim Edildi";
        readonly message: "Gönderiniz başarıyla teslim edildi";
        readonly channels: readonly ["push", "email", "sms"];
        readonly priority: "high";
    };
    readonly delivery_failed: {
        readonly title: "Teslimat Başarısız";
        readonly message: "Teslimat başarısız oldu, yeniden deneme yapılacak";
        readonly channels: readonly ["push", "email", "sms"];
        readonly priority: "urgent";
    };
    readonly delayed: {
        readonly title: "Teslimat Gecikmesi";
        readonly message: "Gönderinizin teslimatında gecikme yaşanıyor";
        readonly channels: readonly ["push", "email"];
        readonly priority: "high";
    };
};
export declare const ESTIMATED_DELIVERY_TIMES: {
    readonly same_day: {
        readonly min: 2;
        readonly max: 8;
    };
    readonly next_day: {
        readonly min: 16;
        readonly max: 24;
    };
    readonly express: {
        readonly min: 24;
        readonly max: 48;
    };
    readonly standard: {
        readonly min: 72;
        readonly max: 120;
    };
    readonly scheduled: {
        readonly min: 48;
        readonly max: 168;
    };
    readonly white_glove: {
        readonly min: 48;
        readonly max: 168;
    };
};
export declare const StatusHelpers: {
    readonly isTransitionAllowed: (from: ShipmentStatus, to: ShipmentStatus) => boolean;
    readonly getNextStatuses: (current: ShipmentStatus) => ShipmentStatus[];
    readonly canCancel: (status: ShipmentStatus) => boolean;
    readonly canEdit: (status: ShipmentStatus) => boolean;
    readonly isActive: (status: ShipmentStatus) => boolean;
    readonly getStatusesByGroup: (group: keyof typeof STATUS_GROUPS) => ShipmentStatus[];
    readonly getStatusInfo: (status: ShipmentStatus) => {
        readonly label: "Taslak";
        readonly description: "Gönderi henüz tamamlanmadı";
        readonly color: "gray";
        readonly icon: "draft";
        readonly isActive: false;
        readonly allowCancel: true;
        readonly allowEdit: true;
        readonly nextStatuses: ShipmentStatus[];
    } | {
        readonly label: "Teklif Bekleniyor";
        readonly description: "Kargo firmalarından teklifler bekleniyor";
        readonly color: "blue";
        readonly icon: "clock";
        readonly isActive: true;
        readonly allowCancel: true;
        readonly allowEdit: true;
        readonly nextStatuses: ShipmentStatus[];
    } | {
        readonly label: "Teklifler Alındı";
        readonly description: "Kargo firması teklifleri alındı, seçim yapılabilir";
        readonly color: "green";
        readonly icon: "list";
        readonly isActive: true;
        readonly allowCancel: true;
        readonly allowEdit: false;
        readonly nextStatuses: ShipmentStatus[];
    } | {
        readonly label: "Taşıyıcı Seçildi";
        readonly description: "Kargo firması seçildi, ödeme bekleniyor";
        readonly color: "orange";
        readonly icon: "user-check";
        readonly isActive: true;
        readonly allowCancel: true;
        readonly allowEdit: false;
        readonly nextStatuses: ShipmentStatus[];
    } | {
        readonly label: "Ödeme Bekleniyor";
        readonly description: "Ödeme işlemi bekleniyor";
        readonly color: "yellow";
        readonly icon: "credit-card";
        readonly isActive: true;
        readonly allowCancel: true;
        readonly allowEdit: false;
        readonly nextStatuses: ShipmentStatus[];
    } | {
        readonly label: "Ödeme Tamamlandı";
        readonly description: "Ödeme başarıyla tamamlandı";
        readonly color: "green";
        readonly icon: "check-circle";
        readonly isActive: true;
        readonly allowCancel: false;
        readonly allowEdit: false;
        readonly nextStatuses: ShipmentStatus[];
    } | {
        readonly label: "Alım Planlandı";
        readonly description: "Gönderi alım tarihi planlandı";
        readonly color: "blue";
        readonly icon: "calendar";
        readonly isActive: true;
        readonly allowCancel: false;
        readonly allowEdit: false;
        readonly nextStatuses: ShipmentStatus[];
    } | {
        readonly label: "Alındı";
        readonly description: "Gönderi alım adresinden alındı";
        readonly color: "indigo";
        readonly icon: "package";
        readonly isActive: true;
        readonly allowCancel: false;
        readonly allowEdit: false;
        readonly nextStatuses: ShipmentStatus[];
    } | {
        readonly label: "Yolda";
        readonly description: "Gönderi teslim adresine doğru yolda";
        readonly color: "blue";
        readonly icon: "truck";
        readonly isActive: true;
        readonly allowCancel: false;
        readonly allowEdit: false;
        readonly nextStatuses: ShipmentStatus[];
    } | {
        readonly label: "Dağıtımda";
        readonly description: "Gönderi teslim için dağıtımda";
        readonly color: "orange";
        readonly icon: "map-pin";
        readonly isActive: true;
        readonly allowCancel: false;
        readonly allowEdit: false;
        readonly nextStatuses: ShipmentStatus[];
    } | {
        readonly label: "Teslim Edildi";
        readonly description: "Gönderi başarıyla teslim edildi";
        readonly color: "green";
        readonly icon: "check-circle";
        readonly isActive: false;
        readonly allowCancel: false;
        readonly allowEdit: false;
        readonly nextStatuses: ShipmentStatus[];
    } | {
        readonly label: "Teslimat Başarısız";
        readonly description: "Teslimat başarısız oldu, yeniden deneme yapılacak";
        readonly color: "red";
        readonly icon: "x-circle";
        readonly isActive: true;
        readonly allowCancel: false;
        readonly allowEdit: false;
        readonly nextStatuses: ShipmentStatus[];
    } | {
        readonly label: "İade Edildi";
        readonly description: "Gönderi gönderen adresine iade edildi";
        readonly color: "gray";
        readonly icon: "rotate-ccw";
        readonly isActive: false;
        readonly allowCancel: false;
        readonly allowEdit: false;
        readonly nextStatuses: ShipmentStatus[];
    } | {
        readonly label: "İptal Edildi";
        readonly description: "Gönderi iptal edildi";
        readonly color: "red";
        readonly icon: "x";
        readonly isActive: false;
        readonly allowCancel: false;
        readonly allowEdit: false;
        readonly nextStatuses: ShipmentStatus[];
    } | {
        readonly label: "Anlaşmazlık";
        readonly description: "Gönderi ile ilgili anlaşmazlık var";
        readonly color: "purple";
        readonly icon: "alert-triangle";
        readonly isActive: true;
        readonly allowCancel: false;
        readonly allowEdit: false;
        readonly nextStatuses: ShipmentStatus[];
    } | {
        readonly label: "İade Edildi";
        readonly description: "Ödeme iade edildi";
        readonly color: "gray";
        readonly icon: "arrow-left";
        readonly isActive: false;
        readonly allowCancel: false;
        readonly allowEdit: false;
        readonly nextStatuses: ShipmentStatus[];
    };
    readonly getProgressPercentage: (status: ShipmentStatus) => number;
};
//# sourceMappingURL=shipment-statuses.d.ts.map