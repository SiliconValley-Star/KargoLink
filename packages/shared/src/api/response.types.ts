import { ApiResponse, PaginatedResponse, PaginationMeta } from '../types/common.types';
import { User, UserProfile, UserSession } from '../types/user.types';
import { Shipment, Quote, TrackingEvent } from '../types/shipment.types';
import { CargoCompany } from '../types/cargo-company.types';
import { Payment, PaymentCard, Wallet } from '../types/payment.types';

/**
 * Authentication responses
 */
export interface LoginResponse extends ApiResponse<{
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  session: UserSession;
}> {}

export interface RegisterResponse extends ApiResponse<{
  user: User;
  message: string;
  verificationRequired: boolean;
}> {}

export interface RefreshTokenResponse extends ApiResponse<{
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}> {}

export interface VerificationResponse extends ApiResponse<{
  verified: boolean;
  message: string;
}> {}

/**
 * User responses
 */
export interface UserResponse extends ApiResponse<User> {}

export interface UserProfileResponse extends ApiResponse<UserProfile> {}

export interface UserListResponse extends PaginatedResponse<User> {}

export interface UserStatsResponse extends ApiResponse<{
  totalShipments: number;
  totalSpent: number;
  averageRating: number;
  completionRate: number;
  memberSince: string;
}> {}

/**
 * Shipment responses
 */
export interface ShipmentResponse extends ApiResponse<Shipment> {}

export interface ShipmentListResponse extends PaginatedResponse<Shipment> {}

export interface QuoteResponse extends ApiResponse<Quote> {}

export interface QuoteListResponse extends ApiResponse<Quote[]> {}

export interface TrackingResponse extends ApiResponse<{
  shipment: Shipment;
  events: TrackingEvent[];
  currentStatus: string;
  estimatedDelivery?: string;
}> {}

export interface ShipmentStatsResponse extends ApiResponse<{
  totalShipments: number;
  activeShipments: number;
  completedShipments: number;
  averageTransitTime: number;
  onTimeDeliveryRate: number;
}> {}

/**
 * Carrier responses
 */
export interface CarrierResponse extends ApiResponse<CargoCompany> {}

export interface CarrierListResponse extends PaginatedResponse<CargoCompany> {}

export interface CarrierSearchResponse extends ApiResponse<{
  carriers: CargoCompany[];
  filters: {
    cities: string[];
    serviceTypes: string[];
    specializations: string[];
  };
}> {}

export interface CarrierMetricsResponse extends ApiResponse<{
  rating: number;
  totalJobs: number;
  onTimeRate: number;
  responseTime: number;
  earnings: {
    thisMonth: number;
    lastMonth: number;
    total: number;
  };
}> {}

/**
 * Payment responses
 */
export interface PaymentResponse extends ApiResponse<Payment> {}

export interface PaymentListResponse extends PaginatedResponse<Payment> {}

export interface PaymentMethodsResponse extends ApiResponse<{
  cards: PaymentCard[];
  defaultCardId?: string;
  savedMethods: number;
}> {}

export interface WalletResponse extends ApiResponse<Wallet> {}

export interface PaymentIntentResponse extends ApiResponse<{
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
}> {}

export interface InstallmentOptionsResponse extends ApiResponse<{
  bankName: string;
  options: {
    installmentCount: number;
    monthlyAmount: number;
    totalAmount: number;
    interestRate: number;
  }[];
}[]> {}

/**
 * File responses
 */
export interface FileUploadResponse extends ApiResponse<{
  id: string;
  fileName: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  thumbnailUrl?: string;
}> {}

export interface FileListResponse extends PaginatedResponse<{
  id: string;
  fileName: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}> {}

/**
 * Notification responses
 */
export interface NotificationResponse extends ApiResponse<{
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  data?: Record<string, any>;
}> {}

export interface NotificationListResponse extends PaginatedResponse<{
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}> {}

export interface NotificationStatsResponse extends ApiResponse<{
  total: number;
  unread: number;
  byType: Record<string, number>;
}> {}

/**
 * Admin responses
 */
export interface AdminDashboardResponse extends ApiResponse<{
  stats: {
    totalUsers: number;
    totalShipments: number;
    totalRevenue: number;
    activeCarriers: number;
  };
  recentActivity: {
    newUsers: number;
    newShipments: number;
    completedShipments: number;
    revenue: number;
  };
  charts: {
    userGrowth: Array<{ date: string; count: number }>;
    shipmentVolume: Array<{ date: string; count: number }>;
    revenue: Array<{ date: string; amount: number }>;
  };
}> {}

export interface SystemHealthResponse extends ApiResponse<{
  status: 'healthy' | 'warning' | 'error';
  services: {
    database: 'healthy' | 'warning' | 'error';
    redis: 'healthy' | 'warning' | 'error';
    storage: 'healthy' | 'warning' | 'error';
    email: 'healthy' | 'warning' | 'error';
    sms: 'healthy' | 'warning' | 'error';
  };
  performance: {
    responseTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  version: string;
  uptime: number;
}> {}

/**
 * Generic responses
 */
export interface SuccessResponse extends ApiResponse<null> {}

export interface MessageResponse extends ApiResponse<{
  message: string;
}> {}

export interface CountResponse extends ApiResponse<{
  count: number;
}> {}

export interface ExistsResponse extends ApiResponse<{
  exists: boolean;
}> {}

export interface HealthResponse extends ApiResponse<{
  status: 'OK' | 'ERROR';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
}> {}

/**
 * Batch operation responses
 */
export interface BatchResponse<T> extends ApiResponse<{
  results: Array<{
    success: boolean;
    data?: T;
    error?: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}> {}

/**
 * Export responses
 */
export interface ExportResponse extends ApiResponse<{
  downloadUrl: string;
  fileName: string;
  format: string;
  size: number;
  expiresAt: string;
}> {}

/**
 * Search responses
 */
export interface SearchResponse<T> extends ApiResponse<{
  results: T[];
  facets?: Record<string, Array<{
    value: string;
    count: number;
  }>>;
  suggestions?: string[];
  totalResults: number;
  searchTime: number;
}> {}

/**
 * Analytics responses
 */
export interface AnalyticsResponse extends ApiResponse<{
  metrics: Record<string, number>;
  trends: Array<{
    date: string;
    value: number;
  }>;
  comparisons?: Record<string, {
    current: number;
    previous: number;
    change: number;
    changePercent: number;
  }>;
}> {}

/**
 * Validation response
 */
export interface ValidationResponse extends ApiResponse<{
  valid: boolean;
  errors?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}> {}