
# CargoLink MVP - Kapsamlı Teknik Dokümantasyon

## 📋 İçindekiler

1. [Proje Genel Bakış](#1-proje-genel-bakış)
2. [Teknik Stack ve Mimari](#2-teknik-stack-ve-mimari)
3. [Sistem Mimarisi](#3-sistem-mimarisi)
4. [Database Tasarımı](#4-database-tasarımı)
5. [API Dokümantasyonu](#5-api-dokümantasyonu)
6. [Frontend (React Native) Mimarisi](#6-frontend-react-native-mimarisi)
7. [Backend (Node.js/Express) Mimarisi](#7-backend-nodejs-express-mimarisi)
8. [Professional Website Architecture](#8-professional-website-architecture)
9. [Kargo Firması Entegrasyonları](#9-kargo-firması-entegrasyonları)
10. [Ödeme Sistemi Entegrasyonu](#10-ödeme-sistemi-entegrasyonu)
11. [Real-time Sistem Tasarımı](#11-real-time-sistem-tasarımı)
12. [Güvenlik ve Authentication](#12-güvenlik-ve-authentication)
13. [Admin Panel Tasarımı](#13-admin-panel-tasarımı)
14. [Bildirim Sistemi](#14-bildirim-sistemi)
15. [File Storage ve Media Management](#15-file-storage-ve-media-management)
16. [Testing Stratejisi](#16-testing-stratejisi)
17. [Deployment ve DevOps](#17-deployment-ve-devops)
18. [Performance ve Optimizasyon](#18-performance-ve-optimizasyon)
19. [Monitoring ve Logging](#19-monitoring-ve-logging)
20. [Business Logic Detayları](#20-business-logic-detayları)
21. [User Experience ve Flow'lar](#21-user-experience-ve-flowlar)
22. [Geliştirme Süreçleri](#22-geliştirme-süreçleri)

---

## 1. Proje Genel Bakış

### 1.1 Proje Vizyonu
CargoLink, Türkiye'deki kargo ve lojistik sektörünü dijital dönüşümle birleştiren, bireysel ve kurumsal kullanıcıların tüm taşıma ihtiyaçlarını tek platformdan karşılayabildiği, yapay zeka destekli, otomatik teklif ve komisyon sistemine sahip bir mobil platformdur.

### 1.2 Temel Problem Tanımı
- **Mevcut Durum**: Türkiye'de lojistik sektörü parçalı, fiyat şeffaflığı yok
- **Ana Problemler**:
  - İşletmeler onlarca firmayla tek tek iletişim kurmak zorunda
  - Küçük taşıyıcılar görünürlük bulamıyor
  - Fiyat karşılaştırma zaman alıyor
  - Güvenilirlik belirsiz
  - Süreç takibi yetersiz

### 1.3 Çözüm Önerisi
**Tek Platform Yaklaşımı**: Tüm taşıyıcıları ve fiyatları birleştiren, otomatik teklif alan, karşılaştıran ve süreç yöneten platform.

### 1.4 Hedef Kullanıcı Grupları

#### 1.4.1 Bireysel Kullanıcılar
- **Profil**: 25-55 yaş arası, teknoloji kullanımında orta-ileri seviye
- **İhtiyaçlar**: 
  - Hızlı fiyat karşılaştırma
  - Güvenilir taşıyıcı seçimi
  - Kolay ödeme
  - Takip imkanı
- **Gönderim Tipleri**: Ev eşyası, hediye paketi, e-ticaret ürünü

#### 1.4.2 Kurumsal Kullanıcılar (KOBİ)
- **Profil**: 10-500 çalışanı olan işletmeler
- **İhtiyaçlar**:
  - Toplu gönderim yönetimi
  - Fatura entegrasyonu
  - Raporlama
  - API erişimi
- **Gönderim Tipleri**: Ticari mal, seri üretim ürünleri

#### 1.4.3 Büyük Kurumsal Kullanıcılar
- **Profil**: 500+ çalışanı olan şirketler, ihracat/ithalat firmaları
- **İhtiyaçlar**:
  - Özel fiyatlandırma
  - Dedicated support
  - Advanced API
  - Custom integrations
- **Gönderim Tipleri**: Sanayi ürünü, ihracat malları, büyük hacimli gönderiler

#### 1.4.4 Taşıyıcı Firmalar

##### Büyük Kargo Firmaları
- **Profil**: Yurtiçi, Aras, MNG, DHL, UPS, FedEx
- **Entegrasyon**: API-based otomatik fiyat çekme
- **Komisyon Modeli**: %3-7 affiliate komisyonu

##### Küçük ve Orta Ölçekli Taşıyıcılar
- **Profil**: Yerel/bölgesel taşımacılar, özel araç sahipleri
- **Entegrasyon**: Manuel/yarı-otomatik teklif sistemi
- **Komisyon Modeli**: %5-10 aracılık komisyonu

### 1.5 MVP Kapsamı

#### 1.5.1 Temel Özellikler
- Kullanıcı kayıt/giriş sistemi
- Gönderim talebi oluşturma
- Fiyat karşılaştırma
- Taşıyıcı seçimi
- Ödeme işlemleri
- Gönderim takibi
- Bildirimler

#### 1.5.2 Gelişmiş Özellikler
- Admin panel
- Taşıyıcı dashboard'u
- Raporlama
- API integrations
- Real-time tracking
- Customer support system

---

## 2. Teknik Stack ve Mimari

### 2.1 Teknoloji Seçim Kriterleri

#### 2.1.1 Performans
- **React Native**: Cross-platform development, native performance
- **Node.js**: High concurrency, real-time applications
- **PostgreSQL**: ACID compliance, complex queries
- **Redis**: Caching, session management, real-time data

#### 2.1.2 Ölçeklenebilirlik
- **Microservices Architecture**: Independent scaling
- **Docker**: Containerization
- **Kubernetes**: Orchestration
- **Load Balancing**: High availability

#### 2.1.3 Geliştirme Verimliliği
- **TypeScript**: Type safety, better IDE support
- **ESLint/Prettier**: Code quality
- **Jest**: Testing framework
- **GitHub Actions**: CI/CD pipeline

### 2.2 Teknik Stack Detayları

#### 2.2.1 Frontend Stack
```
React Native: 0.72+
├── TypeScript: 5.0+
├── React Navigation: 6.x
├── Redux Toolkit: 1.9+
├── React Hook Form: 7.x
├── React Query: 4.x
├── Styled Components: 6.x
├── React Native Paper: 5.x
├── React Native Maps: 1.x
├── React Native Camera: 5.x
├── React Native Push Notification: 8.x
├── React Native Keychain: 8.x
├── React Native Biometrics: 3.x
├── React Native PDF: 6.x
├── React Native Share: 9.x
├── React Native Image Picker: 5.x
├── React Native Document Picker: 9.x
├── React Native QR Scanner: 1.x
├── React Native Permissions: 3.x
├── React Native Splash Screen: 3.x
├── React Native Vector Icons: 9.x
├── React Native Linear Gradient: 2.x
├── React Native Animatable: 1.x
├── React Native Reanimated: 3.x
├── React Native Gesture Handler: 2.x
├── React Native Safe Area Context: 4.x
├── React Native Screen: 3.x
└── Flipper: Development debugging
```

#### 2.2.2 Backend Stack
```
Node.js: 18+ LTS
├── Express.js: 4.18+
├── TypeScript: 5.0+
├── PostgreSQL: 15+
├── Redis: 7.x
├── Prisma ORM: 5.x
├── JWT: 9.x
├── Bcrypt: 5.x
├── Helmet: 7.x
├── CORS: 2.x
├── Rate Limiting: 6.x
├── Multer: 1.x (File upload)
├── Sharp: 0.32+ (Image processing)
├── Node Cron: 3.x (Scheduled tasks)
├── Nodemailer: 6.x (Email)
├── Socket.io: 4.x (Real-time)
├── Bull Queue: 4.x (Background jobs)
├── Winston: 3.x (Logging)
├── Morgan: 1.x (HTTP logging)
├── Compression: 1.x (Response compression)
├── Express Validator: 7.x (Input validation)
├── Swagger: 4.x (API documentation)
├── Axios: 1.x (HTTP client)
├── Moment.js/Day.js: Date manipulation
├── UUID: 9.x (Unique identifiers)
├── QRCode: 1.x (QR generation)
├── PDF-kit: 0.13+ (PDF generation)
└── Jest: 29.x (Testing)
```

#### 2.2.3 DevOps Stack
```
Container & Orchestration:
├── Docker: 24+
├── Docker Compose: 2.x
├── Kubernetes: 1.27+
└── Helm: 3.x

CI/CD:
├── GitHub Actions
├── GitLab CI/CD
└── Jenkins (Alternative)

Cloud Services:
├── AWS/Azure/GCP
├── Amazon RDS (PostgreSQL)
├── Amazon ElastiCache (Redis)
├── Amazon S3 (File storage)
├── Amazon CloudFront (CDN)
├── Amazon Route 53 (DNS)
├── Amazon ELB (Load Balancer)
├── Amazon CloudWatch (Monitoring)
└── Amazon SES (Email service)

Monitoring & Logging:
├── Prometheus: 2.x
├── Grafana: 10.x
├── ELK Stack (Elasticsearch, Logstash, Kibana)
├── Sentry: Error tracking
└── New Relic: APM
```

#### 2.2.4 External Services
```
Payment Gateways:
├── İyzico: Turkish market leader
├── PayTR: Local alternative
├── PayPal: International payments
└── Stripe: Global solution

SMS & Communication:
├── Twilio: International SMS
├── Netgsm: Turkish SMS provider
├── Firebase Cloud Messaging: Push notifications
└── SendGrid: Email service

Maps & Geolocation:
├── Google Maps API: Maps and geocoding
├── OpenStreetMap: Alternative mapping
└── HERE API: Routing and geocoding

Kargo API'leri:
├── Yurtiçi Kargo API
├── Aras Kargo API
├── MNG Kargo API
├── PTT Kargo API
├── UPS API
├── DHL API
├── FedEx API
└── Custom carrier integrations
```

### 2.3 Mimari Kararlar

#### 2.3.1 Monorepo vs Multi-repo
**Seçim**: Monorepo
**Sebep**: 
- Code sharing between mobile and backend
- Consistent versioning
- Simplified CI/CD
- Better developer experience

#### 2.3.2 State Management
**Frontend**: Redux Toolkit + React Query
**Backend**: Stateless design with Redis for sessions

#### 2.3.3 Database Design
**Primary**: PostgreSQL (ACID compliance, complex relationships)
**Cache**: Redis (Sessions, temporary data, rate limiting)
**File Storage**: AWS S3 (Scalable, CDN integration)

---

## 3. Sistem Mimarisi

### 3.1 High-Level Architecture

```mermaid
graph TB
    %% Mobile Apps
    iOS[iOS App<br/>React Native]
    Android[Android App<br/>React Native]
    
    %% Load Balancer
    LB[Load Balancer<br/>NGINX/HAProxy]
    
    %% API Gateway
    Gateway[API Gateway<br/>Express.js]
    
    %% Microservices
    AuthService[Auth Service<br/>JWT + OAuth]
    UserService[User Service<br/>Profile Management]
    ShipmentService[Shipment Service<br/>Order Management]
    PricingService[Pricing Service<br/>Quote Engine]
    PaymentService[Payment Service<br/>Payment Processing]
    NotificationService[Notification Service<br/>Push + SMS + Email]
    TrackingService[Tracking Service<br/>Real-time Updates]
    AdminService[Admin Service<br/>Management Panel]
    
    %% External Services
    CarrierAPIs[Carrier APIs<br/>Yurtiçi, Aras, MNG, DHL]
    PaymentGateways[Payment Gateways<br/>İyzico, PayTR, Stripe]
    SMSService[SMS Service<br/>Twilio, Netgsm]
    EmailService[Email Service<br/>SendGrid]
    MapsAPI[Maps API<br/>Google Maps]
    
    %% Databases
    PostgresMain[(PostgreSQL<br/>Main Database)]
    Redis[(Redis<br/>Cache + Sessions)]
    S3[(AWS S3<br/>File Storage)]
    
    %% Message Queue
    Queue[Message Queue<br/>Bull/Redis]
    
    %% Monitoring
    Monitor[Monitoring<br/>Prometheus + Grafana]
    Logs[Logging<br/>ELK Stack]
    
    %% Connections
    iOS --> LB
    Android --> LB
    LB --> Gateway
    
    Gateway --> AuthService
    Gateway --> UserService
    Gateway --> ShipmentService
    Gateway --> PricingService
    Gateway --> PaymentService
    Gateway --> NotificationService
    Gateway --> TrackingService
    Gateway --> AdminService
    
    AuthService --> PostgresMain
    UserService --> PostgresMain
    ShipmentService --> PostgresMain
    PricingService --> PostgresMain
    PaymentService --> PostgresMain
    
    AuthService --> Redis
    UserService --> Redis
    ShipmentService --> Redis
    PricingService --> Redis
    
    PricingService --> CarrierAPIs
    PaymentService --> PaymentGateways
    NotificationService --> SMSService
    NotificationService --> EmailService
    TrackingService --> MapsAPI
    
    ShipmentService --> S3
    UserService --> S3
    
    NotificationService --> Queue
    TrackingService --> Queue
    
    Gateway --> Monitor
    Gateway --> Logs
```

### 3.2 Microservices Architecture

#### 3.2.1 Auth Service
**Sorumluluklar**:
- User authentication (JWT)
- Password management
- OAuth integrations
- Session management
- Role-based access control

**Endpoints**:
```
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/refresh-token
POST /auth/forgot-password
POST /auth/reset-password
POST /auth/verify-email
POST /auth/verify-phone
```

#### 3.2.2 User Service
**Sorumluluklar**:
- User profile management
- Company profile management
- Address management
- Preferences
- KYC verification

**Endpoints**:
```
GET /users/profile
PUT /users/profile
POST /users/addresses
GET /users/addresses
PUT /users/addresses/:id
DELETE /users/addresses/:id
POST /users/documents
GET /users/documents
```

#### 3.2.3 Shipment Service
**Sorumluluklar**:
- Shipment order creation
- Order management
- Status tracking
- Document management
- Invoice generation

**Endpoints**:
```
POST /shipments
GET /shipments
GET /shipments/:id
PUT /shipments/:id
DELETE /shipments/:id
POST /shipments/:id/cancel
GET /shipments/:id/documents
POST /shipments/:id/documents
```

#### 3.2.4 Pricing Service
**Sorumluluklar**:
- Quote requests to carriers
- Price comparison
- Commission calculation
- Special pricing rules
- Bulk pricing

**Endpoints**:
```
POST /pricing/quote
GET /pricing/quotes/:id
POST /pricing/quotes/:id/accept
GET /pricing/carriers
GET /pricing/calculator
```

#### 3.2.5 Payment Service
**Sorumluluklar**:
- Payment processing
- Invoice management
- Refund handling
- Commission tracking
- Financial reporting

**Endpoints**:
```
POST /payments/process
GET /payments/:id
POST /payments/:id/refund
GET /payments/invoices
GET /payments/history
```

#### 3.2.6 Notification Service
**Sorumluluklar**:
- Push notifications
- SMS notifications
- Email notifications
- Notification preferences
- Delivery tracking

**Endpoints**:
```
POST /notifications/send
GET /notifications/history
PUT /notifications/preferences
POST /notifications/test
```

#### 3.2.7 Tracking Service
**Sorumluluklar**:
- Real-time tracking
- Location updates
- Delivery confirmations
- Proof of delivery
- Route optimization

**Endpoints**:
```
GET /tracking/:shipmentId
POST /tracking/:shipmentId/update
GET /tracking/:shipmentId/history
POST /tracking/:shipmentId/proof-of-delivery
```

### 3.3 Data Flow Architecture

#### 3.3.1 Order Creation Flow
```mermaid
sequenceDiagram
    participant User as Mobile App
    participant Gateway as API Gateway
    participant Auth as Auth Service
    participant Shipment as Shipment Service
    participant Pricing as Pricing Service
    participant Carriers as Carrier APIs
    participant Payment as Payment Service
    participant Notification as Notification Service
    
    User->>Gateway: Create shipment request
    Gateway->>Auth: Validate token
    Auth-->>Gateway: Token valid
    Gateway->>Shipment: Create shipment
    Shipment->>Pricing: Get quotes
    Pricing->>Carriers: Request quotes
    Carriers-->>Pricing: Return quotes
    Pricing-->>Shipment: Compiled quotes
    Shipment-->>Gateway: Shipment with quotes
    Gateway-->>User: Display quotes
    
    User->>Gateway: Select carrier & pay
    Gateway->>Payment: Process payment
    Payment-->>Gateway: Payment confirmed
    Gateway->>Shipment: Confirm order
    Shipment->>Notification: Send confirmation
    Notification-->>User: Push notification
    Shipment-->>Gateway: Order confirmed
    Gateway-->>User: Success response
```

#### 3.3.2 Real-time Tracking Flow
```mermaid
sequenceDiagram
    participant Carrier as Carrier System
    participant Webhook as Webhook Endpoint
    participant Tracking as Tracking Service
    participant Queue as Message Queue
    participant Notification as Notification Service
    participant User as Mobile App
    participant WebSocket as WebSocket Server
    
    Carrier->>Webhook: Status update
    Webhook->>Tracking: Process update
    Tracking->>Queue: Queue notification job
    Queue->>Notification: Process notification
    Notification->>User: Push notification
    Tracking->>WebSocket: Broadcast update
    WebSocket->>User: Real-time update
```

### 3.4 Security Architecture

#### 3.4.1 Authentication Flow
```mermaid
sequenceDiagram
    participant User as Mobile App
    participant Gateway as API Gateway
    participant Auth as Auth Service
    participant DB as Database
    participant Redis as Redis Cache
    
    User->>Gateway: Login request
    Gateway->>Auth: Validate credentials
    Auth->>DB: Check user credentials
    DB-->>Auth: User data
    Auth->>Redis: Store session
    Auth-->>Gateway: JWT tokens
    Gateway-->>User: Access + Refresh tokens
    
    Note over User,Redis: Subsequent requests
    User->>Gateway: API request with token
    Gateway->>Auth: Validate JWT
    Auth->>Redis: Check session
    Redis-->>Auth: Session valid
    Auth-->>Gateway: Token valid
    Gateway->>Gateway: Process request
```

#### 3.4.2 Security Layers
1. **Network Security**: SSL/TLS, VPN, WAF
2. **Application Security**: Input validation, SQL injection prevention
3. **Authentication Security**: JWT, OAuth, 2FA
4. **Authorization Security**: RBAC, resource-based permissions
5. **Data Security**: Encryption at rest and in transit
6. **API Security**: Rate limiting, API keys, CORS

---

## 4. Database Tasarımı

### 4.1 PostgreSQL Schema Design

#### 4.1.1 Core Tables

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('individual', 'business')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE,
    profile_photo_url TEXT,
    language VARCHAR(5) DEFAULT 'tr',
    timezone VARCHAR(50) DEFAULT 'Europe/Istanbul'
);

-- User profiles table (extended information)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    national_id VARCHAR(11),
    tax_number VARCHAR(10),
    preferred_payment_method VARCHAR(20),
    notification_preferences JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    tax_number VARCHAR(10) UNIQUE NOT NULL,
    trade_registry_number VARCHAR(20),
    company_type VARCHAR(50),
    sector VARCHAR(100),
    employee_count INTEGER,
    annual_revenue DECIMAL(15,2),
    website_url TEXT,
    description TEXT,
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Addresses table
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('home', 'work', 'other')),
    country VARCHAR(2) DEFAULT 'TR',
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    neighborhood VARCHAR(100),
    street_address TEXT NOT NULL,
    postal_code VARCHAR(10),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Carriers table
CREATE TABLE carriers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('corporate', 'individual')),
    api_endpoint TEXT,
    api_key_encrypted TEXT,
    commission_rate DECIMAL(5,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    supported_services JSONB,
    coverage_areas JSONB,
    contact_info JSONB,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Shipments table
CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    carrier_id UUID REFERENCES carriers(id) ON DELETE RESTRICT,
    tracking_number VARCHAR(100) UNIQUE,
    internal_tracking_number VARCHAR(100) UNIQUE NOT NULL,
    
    -- Sender information
    sender_name VARCHAR(255) NOT NULL,
    sender_phone VARCHAR(20) NOT NULL,
    sender_address_id UUID REFERENCES addresses(id),
    sender_address_manual JSONB,
    
    -- Receiver information
    receiver_name VARCHAR(255) NOT NULL,
    receiver_phone VARCHAR(20) NOT NULL,
    receiver_address_id UUID REFERENCES addresses(id),
    receiver_address_manual JSONB,
    
    -- Package information
    package_type VARCHAR(50) NOT NULL,
    package_category VARCHAR(50),
    content_description TEXT NOT NULL,
    weight_kg DECIMAL(8,3) NOT NULL,
    dimensions_cm JSONB, -- {"length": 30, "width": 20, "height": 15}
    volume_cm3 DECIMAL(10,2),
    declared_value DECIMAL(12,2),
    
    -- Special requirements
    special_requirements JSONB, -- cooling, fragile, hazardous, etc.
    delivery_instructions TEXT,
    
    -- Pricing
    base_price DECIMAL(12,2) NOT NULL,
    additional_fees DECIMAL(12,2) DEFAULT 0,
    total_price DECIMAL(12,2) NOT NULL,
    commission_amount DECIMAL(12,2) NOT NULL,
    
    -- Status and timing
    status VARCHAR(30) NOT NULL DEFAULT 'draft',
    pickup_date DATE,
    delivery_date DATE,
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    actual_pickup TIMESTAMP WITH TIME ZONE,
    actual_delivery TIMESTAMP WITH TIME ZONE,
    
    -- Payment
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
    payment_method VARCHAR(20),
    
    -- Additional data
    quote_data JSONB,
    carrier_response JSONB,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_shipments_user_id (user_id),
    INDEX idx_shipments_carrier_id (carrier_id),
    INDEX idx_shipments_tracking (tracking_number),
    INDEX idx_shipments_internal_tracking (internal_tracking_number),
    INDEX idx_shipments_status (status),
    INDEX idx_shipments_created_at (created_at),
    INDEX idx_shipments_pickup_date (pickup_date)
);

-- Shipment status history
CREATE TABLE shipment_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL,
    location TEXT,
    description TEXT,
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_shipment_status_history_shipment_id (shipment_id),
    INDEX idx_shipment_status_history_occurred_at (occurred_at)
);

-- Quotes table
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    carrier_id UUID REFERENCES carriers(id) ON DELETE CASCADE,
    
    -- Request data
    request_data JSONB NOT NULL,
    
    -- Quote details
    base_price DECIMAL(12,2) NOT NULL,
    additional_fees JSONB,
    total_price DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TRY',
    
    -- Timing
    estimated_pickup TIMESTAMP WITH TIME ZONE,
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    transit_time_hours INTEGER,
    
    -- Validity
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'accepted', 'rejected')),
    
    -- Additional info
    service_type VARCHAR(50),
    special_services JSONB,
    terms_and_conditions TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_quotes_user_id (user_id),
    INDEX idx_quotes_carrier_id (carrier_id),
    INDEX idx_quotes_status (status),
    INDEX idx_quotes_valid_until (valid_until)
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID REFERENCES shipments(id) ON DELETE RESTRICT,
    user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    
    -- Payment details
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TRY',
    payment_method VARCHAR(20) NOT NULL, -- card, bank_transfer, wallet
    
    -- Gateway details
    gateway_name VARCHAR(50), -- iyzico, paytr, stripe
    gateway_transaction_id VARCHAR(255),
    gateway_response JSONB,
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    processed_at TIMESTAMP WITH TIME ZONE,
    
    -- Additional
    description TEXT,
    metadata JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_payments_shipment_id (shipment_id),
    INDEX idx_payments_user_id (user_id),
    INDEX idx_payments_status (status),
    INDEX idx_payments_processed_at (processed_at)
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    shipment_id UUID REFERENCES shipments(id) ON DELETE SET NULL,
    
    -- Notification content
    type VARCHAR(30) NOT NULL, -- push, sms, email
    title VARCHAR(255),
    message TEXT NOT NULL,
    data JSONB,
    
    -- Channels
    push_sent BOOLEAN DEFAULT FALSE,
    push_sent_at TIMESTAMP WITH TIME ZONE,
    sms_sent BOOLEAN DEFAULT FALSE,
    sms_sent_at TIMESTAMP WITH TIME ZONE,
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    read_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_notifications_user_id (user_id),
    INDEX idx_notifications_type (type),
    INDEX idx_notifications_created_at (created_at)
);

-- Reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    carrier_id UUID REFERENCES carriers(id) ON DELETE CASCADE,
    
    -- Rating
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    
    -- Review content
    title VARCHAR(255),
    comment TEXT,
    
    -- Review aspects
    delivery_speed_rating INTEGER CHECK (delivery_speed_rating >= 1 AND delivery_speed_rating <= 5),
    package_condition_rating INTEGER CHECK (package_condition_rating >= 1 AND package_condition_rating <= 5),
    customer_service_rating INTEGER CHECK (customer_service_rating >= 1 AND customer_service_rating <= 5),
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'deleted')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(shipment_id, user_id),
    INDEX idx_reviews_carrier_id (carrier_id),
    INDEX idx_reviews_rating (rating),
    INDEX idx_reviews_created_at (created_at)
);

-- Files table
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
    
    -- File information
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    
    -- Storage
    storage_path TEXT NOT NULL,
    public_url TEXT,
    
    -- Purpose
    purpose VARCHAR(50) NOT NULL, -- invoice, receipt, document, photo
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_files_user_id (user_id),
    INDEX idx_files_shipment_id (shipment_id),
    INDEX idx_files_purpose (purpose)
);

-- Admin users table
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'support', 'viewer')),
    permissions JSONB,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- Can be regular user or admin user
    user_type VARCHAR(10) CHECK (user_type IN ('user', 'admin')),
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_audit_logs_user_id (user_id),
    INDEX idx_audit_logs_action (action),
    INDEX idx_audit_logs_resource_type (resource_type),
    INDEX idx_audit_logs_created_at (created_at)
);

-- System settings table
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 4.1.2 Indexes and Performance Optimization

```sql
-- Performance indexes
CREATE INDEX CONCURRENTLY idx_shipments_user_created_at 
ON shipments (user_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_shipments_status_updated_at 
ON shipments (status, updated_at DESC);

CREATE INDEX CONCURRENTLY idx_quotes_user_valid_until 
ON quotes (user_id, valid_until DESC) WHERE status = 'active';

CREATE INDEX CONCURRENTLY idx_notifications_user_unread 
ON notifications (user_id, created_at DESC) WHERE read_at IS NULL;

-- Full text search indexes
CREATE INDEX CONCURRENTLY idx_shipments_content_description_fts
ON shipments USING gin(to_tsvector('turkish', content_description));

CREATE INDEX CONCURRENTLY idx_carriers_name_fts
ON carriers USING gin(to_tsvector('turkish', name));

-- Geospatial indexes
CREATE INDEX CONCURRENTLY idx_addresses_location
ON addresses USING gist(point(longitude, latitude));

-- Partial indexes
CREATE INDEX CONCURRENTLY idx_shipments_active_tracking
ON shipments (tracking_number) WHERE status IN ('picked_up', 'in_transit');

CREATE INDEX CONCURRENTLY idx_users_active_email
ON users (email) WHERE status = 'active';
```

#### 4.1.3 Database Views

```sql
-- Shipment summary view
CREATE VIEW shipment_summary AS
SELECT 
    s.id,
    s.internal_tracking_number,
    s.tracking_number,
    s.status,
    s.sender_name,
    s.receiver_name,
    s.total_price,
    s.created_at,
    s.estimated_delivery,
    c.name as carrier_name,
    c.logo_url as carrier_logo,
    u.first_name || ' ' || u.last_name as user_full_name,
    COUNT(sh.id) as status_update_count
FROM shipments s
JOIN carriers c ON s.carrier_id = c.id
JOIN users u ON s.user_id = u.id
LEFT JOIN shipment_status_history sh ON s.id = sh.shipment_id
GROUP BY s.id, c.id, u.id;

-- User statistics view
CREATE VIEW user_statistics AS
SELECT 
    u.id,
    u.email,
    u.first_name || ' ' || u.last_name as full_name,
    u.user_type,
    COUNT(s.id) as total_shipments,
    SUM(s.total_price) as total_spent,
    AVG(s.total_price) as average_shipment_value,
    MAX(s.created_at) as last_shipment_date
FROM users u
LEFT JOIN shipments s ON u.id = s.user_id
GROUP BY u.id;

-- Carrier performance view
CREATE VIEW carrier_performance AS
SELECT 
    c.id,
    c.name,
    c.type,
    COUNT(s.id) as total_shipments,
    AVG(r.rating) as average_rating,
    COUNT(r.id) as total_reviews,
    AVG(EXTRACT(EPOCH FROM (s.actual_delivery - s.actual_pickup))/3600) as average_delivery_time_hours,
    SUM(s.commission_amount) as total_commission_earned
FROM carriers c
LEFT JOIN shipments s ON c.id = s.carrier_id
LEFT JOIN reviews r ON c.id = r.carrier_id AND r.status = 'active'
GROUP BY c.id;
```

### 4.2 Redis Data Structures

#### 4.2.1 Session Management
```
Pattern: session:{user_id}
Type: Hash
TTL: 24 hours
Fields:
- user_id: UUID
- email: string
- user_type: string
- last_activity: timestamp
- ip_address: string
- device_info: JSON
```

#### 4.2.2 Rate Limiting
```
Pattern: rate_limit:{endpoint}:{user_id}
Type: String
TTL: 1 hour
Value: request_count
```

#### 4.2.3 Quote Cache
```
Pattern: quote:{quote_id}
Type: Hash
TTL: Quote validity period
Fields:
- carrier_quotes: JSON
- request_data: JSON
- created_at: timestamp
- valid_until: timestamp
```

#### 4.2.4 Real-time Tracking
```
Pattern: tracking:{shipment_id}
Type: Hash
TTL: 30 days
Fields:
- current_status: string
- last_location: JSON
- update_timestamp: timestamp
- subscriber_count: number
```

#### 4.2.5 Background Jobs Queue
```
Pattern: bull:queue:{queue_name}
Queues:
- email_notifications
- sms_notifications
- push_notifications
- carrier_api_calls
- file_processing
- report_generation
```

---

## 5. API Dokümantasyonu

### 5.1 API Design Principles

#### 5.1.1 RESTful Design
- **Resource-based URLs**: `/users`, `/shipments`, `/quotes`
- **HTTP methods**: GET, POST, PUT, DELETE, PATCH
- **Status codes**: Proper HTTP status code usage
- **Consistent naming**: snake_case for JSON, kebab-case for URLs

#### 5.1.2 API Versioning
```
URL Versioning: /api/v1/...
Header Versioning: Accept: application/vnd.cargolink.v1+json
```

#### 5.1.3 Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "timestamp": "2024-01-15T10:30:00Z",
  "request_id": "req_123456789"
}
```

#### 5.1.4 Error Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "request_id": "req_123456789"
}
```

### 5.2 Authentication & Authorization

#### 5.2.1 JWT Token Structure
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "user_id": "uuid",
    "email": "user@example.com",
    "user_type": "individual|business",
    "roles": ["user"],
    "iat": 1642248600,
    "exp": 1642335000
  }
}
```

#### 5.2.2 Auth Endpoints

```yaml
# Register new user
POST /api/v1/auth/register
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+905551234567",
  "user_type": "individual"
}

Response (201):
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "user_type": "individual",
      "email_verified": false,
      "phone_verified": false
    },
    "tokens": {
      "access_token": "jwt_access_token",
      "refresh_token": "jwt_refresh_token",
      "expires_in": 3600
    }
  }
}

# Login user
POST /api/v1/auth/login
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "password": "SecurePass123"
}

Response (200):
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "user_type": "individual"
    },
    "tokens": {
      "access_token": "jwt_access_token",
      "refresh_token": "jwt_refresh_token",
      "expires_in": 3600
    }
  }
}

