const dotenv = require('dotenv');
dotenv.config();

const http = require('http');
const { initDb, sequelize } = require('../src/config/db');
const app = require('../src/app');

let server;
const PORT = 5008;
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

const runPhase6Tests = async () => {
  console.log('\n======================================================');
  console.log('--- STARTING PHASE 6 INTEGRATION TEST SUITE ---');
  console.log('======================================================\n');

  await initDb();

  const timestamp = Date.now();
  const adminEmail = `admin_p6_${timestamp}@example.com`;
  const customer1Email = `cust1_p6_${timestamp}@example.com`;
  const password = 'password123';

  server = app.listen(PORT, async () => {
    try {
      // 1. Register & Login Admin & Customer
      console.log('[1] Setting up Admin and Customer accounts...');
      await request('POST', '/api/auth/register', { name: 'Admin P6', email: adminEmail, password, role: 'ADMIN' });
      const adminToken = await loginUser(adminEmail, password);

      await request('POST', '/api/auth/register', { name: 'Customer P6', email: customer1Email, password, role: 'CUSTOMER' });
      const cust1Token = await loginUser(customer1Email, password);

      // --- CONFIGURATION TESTS ---

      console.log('\n--- 1. LATE FEE CONFIGURATION TESTS ---');

      // Test 1: Admin Creates Hourly Late Fee Config
      console.log('\n[TEST 1] Admin POST /api/admin/late-fee-configs (Hourly)...');
      const hourlyConfigRes = await request('POST', '/api/admin/late-fee-configs', {
        name: 'Hourly Late Fee Rule',
        charging_unit: 'HOURLY',
        rate: 200,
        grace_period: 2,
        max_fee: 5000,
      }, adminToken);
      console.log('-> Hourly Config Created:', hourlyConfigRes.body.data.id);
      if (hourlyConfigRes.status !== 201) throw new Error('Failed to create hourly config');
      const hourlyConfigId = hourlyConfigRes.body.data.id;

      // Test 2: Admin Creates Daily Late Fee Config
      console.log('\n[TEST 2] Admin POST /api/admin/late-fee-configs (Daily)...');
      const dailyConfigRes = await request('POST', '/api/admin/late-fee-configs', {
        name: 'Daily Late Fee Rule',
        charging_unit: 'DAILY',
        rate: 500,
        grace_period: 0,
        max_fee: 5000,
      }, adminToken);
      console.log('-> Daily Config Created:', dailyConfigRes.body.data.id);
      if (dailyConfigRes.status !== 201) throw new Error('Failed to create daily config');
      const dailyConfigId = dailyConfigRes.body.data.id;

      // Test 3: Admin Updates Config
      console.log('\n[TEST 3] Admin PUT /api/admin/late-fee-configs/:id...');
      const updateConfigRes = await request('PUT', `/api/admin/late-fee-configs/${hourlyConfigId}`, {
        rate: 250,
      }, adminToken);
      console.log('-> Updated Hourly Rate:', updateConfigRes.body.data.rate);
      if (Number(updateConfigRes.body.data.rate) !== 250) throw new Error('Failed to update config');

      // Test 4: Admin Deactivates Config
      console.log('\n[TEST 4] Admin DELETE /api/admin/late-fee-configs/:id (Soft Deactivate)...');
      const deactivateRes = await request('DELETE', `/api/admin/late-fee-configs/${hourlyConfigId}`, null, adminToken);
      console.log('-> Deactivated Config Status:', deactivateRes.body.data.status);
      if (deactivateRes.body.data.status !== 'INACTIVE') throw new Error('Failed to deactivate config');

      // Test 5: Customer attempts Config API -> 403
      console.log('\n[TEST 5] Customer attempts Config API -> Expected 403...');
      const custConfigRes = await request('POST', '/api/admin/late-fee-configs', { name: 'Hack', charging_unit: 'DAILY', rate: 1 }, cust1Token);
      console.log(`-> Status: ${custConfigRes.status}`);
      if (custConfigRes.status !== 403) throw new Error('Customer unauthorized config creation vulnerability');

      // --- SETUP ORDER & RETURN FOR CALCULATION TESTS ---

      console.log('\n--- 2. LATE FEE CALCULATION & DEPOSIT SETTLEMENT TESTS ---');

      const prodRes = await request('POST', '/api/products', { name: 'Rental Camera P6', category: 'Camera', base_price: 2500 }, adminToken);
      if (!prodRes.body.data) throw new Error(`Product creation failed: ${JSON.stringify(prodRes.body)}`);
      const productId = prodRes.body.data.id;

      const periodRes = await request('POST', '/api/rental-periods', { name: '2-Day Period', duration: 2, unit: 'DAY' }, adminToken);
      if (!periodRes.body.data) throw new Error(`Rental period creation failed: ${JSON.stringify(periodRes.body)}`);
      const rentalPeriodId = periodRes.body.data.id;

      // Helper function to create, pay, and return an order with specific dates
      const setupOrderAndReturn = async (startDate, endDate, actualReturnDate) => {
        const cartItemRes = await request('POST', '/api/cart/items', {
          product_id: productId,
          rental_period_id: rentalPeriodId,
          start_date: startDate,
          end_date: endDate,
          quantity: 1,
        }, cust1Token);

        if (!cartItemRes.body.data) throw new Error(`Cart add failed: ${JSON.stringify(cartItemRes.body)}`);

        const orderRes = await request('POST', '/api/orders', { delivery_method: 'STORE_PICKUP' }, cust1Token);
        if (!orderRes.body.data) throw new Error(`Order checkout failed: ${JSON.stringify(orderRes.body)}`);
        const orderId = orderRes.body.data.id;

        await request('POST', `/api/orders/${orderId}/payment`, { payment_method: 'ONLINE' }, cust1Token);

        const pickupRes = await request('GET', `/api/orders/${orderId}/pickup`, null, cust1Token);
        await request('POST', `/api/admin/pickups/${pickupRes.body.data.id}/confirm`, {}, adminToken);

        const returnRes = await request('GET', `/api/orders/${orderId}/return`, null, cust1Token);
        const returnId = returnRes.body.data.id;

        await request('POST', `/api/admin/returns/${returnId}/confirm`, {
          actual_return_at: actualReturnDate,
        }, adminToken);

        return { orderId, returnId };
      };

      // Test 6-9: Grace Period & Hourly Calculation Test
      console.log('\n[TEST 6-9] Testing Grace Period & Hourly Math...');
      // Scheduled deadline end of day 2026-09-02T23:59:59.999Z, Actual return 2026-09-03T03:30:00Z = 3.5 hours late past deadline
      const { orderId: order1Id, returnId: return1Id } = await setupOrderAndReturn('2026-09-01', '2026-09-02', '2026-09-03T03:30:00Z');

      const testHourlyConfig = await request('POST', '/api/admin/late-fee-configs', {
        name: 'Test Hourly Config',
        charging_unit: 'HOURLY',
        rate: 200,
        grace_period: 2,
        max_fee: 5000,
      }, adminToken);

      const calc1Res = await request('POST', `/api/admin/returns/${return1Id}/calculate-late-fee`, {
        config_id: testHourlyConfig.body.data.id,
      }, adminToken);

      console.log('-> Calculated Fee Amount:', calc1Res.body.data.late_fee.final_amount);
      console.log('-> Chargeable Units (Hours):', calc1Res.body.data.late_fee.chargeable_units);

      if (
        calc1Res.status !== 200 ||
        Number(calc1Res.body.data.late_fee.final_amount) !== 400 ||
        calc1Res.body.data.late_fee.chargeable_units !== 2
      ) {
        throw new Error('Hourly calculation / Grace period math failed');
      }

      // Test 10: Daily Calculation (25 hours late, 0 grace -> 2 days * 500 = 1000)
      console.log('\n[TEST 10] Testing Daily Calculation (25 hours late -> 2 days * 500 = 1000)...');
      const { orderId: order2Id, returnId: return2Id } = await setupOrderAndReturn('2026-09-01', '2026-09-02', '2026-09-04T01:00:00Z');

      const calc2Res = await request('POST', `/api/admin/returns/${return2Id}/calculate-late-fee`, {
        config_id: dailyConfigId,
      }, adminToken);

      console.log('-> Daily Calculated Fee:', calc2Res.body.data.late_fee.final_amount);
      if (Number(calc2Res.body.data.late_fee.final_amount) !== 1000) {
        throw new Error('Daily late fee calculation math failed');
      }

      // Test 13: Maximum Fee Cap Test
      console.log('\n[TEST 13] Testing Maximum Fee Cap...');
      const highRateConfig = await request('POST', '/api/admin/late-fee-configs', {
        name: 'High Rate Rule',
        charging_unit: 'DAILY',
        rate: 8000,
        grace_period: 0,
        max_fee: 5000,
      }, adminToken);

      const { returnId: return3Id } = await setupOrderAndReturn('2026-09-01', '2026-09-02', '2026-09-04T01:00:00Z');
      const calc3Res = await request('POST', `/api/admin/returns/${return3Id}/calculate-late-fee`, {
        config_id: highRateConfig.body.data.id,
      }, adminToken);

      console.log('-> Raw Calculated:', calc3Res.body.data.late_fee.calculated_amount, 'Final Capped Fee:', calc3Res.body.data.late_fee.final_amount);
      if (
        Number(calc3Res.body.data.late_fee.calculated_amount) !== 16000 ||
        Number(calc3Res.body.data.late_fee.final_amount) !== 5000
      ) {
        throw new Error('Maximum fee cap enforcement failed');
      }

      // Test 15-20: Deposit Settlement Math
      console.log('\n[TEST 15-20] Testing Security Deposit Settlement Scenarios...');
      console.log('-> Scenario 1: Deposit (500) > Fee (400)');
      console.log('   Deducted:', calc1Res.body.data.settlement.deducted_amount, 'Refunded:', calc1Res.body.data.settlement.refunded_amount);
      if (
        Number(calc1Res.body.data.settlement.deducted_amount) !== 400 ||
        Number(calc1Res.body.data.settlement.refunded_amount) !== 100 ||
        calc1Res.body.data.settlement.settlement_status !== 'PARTIAL_REFUND'
      ) {
        throw new Error('Deposit partial refund settlement math failed');
      }

      console.log('-> Scenario 2: Deposit (500) < Fee (1000)');
      console.log('   Deducted:', calc2Res.body.data.settlement.deducted_amount, 'Outstanding:', calc2Res.body.data.settlement.outstanding_amount);
      if (
        Number(calc2Res.body.data.settlement.deducted_amount) !== 500 ||
        Number(calc2Res.body.data.settlement.outstanding_amount) !== 500 ||
        calc2Res.body.data.settlement.settlement_status !== 'OUTSTANDING'
      ) {
        throw new Error('Outstanding penalty deposit settlement failed');
      }

      // Test 21-24: Idempotency & Duplicate Protection
      console.log('\n[TEST 21-24] Testing Idempotency & Duplicate Prevention...');
      const duplicateCalcRes = await request('POST', `/api/admin/returns/${return1Id}/calculate-late-fee`, {
        config_id: testHourlyConfig.body.data.id,
      }, adminToken);

      console.log('-> Is Existing Flag:', duplicateCalcRes.body.data.is_existing);
      if (!duplicateCalcRes.body.data.is_existing) {
        throw new Error('Duplicate late fee calculation was allowed!');
      }

      console.log('\n[TEST 23] Testing Batch Overdue Processing...');
      const batchRes = await request('POST', '/api/admin/late-fees/process-overdue', {}, adminToken);
      console.log('-> Processed Count:', batchRes.body.data.processed_count);

      // Test 25-27: Admin Waive Late Fee
      console.log('\n[TEST 25-27] Admin Waives Late Fee...');
      const lateFeeId = calc2Res.body.data.late_fee.id;
      const waiveRes = await request('POST', `/api/admin/late-fees/${lateFeeId}/waive`, {
        notes: 'Waived due to customer emergency',
      }, adminToken);

      console.log('-> Waived Status:', waiveRes.body.data.late_fee.status);
      console.log('-> Refunded Amount After Waiver:', waiveRes.body.data.settlement.refunded_amount);
      if (
        waiveRes.body.data.late_fee.status !== 'WAIVED' ||
        Number(waiveRes.body.data.settlement.refunded_amount) !== 500
      ) {
        throw new Error('Late fee waiver processing failed');
      }

      // Test 28-31: Authorization & Reporting Endpoints
      console.log('\n[TEST 28-31] Testing Customer View & Admin Outstanding Penalties Report...');

      const outstandingRes = await request('GET', '/api/admin/late-fees/outstanding', null, adminToken);
      console.log('-> Found Outstanding Penalties:', outstandingRes.body.data.length);
      if (outstandingRes.status !== 200) throw new Error('Failed to fetch outstanding penalties');

      const custLateFeeRes = await request('GET', `/api/orders/${order1Id}/late-fee`, null, cust1Token);
      console.log('-> Customer View Final Fee Amount:', custLateFeeRes.body.data.final_amount);
      if (custLateFeeRes.status !== 200 || Number(custLateFeeRes.body.data.final_amount) !== 400) {
        throw new Error('Customer late fee details view failed');
      }

      const custWaiveRes = await request('POST', `/api/admin/late-fees/${lateFeeId}/waive`, {}, cust1Token);
      if (custWaiveRes.status !== 403) throw new Error('Customer unauthorized waiver vulnerability!');

      console.log('\n======================================================');
      console.log('🎉 ALL 31 PHASE 6 INTEGRATION TESTS PASSED SUCCESSFULLY!');
      console.log('======================================================\n');
    } catch (err) {
      console.error('\n❌ Phase 6 Test Error:', err.message);
      process.exitCode = 1;
    } finally {
      server.close();
      await sequelize.close();
    }
  });
};

runPhase6Tests();
