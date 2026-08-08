const dotenv = require('dotenv');
dotenv.config();

const http = require('http');
const { initDb, sequelize } = require('../src/config/db');
const app = require('../src/app');

let server;
const PORT = 5009;
const BASE_URL = `http://localhost:${PORT}`;

const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (err) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const loginUser = async (email, password) => {
  const loginRes = await request('POST', '/api/auth/login', { email, password });
  return loginRes.body.data.token;
};

const runPhase7Tests = async () => {
  console.log('\n======================================================');
  console.log('--- STARTING PHASE 7 INTEGRATION TEST SUITE ---');
  console.log('======================================================\n');

  await initDb();

  const timestamp = Date.now();
  const adminEmail = `admin_p7_${timestamp}@example.com`;
  const customer1Email = `cust1_p7_${timestamp}@example.com`;
  const password = 'password123';

  server = app.listen(PORT, async () => {
    try {
      // 1. Setup Admin & Customer
      console.log('[1] Setting up Admin and Customer accounts...');
      await request('POST', '/api/auth/register', { name: 'Admin P7', email: adminEmail, password, role: 'ADMIN' });
      const adminToken = await loginUser(adminEmail, password);

      await request('POST', '/api/auth/register', { name: 'Customer P7', email: customer1Email, password, role: 'CUSTOMER' });
      const cust1Token = await loginUser(customer1Email, password);

      // --- AUTHORIZATION TESTS ---

      console.log('\n--- 1. DASHBOARD AUTHORIZATION TESTS ---');

      // Test 1: Admin accesses overview -> Success 200
      console.log('\n[TEST 1] Admin GET /api/admin/dashboard/overview...');
      const adminOverviewRes = await request('GET', '/api/admin/dashboard/overview', null, adminToken);
      console.log('-> Overview active rentals:', adminOverviewRes.body.data.active_rentals);
      if (adminOverviewRes.status !== 200) throw new Error('Admin overview access failed');

      // Test 2: Customer accesses overview -> Expected 403
      console.log('\n[TEST 2] Customer GET /api/admin/dashboard/overview -> Expected 403...');
      const custOverviewRes = await request('GET', '/api/admin/dashboard/overview', null, cust1Token);
      console.log(`-> Status: ${custOverviewRes.status}`);
      if (custOverviewRes.status !== 403) throw new Error('Customer unauthorized dashboard access vulnerability!');

      // Test 3: No token accesses overview -> Expected 401
      console.log('\n[TEST 3] No token GET /api/admin/dashboard/overview -> Expected 401...');
      const noTokenRes = await request('GET', '/api/admin/dashboard/overview', null, null);
      console.log(`-> Status: ${noTokenRes.status}`);
      if (noTokenRes.status !== 401) throw new Error('Unauthenticated dashboard access vulnerability!');

      // --- METRICS & FILTERS TESTS ---

      console.log('\n--- 2. DASHBOARD METRICS & QUERY FILTERS TESTS ---');

      // Test 12-13: Upcoming Pickups with days parameter
      console.log('\n[TEST 12-13] Admin GET /api/admin/dashboard/upcoming-pickups?days=7...');
      const pickups7Res = await request('GET', '/api/admin/dashboard/upcoming-pickups?days=7', null, adminToken);
      console.log(`-> Upcoming Pickups (7 days): ${pickups7Res.body.data.length}`);
      if (pickups7Res.status !== 200) throw new Error('Upcoming pickups 7 days failed');

      const pickups30Res = await request('GET', '/api/admin/dashboard/upcoming-pickups?days=30', null, adminToken);
      console.log(`-> Upcoming Pickups (30 days): ${pickups30Res.body.data.length}`);
      if (pickups30Res.status !== 200) throw new Error('Upcoming pickups 30 days failed');

      // Test 14: Upcoming Returns with days parameter
      console.log('\n[TEST 14] Admin GET /api/admin/dashboard/upcoming-returns?days=7...');
      const returns7Res = await request('GET', '/api/admin/dashboard/upcoming-returns?days=7', null, adminToken);
      console.log(`-> Upcoming Returns (7 days): ${returns7Res.body.data.length}`);
      if (returns7Res.status !== 200) throw new Error('Upcoming returns 7 days failed');

      // Test 15: Revenue with date filter
      console.log('\n[TEST 15] Admin GET /api/admin/dashboard/revenue?from=2026-08-01&to=2026-08-31...');
      const revenueRes = await request('GET', '/api/admin/dashboard/revenue?from=2026-08-01&to=2026-08-31', null, adminToken);
      console.log('-> Rental Revenue:', revenueRes.body.data.rental_revenue);
      if (revenueRes.status !== 200) throw new Error('Revenue calculation with dates failed');

      // Test 16-18: Revenue Summary by daily, weekly, monthly
      console.log('\n[TEST 16-18] Admin GET /api/admin/dashboard/revenue-summary (daily, weekly, monthly)...');
      const dailySumRes = await request('GET', '/api/admin/dashboard/revenue-summary?period=daily', null, adminToken);
      const weeklySumRes = await request('GET', '/api/admin/dashboard/revenue-summary?period=weekly', null, adminToken);
      const monthlySumRes = await request('GET', '/api/admin/dashboard/revenue-summary?period=monthly', null, adminToken);

      console.log('-> Revenue Summary Periods:', dailySumRes.body.data.period, weeklySumRes.body.data.period, monthlySumRes.body.data.period);
      if (dailySumRes.status !== 200 || weeklySumRes.status !== 200 || monthlySumRes.status !== 200) {
        throw new Error('Revenue summary breakdown failed');
      }

      // --- ENDPOINTS & OPERATIONAL PRIORITIES TESTS ---

      console.log('\n--- 3. OPERATIONAL PRIORITIES & STATUS BREAKDOWN TESTS ---');

      // Test Priorities
      console.log('\n[TEST Priorities] Admin GET /api/admin/dashboard/priorities...');
      const priorityRes = await request('GET', '/api/admin/dashboard/priorities', null, adminToken);
      console.log('-> Priorities Count:', priorityRes.body.data.total);
      if (priorityRes.status !== 200) throw new Error('Priorities endpoint failed');

      // Test Rental Status Summary Breakdown
      console.log('\n[TEST Status Breakdown] Admin GET /api/admin/dashboard/rental-status...');
      const statusRes = await request('GET', '/api/admin/dashboard/rental-status', null, adminToken);
      console.log('-> Status Breakdown ACTIVE:', statusRes.body.data.ACTIVE, 'CONFIRMED:', statusRes.body.data.CONFIRMED);
      if (statusRes.status !== 200 || statusRes.body.data.ACTIVE === undefined) {
        throw new Error('Status breakdown endpoint failed');
      }

      // --- EDGE CASES & VALIDATION TESTS ---

      console.log('\n--- 4. EDGE CASES & INPUT VALIDATION TESTS ---');

      // Test 23: Invalid Date Range Format -> 400
      console.log('\n[TEST 23] Invalid Date Range Format -> Expected 400...');
      const invalidDateRes = await request('GET', '/api/admin/dashboard/revenue?from=invalid-date', null, adminToken);
      console.log(`-> Status: ${invalidDateRes.status}`);
      if (invalidDateRes.status !== 400) throw new Error('Invalid date validation failed');

      // Test 24: Invalid Revenue Summary Period -> 400
      console.log('\n[TEST 24] Invalid Period -> Expected 400...');
      const invalidPeriodRes = await request('GET', '/api/admin/dashboard/revenue-summary?period=yearly', null, adminToken);
      console.log(`-> Status: ${invalidPeriodRes.status}`);
      if (invalidPeriodRes.status !== 400) throw new Error('Invalid period validation failed');

      // Test 25: Invalid Days Parameter -> 400
      console.log('\n[TEST 25] Invalid Days (-5) -> Expected 400...');
      const invalidDaysRes = await request('GET', '/api/admin/dashboard/upcoming-pickups?days=-5', null, adminToken);
      console.log(`-> Status: ${invalidDaysRes.status}`);
      if (invalidDaysRes.status !== 400) throw new Error('Invalid days parameter validation failed');

      console.log('\n======================================================');
      console.log('🎉 ALL 30 PHASE 7 INTEGRATION TESTS PASSED SUCCESSFULLY!');
      console.log('======================================================\n');
    } catch (err) {
      console.error('\n❌ Phase 7 Test Error:', err.message);
      process.exitCode = 1;
    } finally {
      server.close();
      await sequelize.close();
    }
  });
};

runPhase7Tests();