# Refresh token
POST /api/v1/auth/refresh
Content-Type: application/json

Request:
{
  "refresh_token": "jwt_refresh_token"
}

Response (200):
{
  "success": true,
  "data": {
    "access_token": "new_jwt_access_token",
    "expires_in": 3600
  }
}

# Logout
POST /api/v1/auth/logout
Authorization: Bearer {access_token}

Response (200):
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 5.3 User Management APIs

```yaml
# Get user profile
GET /api/v1/users/profile
Authorization: Bearer {access_token}

Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+905551234567",
    "user_type": "individual",
    "email_verified": true,
    "phone_verified": true,
    "profile_photo_url": "https://...",
    "language": "tr",
    "timezone": "Europe/Istanbul",
    "created_at": "2024-01-15T10:30:00Z"
  }
}

# Update user profile
PUT /api/v1/users/profile
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "first_name": "John",
  "last_name": "Smith",
  "phone": "+905551234567",
  "language": "en",
  "timezone": "Europe/Istanbul"
}

Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "first_name": "John",
    "last_name": "Smith",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}

# Get user addresses
GET /api/v1/users/addresses
Authorization: Bearer {access_token}

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Home",
      "type": "home",
      "country": "TR",
      "city": "Istanbul",
      "district": "Kadıköy",
      "neighborhood": "Moda",
      "street_address": "Example Street No: 123",
      "postal_code": "34710",
      "latitude": 40.9856,
      "longitude": 29.0253,
      "is_default": true
    }
  ]
}

# Add new address
POST /api/v1/users/addresses
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "title": "Office",
  "type": "work",
  "city": "Istanbul",
  "district": "Beşiktaş",
  "neighborhood": "Levent",
  "street_address": "Business Street No: 456",
  "postal_code": "34330"
}

Response (201):
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Office",
    "type": "work",
    "city": "Istanbul",
    "district": "Beşiktaş",
    "is_default": false,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### 5.4 Shipment Management APIs

```yaml
# Create shipment quote request
POST /api/v1/shipments/quote
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "sender": {
    "name": "John Doe",
    "phone": "+905551234567",
    "address_id": "sender_address_uuid"
  },
  "receiver": {
    "name": "Jane Smith",
    "phone": "+905559876543",
    "address": {
      "city": "Ankara",
      "district": "Çankaya",
      "street_address": "Receiver Street No: 789"
    }
  },
  "package": {
    "type": "box",
    "category": "electronics",
    "content_description": "Laptop computer",
    "weight_kg": 2.5,
    "dimensions_cm": {
      "length": 40,
      "width": 30,
      "height": 8
    },
    "declared_value": 5000
  },
  "special_requirements": ["fragile"],
  "delivery_instructions": "Call before delivery",
  "preferred_pickup_date": "2024-01-20"
}

