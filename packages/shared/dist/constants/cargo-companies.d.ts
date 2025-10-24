import { CargoCompanyType, IntegrationType } from '../types/cargo-company.types';
import { CarrierSpecialization } from '../types/user.types';
import { ServiceType } from '../types/shipment.types';
export declare const MAJOR_CARGO_COMPANIES: {
    readonly YURTICI: {
        readonly id: "yurtici";
        readonly name: "Yurtiçi Kargo";
        readonly legalName: "Yurtiçi Kargo Servisi A.Ş.";
        readonly type: CargoCompanyType;
        readonly website: "https://www.yurtici.com.tr";
        readonly logo: "https://www.yurtici.com.tr/assets/img/logo.png";
        readonly integrationType: IntegrationType;
        readonly specializations: CarrierSpecialization[];
        readonly serviceTypes: ServiceType[];
        readonly commissionRate: 0.05;
        readonly isActive: true;
    };
    readonly ARAS: {
        readonly id: "aras";
        readonly name: "Aras Kargo";
        readonly legalName: "Aras Kargo A.Ş.";
        readonly type: CargoCompanyType;
        readonly website: "https://www.araskargo.com.tr";
        readonly logo: "https://www.araskargo.com.tr/assets/img/logo.png";
        readonly integrationType: IntegrationType;
        readonly specializations: CarrierSpecialization[];
        readonly serviceTypes: ServiceType[];
        readonly commissionRate: 0.06;
        readonly isActive: true;
    };
    readonly MNG: {
        readonly id: "mng";
        readonly name: "MNG Kargo";
        readonly legalName: "MNG Kargo A.Ş.";
        readonly type: CargoCompanyType;
        readonly website: "https://www.mngkargo.com.tr";
        readonly logo: "https://www.mngkargo.com.tr/assets/img/logo.png";
        readonly integrationType: IntegrationType;
        readonly specializations: CarrierSpecialization[];
        readonly serviceTypes: ServiceType[];
        readonly commissionRate: 0.055;
        readonly isActive: true;
    };
    readonly UPS: {
        readonly id: "ups";
        readonly name: "UPS";
        readonly legalName: "United Parcel Service Taşımacılık A.Ş.";
        readonly type: CargoCompanyType;
        readonly website: "https://www.ups.com/tr";
        readonly logo: "https://www.ups.com/assets/resources/images/ups-logo.png";
        readonly integrationType: IntegrationType;
        readonly specializations: CarrierSpecialization[];
        readonly serviceTypes: ServiceType[];
        readonly commissionRate: 0.04;
        readonly isActive: true;
    };
    readonly DHL: {
        readonly id: "dhl";
        readonly name: "DHL";
        readonly legalName: "DHL Express (Turkey) Taşımacılık A.Ş.";
        readonly type: CargoCompanyType;
        readonly website: "https://www.dhl.com.tr";
        readonly logo: "https://www.dhl.com/content/dam/dhl/global/dhl-logo-print.svg";
        readonly integrationType: IntegrationType;
        readonly specializations: CarrierSpecialization[];
        readonly serviceTypes: ServiceType[];
        readonly commissionRate: 0.035;
        readonly isActive: true;
    };
    readonly PTT: {
        readonly id: "ptt";
        readonly name: "PTT Kargo";
        readonly legalName: "PTT A.Ş.";
        readonly type: CargoCompanyType;
        readonly website: "https://www.ptt.gov.tr";
        readonly logo: "https://www.ptt.gov.tr/assets/img/logo.png";
        readonly integrationType: IntegrationType;
        readonly specializations: CarrierSpecialization[];
        readonly serviceTypes: ServiceType[];
        readonly commissionRate: 0.07;
        readonly isActive: true;
    };
    readonly SURAT: {
        readonly id: "surat";
        readonly name: "Sürat Kargo";
        readonly legalName: "Sürat Kargo A.Ş.";
        readonly type: CargoCompanyType;
        readonly website: "https://www.suratkargo.com.tr";
        readonly logo: "https://www.suratkargo.com.tr/assets/img/logo.png";
        readonly integrationType: IntegrationType;
        readonly specializations: CarrierSpecialization[];
        readonly serviceTypes: ServiceType[];
        readonly commissionRate: 0.065;
        readonly isActive: true;
    };
};
export declare const DEFAULT_COMMISSION_RATES: {
    readonly enterprise: 0.05;
    readonly regional: 0.08;
    readonly local: 0.1;
    readonly freelance: 0.12;
};
export declare const MAJOR_CITIES: readonly [{
    readonly code: "01";
    readonly name: "Adana";
    readonly region: "Mediterranean";
}, {
    readonly code: "02";
    readonly name: "Adıyaman";
    readonly region: "Southeastern Anatolia";
}, {
    readonly code: "03";
    readonly name: "Afyonkarahisar";
    readonly region: "Aegean";
}, {
    readonly code: "04";
    readonly name: "Ağrı";
    readonly region: "Eastern Anatolia";
}, {
    readonly code: "06";
    readonly name: "Ankara";
    readonly region: "Central Anatolia";
}, {
    readonly code: "07";
    readonly name: "Antalya";
    readonly region: "Mediterranean";
}, {
    readonly code: "09";
    readonly name: "Aydın";
    readonly region: "Aegean";
}, {
    readonly code: "16";
    readonly name: "Bursa";
    readonly region: "Marmara";
}, {
    readonly code: "17";
    readonly name: "Çanakkale";
    readonly region: "Marmara";
}, {
    readonly code: "34";
    readonly name: "İstanbul";
    readonly region: "Marmara";
}, {
    readonly code: "35";
    readonly name: "İzmir";
    readonly region: "Aegean";
}, {
    readonly code: "38";
    readonly name: "Kayseri";
    readonly region: "Central Anatolia";
}, {
    readonly code: "41";
    readonly name: "Kocaeli";
    readonly region: "Marmara";
}, {
    readonly code: "42";
    readonly name: "Konya";
    readonly region: "Central Anatolia";
}, {
    readonly code: "58";
    readonly name: "Sivas";
    readonly region: "Central Anatolia";
}, {
    readonly code: "61";
    readonly name: "Trabzon";
    readonly region: "Black Sea";
}];
export declare const CARGO_API_ENDPOINTS: {
    readonly YURTICI: {
        readonly baseUrl: "https://api.yurtici.com.tr/v2";
        readonly endpoints: {
            readonly quote: "/shipments/quote";
            readonly create: "/shipments";
            readonly track: "/shipments/{id}/track";
            readonly cancel: "/shipments/{id}/cancel";
            readonly label: "/shipments/{id}/label";
        };
    };
    readonly ARAS: {
        readonly baseUrl: "https://api.araskargo.com.tr/v1";
        readonly endpoints: {
            readonly quote: "/calculate";
            readonly create: "/shipment";
            readonly track: "/track/{trackingNumber}";
            readonly cancel: "/shipment/{id}/cancel";
            readonly label: "/shipment/{id}/waybill";
        };
    };
    readonly MNG: {
        readonly baseUrl: "https://api.mngkargo.com.tr/v1";
        readonly endpoints: {
            readonly quote: "/pricing/calculate";
            readonly create: "/shipments/create";
            readonly track: "/tracking/{barcode}";
            readonly cancel: "/shipments/{id}/cancel";
            readonly label: "/shipments/{id}/label";
        };
    };
};
export declare const DEFAULT_BUSINESS_HOURS: {
    readonly monday: readonly [{
        readonly startTime: "09:00";
        readonly endTime: "18:00";
        readonly available: true;
    }];
    readonly tuesday: readonly [{
        readonly startTime: "09:00";
        readonly endTime: "18:00";
        readonly available: true;
    }];
    readonly wednesday: readonly [{
        readonly startTime: "09:00";
        readonly endTime: "18:00";
        readonly available: true;
    }];
    readonly thursday: readonly [{
        readonly startTime: "09:00";
        readonly endTime: "18:00";
        readonly available: true;
    }];
    readonly friday: readonly [{
        readonly startTime: "09:00";
        readonly endTime: "18:00";
        readonly available: true;
    }];
    readonly saturday: readonly [{
        readonly startTime: "09:00";
        readonly endTime: "13:00";
        readonly available: true;
    }];
    readonly sunday: readonly [{
        readonly startTime: "00:00";
        readonly endTime: "00:00";
        readonly available: false;
    }];
};
export declare const SERVICE_STANDARDS: {
    readonly MIN_RESPONSE_TIME: 30;
    readonly MAX_RESPONSE_TIME: number;
    readonly MIN_RATING: 3;
    readonly MIN_ON_TIME_RATE: 80;
    readonly MAX_DAMAGE_RATE: 0.5;
    readonly MAX_LOSS_RATE: 0.1;
};
//# sourceMappingURL=cargo-companies.d.ts.map