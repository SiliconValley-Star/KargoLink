import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
export let errorRate = new Rate('errors');

// Load test configuration
export let options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up to 10 users
    { duration: '5m', target: 50 }, // Stay at 50 users
    { duration: '2m', target: 100 }, // Peak load
    { duration: '5m', target: 100 }, // Sustain peak
    { duration: '2m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% requests under 2s
    http_req_failed: ['rate<0.1'], // Error rate under 10%
    errors: ['rate<0.1'],
  },
};

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:3001';

// Test data
const testUser = {
  email: `loadtest+${Math.random()}@example.com`,
  password: 'LoadTest123!',
  firstName: 'Load',
  lastName: 'Test'
};

export function setup() {
  // Register a test user
  const registerResponse = http.post(`${BASE_URL}/api/v1/auth/register`, {
    ...testUser,
    phone: '+905551234567'
  });

  if (registerResponse.status === 201) {
    // Login to get token
    const loginResponse = http.post(`${BASE_URL}/api/v1/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });

    if (loginResponse.status === 200) {
      return {
        token: loginResponse.json('data.token'),
        userId: loginResponse.json('data.user.id')
      };
    }
  }

  return {};
}

export default function(data) {
  const headers = {
    'Authorization': `Bearer ${data.token}`,
    'Content-Type': 'application/json',
  };

  // Health check endpoint
  let healthCheck = http.get(`${BASE_URL}/health`);
  check(healthCheck, {
    'Health check status is 200': (r) => r.status === 200,
    'Health check response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  sleep(1);

  if (!data.token) {
    console.log('No auth token available, skipping authenticated tests');
    return;
  }

  // Test authenticated endpoints
  testAuthenticatedEndpoints(headers, data);
  
  // Test public endpoints
  testPublicEndpoints();

  sleep(Math.random() * 3 + 1); // Random sleep 1-4 seconds
}

function testAuthenticatedEndpoints(headers, data) {
  // Get user profile
  let profileResponse = http.get(`${BASE_URL}/api/v1/users/profile`, { headers });
  check(profileResponse, {
    'Profile fetch status is 200': (r) => r.status === 200,
    'Profile response time < 1s': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);

  // List user addresses
  let addressesResponse = http.get(`${BASE_URL}/api/v1/users/addresses`, { headers });
  check(addressesResponse, {
    'Addresses fetch status is 200': (r) => r.status === 200,
    'Addresses response time < 1s': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);

  // List user shipments
  let shipmentsResponse = http.get(`${BASE_URL}/api/v1/shipments`, { headers });
  check(shipmentsResponse, {
    'Shipments fetch status is 200': (r) => r.status === 200,
    'Shipments response time < 2s': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);

  // Create address test
  let addressData = {
    type: 'HOME',
    title: 'Load Test Address',
    fullName: 'Load Test User',
    phone: '+905551234567',
    addressLine1: 'Test Street 123',
    city: 'Istanbul',
    district: 'Besiktas',
    postalCode: '34353',
    country: 'Turkey'
  };

  let createAddressResponse = http.post(`${BASE_URL}/api/v1/users/addresses`, JSON.stringify(addressData), { headers });
  check(createAddressResponse, {
    'Address creation status is 201': (r) => r.status === 201,
    'Address creation response time < 1s': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);
}

function testPublicEndpoints() {
  // Test tracking endpoint (public)
  let trackingResponse = http.get(`${BASE_URL}/api/v1/shipments/tracking/TEST123456`);
  check(trackingResponse, {
    'Tracking endpoint accessible': (r) => r.status === 404 || r.status === 200, // 404 is OK for non-existent tracking
    'Tracking response time < 1s': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);

  // Test cargo companies endpoint
  let cargoResponse = http.get(`${BASE_URL}/api/v1/cargo/companies`);
  check(cargoResponse, {
    'Cargo companies status is 200': (r) => r.status === 200,
    'Cargo companies response time < 1s': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);

  // Test quote calculation (if available)
  let quoteData = {
    pickupCity: 'Istanbul',
    deliveryCity: 'Ankara',
    weight: 2.5,
    dimensions: { length: 30, width: 20, height: 10 }
  };

  let quoteResponse = http.post(`${BASE_URL}/api/v1/cargo/quote`, JSON.stringify(quoteData), {
    headers: { 'Content-Type': 'application/json' }
  });
  check(quoteResponse, {
    'Quote calculation accessible': (r) => r.status >= 200 && r.status < 500,
    'Quote response time < 3s': (r) => r.timings.duration < 3000,
  }) || errorRate.add(1);
}

export function teardown(data) {
  // Cleanup: Delete test user if needed
  if (data.token) {
    http.del(`${BASE_URL}/api/v1/users/profile`, {
      headers: { 'Authorization': `Bearer ${data.token}` }
    });
  }
}

export function handleSummary(data) {
  return {
    'results/load-test-summary.json': JSON.stringify(data, null, 2),
    'results/load-test-report.html': `
      <!DOCTYPE html>
      <html>
        <head>
          <title>CargoLink Load Test Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .metric { background: #f5f5f5; padding: 10px; margin: 10px 0; }
            .success { color: green; }
            .warning { color: orange; }
            .error { color: red; }
          </style>
        </head>
        <body>
          <h1>🏋️ CargoLink Load Test Report</h1>
          <div class="metric">
            <h3>📊 Key Metrics</h3>
            <p><strong>Total Requests:</strong> ${data.metrics.http_reqs.count}</p>
            <p><strong>Failed Requests:</strong> ${data.metrics.http_req_failed.count} (${(data.metrics.http_req_failed.rate * 100).toFixed(2)}%)</p>
            <p><strong>Average Response Time:</strong> ${data.metrics.http_req_duration.avg.toFixed(2)}ms</p>
            <p><strong>95th Percentile:</strong> ${data.metrics.http_req_duration['p(95)'].toFixed(2)}ms</p>
          </div>
          <div class="metric">
            <h3>🎯 Thresholds</h3>
            <p class="${data.metrics.http_req_duration['p(95)'] < 2000 ? 'success' : 'error'}">
              95% Response Time: ${data.metrics.http_req_duration['p(95)'].toFixed(2)}ms (< 2000ms)
            </p>
            <p class="${data.metrics.http_req_failed.rate < 0.1 ? 'success' : 'error'}">
              Error Rate: ${(data.metrics.http_req_failed.rate * 100).toFixed(2)}% (< 10%)
            </p>
          </div>
        </body>
      </html>
    `
  };
}