Response (200):
{
  "success": true,
  "data": {
    "quote_id": "quote_uuid",
    "quotes": [
      {
        "carrier_id": "carrier_uuid",
        "carrier_name": "Yurtiçi Kargo",
        "carrier_logo": "https://...",
        "service_type": "standard",
        "price": {
          "base_price": 25.50,
          "additional_fees": 3.50,
          "total_price": 29.00,
          "currency": "TRY"
        },
        "timing": {
          "estimated_pickup": "2024-01-20T09:00:00Z",
          "estimated_delivery": "2024-01-22T17:00:00Z",
          "transit_time_hours": 48
        },
        "special_services": ["insurance", "sms_notification"],
        "valid_until": "2024-01-20T23:59:59Z"
      },
      {
        "carrier_id": "carrier_uuid_2",
        "carrier_name": "Aras Kargo",
        "carrier_logo": "https://...",
        "service_type": "express",
        "price": {
          "base_price": 35.00,
          "additional_fees": 5.00,
          "total_price": 40.00,
          "currency": "TRY"
        },
        "timing": {
          "estimated_pickup": "2024-01-20T10:00:00Z",
          "estimated_delivery": "2024-01-21T14:00:00Z",
          "transit_time_hours": 24
        },
        "special_services": ["insurance", "sms_notification", "email_notification"],
        "valid_until": "2024-01-20T23:59:59Z"
      }
    ],
    "valid_until": "2024-01-20T23:59:59Z"
  }
}

# Create shipment from quote
POST /api/v1/shipments
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "quote_id": "quote_uuid",
  "selected_carrier_id": "carrier_uuid",
  "payment_method": "card",
  "payment_details": {
    "card_token": "card_token_from_payment_gateway"
  }
}

Response (201):
{
  "success": true,
  "data": {
    "shipment_id": "shipment_uuid",
    "internal_tracking_number": "CL2024001234",
    "tracking_number": "YK1234567890",
    "status": "payment_pending",
    "total_price": 29.00,
    "estimated_delivery": "2024-01-22T17:00:00Z",
    "payment_url": "https://payment.gateway.com/pay/..."
  }
}

# Get user shipments
GET /api/v1/shipments?page=1&limit=20&status=all&sort=created_at&order=desc
Authorization: Bearer {access_token}

Response (200):
{
  "success": true,
  "data": {
    "shipments": [
      {
        "id": "shipment_uuid",
        "internal_tracking_number": "CL2024001234",
        "tracking_number": "YK1234567890",
        "status": "in_transit",
        "sender_name": "John Doe",
        "receiver_name": "Jane Smith",
        "carrier_name": "Yurtiçi Kargo",
        "carrier_logo": "https://...",
        "total_price": 29.00,
        "estimated_delivery": "2024-01-22T17:00:00Z",
        "created_at": "2024-01-20T10:30:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_count": 87,
      "per_page": 20,
      "has_next": true,
      "has_prev": false
    }
  }
}

# Get shipment details
GET /api/v1/shipments/{shipment_id}
Authorization: Bearer {access_token}

Response (200):
{
  "success": true,
  "data": {
    "id": "shipment_uuid",
    "internal_tracking_number": "CL2024001234",
    "tracking_number": "YK1234567890",
    "status": "in_transit",
    "sender": {
      "name": "John Doe",
      "phone": "+905551234567",
      "address": {
        "city": "Istanbul",
        "district": "Kadıköy",
        "street_address": "Sender Street No: 123"
      }
    },
    "receiver": {
      "name": "Jane Smith",
      "phone": "+905559876543",
      "address": {
        "city": "Ankara",
        "district": "Çankaya",
        "street_address": "Receiver Street No: 789"
      }
    },
    "package": {
      "type": "box",
      "content_description": "Laptop computer",
      "weight_kg": 2.5,
      "dimensions_cm": {
        "length": 40,
        "width": 30,
        "height": 8
      }
    },
    "carrier": {
      "id": "carrier_uuid",
      "name": "Yurtiçi Kargo",
      "logo": "https://..."
    },
    "pricing": {
      "base_price": 25.50,
      "additional_fees": 3.50,
      "total_price": 29.00,
      "currency": "TRY"
    },
    "timing": {
      "created_at": "2024-01-20T10:30:00Z",
      "estimated_pickup": "2024-01-20T15:00:00Z",
      "actual_pickup": "2024-01-20T14:30:00Z",
      "estimated_delivery": "2024-01-22T17:00:00Z",
      "actual_delivery": null
    },
    "payment": {
      "status": "paid",
      "method": "card",
      "processed_at": "2024-01-20T10:35:00Z"
    },
    "status_history": [
      {
        "status": "payment_confirmed",
        "location": "Istanbul",
        "description": "Payment confirmed, preparing for pickup",
        "occurred_at": "2024-01-20T10:35:00Z"
      },
      {
        "status": "picked_up",
        "location": "Istanbul, Kadıköy",
        "description": "Package picked up from sender",
        "occurred_at": "2024-01-20T14:30:00Z"
      },
      {
        "status": "in_transit",
        "location": "Istanbul, Sorting Facility",
        "description": "Package sorted and dispatched",
        "occurred_at": "2024-01-20T18:00:00Z"
      }
    ]
  }
}
```

### 5.5 Real-time Tracking APIs

```yaml
# Get real-time tracking
GET /api/v1/tracking/{shipment_id}
Authorization: Bearer {access_token}

Response (200):
{
  "success": true,
  "data": {
    "shipment_id": "shipment_uuid",
    "tracking_number": "YK1234567890",
    "current_status": "in_transit",
    "current_location": {
      "city": "Ankara",
      "description": "Ankara Sorting Facility",
      "latitude": 39.9334,
      "longitude": 32.8597
    },
    "last_update": "2024-01-21T08:30:00Z",
    "estimated_delivery": "2024-01-22T17:00:00Z",
    "progress_percentage": 75,
    "status_history": [
      {
        "status": "picked_up",
        "location": "Istanbul, Kadıköy",
        "occurred_at": "2024-01-20T14:30:00Z"
      },
      {
        "status": "in_transit",
        "location": "Istanbul, Sorting Facility",
        "occurred_at": "2024-01-20T18:00:00Z"
      },
      {
        "status": "in_transit",
        "location": "Ankara, Sorting Facility",
        "occurred_at": "2024-01-21T08:30:00Z"
      }
    ],
    "route_map": {
      "origin": {
        "latitude": 40.9856,
        "longitude": 29.0253
      },
      "destination": {
        "latitude": 39.9208,
        "longitude": 32.8541
      },
      "current_position": {
        "latitude": 39.9334,
        "longitude": 32.8597
      },
      "waypoints": [
        {
          "name": "Istanbul Sorting Facility",
          "latitude": 40.9856,
          "longitude": 29.0253,
          "reached_at": "2024-01-20T18:00:00Z"
        },
        {
          "name": "Ankara Sorting Facility",
          "latitude": 39.9334,
          "longitude": 32.8597,
          "reached_at": "2024-01-21T08:30:00Z"
        }
      ]
    }
  }
}

# WebSocket connection for real-time updates
WS /api/v1/tracking/ws
Authorization: Bearer {access_token}

# Subscribe to shipment updates
Send:
{
  "action": "subscribe",
  "shipment_ids": ["shipment_uuid_1", "shipment_uuid_2"]
}

# Receive real-time updates
Receive:
{
  "type": "status_update",
  "data": {
    "shipment_id": "shipment_uuid",
    "tracking_number": "YK1234567890",
    "status": "out_for_delivery",
    "location": "Ankara, Çankaya",
    "description": "Package is out for delivery",
    "occurred_at": "2024-01-22T09:00:00Z",
    "estimated_delivery": "2024-01-22T14:00:00Z"
  }
}
```

### 5.6 Payment APIs

```yaml
# Process payment
POST /api/v1/payments/process
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "shipment_id": "shipment_uuid",
  "payment_method": "card",
  "payment_details": {
    "gateway": "iyzico",
    "card_number": "5528790000000008",
    "expiry_month": "12",
    "expiry_year": "2030",
    "cvc": "123",
    "cardholder_name": "John Doe"
  },
  "billing_address": {
    "country": "TR",
    "city": "Istanbul",
    "district": "Kadıköy",
    "address": "Billing Address"
  }
}

Response (200):
{
  "success": true,
  "data": {
    "payment_id": "payment_uuid",
    "status": "success",
    "transaction_id": "iyzico_transaction_id",
    "amount": 29.00,
    "currency": "TRY",
    "processed_at": "2024-01-20T10:35:00Z",
    "receipt_url": "https://..."
  }
}

# Get payment history
GET /api/v1/payments/history?page=1&limit=20
Authorization: Bearer {access_token}

Response (200):
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "payment_uuid",
        "shipment_id": "shipment_uuid",
        "amount": 29.00,
        "currency": "TRY",
        "payment_method": "card",
        "status": "success",
        "processed_at": "2024-01-20T10:35:00Z",
        "description": "Shipment payment - CL2024001234"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_count": 45
    }
  }
}
```

### 5.7 Notification APIs

```yaml
# Get notifications
GET /api/v1/notifications?page=1&limit=20&unread_only=false
Authorization: Bearer {access_token}

Response (200):
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notification_uuid",
        "type": "shipment_update",
        "title": "Package Delivered",
        "message": "Your package CL2024001234 has been delivered successfully",
        "data": {
          "shipment_id": "shipment_uuid",
          "tracking_number": "YK1234567890"
        },
        "read_at": null,
        "created_at": "2024-01-22T15:30:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_count": 87,
      "unread_count": 12
    }
  }
}

# Mark notification as read
PUT /api/v1/notifications/{notification_id}/read
Authorization: Bearer {access_token}

Response (200):
{
  "success": true,
  "data": {
    "id": "notification_uuid",
    "read_at": "2024-01-22T16:00:00Z"
  }
}

# Update notification preferences
PUT /api/v1/notifications/preferences
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "push_notifications": true,
  "sms_notifications": true,
  "email_notifications": false,
  "notification_types": {
    "shipment_updates": true,
    "payment_confirmations": true,
    "promotional": false
  }
}

Response (200):
{
  "success": true,
  "data": {
    "preferences_updated": true
  }
}
```

### 5.8 Carrier Integration APIs (Internal)

```yaml
# Webhook endpoint for carrier status updates
POST /api/v1/webhooks/carriers/{carrier_id}/status-update
Content-Type: application/json
Authorization: Bearer {carrier_api_key}

Request:
{
  "tracking_number": "YK1234567890",
  "status": "delivered",
  "location": "Ankara, Çankaya",
  "description": "Package delivered to recipient",
  "occurred_at": "2024-01-22T15:30:00Z",
  "proof_of_delivery": {
    "recipient_name": "Jane Smith",
    "signature_url": "https://...",
    "photo_url": "https://..."
  }
}

Response (200):
{
  "success": true,
  "message": "Status update processed"
}

# Get carrier quote (for carrier integrations)
POST /api/v1/carriers/{carrier_id}/quote
Content-Type: application/json
Authorization: Bearer {internal_api_key}

Request:
{
  "sender_address": {
    "country": "TR",
    "city": "Istanbul",
    "district": "Kadıköy",
    "postal_code": "34710"
  },
  "receiver_address": {
    "country": "TR",
    "city": "Ankara",
    "district": "Çankaya",
    "postal_code": "06550"
  },
  "package": {
    "weight_kg": 2.5,
    "dimensions_cm": {
      "length": 40,
      "width": 30,
      "height": 8
    },
    "declared_value": 5000
  },
  "service_type": "standard"
}

Response (200):
{
  "success": true,
  "data": {
    "quote_id": "carrier_quote_id",
    "price": 25.50,
    "currency": "TRY",
    "estimated_pickup": "2024-01-20T15:00:00Z",
    "estimated_delivery": "2024-01-22T17:00:00Z",
    "valid_until": "2024-01-20T23:59:59Z"
  }
}
```

---

## 6. Frontend (React Native) Mimarisi

### 6.1 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Generic components
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Modal/
│   │   ├── Loading/
│   │   └── ErrorBoundary/
│   ├── forms/           # Form components
│   │   ├── LoginForm/
│   │   ├── ShipmentForm/
│   │   └── AddressForm/
│   └── navigation/      # Navigation components
│       ├── TabBar/
│       └── Header/
├── screens/             # Screen components
│   ├── auth/           # Authentication screens
│   │   ├── LoginScreen/
│   │   ├── RegisterScreen/
│   │   └── ForgotPasswordScreen/
│   ├── main/           # Main app screens
│   │   ├── HomeScreen/
│   │   ├── QuoteScreen/
│   │   ├── ShipmentsScreen/
│   │   └── ProfileScreen/
│   ├── shipment/       # Shipment related screens
│   │   ├── CreateShipmentScreen/
│   │   ├── QuoteResultsScreen/
│   │   ├── ShipmentDetailsScreen/
│   │   └── TrackingScreen/
│   └── onboarding/     # Onboarding screens
├── navigation/         # Navigation configuration
│   ├── AppNavigator.tsx
│   ├── AuthNavigator.tsx
│   └── MainTabNavigator.tsx
├── store/              # Redux store configuration
│   ├── index.ts
│   ├── rootReducer.ts
│   └── slices/
│       ├── authSlice.ts
│       ├── userSlice.ts
│       ├── shipmentSlice.ts
│       └── notificationSlice.ts
├── services/           # API and external services
│   ├── api/
│   │   ├── client.ts
│   │   ├── authApi.ts
│   │   ├── userApi.ts
│   │   ├── shipmentApi.ts
│   │   └── paymentApi.ts
│   ├── notifications/
│   └── tracking/
├── hooks/              # Custom React hooks
│   ├── useAuth.ts
│   ├── useShipments.ts
│   ├── useTracking.ts
│   └── useNotifications.ts
├── utils/              # Utility functions
│   ├── validation.ts
│   ├── formatting.ts
│   ├── constants.ts
│   └── helpers.ts
├── types/              # TypeScript type definitions
│   ├── auth.ts
│   ├── user.ts
│   ├── shipment.ts
│   └── api.ts
├── assets/             # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
└── styles/             # Global styles and theme
    ├── theme.ts
    ├── colors.ts
    └── typography.ts
```

### 6.2 State Management Architecture

#### 6.2.1 Redux Store Structure

```typescript
// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import rootReducer from './rootReducer';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'user'], // Only persist auth and user state
};

const persistedReducer =
 persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

#### 6.2.2 Redux Slices

```typescript
// store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../services/api/authApi';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'individual' | 'business';
  emailVerified: boolean;
  phoneVerified: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Login failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.tokens.accessToken;
        state.refreshToken = action.payload.tokens.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
```

### 6.3 Navigation Architecture

```typescript
// navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';

const Stack = createNativeStackNavigator();

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
```

### 6.4 UI Components

#### 6.4.1 Shipment Form Component

```typescript
// components/forms/ShipmentForm.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';

