import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@cargolink.com.tr' },
    update: {},
    create: {
      email: 'admin@cargolink.com.tr',
      phone: '+905551234567',
      firstName: 'Admin',
      lastName: 'User',
      password: await bcryptjs.hash('Admin123!', 12),
      role: 'ADMIN',
      accountType: 'BUSINESS',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
      emailVerifiedAt: new Date(),
      phoneVerifiedAt: new Date(),
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(),
      termsAcceptedAt: new Date(),
      privacyPolicyAcceptedAt: new Date(),
      preferences: {
        language: 'tr',
        currency: 'TRY',
        notifications: {
          email: true,
          push: true,
          sms: false,
          marketing: false
        },
        privacy: {
          showProfile: false,
          showHistory: false
        },
        theme: 'light'
      }
    },
  });

  console.log('👤 Admin user created:', adminUser.email);

  // Create test customer
  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@test.com' },
    update: {},
    create: {
      email: 'customer@test.com',
      phone: '+905551234568',
      firstName: 'Test',
      lastName: 'Customer',
      password: await bcryptjs.hash('Customer123!', 12),
      role: 'CUSTOMER',
      accountType: 'INDIVIDUAL',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
      emailVerifiedAt: new Date(),
      phoneVerifiedAt: new Date(),
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(),
      termsAcceptedAt: new Date(),
      privacyPolicyAcceptedAt: new Date(),
      preferences: {
        language: 'tr',
        currency: 'TRY',
        notifications: {
          email: true,
          push: true,
          sms: true,
          marketing: true
        },
        privacy: {
          showProfile: true,
          showHistory: false
        },
        theme: 'auto'
      }
    },
  });

  console.log('👤 Test customer created:', customerUser.email);

  // Create test carrier
  const carrierUser = await prisma.user.upsert({
    where: { email: 'carrier@test.com' },
    update: {},
    create: {
      email: 'carrier@test.com',
      phone: '+905551234569',
      firstName: 'Test',
      lastName: 'Carrier',
      password: await bcryptjs.hash('Carrier123!', 12),
      role: 'CARRIER',
      accountType: 'INDIVIDUAL',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
      emailVerifiedAt: new Date(),
      phoneVerifiedAt: new Date(),
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(),
      termsAcceptedAt: new Date(),
      privacyPolicyAcceptedAt: new Date(),
      carrierInfo: {
        driverLicense: 'ABC123456',
        driverLicenseExpiry: '2026-12-31T00:00:00Z',
        commercialPermit: 'COM789012',
        commercialPermitExpiry: '2025-06-30T00:00:00Z',
        vehicleCount: 1,
        serviceAreas: ['34', '06', '35'], // Istanbul, Ankara, Izmir
        specializations: ['general', 'express'],
        rating: 4.5,
        completedJobs: 150,
        insurancePolicy: 'INS456789',
        insuranceExpiry: '2025-12-31T00:00:00Z'
      },
      preferences: {
        language: 'tr',
        currency: 'TRY',
        notifications: {
          email: true,
          push: true,
          sms: true,
          marketing: false
        },
        privacy: {
          showProfile: true,
          showHistory: true
        },
        theme: 'light'
      }
    },
  });

  console.log('🚛 Test carrier created:', carrierUser.email);

  // Create addresses for customer
  const customerAddress1 = await prisma.address.create({
    data: {
      userId: customerUser.id,
      title: 'Ev Adresi',
      firstName: 'Test',
      lastName: 'Customer',
      addressLine1: 'Atatürk Mahallesi No:123',
      addressLine2: 'Daire 4',
      city: 'Istanbul',
      district: 'Kadıköy',
      neighborhood: 'Atatürk',
      postalCode: '34710',
      country: 'TR',
      phone: '+905551234568',
      email: 'customer@test.com',
      latitude: 40.9900,
      longitude: 29.0300,
      isDefault: true
    }
  });

  const customerAddress2 = await prisma.address.create({
    data: {
      userId: customerUser.id,
      title: 'İş Adresi',
      firstName: 'Test',
      lastName: 'Customer',
      company: 'Test Company Ltd.',
      addressLine1: 'İş Merkezi No:456',
      city: 'Istanbul',
      district: 'Şişli',
      neighborhood: 'Merkez',
      postalCode: '34360',
      country: 'TR',
      phone: '+902123456789',
      email: 'customer@test.com',
      latitude: 41.0600,
      longitude: 28.9800,
      isDefault: false
    }
  });

  console.log('📍 Customer addresses created');

  // Create major cargo companies
  const yurticiKargo = await prisma.cargoCompany.create({
    data: {
      name: 'Yurtiçi Kargo',
      legalName: 'Yurtiçi Kargo Servisi A.Ş.',
      type: 'ENTERPRISE',
      status: 'ACTIVE',
      isVerified: true,
      verifiedAt: new Date(),
      verifiedBy: adminUser.id,
      contacts: [
        {
          name: 'Customer Service',
          phone: '+908506006060',
          email: 'info@yurtici.com.tr'
        }
      ],
      addresses: [
        {
          title: 'Headquarters',
          addressLine1: 'Yurtiçi Kargo Merkez',
          city: 'Istanbul',
          district: 'Ümraniye',
          postalCode: '34768',
          country: 'TR'
        }
      ],
      headquarters: {
        title: 'Headquarters',
        addressLine1: 'Yurtiçi Kargo Merkez',
        city: 'Istanbul',
        district: 'Ümraniye',
        postalCode: '34768',
        country: 'TR'
      },
      taxNumber: '1234567890',
      taxOffice: 'Ümraniye',
      tradeRegistryNumber: 'TR123456789',
      establishmentDate: new Date('1982-01-01'),
      employeeCount: 15000,
      specializations: ['GENERAL', 'EXPRESS', 'DOCUMENTS', 'INTERNATIONAL'],
      serviceTypes: ['STANDARD', 'EXPRESS', 'NEXT_DAY', 'SAME_DAY'],
      serviceAreas: [
        {
          country: 'TR',
          cities: ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya'],
          isInternational: false,
          deliveryDays: 2,
          additionalCost: 0
        }
      ],
      businessHours: {
        monday: [{ startTime: '09:00', endTime: '18:00', available: true }],
        tuesday: [{ startTime: '09:00', endTime: '18:00', available: true }],
        wednesday: [{ startTime: '09:00', endTime: '18:00', available: true }],
        thursday: [{ startTime: '09:00', endTime: '18:00', available: true }],
        friday: [{ startTime: '09:00', endTime: '18:00', available: true }],
        saturday: [{ startTime: '09:00', endTime: '13:00', available: true }],
        sunday: [{ startTime: '00:00', endTime: '00:00', available: false }]
      },
      integrationType: 'API',
      apiConfig: {
        endpoint: 'https://api.yurtici.com.tr/v2',
        authentication: {
          type: 'api_key',
          credentials: {
            apiKey: 'test_api_key',
            apiSecret: 'test_api_secret'
          }
        },
        rateLimits: {
          requestsPerMinute: 100,
          dailyQuota: 10000
        },
        capabilities: {
          quoteGeneration: true,
          shipmentCreation: true,
          tracking: true,
          labelGeneration: true,
          cancellation: true,
          rateCalculation: true
        }
      },
      commissionRate: 0.05,
      rating: 4.2,
      reviewCount: 2500,
      totalShipments: 150000,
      onTimeDeliveryRate: 92.5,
      avgResponseTime: 15,
      avgTransitTime: 2,
      licenses: [],
      certifications: [],
      insurance: {
        provider: 'Test Insurance Co.',
        policyNumber: 'POL123456',
        coverage: 1000000,
        expiresAt: '2025-12-31T00:00:00Z'
      },
      agreementVersion: '1.0',
      agreementAcceptedAt: new Date(),
      settlementFrequency: 'MONTHLY'
    }
  });

  console.log('🏢 Yurtiçi Kargo created');

  const arasKargo = await prisma.cargoCompany.create({
    data: {
      name: 'Aras Kargo',
      legalName: 'Aras Kargo A.Ş.',
      type: 'ENTERPRISE',
      status: 'ACTIVE',
      isVerified: true,
      verifiedAt: new Date(),
      verifiedBy: adminUser.id,
      contacts: [
        {
          name: 'Customer Service',
          phone: '+908504440606',
          email: 'info@araskargo.com.tr'
        }
      ],
      addresses: [
        {
          title: 'Headquarters',
          addressLine1: 'Aras Kargo Merkez',
          city: 'Istanbul',
          district: 'Sancaktepe',
          postalCode: '34885',
          country: 'TR'
        }
      ],
      headquarters: {
        title: 'Headquarters',
        addressLine1: 'Aras Kargo Merkez',
        city: 'Istanbul',
        district: 'Sancaktepe',
        postalCode: '34885',
        country: 'TR'
      },
      taxNumber: '2345678901',
      taxOffice: 'Sancaktepe',
      tradeRegistryNumber: 'TR234567890',
      establishmentDate: new Date('1979-01-01'),
      employeeCount: 12000,
      specializations: ['GENERAL', 'EXPRESS', 'DOCUMENTS', 'INTERNATIONAL', 'COLD_CHAIN'],
      serviceTypes: ['STANDARD', 'EXPRESS', 'NEXT_DAY'],
      serviceAreas: [
        {
          country: 'TR',
          cities: ['Istanbul', 'Ankara', 'Izmir', 'Adana', 'Bursa'],
          isInternational: false,
          deliveryDays: 2,
          additionalCost: 0
        }
      ],
      businessHours: {
        monday: [{ startTime: '08:30', endTime: '18:30', available: true }],
        tuesday: [{ startTime: '08:30', endTime: '18:30', available: true }],
        wednesday: [{ startTime: '08:30', endTime: '18:30', available: true }],
        thursday: [{ startTime: '08:30', endTime: '18:30', available: true }],
        friday: [{ startTime: '08:30', endTime: '18:30', available: true }],
        saturday: [{ startTime: '09:00', endTime: '14:00', available: true }],
        sunday: [{ startTime: '00:00', endTime: '00:00', available: false }]
      },
      integrationType: 'API',
      commissionRate: 0.06,
      rating: 4.1,
      reviewCount: 1800,
      totalShipments: 120000,
      onTimeDeliveryRate: 89.5,
      avgResponseTime: 20,
      avgTransitTime: 2,
      licenses: [],
      certifications: [],
      insurance: {
        provider: 'Test Insurance Co.',
        policyNumber: 'POL234567',
        coverage: 800000,
        expiresAt: '2025-12-31T00:00:00Z'
      },
      agreementVersion: '1.0',
      agreementAcceptedAt: new Date(),
      settlementFrequency: 'MONTHLY'
    }
  });

  console.log('🏢 Aras Kargo created');

  // Create vehicles for the test carrier
  const testVehicle = await prisma.vehicle.create({
    data: {
      type: 'VAN',
      brand: 'Ford',
      model: 'Transit',
      year: 2020,
      plateNumber: '34ABC123',
      capacity: {
        weight: 1500, // kg
        volume: 10, // m3
        dimensions: {
          length: 400, // cm
          width: 200, // cm
          height: 200 // cm
        }
      },
      features: ['GPS_TRACKING', 'FRAGILE_HANDLING'],
      insuranceNumber: 'VEH123456',
      insuranceExpiry: new Date('2025-12-31'),
      inspectionExpiry: new Date('2025-06-30'),
      isActive: true,
      images: []
    }
  });

  console.log('🚐 Test vehicle created');

  // Create pricing rules for Yurtiçi Kargo
  const yurticiPricingRule = await prisma.pricingRule.create({
    data: {
      cargoCompanyId: yurticiKargo.id,
      name: 'Standard Istanbul Pricing',
      serviceType: 'STANDARD',
      specializations: ['GENERAL'],
      fromCities: ['Istanbul'],
      toCities: ['Ankara', 'Izmir', 'Bursa'],
      distance: {
        min: 0,
        max: 1000
      },
      weightRanges: [
        {
          min: 0,
          max: 5,
          baseCost: 25.00,
          additionalCostPerKg: 2.50
        },
        {
          min: 5,
          max: 30,
          baseCost: 35.00,
          additionalCostPerKg: 2.00
        }
      ],
      volumeRanges: [],
      fuelSurcharge: 5.00,
      insuranceRate: 0.002,
      specialServiceCosts: {
        coldChain: 15.00,
        fragileHandling: 8.00,
        signatureRequired: 3.00,
        weekendDelivery: 10.00,
        expressDelivery: 20.00
      },
      deliveryTimeModifiers: {
        sameDay: 3.0,
        nextDay: 1.5,
        express: 1.2
      },
      seasonalModifiers: [],
      isActive: true,
      validFrom: new Date(),
      validUntil: new Date('2025-12-31')
    }
  });

  console.log('💰 Pricing rule created for Yurtiçi Kargo');

  // Create wallet for test customer
  const customerWallet = await prisma.wallet.create({
    data: {
      userId: customerUser.id,
      balance: 1000.00,
      currency: 'TRY',
      dailySpendLimit: 2000.00,
      monthlySpendLimit: 20000.00,
      isActive: true,
      isFrozen: false,
      isVerified: true,
      verifiedAt: new Date(),
      verificationLevel: 'enhanced'
    }
  });

  console.log('💳 Customer wallet created');

  console.log('✅ Database seeding completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error during database seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });