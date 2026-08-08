const dotenv = require('dotenv');
dotenv.config();

const http = require('http');
const { initDb, sequelize } = require('../src/config/db');
const app = require('../src/app');

let server;
const PORT = 5007;
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

const runPhase5Tests = async () => {
  console.log('\n======================================================');
  console.log('--- STARTING PHASE 5 INTEGRATION TEST SUITE ---');
  console.log('======================================================\n');

  await initDb();

  const timestamp = Date.now();
  const adminEmail = `admin_p5_${timestamp}@example.com`;
  const customer1Email = `cust1_p5_${timestamp}@example.com`;
  const customer2Email = `cust2_p5_${timestamp}@example.com`;
  const password = 'password123';

  server = app.listen(PORT, async () => {
    try {
      // 1. Setup Users
      console.log('[1] Registering & Authenticating Admin and 2 Customers...');
      await request('POST', '/api/auth/register', { name: 'Admin User', email: adminEmail, password, role: 'ADMIN' });
      const adminToken = await loginUser(adminEmail, password);

      await request('POST', '/api/auth/register', { name: 'Customer One', email: customer1Email, password, role: 'CUSTOMER' });
      const cust1Token = await loginUser(customer1Email, password);

      await request('POST', '/api/auth/register', { name: 'Customer Two', email: customer2Email, password, role: 'CUSTOMER' });
      const cust2Token = await loginUser(customer2Email, password);

      // 2. Setup Product & Rental Period
      console.log('\n[2] Setting up Product & Rental Period...');
      const prodRes = await request('POST', '/api/products', { name: 'Sony FX3 Cinema Camera', category: 'Electronics', base_price: 2000 }, adminToken);
      const productId = prodRes.body.data.id;

      const periodRes = await request('POST', '/api/rental-periods', { name: '3-Day Rental', duration: 3, unit: 'DAY' }, adminToken);
      const rentalPeriodId = periodRes.body.data.id;

      // 3. Create & Pay Order 1 (ON_TIME Return Test)
      console.log('\n[3] Creating & Confirming Order 1 (Customer 1)...');
      await request('POST', '/api/cart/items', {
        product_id: productId,
        rental_period_id: rentalPeriodId,
        start_date: '2026-09-01',
        end_date: '2026-09-04',
        quantity: 1,
      }, cust1Token);

      const order1Res = await request('POST', '/api/orders', {
        delivery_method: 'DELIVERY',
        delivery_address: '742 Evergreen Terrace',
      }, cust1Token);
      const order1Id = order1Res.body.data.id;

      const pay1Res = await request('POST', `/api/orders/${order1Id}/payment`, { payment_method: 'ONLINE' }, cust1Token);
      console.log(`-> Order 1 Confirmed! Status=${pay1Res.body.data.order.status}, PickupCode=${pay1Res.body.data.pickup.pickup_code}`);

      // 4. Create & Pay Order 2 (LATE Return Test)
      console.log('\n[4] Creating & Confirming Order 2 (Customer 2)...');
      await request('POST', '/api/cart/items', {
        product_id: productId,
        rental_period_id: rentalPeriodId,
        start_date: '2026-08-01',
        end_date: '2026-08-04', // Past date for late test
        quantity: 1,
      }, cust2Token);

      const order2Res = await request('POST', '/api/orders', {
        delivery_method: 'STORE_PICKUP',
      }, cust2Token);
      const order2Id = order2Res.body.data.id;

      const pay2Res = await request('POST', `/api/orders/${order2Id}/payment`, { payment_method: 'CASH' }, cust2Token);
      console.log(`-> Order 2 Confirmed! Status=${pay2Res.body.data.order.status}`);

      // --- PICKUP TESTS ---

      console.log('\n--- PICKUP MANAGEMENT TESTS ---');

      // Test 1: Admin View Pickup Schedule
      console.log('\n[TEST 1] Admin GET /api/admin/pickups...');
      const pickupsRes = await request('GET', '/api/admin/pickups?status=READY', null, adminToken);
      console.log(`-> Found ${pickupsRes.body.data.length} ready pickup(s)`);
      if (pickupsRes.status !== 200 || pickupsRes.body.data.length < 2) {
        throw new Error('Admin pickups listing failed');
      }

      const pickup1 = pickupsRes.body.data.find(p => p.order_id === order1Id);
      const pickup1Id = pickup1.id;
      const pickupCode1 = pickup1.pickup_code;

      // Test 2: Admin View Pickup Details by ID
      console.log('\n[TEST 2] Admin GET /api/admin/pickups/:id...');
      const pickupDetailRes = await request('GET', `/api/admin/pickups/${pickup1Id}`, null, adminToken);
      console.log('-> Response:', pickupDetailRes.body.data.pickup_code);
      if (pickupDetailRes.status !== 200 || pickupDetailRes.body.data.id !== pickup1Id) {
        throw new Error('Admin get pickup by ID failed');
      }

      // Test 3: Admin Search Pickup by Code (QR/Barcode simulation)
      console.log('\n[TEST 3] Admin GET /api/admin/pickups/code/:code...');
      const pickupByCodeRes = await request('GET', `/api/admin/pickups/code/${pickupCode1}`, null, adminToken);
      console.log('-> Found pickup by code:', pickupByCodeRes.body.data.id);
      if (pickupByCodeRes.status !== 200 || pickupByCodeRes.body.data.id !== pickup1Id) {
        throw new Error('Admin search pickup by code failed');
      }

      // Test 4: Admin Confirm Pickup
      console.log('\n[TEST 4] Admin POST /api/admin/pickups/:id/confirm...');
      const confirmPickupRes = await request('POST', `/api/admin/pickups/${pickup1Id}/confirm`, {
        notes: 'Verified customer ID proof and handed over equipment',
      }, adminToken);
      console.log('-> Pickup Status:', confirmPickupRes.body.data.status);
      if (confirmPickupRes.status !== 200 || confirmPickupRes.body.data.status !== 'COMPLETED') {
        throw new Error('Pickup confirmation failed');
      }

      // Verify order status became ACTIVE
      const activeOrderRes = await request('GET', `/api/orders/${order1Id}`, null, cust1Token);
      if (activeOrderRes.body.data.status !== 'ACTIVE') {
        throw new Error('Order status failed to transition to ACTIVE after pickup confirmation');
      }

      // Test 5: Confirm pickup twice -> 400
      console.log('\n[TEST 5] Confirming pickup twice -> Expected 400...');
      const doublePickupRes = await request('POST', `/api/admin/pickups/${pickup1Id}/confirm`, {}, adminToken);
      console.log(`-> Status: ${doublePickupRes.status}`);
      if (doublePickupRes.status !== 400) {
        throw new Error('Allowed confirming pickup twice!');
      }

      // Test 6: Customer view own pickup
      console.log('\n[TEST 6] Customer GET /api/orders/:orderId/pickup...');
      const custPickupRes = await request('GET', `/api/orders/${order1Id}/pickup`, null, cust1Token);
      console.log('-> Customer view pickup code:', custPickupRes.body.data.pickup_code);
      if (custPickupRes.status !== 200 || custPickupRes.body.data.order_id !== order1Id) {
        throw new Error('Customer pickup view failed');
      }

      // Test 7: Customer tries viewing another customer\'s pickup -> 404
      console.log('\n[TEST 7] Customer 2 tries viewing Customer 1 pickup -> Expected 404...');
      const forbiddenPickupRes = await request('GET', `/api/orders/${order1Id}/pickup`, null, cust2Token);
      console.log(`-> Status: ${forbiddenPickupRes.status}`);
      if (forbiddenPickupRes.status !== 404) {
        throw new Error('Customer unauthorized pickup view vulnerability!');
      }

      // --- RETURN MANAGEMENT TESTS ---

      console.log('\n--- RETURN MANAGEMENT TESTS ---');

      // Test 8: Admin View Return Schedule
      console.log('\n[TEST 8] Admin GET /api/admin/returns...');
      const returnsRes = await request('GET', '/api/admin/returns?status=PENDING', null, adminToken);
      console.log(`-> Found ${returnsRes.body.data.length} pending return(s)`);
      if (returnsRes.status !== 200 || returnsRes.body.data.length < 2) {
        throw new Error('Admin returns listing failed');
      }

      const return1 = returnsRes.body.data.find(r => r.order_id === order1Id);
      const return1Id = return1.id;

      const return2 = returnsRes.body.data.find(r => r.order_id === order2Id);
      const return2Id = return2.id;

      // Test 9: Admin View Return Details by ID
      console.log('\n[TEST 9] Admin GET /api/admin/returns/:id...');
      const returnDetailRes = await request('GET', `/api/admin/returns/${return1Id}`, null, adminToken);
      console.log('-> Return details order number:', returnDetailRes.body.data.order.order_number);
      if (returnDetailRes.status !== 200 || returnDetailRes.body.data.id !== return1Id) {
        throw new Error('Admin get return details failed');
      }

      // Test 10: Admin Inspect Return (Good Condition)
      console.log('\n[TEST 10] Admin POST /api/admin/returns/:id/inspect (GOOD Condition)...');
      const inspectRes = await request('POST', `/api/admin/returns/${return1Id}/inspect`, {
        condition: 'GOOD',
        damage_report: null,
        missing_accessories: [],
        notes: 'Equipment returned in pristine condition',
      }, adminToken);
      console.log('-> Inspection result condition:', inspectRes.body.data.condition);
      if (inspectRes.status !== 200 || inspectRes.body.data.status !== 'INSPECTION') {
        throw new Error('Return inspection failed');
      }

      // Test 11: Admin Confirm ON_TIME Return (Order 1)
      console.log('\n[TEST 11] Admin POST /api/admin/returns/:id/confirm (ON_TIME)...');
      const confirmReturn1Res = await request('POST', `/api/admin/returns/${return1Id}/confirm`, {
        actual_return_at: '2026-09-04T10:00:00Z', // Within scheduled 2026-09-04
      }, adminToken);
      console.log('-> Return timing:', confirmReturn1Res.body.data.return_timing);
      if (
        confirmReturn1Res.status !== 200 ||
        confirmReturn1Res.body.data.return_timing !== 'ON_TIME' ||
        confirmReturn1Res.body.data.order.status !== 'RETURNED'
      ) {
        throw new Error('ON_TIME return confirmation failed');
      }

      // Test 12-14: Verify Security Deposit status is REFUNDED for ON_TIME return
      console.log('\n[TEST 12-14] Verifying Security Deposit status = REFUNDED...');
      const deposit1Res = await request('GET', `/api/orders/${order1Id}/security-deposit`, null, cust1Token);
      console.log('-> Deposit Status:', deposit1Res.body.data.status, 'Refunded Amount:', deposit1Res.body.data.refunded_amount);
      if (deposit1Res.body.data.status !== 'REFUNDED' || Number(deposit1Res.body.data.refunded_amount) !== 400) {
        throw new Error('Deposit refund processing for ON_TIME return failed');
      }

      // Test 15-21: Admin Inspect & Confirm LATE Return with DAMAGED items (Order 2)
      console.log('\n[TEST 15-21] Inspecting & Confirming LATE Return with DAMAGED condition (Order 2)...');
      await request('POST', `/api/admin/returns/${return2Id}/inspect`, {
        condition: 'DAMAGED',
        damage_report: 'Lens glass scratched',
        missing_accessories: ['Battery charger'],
        notes: 'Item returned late and damaged',
      }, adminToken);

      const confirmReturn2Res = await request('POST', `/api/admin/returns/${return2Id}/confirm`, {
        actual_return_at: '2026-08-10T12:00:00Z', // Past scheduled 2026-08-04
      }, adminToken);

      console.log('-> Return 2 timing:', confirmReturn2Res.body.data.return_timing);
      if (confirmReturn2Res.body.data.return_timing !== 'LATE') {
        throw new Error('LATE return timing detection failed');
      }

      // Verify deposit remains HELD (Phase 6 boundary)
      const deposit2Res = await request('GET', `/api/orders/${order2Id}/security-deposit`, null, cust2Token);
      console.log('-> Order 2 Deposit Status:', deposit2Res.body.data.status);
      if (deposit2Res.body.data.status !== 'HELD') {
        throw new Error('LATE return deposit should remain HELD for Phase 6!');
      }

      // Verify return record details for damage and missing accessories
      const return2DetailRes = await request('GET', `/api/admin/returns/${return2Id}`, null, adminToken);
      console.log('-> Return 2 Damage Report:', return2DetailRes.body.data.damage_report);
      console.log('-> Return 2 Missing Accessories:', return2DetailRes.body.data.missing_accessories);
      console.log('-> Repair Required Flag:', return2DetailRes.body.data.repair_required);

      if (
        !return2DetailRes.body.data.repair_required ||
        return2DetailRes.body.data.missing_accessories.length !== 1
      ) {
        throw new Error('Damage / Missing accessory tracking failed');
      }

      // Test 22-24: Authorization Checks (Customer cannot inspect or confirm)
      console.log('\n[TEST 22-24] Testing Authorization Restrictions for Customer...');
      const custInspectRes = await request('POST', `/api/admin/returns/${return1Id}/inspect`, {}, cust1Token);
      if (custInspectRes.status !== 403) {
        throw new Error('Customer was allowed to access admin inspect API!');
      }

      const custConfirmReturnRes = await request('POST', `/api/admin/returns/${return1Id}/confirm`, {}, cust1Token);
      if (custConfirmReturnRes.status !== 403) {
        throw new Error('Customer was allowed to access admin confirm return API!');
      }

      const custConfirmPickupRes = await request('POST', `/api/admin/pickups/${pickup1Id}/confirm`, {}, cust1Token);
      if (custConfirmPickupRes.status !== 403) {
        throw new Error('Customer was allowed to access admin confirm pickup API!');
      }

      // Test 25: Customer view own return information
      console.log('\n[TEST 25] Customer GET /api/orders/:orderId/return...');
      const custReturnRes = await request('GET', `/api/orders/${order1Id}/return`, null, cust1Token);
      console.log('-> Customer View Return Status:', custReturnRes.body.data.status);
      if (custReturnRes.status !== 200 || custReturnRes.body.data.order_id !== order1Id) {
        throw new Error('Customer view return failed');
      }

      console.log('\n======================================================');
      console.log('🎉 ALL 25 PHASE 5 INTEGRATION TESTS PASSED SUCCESSFULLY!');
      console.log('======================================================\n');
    } catch (err) {
      console.error('\n❌ Phase 5 Test Error:', err.message);
      process.exitCode = 1;
    } finally {
      server.close();
      await sequelize.close();
    }
  });
};

runPhase5Tests();