const ShipmentForm: React.FC = () => {
  const { control, handleSubmit, formState: { errors } } = useForm();
  const [currentStep, setCurrentStep] = useState(1);

  const onSubmit = (data: any) => {
    console.log('Form submitted:', data);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.progressBar}>
        {[1, 2, 3].map((step) => (
          <View
            key={step}
            style={[
              styles.progressStep,
              currentStep >= step && styles.progressStepActive,
            ]}
          />
        ))}
      </View>
      {/* Form steps implementation */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  progressStep: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 4,
    borderRadius: 2,
  },
  progressStepActive: {
    backgroundColor: '#007AFF',
  },
});

export default ShipmentForm;
```

---

## 7. Backend (Node.js/Express) Mimarisi

### 7.1 Project Structure

```
backend/
├── src/
│   ├── controllers/        # Request handlers
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   ├── shipmentController.ts
│   │   ├── paymentController.ts
│   │   └── notificationController.ts
│   ├── services/           # Business logic
│   │   ├── authService.ts
│   │   ├── userService.ts
│   │   ├── shipmentService.ts
│   │   ├── pricingService.ts
│   │   └── paymentService.ts
│   ├── routes/             # API routes
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── shipments.ts
│   │   └── payments.ts
│   ├── middleware/         # Custom middleware
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   └── errorHandler.ts
│   ├── integrations/       # External API integrations
│   │   ├── carriers/
│   │   ├── payments/
│   │   └── notifications/
│   └── utils/              # Utility functions
├── prisma/
│   └── schema.prisma
├── docker/
└── scripts/
```

### 7.2 Express Application Setup

```typescript
// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import shipmentRoutes from './routes/shipments';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/shipments', shipmentRoutes);

// Error handling
app.use(errorHandler);

export default app;
```

### 7.3 Service Layer

```typescript
// src/services/shipmentService.ts
import { PrismaClient } from '@prisma/client';
import { pricingService } from './pricingService';
import { notificationService } from './notificationService';

const prisma = new PrismaClient();

export class ShipmentService {
  async createQuote(request: QuoteRequest) {
    try {
      // Get quotes from pricing service
      const quotes = await pricingService.getQuotes(request);

      // Save quote to database
      const quoteRecord = await prisma.quotes.create({
        data: {
          userId: request.userId,
          requestData: request,
          validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
          status: 'active',
        },
      });

      return {
        quoteId: quoteRecord.id,
        quotes: quotes,
        validUntil: quoteRecord.validUntil,
      };
    } catch (error) {
      throw new Error('Failed to create quote');
    }
  }

  async createShipment(request: CreateShipmentRequest) {
    // Implementation for shipment creation
    // Including payment processing, carrier integration
  }
}

export const shipmentService = new ShipmentService();
```

---

## 8. Professional Website Architecture

### 8.1 Web Sitesi Genel Bakış

#### 8.1.1 Proje Vizyonu
CargoLink Professional Website, Stripe ve PayPal'a benzer şekilde tasarlanmış modern, profesyonel ve kullanıcı dostu bir web platformudur. Türk lojistik sektörüne odaklanarak, hem bireysel hem de kurumsal kullanıcılara hitap eden kapsamlı bir dijital çözüm sunar.

#### 8.1.2 Teknik Stack
```typescript
// Next.js 14 Modern Web Architecture
Framework: Next.js 14 with App Router
├── TypeScript: 5.2+ (Type Safety)
├── React: 18.2+ (UI Framework)
├── Tailwind CSS: 3.3+ (Utility-first Styling)
├── Radix UI: Modern Component Library
├── Framer Motion: Animation Library
├── Next Themes: Dark/Light Mode Support
├── React Hook Form: Form Management
├── Zod: Schema Validation
├── Lucide React: Icon Library
├── Class Variance Authority: Component Variants
└── ESLint + Prettier: Code Quality
```

#### 8.1.3 Design Philosophy
- **Stripe-inspired**: Clean, minimal, professional appearance
- **Turkish Market Focus**: Türkçe içerik ve yerel ihtiyaçlara odaklanma
- **Mobile-first**: Responsive tasarım yaklaşımı
- **Accessibility**: WCAG 2.1 AA uyumlu tasarım
- **Performance**: Lighthouse 90+ skor hedefi

### 8.2 Next.js 14 Modern Architecture

#### 8.2.1 App Router Structure
```
src/app/
├── globals.css                 # Global styles
├── layout.tsx                  # Root layout
├── page.tsx                    # Homepage
├── loading.tsx                 # Loading UI
├── error.tsx                   # Error UI
├── not-found.tsx              # 404 page
│
├── (marketing)/               # Route groups
│   ├── about/
│   │   └── page.tsx           # About page
│   ├── pricing/
│   │   └── page.tsx           # Pricing page
│   ├── contact/
│   │   └── page.tsx           # Contact page
│   └── blog/
│       ├── page.tsx           # Blog listing
│       └── [slug]/
│           └── page.tsx       # Blog post
│
├── (dashboard)/               # User dashboard
│   ├── layout.tsx             # Dashboard layout
│   ├── dashboard/
│   │   ├── page.tsx           # Dashboard home
│   │   ├── shipments/
│   │   │   ├── page.tsx       # Shipments list
│   │   │   ├── create/
│   │   │   │   └── page.tsx   # Create shipment
│   │   │   └── [id]/
│   │   │       └── page.tsx   # Shipment detail
│   │   ├── tracking/
│   │   │   └── [trackingId]/
│   │   │       └── page.tsx   # Live tracking
│   │   └── profile/
│   │       └── page.tsx       # User profile
│   └── api/                   # API routes
│       ├── auth/
│       ├── shipments/
│       └── tracking/
│
└── (legal)/                  # Legal pages
    ├── privacy/
    │   └── page.tsx           # Privacy policy
    ├── terms/
    │   └── page.tsx           # Terms of service
    └── gdpr/
        └── page.tsx           # GDPR compliance
```

#### 8.2.2 Component Architecture
```
src/components/
├── ui/                        # Base UI components
│   ├── button.tsx             # Button variants
│   ├── input.tsx              # Form inputs
│   ├── card.tsx               # Card layouts
│   ├── navigation-menu.tsx    # Navigation component
│   ├── dialog.tsx             # Modal dialogs
│   ├── accordion.tsx          # Collapsible content
│   ├── tabs.tsx               # Tab navigation
│   ├── separator.tsx          # Visual separators
│   ├── avatar.tsx             # User avatars
│   └── theme-provider.tsx     # Theme management
│
├── layout/                    # Layout components
│   ├── header.tsx             # Site header
│   ├── footer.tsx             # Site footer
│   ├── sidebar.tsx            # Dashboard sidebar
│   └── breadcrumbs.tsx        # Navigation breadcrumbs
│
├── sections/                  # Landing page sections
│   ├── hero-section.tsx       # Hero/banner section
│   ├── stats-section.tsx      # Statistics display
│   ├── features-section.tsx   # Feature showcase
│   ├── how-it-works-section.tsx  # Process explanation
│   ├── pricing-section.tsx    # Pricing plans
│   ├── testimonials-section.tsx  # Customer testimonials
│   └── cta-section.tsx        # Call-to-action
│
├── forms/                     # Form components
│   ├── shipment-form.tsx      # Shipment creation
│   ├── contact-form.tsx       # Contact form
│   ├── login-form.tsx         # Authentication
│   └── quote-form.tsx         # Quick quote
│
└── dashboard/                 # Dashboard-specific components
    ├── shipment-card.tsx      # Shipment display
    ├── tracking-map.tsx       # Live tracking
    ├── analytics-widget.tsx   # Dashboard widgets
    └── notification-center.tsx # Notifications
```

### 8.3 Shared Backend Integration

#### 8.3.1 API Integration Architecture
```typescript
// src/lib/api.ts - Shared API client
import { APIResponse, ShipmentRequest, QuoteResponse } from '@cargolink/shared';

class CargoLinkAPI {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://api.cargolink.com';
    this.apiKey = process.env.API_KEY || '';
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return this.handleResponse<AuthResponse>(response);
  }

  // Shipment management
  async createShipment(data: ShipmentRequest): Promise<ShipmentResponse> {
    return this.authenticatedRequest('/shipments', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getQuotes(request: QuoteRequest): Promise<QuoteResponse[]> {
    return this.authenticatedRequest('/shipments/quote', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  // Real-time tracking
  async trackShipment(trackingId: string): Promise<TrackingInfo> {
    return this.authenticatedRequest(`/tracking/${trackingId}`);
  }

  // WebSocket connection for real-time updates
  createTrackingSocket(trackingId: string): WebSocket {
    const token = this.getAuthToken();
    return new WebSocket(
      `${this.baseURL.replace('http', 'ws')}/tracking/ws?token=${token}&trackingId=${trackingId}`
    );
  }

  private async authenticatedRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
    return this.handleResponse<T>(response);
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json();
      throw new APIError(error.message, response.status);
    }
    return response.json();
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('cargolink_token');
  }
}

export const cargoLinkAPI = new CargoLinkAPI();
```

#### 8.3.2 Type Safety with Shared Types
```typescript
// Shared types from @cargolink/shared package
import {
  User,
  Shipment,
  Quote,
  TrackingInfo,
  PaymentMethod,
  CarrierInfo,
  AddressInfo,
  PackageInfo
} from '@cargolink/shared';

// Website-specific types
export interface LandingPageProps {
  hero: HeroContent;
  features: FeatureItem[];
  testimonials: Testimonial[];
  pricing: PricingPlan[];
}

export interface DashboardData {
  user: User;
  recentShipments: Shipment[];
  activeTracking: TrackingInfo[];
  notifications: Notification[];
  analytics: DashboardAnalytics;
}

export interface QuoteFormData {
  sender: AddressInfo;
  receiver: AddressInfo;
  package: PackageInfo;
  preferences: ShipmentPreferences;
}
```

### 8.4 SEO ve Performance Optimization

#### 8.4.1 Next.js 14 SEO Features
```typescript
// src/app/layout.tsx - Root layout with SEO
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CargoLink - Türkiye\'nin En Kapsamlı Lojistik Platformu',
  description: 'CargoLink ile tüm kargo ve lojistik ihtiyaçlarınızı tek platformdan yönetin. Hızlı, güvenilir ve ekonomik kargo çözümleri.',
  keywords: [
    'kargo', 'lojistik', 'kargo takibi', 'kargo gönderimi',
    'yurtiçi kargo', 'aras kargo', 'mng kargo', 
    'kargo fiyat karşılaştırma', 'dijital lojistik', 'CargoLink'
  ].join(', '),
  authors: [{ name: 'CargoLink Team' }],
  creator: 'CargoLink',
  publisher: 'CargoLink',
  metadataBase: new URL('https://cargolink.com'),
  alternates: {
    canonical: '/',
    languages: {
      'tr-TR': '/tr',
      'en-US': '/en',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: '/',
    title: 'CargoLink - Türkiye\'nin En Kapsamlı Lojistik Platformu',
    description: 'CargoLink ile tüm kargo ve lojistik ihtiyaçlarınızı tek platformdan yönetin.',
    siteName: 'CargoLink',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CargoLink - Lojistik Platformu',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CargoLink - Türkiye\'nin En Kapsamlı Lojistik Platformu',
    description: 'CargoLink ile tüm kargo ve lojistik ihtiyaçlarınızı tek platformdan yönetin.',
    images: ['/twitter-image.png'],
    creator: '@cargolink',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};
```

#### 8.4.2 Performance Optimizations
```typescript
// next.config.js - Performance configuration
/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router
  experimental: {
    appDir: true,
  },
  
  // Image optimization
  images: {
    domains: ['localhost', 'api.cargolink.com', 'cdn.cargolink.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Compression
  compress: true,
  
  // Bundle analysis
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/dashboard/overview',
        permanent: true,
      },
    ];
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### 8.5 Component Library ve Design System

#### 8.5.1 Tailwind CSS Configuration
```typescript
// tailwind.config.ts - CargoLink Design System
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // CargoLink Brand Colors
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',  // Main brand color
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        cargolink: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',  // Secondary brand color
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-in-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'bounce-gentle': 'bounce-gentle 2s infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

#### 8.5.2 Modern Component Examples
```typescript
// src/components/ui/button.tsx - Button component
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        cargolink: "bg-cargolink-500 text-white hover:bg-cargolink-600",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

### 8.6 Business-Focused Pages

#### 8.6.1 Landing Page Architecture
```typescript
// src/app/page.tsx - Main landing page
import { HeroSection } from '@/components/sections/hero-section';
import { StatsSection } from '@/components/sections/stats-section';
import { FeaturesSection } from '@/components/sections/features-section';
import { HowItWorksSection } from '@/components/sections/how-it-works-section';
import { PricingSection } from '@/components/sections/pricing-section';
import { TestimonialsSection } from '@/components/sections/testimonials-section';
import { CTASection } from '@/components/sections/cta-section';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Professional landing page sections */}
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
    </main>
  );
}
```

#### 8.6.2 Hero Section Implementation
```typescript
// src/components/sections/hero-section.tsx
'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Truck, Users, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Türkiye'nin En Kapsamlı{' '}
              <span className="text-cargolink-500">Lojistik Platformu</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Tüm kargo ve lojistik ihtiyaçlarınızı tek platformdan yönetin. 
              Hızlı, güvenilir ve ekonomik kargo çözümleri ile işinizi büyütün.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 flex items-center justify-center gap-x-6"
          >
            <Button size="lg" variant="cargolink" className="group">
              Ücretsiz Başla
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" className="group">
              <Play className="mr-2 h-4 w-4" />
              Demo İzle
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3"
          >
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cargolink-100">
                <Truck className="h-6 w-6 text-cargolink-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                50+ Kargo Firması
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Tek platformda tüm kargo seçenekleri
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cargolink-100">
                <Users className="h-6 w-6 text-cargolink-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                10.000+ Mutlu Müşteri
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Güvenilir ve kaliteli hizmet
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cargolink-100">
                <BarChart3 className="h-6 w-6 text-cargolink-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                %30'a Varan Tasarruf
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                En uygun fiyatları karşılaştırın
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
```

### 8.7 User Dashboard Integration

#### 8.7.1 Dashboard Layout
```typescript
// src/app/(dashboard)/layout.tsx - Dashboard layout
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - CargoLink',
  description: 'Kargo gönderilerinizi yönetin ve takip edin',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar />
      <div className="lg:pl-64">
        <DashboardHeader />
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
```

#### 8.7.2 Real-time Tracking Interface
```typescript
// src/app/(dashboard)/dashboard/tracking/[trackingId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { TrackingMap } from '@/components/dashboard/tracking-map';
import { TrackingTimeline } from '@/components/dashboard/tracking-timeline';
import { cargoLinkAPI } from '@/lib/api';
import { TrackingInfo } from '@cargolink/shared';

export default function TrackingPage() {
  const { trackingId } = useParams();
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!trackingId) return;

    // Initial data fetch
    const fetchTrackingInfo = async () => {
      try {
        const data = await cargoLinkAPI.trackShipment(trackingId as string);
        setTrackingInfo(data);
      } catch (error) {
        console.error('Failed to fetch tracking info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrackingInfo();

    // WebSocket connection for real-time updates
    const socket = cargoLinkAPI.createTrackingSocket(trackingId as string);
    
    socket.onmessage = (event) => {
      const update = JSON.parse(event.data);
      if (update.type === 'tracking_update') {
        setTrackingInfo(prev => ({
          ...prev,
          ...update.data,
        }));
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      socket.close();
    };
  }, [trackingId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cargolink-500"></div>
      </div>
    );
  }

  if (!trackingInfo) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">
          Takip bilgisi bulunamadı
        </h2>
        <p className="mt-2 text-gray-600">
          Lütfen takip numaranızı kontrol edin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Kargo Takibi
        </h1>
        <p className="mt-2 text-gray-600">
          Takip No: {trackingInfo.trackingNumber}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <TrackingMap trackingInfo={trackingInfo} />
        </div>
        <div>
          <TrackingTimeline trackingInfo={trackingInfo} />
        </div>
      </div>
    </div>
  );
}
```

### 8.8 Technical Infrastructure

#### 8.8.1 Deployment Configuration
```dockerfile
# Dockerfile for Next.js Website
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN yarn build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### 8.8.2 Analytics and Monitoring
```typescript
// src/lib/analytics.ts - Analytics integration
export class WebsiteAnalytics {
  private static instance: WebsiteAnalytics;
  private gtag: any;

  private constructor() {
    if (typeof window !== 'undefined' && window.gtag) {
      this.gtag = window.gtag;
    }
  }

  public static getInstance(): WebsiteAnalytics {
    if (!WebsiteAnalytics.instance) {
      WebsiteAnalytics.instance = new WebsiteAnalytics();
    }
    return WebsiteAnalytics.instance;
  }

  // Track page views
  public trackPageView(url: string): void {
    if (this.gtag) {
      this.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        page_path: url,
      });
    }
  }

  // Track business events
  public trackQuoteRequest(data: {
    origin: string;
    destination: string;
    package_type: string;
    weight: number;
  }): void {
    if (this.gtag) {
      this.gtag('event', 'quote_request', {
        event_category: 'business',
        event_label: 'quote_form',
        custom_parameters: data,
      });
    }
  }

  public trackShipmentCreate(data: {
    carrier: string;
    price: number;
    service_type: string;
  }): void {
    if (this.gtag) {
      this.gtag('event', 'shipment_create', {
        event_category: 'conversion',
        event_label: 'shipment_form',
        value: data.price,
        custom_parameters: data,
      });
    }
  }

  // Track user interactions
  public trackCTAClick(cta_name: string): void {
    if (this.gtag) {
      this.gtag('event', 'cta_click', {
        event_category: 'engagement',
        event_label: cta_name,
      });
    }
  }
}

