/**
 * Base response type for all API responses
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  timestamp: string;
  requestId?: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Paginated response type
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

/**
 * Generic ID type
 */
export type ID = string | number;

/**
 * Address information
 */
export interface Address {
  id?: ID;
  title: string; // Ev, İş, Depo vs.
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

/**
 * File upload information
 */
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

/**
 * Currency type
 */
export type Currency = 'TRY' | 'USD' | 'EUR';

/**
 * Money representation
 */
export interface Money {
  amount: number;
  currency: Currency;
}

/**
 * Dimensions for packages
 */
export interface Dimensions {
  length: number; // cm
  width: number;  // cm
  height: number; // cm
  weight: number; // kg
}

/**
 * Contact information
 */
export interface Contact {
  name: string;
  phone: string;
  email?: string;
}

/**
 * Date range filter
 */
export interface DateRange {
  startDate: string;
  endDate: string;
}

/**
 * Sort options
 */
export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Filter options for queries
 */
export interface FilterOptions {
  search?: string;
  dateRange?: DateRange;
  status?: string[];
  city?: string[];
  sort?: SortOptions;
}

/**
 * Generic list query parameters
 */
export interface ListQueryParams extends FilterOptions {
  page?: number;
  limit?: number;
}

/**
 * Status type for various entities
 */
export type Status = 
  | 'active' 
  | 'inactive' 
  | 'pending' 
  | 'suspended' 
  | 'deleted';

/**
 * Notification types
 */
export type NotificationType = 
  | 'info' 
  | 'success' 
  | 'warning' 
  | 'error';

/**
 * Device information
 */
export interface DeviceInfo {
  deviceId: string;
  platform: 'ios' | 'android' | 'web';
  version: string;
  pushToken?: string;
}

/**
 * Geolocation
 */
export interface Geolocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: string;
}

/**
 * Time slot for delivery/pickup
 */
export interface TimeSlot {
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  available: boolean;
}

/**
 * Business hours
 */
export interface BusinessHours {
  [key: string]: TimeSlot[]; // key: day of week (monday, tuesday, etc.)
}

/**
 * Generic entity with audit fields
 */
export interface BaseEntity {
  id: ID;
  createdAt: string;
  updatedAt: string;
  createdBy?: ID;
  updatedBy?: ID;
}

/**
 * Soft delete fields
 */
export interface SoftDeleteEntity extends BaseEntity {
  deletedAt?: string;
  deletedBy?: ID;
}