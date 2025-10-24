-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "avatar" TEXT,
    "birthDate" DATETIME,
    "gender" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "accountType" TEXT NOT NULL DEFAULT 'INDIVIDUAL',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" DATETIME,
    "phoneVerifiedAt" DATETIME,
    "password" TEXT NOT NULL,
    "passwordChangedAt" DATETIME,
    "lastLoginAt" DATETIME,
    "lastActiveAt" DATETIME,
    "lastLoginIP" TEXT,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "verificationDocuments" TEXT,
    "verificationNotes" TEXT,
    "verifiedAt" DATETIME,
    "verifiedBy" TEXT,
    "businessInfo" TEXT,
    "carrierInfo" TEXT,
    "preferences" TEXT,
    "notificationSettings" TEXT,
    "totalShipments" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" REAL NOT NULL DEFAULT 0,
    "rating" REAL NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "referralCode" TEXT NOT NULL,
    "referredBy" TEXT,
    "referralCount" INTEGER NOT NULL DEFAULT 0,
    "subscriptionPlan" TEXT,
    "subscriptionExpiresAt" DATETIME,
    "gdprConsent" BOOLEAN NOT NULL DEFAULT false,
    "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
    "termsAcceptedAt" DATETIME NOT NULL,
    "privacyPolicyAcceptedAt" DATETIME NOT NULL,
    CONSTRAINT "users_referredBy_fkey" FOREIGN KEY ("referredBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "users_verifiedBy_fkey" FOREIGN KEY ("verifiedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "company" TEXT,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "neighborhood" TEXT,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'TR',
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "devices" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "pushToken" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" DATETIME,
    CONSTRAINT "devices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "deviceInfo" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "lastActivity" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT NOT NULL,
    "deviceInfo" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "lastActivity" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "permissions" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" DATETIME,
    "expiresAt" DATETIME,
    CONSTRAINT "api_keys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_activities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    CONSTRAINT "user_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cargo_companies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    "name" TEXT NOT NULL,
    "legalName" TEXT,
    "logo" TEXT,
    "website" TEXT,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'REGIONAL',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" DATETIME,
    "verifiedBy" TEXT,
    "contacts" TEXT NOT NULL,
    "addresses" TEXT NOT NULL,
    "headquarters" TEXT NOT NULL,
    "taxNumber" TEXT NOT NULL,
    "taxOffice" TEXT NOT NULL,
    "tradeRegistryNumber" TEXT,
    "establishmentDate" DATETIME,
    "employeeCount" INTEGER,
    "specializations" TEXT NOT NULL,
    "serviceTypes" TEXT NOT NULL,
    "serviceAreas" TEXT NOT NULL,
    "businessHours" TEXT NOT NULL,
    "integrationType" TEXT NOT NULL DEFAULT 'API',
    "apiConfig" TEXT,
    "driverCount" INTEGER,
    "commissionRate" REAL NOT NULL DEFAULT 0.05,
    "rating" REAL NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "totalShipments" INTEGER NOT NULL DEFAULT 0,
    "onTimeDeliveryRate" REAL NOT NULL DEFAULT 0,
    "avgResponseTime" INTEGER NOT NULL DEFAULT 0,
    "avgTransitTime" INTEGER NOT NULL DEFAULT 0,
    "creditLimit" REAL,
    "currentBalance" REAL NOT NULL DEFAULT 0,
    "paymentTerms" INTEGER NOT NULL DEFAULT 30,
    "licenses" TEXT NOT NULL,
    "certifications" TEXT NOT NULL,
    "insurance" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActiveAt" DATETIME,
    "agreementVersion" TEXT NOT NULL,
    "agreementAcceptedAt" DATETIME NOT NULL,
    "settlementFrequency" TEXT NOT NULL DEFAULT 'MONTHLY',
    "bankAccount" TEXT
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    "cargoCompanyId" TEXT,
    "type" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "capacity" TEXT NOT NULL,
    "features" TEXT NOT NULL,
    "insuranceNumber" TEXT NOT NULL,
    "insuranceExpiry" DATETIME NOT NULL,
    "inspectionExpiry" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "images" TEXT NOT NULL,
    CONSTRAINT "vehicles_cargoCompanyId_fkey" FOREIGN KEY ("cargoCompanyId") REFERENCES "cargo_companies" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pricing_rules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "cargoCompanyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "specializations" TEXT NOT NULL,
    "fromCities" TEXT NOT NULL,
    "toCities" TEXT NOT NULL,
    "distance" TEXT,
    "weightRanges" TEXT NOT NULL,
    "volumeRanges" TEXT NOT NULL DEFAULT '[]',
    "fuelSurcharge" REAL,
    "insuranceRate" REAL,
    "specialServiceCosts" TEXT NOT NULL,
    "deliveryTimeModifiers" TEXT,
    "seasonalModifiers" TEXT NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "validFrom" DATETIME NOT NULL,
    "validUntil" DATETIME,
    CONSTRAINT "pricing_rules_cargoCompanyId_fkey" FOREIGN KEY ("cargoCompanyId") REFERENCES "cargo_companies" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "shipments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    "trackingNumber" TEXT NOT NULL,
    "reference" TEXT,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT,
    "pickupAddressId" TEXT NOT NULL,
    "deliveryAddressId" TEXT NOT NULL,
    "packages" TEXT NOT NULL,
    "totalWeight" REAL NOT NULL,
    "totalValue" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "serviceType" TEXT NOT NULL DEFAULT 'STANDARD',
    "specialServices" TEXT NOT NULL,
    "pickupPreference" TEXT NOT NULL,
    "deliveryPreference" TEXT NOT NULL,
    "estimatedPickupDate" DATETIME,
    "estimatedDeliveryDate" DATETIME,
    "actualPickupDate" DATETIME,
    "actualDeliveryDate" DATETIME,
    "selectedCarrierId" TEXT,
    "selectedCargoCompanyId" TEXT,
    "selectedQuoteId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "totalCost" REAL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentId" TEXT,
    "paidAt" DATETIME,
    "instructions" TEXT,
    "notes" TEXT,
    "customerNotes" TEXT,
    "internalNotes" TEXT,
    "invoices" TEXT NOT NULL,
    "packingList" TEXT,
    "customsDeclaration" TEXT,
    "otherDocuments" TEXT NOT NULL,
    "insuranceValue" REAL,
    "insurancePolicyNumber" TEXT,
    "claimId" TEXT,
    "customerRating" INTEGER,
    "carrierRating" INTEGER,
    "customerReview" TEXT,
    "carrierReview" TEXT,
    "cancellationReason" TEXT,
    "cancelledBy" TEXT,
    "cancelledAt" DATETIME,
    "returnReason" TEXT,
    "returnedAt" DATETIME,
    "requiresCustoms" BOOLEAN NOT NULL DEFAULT false,
    "customsValue" REAL,
    "commodityCode" TEXT,
    "exportLicense" TEXT,
    CONSTRAINT "shipments_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "shipments_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "shipments_pickupAddressId_fkey" FOREIGN KEY ("pickupAddressId") REFERENCES "addresses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "shipments_deliveryAddressId_fkey" FOREIGN KEY ("deliveryAddressId") REFERENCES "addresses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "shipments_selectedCarrierId_fkey" FOREIGN KEY ("selectedCarrierId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "shipments_selectedCargoCompanyId_fkey" FOREIGN KEY ("selectedCargoCompanyId") REFERENCES "cargo_companies" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "shipments_selectedQuoteId_fkey" FOREIGN KEY ("selectedQuoteId") REFERENCES "quotes" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "quotes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "carrierId" TEXT,
    "cargoCompanyId" TEXT,
    "baseCost" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "additionalCosts" TEXT NOT NULL,
    "totalCost" REAL NOT NULL DEFAULT 0,
    "serviceType" TEXT NOT NULL DEFAULT 'STANDARD',
    "estimatedPickupDate" DATETIME NOT NULL,
    "estimatedDeliveryDate" DATETIME NOT NULL,
    "transitDays" INTEGER NOT NULL,
    "termsAndConditions" TEXT,
    "validUntil" DATETIME NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "respondedAt" DATETIME,
    "trackingIncluded" BOOLEAN NOT NULL DEFAULT true,
    "insuranceIncluded" BOOLEAN NOT NULL DEFAULT false,
    "signatureRequired" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "quotes_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "shipments" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "quotes_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "quotes_cargoCompanyId_fkey" FOREIGN KEY ("cargoCompanyId") REFERENCES "cargo_companies" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tracking_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shipmentId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "images" TEXT NOT NULL,
    "signature" TEXT,
    "contactPerson" TEXT,
    "metadata" TEXT,
    CONSTRAINT "tracking_events_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "shipments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "delivery_attempts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "scheduledDate" DATETIME NOT NULL,
    "actualDate" DATETIME,
    "status" TEXT NOT NULL,
    "failureReason" TEXT,
    "recipientNote" TEXT,
    "carrierNote" TEXT,
    "signature" TEXT,
    "photos" TEXT NOT NULL,
    "location" TEXT,
    "contactAttempts" TEXT NOT NULL,
    CONSTRAINT "delivery_attempts_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "shipments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "maskedNumber" TEXT,
    "brand" TEXT,
    "expiryMonth" INTEGER,
    "expiryYear" INTEGER,
    "holderName" TEXT,
    "nickname" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "lastUsedAt" DATETIME,
    "providerId" TEXT NOT NULL,
    "providerToken" TEXT,
    "billingAddress" TEXT,
    CONSTRAINT "payment_methods_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "transactionId" TEXT NOT NULL,
    "referenceNumber" TEXT,
    "shipmentId" TEXT,
    "userId" TEXT NOT NULL,
    "amount" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "originalAmount" REAL,
    "exchangeRate" REAL,
    "method" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "providerTransactionId" TEXT,
    "providerReferenceId" TEXT,
    "providerStatus" TEXT,
    "paymentMethodId" TEXT,
    "installmentCount" INTEGER,
    "installmentAmount" REAL,
    "fees" TEXT NOT NULL,
    "grossAmount" REAL NOT NULL DEFAULT 0,
    "netAmount" REAL NOT NULL DEFAULT 0,
    "paidAt" DATETIME,
    "processedAt" DATETIME,
    "settledAt" DATETIME,
    "expiresAt" DATETIME,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "billingAddress" TEXT,
    "refundableAmount" REAL NOT NULL DEFAULT 0,
    "riskScore" REAL,
    "fraudCheck" TEXT,
    "threeDS" TEXT,
    "description" TEXT,
    "metadata" TEXT,
    "failureReason" TEXT,
    "failureCode" TEXT,
    "reconciled" BOOLEAN NOT NULL DEFAULT false,
    "reconciledAt" DATETIME,
    "bankStatementReference" TEXT,
    CONSTRAINT "payments_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "shipments" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "payments_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "payment_methods" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payment_refunds" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "paymentId" TEXT NOT NULL,
    "amount" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "providerRefundId" TEXT,
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" DATETIME,
    "completedAt" DATETIME,
    "initiatedBy" TEXT NOT NULL,
    "autoRefund" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "metadata" TEXT,
    CONSTRAINT "payment_refunds_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "dailySpendLimit" REAL NOT NULL DEFAULT 1000,
    "monthlySpendLimit" REAL NOT NULL DEFAULT 10000,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFrozen" BOOLEAN NOT NULL DEFAULT false,
    "frozenReason" TEXT,
    "frozenAt" DATETIME,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" DATETIME,
    "verificationLevel" TEXT NOT NULL DEFAULT 'basic',
    CONSTRAINT "wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "wallet_transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "walletId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "balanceAfter" REAL NOT NULL DEFAULT 0,
    "paymentId" TEXT,
    "shipmentId" TEXT,
    "description" TEXT NOT NULL,
    "reference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "processedAt" DATETIME,
    "metadata" TEXT,
    CONSTRAINT "wallet_transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payouts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "cargoCompanyId" TEXT NOT NULL,
    "amount" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "breakdown" TEXT NOT NULL,
    "bankAccount" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerPayoutId" TEXT,
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" DATETIME,
    "completedAt" DATETIME,
    "expectedAt" DATETIME,
    "failureReason" TEXT,
    "invoiceUrl" TEXT,
    "receiptUrl" TEXT,
    "shipmentIds" TEXT NOT NULL,
    CONSTRAINT "payouts_cargoCompanyId_fkey" FOREIGN KEY ("cargoCompanyId") REFERENCES "cargo_companies" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "giverId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "shipmentId" TEXT,
    "cargoCompanyId" TEXT,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "comment" TEXT,
    "ratings" TEXT,
    "response" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "reviews_giverId_fkey" FOREIGN KEY ("giverId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reviews_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reviews_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "shipments" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "reviews_cargoCompanyId_fkey" FOREIGN KEY ("cargoCompanyId") REFERENCES "cargo_companies" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" TEXT,
    "channels" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" DATETIME,
    "clicked" BOOLEAN NOT NULL DEFAULT false,
    "clickedAt" DATETIME,
    "sentAt" DATETIME,
    "deliveryStatus" TEXT,
    CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "shipment_notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shipmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "channels" TEXT NOT NULL,
    "sentAt" DATETIME,
    "readAt" DATETIME,
    "clickedAt" DATETIME,
    CONSTRAINT "shipment_notifications_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "shipments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    "key" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" BIGINT NOT NULL,
    "hash" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'OTHER',
    "category" TEXT,
    "tags" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'AWS_S3',
    "bucketName" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "accessLevel" TEXT NOT NULL DEFAULT 'private',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "processingStatus" TEXT,
    "thumbnailKey" TEXT,
    "thumbnailUrl" TEXT,
    "variants" TEXT NOT NULL DEFAULT '{}',
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "exifData" TEXT,
    "dimensions" TEXT,
    "duration" INTEGER,
    "uploadedById" TEXT,
    "uploadSource" TEXT NOT NULL DEFAULT 'web',
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "lastAccessedAt" DATETIME,
    "expiresAt" DATETIME,
    "autoCleanup" BOOLEAN NOT NULL DEFAULT false,
    "virusScanStatus" TEXT DEFAULT 'pending',
    "virusScanResult" TEXT,
    "virusScanAt" DATETIME,
    CONSTRAINT "files_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "file_associations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fileId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "fieldName" TEXT,
    "purpose" TEXT,
    "displayOrder" INTEGER DEFAULT 0,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    CONSTRAINT "file_associations_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "file_shares" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "fileId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "sharedById" TEXT NOT NULL,
    "sharedWithEmail" TEXT,
    "sharedWithUserId" TEXT,
    "permissions" TEXT NOT NULL DEFAULT '["read"]',
    "expiresAt" DATETIME,
    "maxDownloads" INTEGER,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "password" TEXT,
    "requiresPassword" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastAccessedAt" DATETIME,
    "note" TEXT,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    CONSTRAINT "file_shares_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "file_shares_sharedById_fkey" FOREIGN KEY ("sharedById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "file_shares_sharedWithUserId_fkey" FOREIGN KEY ("sharedWithUserId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "file_versions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "originalFileId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL DEFAULT 1,
    "changelog" TEXT,
    "key" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" BIGINT NOT NULL,
    "hash" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "uploadedById" TEXT,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    CONSTRAINT "file_versions_originalFileId_fkey" FOREIGN KEY ("originalFileId") REFERENCES "files" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "file_versions_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "file_access_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fileId" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "action" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referer" TEXT,
    "responseStatus" INTEGER,
    "bytesServed" BIGINT,
    "duration" INTEGER,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    CONSTRAINT "file_access_logs_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "file_access_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_referralCode_key" ON "users"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "devices_userId_deviceId_key" ON "devices"("userId", "deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_refreshToken_key" ON "user_sessions"("refreshToken");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_key" ON "api_keys"("key");

-- CreateIndex
CREATE UNIQUE INDEX "cargo_companies_taxNumber_key" ON "cargo_companies"("taxNumber");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_plateNumber_key" ON "vehicles"("plateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "shipments_trackingNumber_key" ON "shipments"("trackingNumber");

-- CreateIndex
CREATE UNIQUE INDEX "payments_transactionId_key" ON "payments"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_userId_key" ON "wallets"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "files_key_key" ON "files"("key");

-- CreateIndex
CREATE UNIQUE INDEX "files_hash_key" ON "files"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "file_shares_token_key" ON "file_shares"("token");