export const analytics = WebsiteAnalytics.getInstance();
```

---

## 9. Kargo Firması Entegrasyonları

### 8.1 Entegrasyon Stratejisi

#### 8.1.1 Genel Yaklaşım
CargoLink, hem büyük kurumsal kargo firmalarıyla API tabanlı entegrasyonlar hem de küçük taşıyıcılarla manuel/yarı-otomatik entegrasyonlar kurar.

**Entegrasyon Tipleri**:
1. **API Entegrasyonları**: Büyük firmalar (Yurtiçi, Aras, MNG, DHL, UPS)
2. **Webhook Entegrasyonları**: Orta ölçekli firmalar
3. **Manuel Entegrasyonlar**: Küçük yerel taşıyıcılar

### 8.2 Yurtiçi Kargo Entegrasyonu

```typescript
// src/integrations/carriers/yurtici.ts
import axios, { AxiosInstance } from 'axios';

interface YurticiConfig {
  apiKey: string;
  username: string;
  password: string;
  baseURL: string;
}

export class YurticiCarrierIntegration {
  private client: AxiosInstance;
  private config: YurticiConfig;

  constructor(config: YurticiConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: 10000,
    });
  }

  async getQuote(request: QuoteRequest) {
    try {
      const response = await this.client.post('/pricing/quote', {
        origin: {
          city: request.senderCity,
          district: request.senderDistrict,
        },
        destination: {
          city: request.receiverCity,
          district: request.receiverDistrict,
        },
        package: {
          weight: request.weight,
          desi: request.desi || Math.max(request.weight, 1),
        },
      });

      return {
        success: true,
        data: {
          price: response.data.totalPrice,
          currency: 'TRY',
          deliveryTime: response.data.estimatedDeliveryHours,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: 'Quote request failed',
      };
    }
  }

  async createShipment(request: CreateShipmentRequest) {
    // Implementation for creating shipment with Yurtiçi
  }

  async trackShipment(trackingNumber: string) {
    // Implementation for tracking shipment
  }
}
```

### 8.3 Carrier Adapter Pattern

```typescript
// src/integrations/carriers/carrierAdapter.ts
import { YurticiCarrierIntegration } from './yurtici';
import { ArasCarrierIntegration } from './aras';
import { MNGCarrierIntegration } from './mng';

export class CarrierAdapter {
  private carriers: Map<string, any> = new Map();

  constructor() {
    this.initializeCarriers();
  }

  private initializeCarriers() {
    this.carriers.set('yurtici', new YurticiCarrierIntegration(config.yurtici));
    this.carriers.set('aras', new ArasCarrierIntegration(config.aras));
    this.carriers.set('mng', new MNGCarrierIntegration(config.mng));
  }

  async getQuotes(request: QuoteRequest): Promise<Quote[]> {
    const promises = Array.from(this.carriers.entries()).map(
      async ([carrierId, carrier]) => {
        try {
          const quote = await carrier.getQuote(request);
          return {
            carrierId,
            ...quote,
          };
        } catch (error) {
          console.error(`Failed to get quote from ${carrierId}:`, error);
          return null;
        }
      }
    );

    const results = await Promise.allSettled(promises);
    return results
      .filter((result): result is PromiseFulfilledResult<Quote> =>
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);
  }
}
```

---

## 10. Ödeme Sistemi Entegrasyonu

### 9.1 Ödeme Gateway Entegrasyonları

#### 9.1.1 İyzico Entegrasyonu

```typescript
// src/integrations/payments/iyzico.ts
import Iyzipay from 'iyzipay';

export class IyzicoPaymentGateway {
  private iyzipay: any;

  constructor(config: { apiKey: string; secretKey: string; uri: string }) {
    this.iyzipay = new Iyzipay({
      apiKey: config.apiKey,
      secretKey: config.secretKey,
      uri: config.uri,
    });
  }

  async processPayment(paymentRequest: PaymentRequest) {
    try {
      const request = {
        price: paymentRequest.amount.toString(),
        paidPrice: paymentRequest.amount.toString(),
        currency: 'TRY',
        installment: '1',
        basketId: paymentRequest.orderId,
        paymentChannel: 'WEB',
        paymentGroup: 'PRODUCT',
        conversationId: paymentRequest.conversationId,
        paymentCard: {
          cardHolderName: paymentRequest.cardDetails.holderName,
          cardNumber: paymentRequest.cardDetails.number,
          expireMonth: paymentRequest.cardDetails.expireMonth,
          expireYear: paymentRequest.cardDetails.expireYear,
          cvc: paymentRequest.cardDetails.cvc,
        },
        buyer: paymentRequest.buyer,
        shippingAddress: paymentRequest.shippingAddress,
        billingAddress: paymentRequest.billingAddress,
        basketItems: paymentRequest.basketItems,
      };

      return new Promise((resolve, reject) => {
        this.iyzipay.payment.create(request, (err: any, result: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
    } catch (error) {
      throw new Error(`İyzico payment failed: ${error}`);
    }
  }

  async refundPayment(refundRequest: RefundRequest) {
    // Implementation for refund
  }
}
```

#### 9.1.2 Payment Service

```typescript
// src/services/paymentService.ts
import { IyzicoPaymentGateway } from '../integrations/payments/iyzico';
import { PayTRPaymentGateway } from '../integrations/payments/paytr';
import { StripePaymentGateway } from '../integrations/payments/stripe';

export class PaymentService {
  private gateways: Map<string, any> = new Map();

  constructor() {
    this.gateways.set('iyzico', new IyzicoPaymentGateway(config.iyzico));
    this.gateways.set('paytr', new PayTRPaymentGateway(config.paytr));
    this.gateways.set('stripe', new StripePaymentGateway(config.stripe));
  }

  async processPayment(paymentRequest: PaymentRequest) {
    const gateway = this.gateways.get(paymentRequest.gateway);
    if (!gateway) {
      throw new Error(`Unsupported payment gateway: ${paymentRequest.gateway}`);
    }

    try {
      // Process payment
      const paymentResult = await gateway.processPayment(paymentRequest);

      // Save to database
      const payment = await prisma.payments.create({
        data: {
          shipmentId: paymentRequest.shipmentId,
          userId: paymentRequest.userId,
          amount: paymentRequest.amount,
          currency: paymentRequest.currency,
          paymentMethod: paymentRequest.method,
          gatewayName: paymentRequest.gateway,
          gatewayTransactionId: paymentResult.paymentId,
          gatewayResponse: paymentResult,
          status: paymentResult.status === 'success' ? 'completed' : 'failed',
          processedAt: new Date(),
        },
      });

      // Update shipment payment status
      if (paymentResult.status === 'success') {
        await this.updateShipmentPaymentStatus(
          paymentRequest.shipmentId,
          'paid'
        );
      }

      return {
        success: paymentResult.status === 'success',
        paymentId: payment.id,
        transactionId: paymentResult.paymentId,
        message: paymentResult.errorMessage || 'Payment processed successfully',
      };
    } catch (error) {
      throw new Error(`Payment processing failed: ${error}`);
    }
  }

  private async updateShipmentPaymentStatus(shipmentId: string, status: string) {
    await prisma.shipments.update({
      where: { id: shipmentId },
      data: { paymentStatus: status },
    });
  }
}
```

---

## 11. Real-time Sistem Tasarımı

### 10.1 WebSocket Architecture

```typescript
// src/websocket/trackingSocket.ts
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';

export function setupTrackingSocket(io: SocketIOServer) {
  const trackingNamespace = io.of('/tracking');

  trackingNamespace.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  trackingNamespace.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected to tracking`);

    socket.on('subscribe', (data: { shipmentIds: string[] }) => {
      // Subscribe to shipment updates
      data.shipmentIds.forEach(shipmentId => {
        socket.join(`shipment:${shipmentId}`);
      });
    });

    socket.on('unsubscribe', (data: { shipmentIds: string[] }) => {
      // Unsubscribe from shipment updates
      data.shipmentIds.forEach(shipmentId => {
        socket.leave(`shipment:${shipmentId}`);
      });
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected from tracking`);
    });
  });

  return trackingNamespace;
}

export function broadcastTrackingUpdate(
  io: SocketIOServer,
  shipmentId: string,
  update: TrackingUpdate
) {
  const trackingNamespace = io.of('/tracking');
  trackingNamespace.to(`shipment:${shipmentId}`).emit('tracking_update', update);
}
```

### 10.2 Real-time Tracking Service

```typescript
// src/services/trackingService.ts
import { io } from '../app';
import { broadcastTrackingUpdate } from '../websocket/trackingSocket';

export class TrackingService {
  async updateShipmentStatus(
    shipmentId: string,
    status: string,
    location?: string,
    description?: string
  ) {
    // Update database
    const statusUpdate = await prisma.shipmentStatusHistory.create({
      data: {
        shipmentId,
        status,
        location,
        description,
        occurredAt: new Date(),
      },
    });

    // Broadcast real-time update
    broadcastTrackingUpdate(io, shipmentId, {
      type: 'status_update',
      data: {
        shipmentId,
        status,
        location,
        description,
        occurredAt: statusUpdate.occurredAt,
      },
    });

    // Send push notification
    await this.sendTrackingNotification(shipmentId, status, location);

    return statusUpdate;
  }

  async sendTrackingNotification(
    shipmentId: string,
    status: string,
    location?: string
  ) {
    // Get shipment owner
    const shipment = await prisma.shipments.findUnique({
      where: { id: shipmentId },
      include: { user: true },
    });

    if (!shipment) return;

    // Send notification
    await notificationService.sendPushNotification({
      userId: shipment.userId,
      title: 'Shipment Update',
      message: `Your package ${shipment.internalTrackingNumber} is now ${status}${location ? ` at ${location}` : ''}`,
      data: {
        shipmentId,
        status,
        location,
      },
    });
  }
}

export const trackingService = new TrackingService();
```

---

## 12. Güvenlik ve Authentication

### 11.1 JWT Authentication

```typescript
// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { redis } from '../config/redis';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    userType: string;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authorization token required' },
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Check if session exists in Redis
    const sessionKey = `session:${decoded.userId}`;
    const sessionData = await redis.get(sessionKey);
    
    if (!sessionData) {
      return res.status(401).json({
        success: false,
        error: { code: 'SESSION_EXPIRED', message: 'Session expired' },
      });
    }

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      userType: decoded.userType,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid authorization token' },
    });
  }
};
```

### 11.2 Data Encryption

```typescript
// src/utils/encryption.ts
import crypto from 'crypto';

export class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private secretKey = crypto.scryptSync(process.env.ENCRYPTION_KEY!, 'salt', 32);

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.secretKey, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  decrypt(encryptedText: string): string {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipher(this.algorithm, this.secretKey, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

export const encryptionService = new EncryptionService();
```

---

## 13. Admin Panel Tasarımı

### 12.1 Admin Dashboard Architecture

```typescript
// Admin panel için React.js web uygulaması
// src/admin/components/Dashboard.tsx
import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  TruckOutlined,
  DollarOutlined,
} from '@ant-design/icons';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard">
      <Row gutter={16} className="dashboard-stats">
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={1128}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Shipments"
              value={284}
              prefix={<TruckOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={28540}
              prefix={<DollarOutlined />}
              precision={2}
              suffix="₺"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Commission Earned"
              value={2854}
              prefix={<DollarOutlined />}
              precision={2}
              suffix="₺"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
```

### 12.2 Admin API Endpoints

```typescript
// src/routes/admin.ts
import express from 'express';
import { adminAuthenticate, requirePermission } from '../middleware/auth';
import { AdminController } from '../controllers/adminController';

const router = express.Router();
const adminController = new AdminController();

// Authentication required for all admin routes
router.use(adminAuthenticate);

// Dashboard stats
router.get('/dashboard/stats', adminController.getDashboardStats);

// User management
router.get('/users', requirePermission('users.read'), adminController.getUsers);
router.get('/users/:id', requirePermission('users.read'), adminController.getUserById);
router.put('/users/:id', requirePermission('users.update'), adminController.updateUser);
router.delete('/users/:id', requirePermission('users.delete'), adminController.deleteUser);

// Shipment management
router.get('/shipments', requirePermission('shipments.read'), adminController.getShipments);
router.get('/shipments/:id', requirePermission('shipments.read'), adminController.getShipmentById);
router.put('/shipments/:id/status', requirePermission('shipments.update'), adminController.updateShipmentStatus);

// Carrier management
router.get('/carriers', requirePermission('carriers.read'), adminController.getCarriers);
router.post('/carriers', requirePermission('carriers.create'), adminController.createCarrier);
router.put('/carriers/:id', requirePermission('carriers.update'), adminController.updateCarrier);

// Financial reports
router.get('/reports/revenue', requirePermission('reports.read'), adminController.getRevenueReport);
router.get('/reports/commission', requirePermission('reports.read'), adminController.getCommissionReport);

export default router;
```

---

## 14. Bildirim Sistemi

### 13.1 Notification Service

```typescript
// src/services/notificationService.ts
import { FCMService } from '../integrations/notifications/firebase';
import { TwilioSMSService } from '../integrations/notifications/twilio';
import { SendGridEmailService } from '../integrations/notifications/sendgrid';

export class NotificationService {
  private fcm: FCMService;
  private sms: TwilioSMSService;
  private email: SendGridEmailService;

  constructor() {
    this.fcm = new FCMService();
    this.sms = new TwilioSMSService();
    this.email = new SendGridEmailService();
  }

  async sendPushNotification(notification: PushNotificationRequest) {
    try {
      // Get user's FCM tokens
      const user = await prisma.users.findUnique({
        where: { id: notification.userId },
        select: { fcmTokens: true, notificationPreferences: true },
      });

      if (!user || !user.notificationPreferences?.pushNotifications) {
        return;
      }

      // Send push notification
      await this.fcm.sendNotification({
        tokens: user.fcmTokens as string[],
        title: notification.title,
        body: notification.message,
        data: notification.data,
      });

      // Save to database
      await prisma.notifications.create({
        data: {
          userId: notification.userId,
          shipmentId: notification.data?.shipmentId,
          type: 'push',
          title: notification.title,
          message: notification.message,
          data: notification.data,
          pushSent: true,
          pushSentAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Push notification failed:', error);
    }
  }

  async sendSMSNotification(notification: SMSNotificationRequest) {
    try {
      const user = await prisma.users.findUnique({
        where: { id: notification.userId },
        select: { phone: true, notificationPreferences: true },
      });

      if (!user || !user.notificationPreferences?.smsNotifications) {
        return;
      }

      await this.sms.sendSMS({
        to: user.phone,
        message: notification.message,
      });

      // Save to database
      await prisma.notifications.create({
        data: {
          userId: notification.userId,
          shipmentId: notification.shipmentId,
          type: 'sms',
          message: notification.message,
          smsSent: true,
          smsSentAt: new Date(),
        },
      });
    } catch (error) {
      console.error('SMS notification failed:', error);
    }
  }

  async sendEmailNotification(notification: EmailNotificationRequest) {
    try {
      const user = await prisma.users.findUnique({
        where: { id: notification.userId },
        select: { email: true, firstName: true, notificationPreferences: true },
      });

      if (!user || !user.notificationPreferences?.emailNotifications) {
        return;
      }

      await this.email.sendEmail({
        to: user.email,
        subject: notification.subject,
        template: notification.template,
        templateData: {
          userName: user.firstName,
          ...notification.templateData,
        },
      });

      // Save to database
      await prisma.notifications.create({
        data: {
          userId: notification.userId,
          shipmentId: notification.shipmentId,
          type: 'email',
          title: notification.subject,
          message: notification.message,
          emailSent: true,
          emailSentAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Email notification failed:', error);
    }
  }
}

export const notificationService = new NotificationService();
```

### 13.2 Firebase Cloud Messaging

```typescript
// src/integrations/notifications/firebase.ts
import * as admin from 'firebase-admin';

export class FCMService {
  private app: admin.app.App;

  constructor() {
    this.app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
  }

  async sendNotification(notification: {
    tokens: string[];
    title: string;
    body: string;
    data?: any;
  }) {
    if (!notification.tokens.length) return;

    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data ? JSON.stringify(notification.data) : undefined,
      tokens: notification.tokens,
    };

    try {
      const response = await admin.messaging().sendMulticast(message);
      
      // Handle failed tokens
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(notification.tokens[idx]);
          }
        });
        
        // Remove invalid tokens from database
        await this.removeInvalidTokens(failedTokens);
      }

      return response;
    } catch (error) {
      console.error('FCM send error:', error);
      throw error;
    }
  }

  private async removeInvalidTokens(tokens: string[]) {
    // Remove invalid FCM tokens from user records
    await prisma.users.updateMany({
      where: {
        fcmTokens: {
          hasSome: tokens,
        },
      },
      data: {
        fcmTokens: {
          set: [], // This would need proper array manipulation in production
        },
      },
    });
  }
}
```

---

## 15. File Storage ve Media Management

### 14.1 AWS S3 Integration

```typescript
// src/services/fileStorageService.ts
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

export class FileStorageService {
  private s3: AWS.S3;
  private bucketName: string;

  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });
    this.bucketName = process.env.AWS_S3_BUCKET_NAME!;
  }

  async uploadFile(
    file: Buffer,
    fileName: string,
    contentType: string,
    userId: string,
    purpose: 'profile' | 'document' | 'proof' | 'invoice'
  ) {
    try {
      const fileKey = `${purpose}/${userId}/${uuidv4()}-${fileName}`;

      // Process image if needed
      let processedFile = file;
      if (contentType.startsWith('image/') && purpose === 'profile') {
        processedFile = await this.processImage(file);
      }

      // Upload to S3
      const uploadParams = {
        Bucket: this.bucketName,
        Key: fileKey,
        Body: processedFile,
        ContentType: contentType,
        ACL: purpose === 'profile' ? 'public-read' : 'private',
      };

      const result = await this.s3.upload(uploadParams).promise();

      // Save file record to database
      const fileRecord = await prisma.files.create({
        data: {
          userId,
          filename: fileKey,
          originalFilename: fileName,
          fileType: contentType.split('/')[1],
          fileSize: processedFile.length,
          mimeType: contentType,
          storagePath: fileKey,
          publicUrl: result.Location,
          purpose,
        },
      });

      return {
        id: fileRecord.id,
        url: result.Location,
        key: fileKey,
      };
    } catch (error) {
      console.error('File upload error:', error);
      throw new Error('File upload failed');
    }
  }

  async deleteFile(fileId: string, userId: string) {
    try {
      const file = await prisma.files.findFirst({
        where: { id: fileId, userId },
      });

      if (!file) {
        throw new Error('File not found');
      }

      // Delete from S3
      await this.s3.deleteObject({
        Bucket: this.bucketName,
        Key: file.storagePath,
      }).promise();

      // Delete from database
      await prisma.files.delete({
        where: { id: fileId },
      });

      return true;
    } catch (error) {
      console.error('File deletion error:', error);
      throw new Error('File deletion failed');
    }
  }

  async getSignedUrl(fileKey: string, expiresIn: number = 3600) {
    return this.s3.getSignedUrl('getObject', {
      Bucket: this.bucketName,
      Key: fileKey,
      Expires: expiresIn,
    });
  }

  private async processImage(imageBuffer: Buffer): Promise<Buffer> {
    return sharp(imageBuffer)
      .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();
  }
}

