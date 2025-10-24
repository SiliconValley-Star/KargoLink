export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    errors?: Record<string, string[]>;
    timestamp: string;
    requestId?: string;
}
export interface PaginationMeta {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    meta: PaginationMeta;
}
export type ID = string | number;
export interface Address {
    id?: ID;
    title: string;
    firstName: string;
    lastName: string;
    company?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    district: string;
    neighborhood?: string;
    postalCode: string;
    country: string;
    phone: string;
    email?: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
    isDefault?: boolean;
    createdAt?: string;
    updatedAt?: string;
}
export interface FileInfo {
    id: ID;
    fileName: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    thumbnailUrl?: string;
    uploadedAt: string;
}
export type Currency = 'TRY' | 'USD' | 'EUR';
export interface Money {
    amount: number;
    currency: Currency;
}
export interface Dimensions {
    length: number;
    width: number;
    height: number;
    weight: number;
}
export interface Contact {
    name: string;
    phone: string;
    email?: string;
}
export interface DateRange {
    startDate: string;
    endDate: string;
}
export interface SortOptions {
    field: string;
    direction: 'asc' | 'desc';
}
export interface FilterOptions {
    search?: string;
    dateRange?: DateRange;
    status?: string[];
    city?: string[];
    sort?: SortOptions;
}
export interface ListQueryParams extends FilterOptions {
    page?: number;
    limit?: number;
}
export type Status = 'active' | 'inactive' | 'pending' | 'suspended' | 'deleted';
export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export interface DeviceInfo {
    deviceId: string;
    platform: 'ios' | 'android' | 'web';
    version: string;
    pushToken?: string;
}
export interface Geolocation {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp?: string;
}
export interface TimeSlot {
    startTime: string;
    endTime: string;
    available: boolean;
}
export interface BusinessHours {
    [key: string]: TimeSlot[];
}
export interface BaseEntity {
    id: ID;
    createdAt: string;
    updatedAt: string;
    createdBy?: ID;
    updatedBy?: ID;
}
export interface SoftDeleteEntity extends BaseEntity {
    deletedAt?: string;
    deletedBy?: ID;
}
//# sourceMappingURL=common.types.d.ts.map