export const fileStorageService = new FileStorageService();
```

### 14.2 File Upload Middleware

```typescript
// src/middleware/fileUpload.ts
import multer from 'multer';
import { Request } from 'express';

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
  // Allow specific file types
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// File upload controller
export const uploadFileController = async (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { message: 'No file provided' },
      });
    }

    const result = await fileStorageService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      req.user.id,
      req.body.purpose || 'document'
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'File upload failed' },
    });
  }
};
```

---

## 16. Testing Stratejisi

### 15.1 Test Pyramid

```
                /\
               /  \
              / E2E \
             /______\
            /        \
           / INTEGRATION \
          /______________\
         /                \
        /   UNIT TESTS     \
       /___________________\
```

### 15.2 Unit Testing

```typescript
// tests/unit/services/shipmentService.test.ts
import { ShipmentService } from '../../../src/services/shipmentService';
import { prismaMock } from '../../mocks/prisma';

jest.mock('../../../src/config/prisma', () => ({
  prisma: prismaMock,
}));

describe('ShipmentService', () => {
  let shipmentService: ShipmentService;

  beforeEach(() => {
    shipmentService = new ShipmentService();
    jest.clearAllMocks();
  });

  describe('createQuote', () => {
    it('should create a quote successfully', async () => {
      const mockQuoteData = {
        userId: 'user-123',
        sender: { name: 'John Doe', phone: '+905551234567' },
        receiver: { name: 'Jane Smith', phone: '+905559876543' },
        package: { type: 'box', weight: 2.5 },
      };

      const mockQuote = {
        id: 'quote-123',
        userId: 'user-123',
        validUntil: new Date(),
        status: 'active',
      };

      prismaMock.quotes.create.mockResolvedValue(mockQuote);

      const result = await shipmentService.createQuote(mockQuoteData);

      expect(result).toHaveProperty('quoteId', 'quote-123');
      expect(prismaMock.quotes.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-123',
          status: 'active',
        }),
      });
    });

    it('should handle quote creation failure', async () => {
      const mockQuoteData = {
        userId: 'user-123',
        sender: { name: 'John Doe' },
      };

      prismaMock.quotes.create.mockRejectedValue(new Error('Database error'));

      await expect(shipmentService.createQuote(mockQuoteData))
        .rejects.toThrow('Failed to create quote');
    });
  });
});
```

### 15.3 Integration Testing

```typescript
// tests/integration/api/shipments.test.ts
import request from 'supertest';
import { app } from '../../../src/app';
import { setupTestDatabase, teardownTestDatabase } from '../../helpers/database';

describe('/api/v1/shipments', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    await setupTestDatabase();
    
    // Create test user and get auth token
    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'SecurePass123',
        firstName: 'Test',
        lastName: 'User',
        phone: '+905551234567',
        userType: 'individual',
      });

    authToken = registerResponse.body.data.tokens.accessToken;
    userId = registerResponse.body.data.user.id;
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('POST /quote', () => {
    it('should create a quote successfully', async () => {
      const quoteData = {
        sender: {
          name: 'John Doe',
          phone: '+905551234567',
        },
        receiver: {
          name: 'Jane Smith',
          phone: '+905559876543',
          address: {
            city: 'Ankara',
            district: 'Çankaya',
            streetAddress: 'Test Street 123',
          },
        },
        package: {
          type: 'box',
          category: 'electronics',
          contentDescription: 'Laptop computer',
          weight: 2.5,
        },
      };

      const response = await request(app)
        .post('/api/v1/shipments/quote')
        .set('Authorization', `Bearer ${authToken}`)
        .send(quoteData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('quoteId');
      expect(response.body.data.quotes).toBeInstanceOf(Array);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/v1/shipments/quote')
        .send({})
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});
```

### 15.4 E2E Testing

```typescript
// tests/e2e/shipment-flow.test.ts
import { test, expect } from '@playwright/test';

test.describe('Shipment Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePass123');
    await page.click('[data-testid="login-button"]');
    await page.waitForSelector('[data-testid="home-screen"]');
  });

  test('should create shipment successfully', async ({ page }) => {
    // Navigate to create shipment
    await page.click('[data-testid="create-shipment-button"]');

    // Fill sender information
    await page.fill('[data-testid="sender-name"]', 'John Doe');
    await page.fill('[data-testid="sender-phone"]', '+905551234567');
    await page.click('[data-testid="next-button"]');

    // Fill receiver information
    await page.fill('[data-testid="receiver-name"]', 'Jane Smith');
    await page.fill('[data-testid="receiver-phone"]', '+905559876543');
    await page.fill('[data-testid="receiver-city"]', 'Ankara');
    await page.click('[data-testid="next-button"]');

    // Fill package information
    await page.selectOption('[data-testid="package-type"]', 'box');
    await page.fill('[data-testid="content-description"]', 'Laptop computer');
    await page.fill('[data-testid="weight"]', '2.5');
    await page.click('[data-testid="get-quotes-button"]');

    // Wait for quotes to load
    await page.waitForSelector('[data-testid="quote-results"]');
    
    // Verify quotes are displayed
    const quotes = await page.locator('[data-testid="quote-card"]').count();
    expect(quotes).toBeGreaterThan(0);

    // Select first quote and proceed to payment
    await page.click('[data-testid="select-quote-button"]').first();
    await page.waitForSelector('[data-testid="payment-screen"]');

    // Verify shipment creation success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.click('[data-testid="create-shipment-button"]');
    
    // Try to proceed without filling required fields
    await page.click('[data-testid="next-button"]');
    
    // Verify validation errors are displayed
    await expect(page.locator('[data-testid="sender-name-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="sender-phone-error"]')).toBeVisible();
  });
});
```

---

## 17. Deployment ve DevOps

### 16.1 Docker Configuration

```dockerfile
# Dockerfile for Backend
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install dumb-init
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma

USER nodejs

EXPOSE 3000

CMD ["dumb-init", "node", "dist/server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
      - redis
    networks:
      - cargolink-network

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=cargolink
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - cargolink-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - cargolink-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/ssl
    depends_on:
      - backend
    networks:
      - cargolink-network

volumes:
  postgres_data:
  redis_data:

networks:
  cargolink-network:
    driver: bridge
```

### 16.2 Kubernetes Deployment

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: cargolink

---
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cargolink-backend
  namespace: cargolink
spec:
  replicas: 3
  selector:
    matchLabels:
      app: cargolink-backend
  template:
    metadata:
      labels:
        app: cargolink-backend
    spec:
      containers:
      - name: backend
        image: cargolink/backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: cargolink-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: cargolink-secrets
              key: redis-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
# k8s/backend-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: cargolink-backend-service
  namespace: cargolink
spec:
  selector:
    app: cargolink-backend
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP

---
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: cargolink-ingress
  namespace: cargolink
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - api.cargolink.com
    secretName: cargolink-tls
  rules:
  - host: api.cargolink.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: cargolink-backend-service
            port:
              number: 80
```

### 16.3 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy CargoLink

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: cargolink_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: |
        cd backend
        npm ci

    - name: Run database migrations
      run: |
        cd backend
        npx prisma migrate deploy
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/cargolink_test

    - name: Run tests
      run: |
        cd backend
        npm run test:ci
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/cargolink_test
        REDIS_URL: redis://localhost:6379

    - name: Run E2E tests
      run: |
        cd mobile
        npm run test:e2e

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v3

    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: eu-west-1

    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v1

    - name: Build, tag, and push backend image
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        ECR_REPOSITORY: cargolink-backend
        IMAGE_TAG: ${{ github.sha }}
      run: |
        cd backend
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
        docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest

    - name: Deploy to EKS
      run: |
        aws eks update-kubeconfig --name cargolink-cluster
        kubectl set image deployment/cargolink-backend cargolink-backend=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG -n cargolink
        kubectl rollout status deployment/cargolink-backend -n cargolink

    - name: Build and deploy mobile app
      run: |
        cd mobile
        # React Native build and deployment steps
        # This would include building for both iOS and Android
        # and deploying to respective app stores
```

---

## 18. Performance ve Optimizasyon

### 17.1 Database Optimization

```sql
-- Performance tuning for PostgreSQL
-- postgresql.conf optimizations

shared_buffers = '256MB'
effective_cache_size = '1GB'
maintenance_work_mem = '64MB'
checkpoint_completion_target = 0.9
wal_buffers = '16MB'
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200

-- Connection pooling
max_connections = 200
```

```typescript
// Connection pooling with Prisma
// src/config/database.ts
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'info'] : ['error'],
});

// Connection pool configuration
const connectionString = process.env.DATABASE_URL;
const poolConfig = {
  connectionString,
  max: 20, // Maximum number of connections
  min: 5,  // Minimum number of connections
  idle: 10000, // Close connections after 10 seconds of inactivity
  acquire: 60000, // Maximum time to get connection
  evict: 1000, // Run eviction every second
};
```

### 17.2 Caching Strategies

```typescript
// src/services/cacheService.ts
import { redis } from '../config/redis';

export class CacheService {
  private defaultTTL = 3600; // 1 hour

  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl: number = this.defaultTTL): Promise<void> {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached) return cached;

    const fresh = await fetcher();
    await this.set(key, fresh, ttl);
    return fresh;
  }

  // Cache invalidation patterns
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache pattern invalidation error:', error);
    }
  }
}

export const cacheService = new CacheService();
```

### 17.3 API Response Optimization

```typescript
// src/middleware/compression.ts
import compression from 'compression';

export const compressionMiddleware = compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024,
});

// Response optimization middleware
export const optimizeResponse = (req: any, res: any, next: any) => {
  const originalJson = res.json;
  
  res.json = function(data: any) {
    // Remove sensitive data
    if (data && typeof data === 'object') {
      data = sanitizeResponse(data);
    }

    // Add response headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Set cache headers for static responses
    if (req.method === 'GET' && !req.url.includes('/api/v1/users/')) {
      res.setHeader('Cache-Control', 'public, max-age=300');
    }

    return originalJson.call(this, data);
  };

  next();
};

function sanitizeResponse(data: any): any {
  if (Array.isArray(data)) {
    return data.map(sanitizeResponse);
  }

  if (data && typeof data === 'object') {
    const sanitized = { ...data };
    
    // Remove sensitive fields
    delete sanitized.password;
    delete sanitized.passwordHash;
    delete sanitized.apiKey;
    delete sanitized.secretKey;
    
    // Recursively sanitize nested objects
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'object') {
        sanitized[key] = sanitizeResponse(sanitized[key]);
      }
    });

    return sanitized;
  }

  return data;
}
```

---

## 19. Monitoring ve Logging

### 18.1 Application Logging

```typescript
// src/utils/logger.ts
import winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }),
];

// Add file transport for production
if (process.env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: logFormat,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: logFormat,
    })
  );

  // Add Elasticsearch transport
  if (process.env.ELASTICSEARCH_URL) {
    transports.push(
      new ElasticsearchTransport({
        level: 'info',
        clientOpts: {
          node: process.env.ELASTICSEARCH_URL,
        },
        index: 'cargolink-logs',
      })
    );
  }
}

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports,
});

// Request logging middleware
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id,
    });
  });

  next();
};
```

### 18.2 Health Checks

```typescript
// src/routes/health.ts
import express from 'express';
import { prisma } from '../config/database';
import { redis } from '../config/redis';

const router = express.Router();

interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  services: {
    database: ServiceStatus;
    redis: ServiceStatus;
    external_apis: ServiceStatus;
  };
  metrics: {
    uptime: number;
    memory: NodeJS.MemoryUsage;
    cpu: number;
  };
}

interface ServiceStatus {
  status: 'healthy' | 'unhealthy';
  responseTime?: number;
  error?: string;
}

router.get('/health', async (req, res) => {
  const startTime = Date.now();
  
  const healthCheck: HealthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
    services: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      external_apis: await checkExternalAPIs(),
    },
    metrics: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage().user,
    },
  };

  // Determine overall health
  const servicesHealthy = Object.values(healthCheck.services)
    .every(service => service.status === 'healthy');
  
  healthCheck.status = servicesHealthy ? 'healthy' : 'unhealthy';

  const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(healthCheck);
});

async function checkDatabase(): Promise<ServiceStatus> {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'healthy',
      responseTime: Date.now() - start,
    };
  } catch (error: any) {
    return {
      status: 'unhealthy',
      error: error.message,
    };
  }
}

async function checkRedis(): Promise<ServiceStatus> {
  try {
    const start = Date.now();
    await redis.ping();
    return {
      status: 'healthy',
      responseTime: Date.now() - start,
    };
  } catch (error: any) {
    return {
      status: 'unhealthy',
      error: error.message,
    };
  }
}

async function checkExternalAPIs(): Promise<ServiceStatus> {
  try {
    // Check critical external APIs
    const checks = await Promise.allSettled([
      checkCarrierAPI('yurtici'),
      checkPaymentGateway('iyzico'),
    ]);

    const hasFailures = checks.some(check => check.status === 'rejected');
    
    return {
      status: hasFailures ? 'unhealthy' : 'healthy',
    };
  } catch (error: any) {
    return {
      status: 'unhealthy',
      error: error.message,
    };
  }
}

export default router;
```

### 18.3 Metrics and Monitoring

```typescript
// src/utils/metrics.ts
import prometheus from 'prom-client';

// Create a Registry
const register = new prometheus.Registry();

// HTTP request metrics
export const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

export const httpRequestTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

// Business metrics
export const shipmentsCreated = new prometheus.Counter({
  name: 'shipments_created_total',
  help: 'Total number of shipments created',
  
  labelNames: ['carrier_type'],
});

export const paymentsProcessed = new prometheus.Counter({
  name: 'payments_processed_total',
  help: 'Total number of payments processed',
  labelNames: ['gateway', 'status'],
});

export const activeUsers = new prometheus.Gauge({
  name: 'active_users_current',
  help: 'Current number of active users',
});

// Database metrics
export const dbConnectionsActive = new prometheus.Gauge({
  name: 'db_connections_active',
  help: 'Current number of active database connections',
});

export const dbQueryDuration = new prometheus.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2],
});

// Register metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(shipmentsCreated);
register.registerMetric(paymentsProcessed);
register.registerMetric(activeUsers);
register.registerMetric(dbConnectionsActive);
register.registerMetric(dbQueryDuration);

// Add default metrics
prometheus.collectDefaultMetrics({ register });

export { register };

// Metrics middleware
export const metricsMiddleware = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    
    httpRequestDuration
      .labels(req.method, route, res.statusCode.toString())
      .observe(duration);
    
    httpRequestTotal
      .labels(req.method, route, res.statusCode.toString())
      .inc();
  });
  
  next();
};
```

---

## 20. Business Logic Detayları

### 19.1 Fiyatlandırma Algoritması

```typescript
// src/services/pricingService.ts
export class PricingService {
  async calculatePrice(request: PricingRequest): Promise<PriceCalculation> {
    const baseCalculation = this.calculateBasePrice(request);
    const modifiers = await this.getPriceModifiers(request);
    const finalPrice = this.applyModifiers(baseCalculation, modifiers);
    
    return {
      basePrice: baseCalculation.basePrice,
      modifiers: modifiers,
      finalPrice: finalPrice,
      breakdown: this.generatePriceBreakdown(baseCalculation, modifiers),
    };
  }

  private calculateBasePrice(request: PricingRequest): BasePrice {
    const { weight, dimensions, distance, serviceType } = request;
    
    // Weight-based pricing
    const weightPrice = this.calculateWeightPrice(weight);
    
    // Volume-based pricing (desi calculation)
    const volume = dimensions ? 
      (dimensions.length * dimensions.width * dimensions.height) / 5000 : 0;
    const volumePrice = this.calculateVolumePrice(Math.max(weight, volume));
    
    // Distance-based pricing
    const distancePrice = this.calculateDistancePrice(distance, serviceType);
    
    // Take the maximum of weight and volume pricing
    const dimensionPrice = Math.max(weightPrice, volumePrice);
    
    return {
      basePrice: dimensionPrice + distancePrice,
      weightComponent: weightPrice,
      volumeComponent: volumePrice,
      distanceComponent: distancePrice,
    };
  }

  private async getPriceModifiers(request: PricingRequest): Promise<PriceModifier[]> {
    const modifiers: PriceModifier[] = [];

    // Service type modifiers
    if (request.serviceType === 'express') {
      modifiers.push({
        type: 'service_type',
        name: 'Express Delivery',
        multiplier: 1.5,
        fixedAmount: 0,
      });
    }

    // Special requirements
    request.specialRequirements?.forEach(requirement => {
      switch (requirement) {
        case 'fragile':
          modifiers.push({
            type: 'special_requirement',
            name: 'Fragile Handling',
            multiplier: 1.1,
            fixedAmount: 5,
          });
          break;
        case 'cooling':
          modifiers.push({
            type: 'special_requirement',
            name: 'Cold Chain',
            multiplier: 1.3,
            fixedAmount: 15,
          });
          break;
        case 'insurance':
          const insuranceAmount = request.declaredValue * 0.01; // 1% of declared value
          modifiers.push({
            type: 'insurance',
            name: 'Cargo Insurance',
            multiplier: 1,
            fixedAmount: Math.max(insuranceAmount, 2), // Minimum 2 TL
          });
          break;
      }
    });

    // Geographic modifiers
    const geoModifier = await this.getGeographicModifier(
      request.origin,
      request.destination
    );
    if (geoModifier) {
      modifiers.push(geoModifier);
    }

    // Seasonal modifiers
    const seasonalModifier = this.getSeasonalModifier();
    if (seasonalModifier) {
      modifiers.push(seasonalModifier);
    }

    // Volume discount for business users
    if (request.userType === 'business') {
      const volumeDiscount = await this.getVolumeDiscount(request.userId);
      if (volumeDiscount) {
        modifiers.push(volumeDiscount);
      }
    }

    return modifiers;
  }

  private applyModifiers(basePrice: BasePrice, modifiers: PriceModifier[]): number {
    let price = basePrice.basePrice;
    
    // Apply multipliers first
    modifiers.forEach(modifier => {
      price *= modifier.multiplier;
    });
    
    // Then apply fixed amounts
    modifiers.forEach(modifier => {
      price += modifier.fixedAmount;
    });
    
    return Math.round(price * 100) / 100; // Round to 2 decimal places
  }

  private calculateWeightPrice(weight: number): number {
    // Tiered weight pricing
    const tiers = [
      { max: 1, price: 10 },      // 0-1 kg: 10 TL
      { max: 5, price: 8 },       // 1-5 kg: 8 TL/kg
      { max: 10, price: 6 },      // 5-10 kg: 6 TL/kg
      { max: 30, price: 4 },      // 10-30 kg: 4 TL/kg
      { max: Infinity, price: 3 } // 30+ kg: 3 TL/kg
    ];

    let totalPrice = 0;
    let remainingWeight = weight;

    for (const tier of tiers) {
      if (remainingWeight <= 0) break;
      
      const tierWeight = Math.min(remainingWeight, tier.max);
      totalPrice += tierWeight * tier.price;
      remainingWeight -= tierWeight;
    }

    return totalPrice;
  }
}
```

### 19.2 Komisyon Hesaplama Sistemi

```typescript
// src/services/commissionService.ts
export class CommissionService {
  async calculateCommission(shipment: Shipment, carrier: Carrier): Promise<CommissionCalculation> {
    const baseCommission = this.calculateBaseCommission(
      shipment.totalPrice,
      carrier.commissionRate
    );

    const bonuses = await this.calculatePerformanceBonuses(carrier);
    const penalties = await this.calculatePenalties(carrier);
    
    const finalCommission = baseCommission + bonuses - penalties;
    
    return {
      baseCommission,
      performanceBonuses: bonuses,
      penalties,
      finalCommission: Math.max(finalCommission, 0), // Never negative
      breakdown: {
        carrierEarnings: shipment.totalPrice - finalCommission,
        platformCommission: finalCommission,
        commissionRate: (finalCommission / shipment.totalPrice) * 100,
      },
    };
  }

  private calculateBaseCommission(totalPrice: number, rate: number): number {
    return totalPrice * (rate / 100);
  }

  private async calculatePerformanceBonuses(carrier: Carrier): Promise<number> {
    const performance = await this.getCarrierPerformance(carrier.id);
    let bonus = 0;

    // On-time delivery bonus
    if (performance.onTimeDeliveryRate >= 95) {
      bonus += 0.5; // 0.5% additional commission
    }

    // Customer satisfaction bonus
    if (performance.averageRating >= 4.5) {
      bonus += 0.3; // 0.3% additional commission
    }

    // Volume bonus
    if (performance.monthlyVolume >= 1000) {
      bonus += 0.2; // 0.2% additional commission
    }

    return bonus;
  }

  private async calculatePenalties(carrier: Carrier): Promise<number> {
    const issues = await this.getCarrierIssues(carrier.id);
    let penalty = 0;

    // Late delivery penalty
    if (issues.lateDeliveryRate > 10) {
      penalty += 1.0; // 1% penalty
    }

    // Damage/loss penalty
    if (issues.damageRate > 2) {
      penalty += 0.5; // 0.5% penalty
    }

    // Customer complaint penalty
    if (issues.complaintRate > 5) {
      penalty += 0.3; // 0.3% penalty
    }

    return penalty;
  }
}
```

### 19.3 Statü Yönetim Sistemi

```typescript
// src/services/statusManager.ts
export class StatusManager {
  private statusTransitions: Map<string, string[]> = new Map([
    ['draft', ['payment_pending', 'cancelled']],
    ['payment_pending', ['payment_confirmed', 'payment_failed', 'cancelled']],
    ['payment_confirmed', ['ready_for_pickup', 'cancelled']],
    ['ready_for_pickup', ['picked_up', 'cancelled']],
    ['picked_up', ['in_transit', 'returned']],
    ['in_transit', ['out_for_delivery', 'delayed', 'returned']],
    ['out_for_delivery', ['delivered', 'delivery_failed', 'returned']],
    ['delivery_failed', ['out_for_delivery', 'returned']],
    ['delivered', ['completed']],
    ['returned', ['completed']],
    ['cancelled', []],
    ['completed', []],
  ]);

  private statusDescriptions: Map<string, StatusDescription> = new Map([
    ['draft', { 
      tr: 'Taslak', 
      en: 'Draft',
      description: 'Gönderi oluşturuldu, henüz ödeme yapılmadı',
      color: '#gray',
      icon: 'draft'
    }],
    ['payment_pending', {
      tr: 'Ödeme Bekleniyor',
      en: 'Payment Pending',
      description: 'Ödeme işlemi bekleniyor',
      color: '#orange',
      icon: 'payment'
    }],
    ['payment_confirmed', {
      tr: 'Ödeme Onaylandı',
      en: 'Payment Confirmed',
      description: 'Ödeme başarıyla tamamlandı',
      color: '#green',
      icon: 'check'
    }],
    ['ready_for_pickup', {
      tr: 'Alınmaya Hazır',
      en: 'Ready for Pickup',
      description: 'Paket alınmaya hazır',
      color: '#blue',
      icon: 'ready'
    }],
    ['picked_up', {
      tr: 'Alındı',
      en: 'Picked Up',
      description: 'Paket gönderenden alındı',
      color: '#blue',
      icon: 'pickup'
    }],
    ['in_transit', {
      tr: 'Yolda',
      en: 'In Transit',
      description: 'Paket teslimat noktasına yollandı',
      color: '#blue',
      icon: 'truck'
    }],
    ['out_for_delivery', {
      tr: 'Dağıtımda',
      en: 'Out for Delivery',
      description: 'Paket teslimat için çıktı',
      color: '#blue',
      icon: 'delivery'
    }],
    ['delivered', {
      tr: 'Teslim Edildi',
      en: 'Delivered',
      description: 'Paket başarıyla teslim edildi',
      color: '#green',
      icon: 'delivered'
    }],
    ['completed', {
      tr: 'Tamamlandı',
      en: 'Completed',
      description: 'Gönderi süreci tamamlandı',
      color: '#green',
      icon: 'complete'
    }],
    ['cancelled', {
      tr: 'İptal Edildi',
      en: 'Cancelled',
      description: 'Gönderi iptal edildi',
      color: '#red',
      icon: 'cancel'
    }],
  ]);

  canTransition(currentStatus: string, targetStatus: string): boolean {
    const allowedTransitions = this.statusTransitions.get(currentStatus);
    return allowedTransitions?.includes(targetStatus) || false;
  }

  async updateStatus(
    shipmentId: string,
    newStatus: string,
    location?: string,
    description?: string,
    metadata?: any
  ): Promise<StatusUpdate> {
    // Validate transition
    const currentShipment = await prisma.shipments.findUnique({
      where: { id: shipmentId },
      select: { status: true, userId: true },
    });

    if (!currentShipment) {
      throw new Error('Shipment not found');
    }

    if (!this.canTransition(currentShipment.status, newStatus)) {
      throw new Error(
        `Invalid status transition from ${currentShipment.status} to ${newStatus}`
      );
    }

    // Update shipment status
    await prisma.shipments.update({
      where: { id: shipmentId },
      data: { 
        status: newStatus,
        updatedAt: new Date(),
      },
    });

    // Create status history entry
    const statusHistory = await prisma.shipmentStatusHistory.create({
      data: {
        shipmentId,
        status: newStatus,
        location,
        description: description || this.getDefaultStatusDescription(newStatus),
        occurredAt: new Date(),
        metadata,
      },
    });

    // Trigger status-based actions
    await this.handleStatusActions(shipmentId, newStatus, currentShipment.userId);

    return {
      shipmentId,
      oldStatus: currentShipment.status,
      newStatus,
      statusHistory,
    };
  }

  private async handleStatusActions(
    shipmentId: string,
    status: string,
    userId: string
  ): Promise<void> {
    switch (status) {
      case 'payment_confirmed':
        await this.schedulePickupNotification(shipmentId);
        break;
      
      case 'picked_up':
        await notificationService.sendStatusUpdateNotification(
          userId,
          shipmentId,
          'Paketiniz alındı ve yola çıktı'
        );
        break;
      
      case 'delivered':
        await this.handleDeliveryComplete(shipmentId, userId);
        break;
      
      case 'cancelled':
        await this.handleCancellation(shipmentId, userId);
        break;
    }
  }

  private async handleDeliveryComplete(shipmentId: string, userId: string): Promise<void> {
    // Send delivery notification
    await notificationService.sendStatusUpdateNotification(
      userId,
      shipmentId,
      'Paketiniz başarıyla teslim edildi! 📦✅'
    );

    // Schedule review request (24 hours later)
    await scheduleJob('request_review', {
      shipmentId,
      userId,
    }, { delay: 24 * 60 * 60 * 1000 }); // 24 hours

    // Update carrier performance metrics
    await this.updateCarrierMetrics(shipmentId, 'delivered');
  }

  private getDefaultStatusDescription(status: string): string {
    const description = this.statusDescriptions.get(status);
    return description?.description || 'Durum güncellendi';
  }
}

export const statusManager = new StatusManager();
```

---

## 21. User Experience ve Flow'lar

### 20.1 Kullanıcı Onboarding Flow

```mermaid
graph TD
    A[App Launch] --> B{First Time User?}
    B -->|Yes| C[Welcome Screen]
    B -->|No| D[Login Screen]
    
    C --> E[Registration Options]
    E --> F[Email/Phone Registration]
    E --> G[Social Login]
    
    F --> H[Verification Code]
    G --> H
    
    H --> I[Profile Setup]
    I --> J[Address Setup]
    J --> K[Preferences]
    K --> L[Tutorial]
    L --> M[Home Screen]
    
    D --> N{Login Success?}
    N -->|Yes| M
    N -->|No| O[Login Error]
    O --> D
```

### 20.2 Gönderi Oluşturma Flow

```mermaid
graph TD
    A[Home Screen] --> B[Create Shipment]
    B --> C[Sender Information]
    C --> D{Use Saved Address?}
    D -->|Yes| E[Select Address]
    D -->|No| F[Enter New Address]
    
    E --> G[Receiver Information]
    F --> G
    
    G --> H{Use Contact?}
    H -->|Yes| I[Select Contact]
    H -->|No| J[Enter Receiver Details]
    
    I --> K[Package Details]
    J --> K
    
    K --> L[Weight & Dimensions]
    L --> M[Special Requirements]
    M --> N[Get Quotes]
    
    N --> O[Loading Quotes]
    O --> P[Quote Results]
    
    P --> Q[Select Quote]
    Q --> R[Payment Options]
    R --> S[Process Payment]
    
    S --> T{Payment Success?}
    T -->|Yes| U[Shipment Created]
    T -->|No| V[Payment Error]
    
    V --> R
    U --> W[Tracking Screen]
```

### 20.3 User Interface Design Principles

#### 20.3.1 Design System

```typescript
// src/styles/theme.ts
export const theme = {
  colors: {
    primary: {
      50: '#E3F2FD',
      100: '#BBDEFB',
      500: '#2196F3',
      600: '#1E88E5',
      700: '#1976D2',
      900: '#0D47A1',
    },
    secondary: {
      50: '#FFF3E0',
      500: '#FF9800',
      700: '#F57C00',
    },
    success: {
      50: '#E8F5E8',
      500: '#4CAF50',
      700: '#388E3C',
    },
    error: {
      50: '#FFEBEE',
      500: '#F44336',
      700: '#D32F2F',
    },
    warning: {
      50: '#FFF8E1',
      500: '#FFC107',
      700: '#F9A000',
    },
    gray: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
    white: '#FFFFFF',
    black: '#000000',
  },
  typography: {
    fontFamily: {
      regular: 'Inter-Regular',
      medium: 'Inter-Medium',
      semibold: 'Inter-SemiBold',
      bold: 'Inter-Bold',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
    },
    lineHeight: {
      xs: 16,
      sm: 20,
      md: 24,
      lg: 28,
      xl: 32,
      '2xl': 36,
      '3xl': 42,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    full: 9999,
  },
  shadows: {
    sm: {
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    md: {
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
    },
    lg: {
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
};
```

#### 20.3.2 Component Library

```typescript
// src/components/common/Card/Card.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../../styles/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  shadow?: 'sm' | 'md' | 'lg';
  padding?: keyof typeof theme.spacing;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  style, 
  shadow = 'md',
  padding = 'md'
}) => {
  return (
    <View style={[
      styles.card,
      { padding: theme.spacing[padding] },
      theme.shadows[shadow],
      style,
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
  },
});

export default Card;
```

### 20.4 Error Handling ve User Feedback

```typescript
// src/utils/errorHandler.tsx
import React from 'react';
import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';

export class UserErrorHandler {
  static showError(error: any, context?: string) {
    const errorMessage = this.getUserFriendlyMessage(error, context);
    
    Toast.show({
      type: 'error',
      text1: 'Hata',
      text2: errorMessage,
      position: 'top',
      visibilityTime: 4000,
    });
  }

  static showSuccess(message: string, subtitle?: string) {
    Toast.show({
      type: 'success',
      text1: message,
      text2: subtitle,
      position: 'top',
      visibilityTime: 3000,
    });
  }

  static showWarning(message: string, subtitle?: string) {
    Toast.show({
      type: 'info',
      text1: message,
      text2: subtitle,
      position: 'top',
      visibilityTime: 3500,
    });
  }

  static showConfirmDialog(
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) {
    Alert.alert(
      title,
      message,
      [
        {
          text: 'İptal',
          style: 'cancel',
          onPress: onCancel,
        },
        {
          text: 'Onayla',
          style: 'destructive',
          onPress: onConfirm,
        },
      ]
    );
  }

  private static getUserFriendlyMessage(error: any, context?: string): string {
    // Network errors
    if (error.code === 'NETWORK_ERROR') {
      return 'İnternet bağlantınızı kontrol ediniz';
    }

    // Authentication errors
    if (error.code === 'UNAUTHORIZED') {
      return 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın';
    }

    // Validation errors
    if (error.code === 'VALIDATION_ERROR') {
      return error.message || 'Girdiğiniz bilgileri kontrol ediniz';
    }

    // Payment errors
    if (error.code === 'PAYMENT_FAILED') {
      return 'Ödeme işlemi başarısız. Kart bilgilerinizi kontrol ediniz';
    }

    // Quote errors
    if (error.code === 'NO_QUOTES_AVAILABLE') {
      return 'Bu güzergah için teklif bulunamadı. Lütfen farklı adresler deneyin';
    }

    // Shipment errors
    if (error.code === 'SHIPMENT_NOT_FOUND') {
      return 'Gönderi bulunamadı';
    }

    // Generic error based on context
    switch (context) {
      case 'login':
        return 'Giriş yapılırken bir hata oluştu';
      case 'register':
        return 'Kayıt olurken bir hata oluştu';
      case 'shipment_create':
        return 'Gönderi oluşturulurken bir hata oluştu';
      case 'payment':
        return 'Ödeme işlemi sırasında bir hata oluştu';
      default:
        return error.message || 'Beklenmeyen bir hata oluştu';
    }
  }
}

// Hook for error handling
export const useErrorHandler = () => {
  const showError = (error: any, context?: string) => {
    UserErrorHandler.showError(error, context);
  };

  const showSuccess = (message: string, subtitle?: string) => {
    UserErrorHandler.showSuccess(message, subtitle);
  };

  const showWarning = (message: string, subtitle?: string) => {
    UserErrorHandler.showWarning(message, subtitle);
  };

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    UserErrorHandler.showConfirmDialog(title, message, onConfirm, onCancel);
  };

  return {
    showError,
    showSuccess,
    showWarning,
    showConfirm,
  };
};
```

---

## 22. Geliştirme Süreçleri

### 21.1 Git Repository Yapısı ve Commit Stratejisi

#### 21.1.1 Repository Structure

```
cargolink-mvp/
├── .github/
│   ├── workflows/           # GitHub Actions
│   │   ├── ci-backend.yml
│   │   ├── ci-mobile.yml
│   │   ├── cd-production.yml
│   │   └── cd-staging.yml
│   ├── ISSUE_TEMPLATE/      # Issue templates
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── CODEOWNERS
├── backend/                 # Node.js/Express API
├── mobile/                  # React Native app
├── admin/                   # Admin web panel
├── docs/                    # Project documentation
├── scripts/                 # Build and deployment scripts
├── docker/                  # Docker configurations
├── k8s/                     # Kubernetes manifests
├── .gitignore
├── README.md
├── CONTRIBUTING.md
├── CHANGELOG.md
└── package.json             # Root package.json for monorepo
```

#### 21.1.2 Branching Strategy (Git Flow)

```mermaid
gitgraph
    commit id: "Initial commit"
    
    branch develop
    checkout develop
    commit id: "Setup development"
    
    branch feature/user-auth
    checkout feature/user-auth
    commit id: "Add login API"
    commit id: "Add registration"
    
    checkout develop
    merge feature/user-auth
    
    branch feature/shipment-creation
    checkout feature/shipment-creation
    commit id: "Add shipment model"
    commit id: "Add quote API"
    
    checkout develop
    merge feature/shipment-creation
    
    branch release/v1.0.0
    checkout release/v1.0.0
    commit id: "Prepare release v1.0.0"
    commit id: "Fix release bugs"
    
    checkout main
    merge release/v1.0.0
    commit id: "v1.0.0" tag: "v1.0.0"
    
    checkout develop
    merge release/v1.0.0
    
    branch hotfix/payment-fix
    checkout hotfix/payment-fix
    commit id: "Fix payment gateway"
    
    checkout main
    merge hotfix/payment-fix
    commit id: "v1.0.1" tag: "v1.0.1"
    
    checkout develop
    merge hotfix/payment-fix
```

**Branch Types:**
- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: New features
- `release/*`: Release preparation
- `hotfix/*`: Critical production fixes

#### 21.1.3 Commit Message Convention

```bash
# Format: <type>(<scope>): <subject>

# Types:
feat:     # New feature
fix:      # Bug fix
docs:     # Documentation changes
style:    # Code style changes (formatting, etc.)
refactor: # Code refactoring
perf:     # Performance improvements
test:     # Adding or updating tests
chore:    # Build process or auxiliary tool changes
ci:       # CI configuration changes

# Examples:
feat(auth): add JWT token refresh mechanism
fix(payment): resolve iyzico payment gateway timeout
docs(api): update shipment endpoint documentation
refactor(database): optimize query performance
test(shipment): add unit tests for quote calculation
chore(deps): update React Native to 0.73
ci(github): add automated security scanning
```

#### 21.1.4 Pull Request Process

```yaml
# .github/PULL_REQUEST_TEMPLATE.md
## Pull Request Checklist

### Description
Brief description of changes made.

### Type of Change
- [ ] 🐛 Bug fix (non-breaking change)
- [ ] ✨ New feature (non-breaking change)
- [ ] 💥 Breaking change (fix or feature causing existing functionality to not work)
- [ ] 📚 Documentation update
- [ ] 🔧 Configuration change
- [ ] 🧹 Code cleanup/refactoring

### Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

### Code Quality
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Code is commented appropriately
- [ ] No console.log statements in production code

### Security
- [ ] No sensitive data exposed
- [ ] Input validation implemented
- [ ] Authentication/authorization checks added

### Documentation
- [ ] README updated (if needed)
- [ ] API documentation updated (if needed)
- [ ] Comments added to complex code

### Database Changes
- [ ] Migration scripts created
- [ ] Database changes are backward compatible
- [ ] Data migration tested

### Screenshots (if applicable)
Please add screenshots for UI changes.

### Related Issues
Closes #issue_number
```

### 21.2 Code Quality Standards

#### 21.2.1 ESLint Configuration

```json
// backend/.eslintrc.js
{
  "extends": [
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "plugins": ["@typescript-eslint", "security"],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "security/detect-sql-injection": "error",
    "security/detect-object-injection": "warn",
    "no-console": "error",
    "prefer-const": "error",
    "no-var": "error"
  },
  "overrides": [
    {
      "files": ["*.test.ts", "*.spec.ts"],
      "rules": {
        "no-console": "off",
        "@typescript-eslint/no-explicit-any": "off"
      }
    }
  ]
}
```

#### 21.2.2 Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

#### 21.2.3 Pre-commit Hooks

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
  "lint-staged": {
    "backend/**/*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "jest --findRelatedTests --passWithNoTests"
    ],
    "mobile/**/*.{ts,tsx}": [
      "eslint --fix", 
      "prettier --write"
    ],
    "**/*.{md,json,yml,yaml}": [
      "prettier --write"
    ]
  }
}
```

### 21.3 Development Workflow

#### 21.3.1 Local Development Setup

```bash
#!/bin/bash
# scripts/setup-dev.sh

echo "🚀 Setting up CargoLink development environment..."

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "Node.js is required"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "Docker is required"; exit 1; }

# Clone repository
git clone https://github.com/cargolink/cargolink-mvp.git
cd cargolink-mvp

# Install root dependencies
npm install

# Setup backend
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev

# Setup mobile
cd ../mobile
cp .env.example .env
npm install

# For iOS (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    cd ios && pod install && cd ..
fi

# Setup admin panel
cd ../admin
npm install

# Start development environment
cd ..
docker-compose up -d postgres redis

echo "✅ Development environment ready!"
echo "Backend: http://localhost:3000"
echo "Admin Panel: http://localhost:3001"
echo "Mobile: Run 'npm run ios' or 'npm run android' in mobile/"
```

#### 21.3.2 Development Commands

```json
// package.json (root)
{
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:admin\"",
    "dev:backend": "cd backend && npm run dev",
    "dev:admin": "cd admin && npm run dev",
    "dev:mobile": "cd mobile && npm run start",
    
    "build": "npm run build:backend && npm run build:admin",
    "build:backend": "cd backend && npm run build",
    "build:admin": "cd admin && npm run build",
    "build:mobile:ios": "cd mobile && npm run build:ios",
    "build:mobile:android": "cd mobile && npm run build:android",
    
    "test": "npm run test:backend && npm run test:mobile",
    "test:backend": "cd backend && npm run test",
    "test:mobile": "cd mobile && npm run test",
    "test:e2e": "cd mobile && npm run test:e2e",
    
    "lint": "npm run lint:backend && npm run lint:mobile && npm run lint:admin",
    "lint:fix": "npm run lint:backend:fix && npm run lint:mobile:fix && npm run lint:admin:fix",
    "lint:backend": "cd backend && npm run lint",
    "lint:backend:fix": "cd backend && npm run lint:fix",
    "lint:mobile": "cd mobile && npm run lint",
    "lint:mobile:fix": "cd mobile && npm run lint:fix",
    "lint:admin": "cd admin && npm run lint",
    "lint:admin:fix": "cd admin && npm run lint:fix",
    
    "db:migrate": "cd backend && npx prisma migrate dev",
    "db:seed": "cd backend && npx prisma db seed",
    "db:reset": "cd backend && npx prisma migrate reset",
    
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f",
    
    "deploy:staging": "./scripts/deploy-staging.sh",
    "deploy:production": "./scripts/deploy-production.sh"
  }
}
```

### 21.4 Release Management

#### 21.4.1 Semantic Versioning

```
MAJOR.MINOR.PATCH

MAJOR: Breaking changes
MINOR: New features (backward compatible)
PATCH: Bug fixes (backward compatible)

Examples:
1.0.0 - Initial release
1.1.0 - Added payment gateway integration
1.1.1 - Fixed payment timeout issue
2.0.0 - Changed API response format (breaking)
```

#### 21.4.2 Changelog Management

```markdown
# CHANGELOG.md

## [Unreleased]

### Added
- Real-time tracking with WebSocket support
- Push notification preferences

### Changed
- Improved quote calculation algorithm
- Updated UI components to match new design system

### Fixed
- Payment gateway timeout issues
- Memory leak in tracking service

## [1.1.0] - 2024-01-15

### Added
- İyzico payment gateway integration
- SMS notifications via Twilio
- Admin panel user management

### Changed
- Optimized database queries for better performance
- Updated React Native to 0.73

### Fixed
- Authentication token refresh bug
- Shipment status update race condition

## [1.0.0] - 2024-01-01

### Added
- Initial MVP release
- User registration and authentication
- Shipment creation and quote comparison
- Basic tracking functionality
- Mobile app for iOS and Android
```

#### 21.4.3 Release Process

```bash
#!/bin/bash
# scripts/release.sh

VERSION=$1
if [ -z "$VERSION" ]; then
    echo "Usage: ./release.sh <version>"
    exit 1
fi

echo "🚀 Preparing release v$VERSION"

# Ensure we're on develop branch
git checkout develop
git pull origin develop

# Run tests
echo "🧪 Running tests..."
npm run test || { echo "Tests failed"; exit 1; }

# Create release branch
git checkout -b "release/v$VERSION"

# Update version in package.json files
npm version $VERSION --no-git-tag-version
cd backend && npm version $VERSION --no-git-tag-version
cd ../mobile && npm version $VERSION --no-git-tag-version  
cd ../admin && npm version $VERSION --no-git-tag-version
cd ..

# Update CHANGELOG.md
echo "📝 Update CHANGELOG.md manually, then press any key..."
read -n 1 -s

# Commit version bump
git add -A
git commit -m "chore(release): prepare v$VERSION"

# Merge to main
git checkout main
git pull origin main
git merge "release/v$VERSION"

# Tag release
git tag -a "v$VERSION" -m "Release v$VERSION"

# Push to main
git push origin main
git push origin "v$VERSION"

# Merge back to develop
git checkout develop
git merge main

# Push to develop
git push origin develop

# Delete release branch
git branch -d "release/v$VERSION"

echo "✅ Release v$VERSION completed!"
echo "Don't forget to:"
echo "1. Create GitHub release with changelog"
echo "2. Deploy to staging and production"
echo "3. Submit mobile app updates to stores"
```

---

## 📝 Sonuç ve Özet

Bu kapsamlı teknik dokümantasyon, CargoLink MVP projesinin tüm teknik detaylarını içermektedir. Dokümantasyon şunları kapsar:

### ✅ Tamamlanan Bölümler:
- **Proje Genel Bakış**: Vizyon, problem tanımı, kullanıcı grupları
- **Teknik Stack**: React Native, Node.js, PostgreSQL, Redis
- **Sistem Mimarisi**: Microservices, API Gateway, Data Flow
- **Database Tasarımı**: Şema, indexler, views, Redis yapıları
- **API Dokümantasyonu**: RESTful endpoints, WebSocket, authentication
- **Frontend Mimarisi**: React Native yapısı, state management, navigation
- **Backend Mimarisi**: Express.js, services, middleware, controllers
- **Professional Website**: Next.js 14, Stripe-benzeri tasarım, SEO optimizasyonu
- **Kargo Entegrasyonları**: Yurtiçi, Aras, MNG, DHL API entegrasyonları
- **Ödeme Sistemi**: İyzico, PayTR, Stripe entegrasyonları
- **Real-time Sistem**: WebSocket, tracking, live updates
- **Güvenlik**: JWT, encryption, middleware
- **Admin Panel**: Dashboard, management interfaces
- **Bildirim Sistemi**: Push, SMS, email notifications
- **File Storage**: AWS S3 entegrasyonu, media management
- **Testing**: Unit, integration, E2E test stratejileri
- **DevOps**: Docker, Kubernetes, CI/CD pipelines
- **Performance**: Caching, optimization, monitoring
- **Business Logic**: Fiyatlandırma, komisyon, status management
- **UX Design**: UI/UX flows, error handling, feedback
- **Development**: Git workflow, code quality, release management

### 📊 Proje İstatistikleri:
- **Toplam Satır**: 5000+ satır kapsamlı dokümantasyon
- **Teknik Bileşen**: 20+ ana sistem bileşeni
- **API Endpoint**: 50+ REST API endpoint
- **Database Tablo**: 15+ ana tablo yapısı
- **External Integration**: 10+ harici servis entegrasyonu
- **Test Coverage**: Unit, Integration, E2E test kapsamı

### 🎯 Gelecek Adımlar:
1. **Code Mode'a geçiş**: Bu dokümantasyona dayanarak implementasyon
2. **MVP Geliştirme**: Öncelikli özelliklerin kodlanması
3. **Test Implementation**: Test suite'lerinin oluşturulması
4. **Deployment Setup**: Production ortamının hazırlanması
5. **Monitoring Setup**: Monitoring ve alerting sistemlerinin kurulması

Bu dokümantasyon, CargoLink MVP'sinin başarılı bir şekilde geliştirilmesi için gerekli tüm teknik bilgileri sağlamaktadır. Her bölüm, implementation sırasında referans olarak kullanılabilecek detayda hazırlanmıştır.

**🚀 Proje artık implementasyon için hazır!**