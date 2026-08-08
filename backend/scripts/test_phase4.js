const dotenv = require('dotenv');
dotenv.config();

const http = require('http');
const { initDb, sequelize } = require('../src/config/db');
const app = require('../src/app');

let server;
const PORT = 5006;
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

const runPhase4Tests = async () => {
  console.log('\n======================================================');
  console.log('--- STARTING PHASE 4 INTEGRATION TEST SUITE ---');
  console.log('======================================================\n');

  await initDb();

  const timestamp = Date.now();
  const adminEmail = `admin_p4_${timestamp}@example.com`;
  const customer1Email = `cust1_p4_${timestamp}@example.com`;
  const customer2Email = `cust2_p4_${timestamp}@example.com`;
  const password = 'password123';

  server = app.listen(PORT, async () => {
    try {
      // Setup Users
      console.log('[1] Registering Admin & 2 Customers...');
      await request('POST', '/api/auth/register', { name: 'Admin User', email: adminEmail, password, role: 'ADMIN' });
      const adminToken = await loginUser(adminEmail, password);

      await request('POST', '/api/auth/register', { name: 'Customer One', email: customer1Email, password, role: 'CUSTOMER' });
      const cust1Token = await loginUser(customer1Email, password);

      await request('POST', '/api/auth/register', { name: 'Customer Two', email: customer2Email, password, role: 'CUSTOMER' });
      const cust2Token = await loginUser(customer2Email, password);

      // Setup Product & Rental Period
      console.log('\n[2] Setting up Product & Rental Period...');
      const prodRes = await request('POST', '/api/products', { name: 'DSLR Camera', category: 'Electronics', base_price: 1000 }, adminToken);
      const productId = prodRes.body.data.id;

      const periodRes = await request('POST', '/api/rental-periods', { name: '3-Day Rental', duration: 3, unit: 'DAY' }, adminToken);
      const rentalPeriodId = periodRes.body.data.id;

      // Customer 1 adds item to cart & creates order 1 (Subtotal: 1000)
      console.log('\n[3] Customer 1 adds product to cart & checks out Order 1...');
      await request('POST', '/api/cart/items', {
        product_id: productId,
        rental_period_id: rentalPeriodId,
        start_date: '2026-09-01',
        end_date: '2026-09-04',
        quantity: 1,
      }, cust1Token);

      const order1Res = await request('POST', '/api/orders', {
        delivery_method: 'DELIVERY',
        delivery_address: '123 Main Street',
      }, cust1Token);

      const order1Id = order1Res.body.data.id;
      console.log(`-> Order 1 Created: ID=${order1Id}, Subtotal=₹${order1Res.body.data.subtotal}, Status=${order1Res.body.data.status}`);

      // Customer 2 creates order 2 for security isolation testing (Subtotal: 2000)
      console.log('\n[4] Customer 2 adds product to cart & checks out Order 2...');
      await request('POST', '/api/cart/items', {
        product_id: productId,
        rental_period_id: rentalPeriodId,
        start_date: '2026-09-10',
        end_date: '2026-09-13',
        quantity: 2,
      }, cust2Token);

      const order2Res = await request('POST', '/api/orders', {
        delivery_method: 'STORE_PICKUP',
      }, cust2Token);
      const order2Id = order2Res.body.data.id;
      console.log(`-> Order 2 Created: ID=${order2Id}, Subtotal=₹${order2Res.body.data.subtotal}`);

      // --- TEST SUITE FOR PHASE 4 ---

      // Test 1: Get Payment Summary for Order 1
      console.log('\n[TEST 1] GET Payment Summary for Order 1...');
      const summaryRes = await request('GET', `/api/orders/${order1Id}/payment-summary`, null, cust1Token);
      console.log('-> Response:', summaryRes.body);
      if (summaryRes.status !== 200 || Number(summaryRes.body.data.rental_amount) !== 1000 || Number(summaryRes.body.data.security_deposit) !== 200) {
        throw new Error('Payment summary calculation mismatch! Expected rental=1000, deposit=200 (20%)');
      }

      // Test 2: Customer 2 tries to view Customer 1's payment summary -> 404
      console.log('\n[TEST 2] Customer 2 tries to view Customer 1 Payment Summary...');
      const forbiddenSummaryRes = await request('GET', `/api/orders/${order1Id}/payment-summary`, null, cust2Token);
      console.log(`-> Status: ${forbiddenSummaryRes.status}`);
      if (forbiddenSummaryRes.status !== 404) {
        throw new Error('Security isolation failed! Customer 2 was able to access Customer 1 order summary');
      }

      // Test 3: Invalid Order ID -> 404
      console.log('\n[TEST 3] Invalid Order ID Payment Summary...');
      const invalidSummaryRes = await request('GET', '/api/orders/00000000-0000-0000-0000-000000000000/payment-summary', null, cust1Token);
      console.log(`-> Status: ${invalidSummaryRes.status}`);
      if (invalidSummaryRes.status !== 404) {
        throw new Error('Invalid order ID test failed');
      }

      // Test 4: Simulate Failed Payment
      console.log('\n[TEST 4] Initiating Payment with simulate_failure = true...');
      const failedPayRes = await request('POST', `/api/orders/${order1Id}/payment`, {
        payment_method: 'ONLINE',
        simulate_failure: true,
      }, cust1Token);
      console.log('-> Response:', failedPayRes.body);
      if (failedPayRes.status !== 400 || failedPayRes.body.data.status !== 'FAILED') {
        throw new Error('Failed payment simulation test failed');
      }

      // Verify order remains PENDING_PAYMENT
      const verifyOrderPendingRes = await request('GET', `/api/orders/${order1Id}`, null, cust1Token);
      if (verifyOrderPendingRes.body.data.status !== 'PENDING_PAYMENT') {
        throw new Error('Order status changed after failed payment!');
      }

      // Test 5: Successful ONLINE Payment for Order 1
      console.log('\n[TEST 5] Initiating Successful ONLINE Payment for Order 1...');
      const onlinePayRes = await request('POST', `/api/orders/${order1Id}/payment`, {
        payment_method: 'ONLINE',
      }, cust1Token);
      console.log('-> Response:', onlinePayRes.body);
      if (
        onlinePayRes.status !== 200 ||
        onlinePayRes.body.data.payment.status !== 'SUCCESS' ||
        onlinePayRes.body.data.security_deposit.status !== 'HELD' ||
        onlinePayRes.body.data.order.status !== 'CONFIRMED'
      ) {
        throw new Error('ONLINE payment processing failed');
      }

      // Test 6: Try paying an already CONFIRMED order -> 400
      console.log('\n[TEST 6] Attempting to pay an already CONFIRMED Order 1...');
      const doublePayRes = await request('POST', `/api/orders/${order1Id}/payment`, {
        payment_method: 'ONLINE',
      }, cust1Token);
      console.log(`-> Status: ${doublePayRes.status}`, doublePayRes.body);
      if (doublePayRes.status !== 400) {
        throw new Error('Allowed payment on already CONFIRMED order!');
      }

      // Test 7: Successful CASH Payment for Order 2
      console.log('\n[TEST 7] Initiating Successful CASH Payment for Order 2...');
      const cashPayRes = await request('POST', `/api/orders/${order2Id}/payment`, {
        payment_method: 'CASH',
      }, cust2Token);
      console.log('-> Response:', cashPayRes.body);
      if (
        cashPayRes.status !== 200 ||
        cashPayRes.body.data.payment.payment_method !== 'CASH' ||
        cashPayRes.body.data.payment.status !== 'SUCCESS' ||
        cashPayRes.body.data.security_deposit.status !== 'HELD' ||
        cashPayRes.body.data.order.status !== 'CONFIRMED'
      ) {
        throw new Error('CASH payment processing failed');
      }

      // Test 8: Get Order Payments (Customer 1)
      console.log('\n[TEST 8] Customer 1 GET Payments for Order 1...');
      const custPaymentsRes = await request('GET', `/api/orders/${order1Id}/payments`, null, cust1Token);
      console.log(`-> Found ${custPaymentsRes.body.data.length} payment record(s)`);
      if (custPaymentsRes.status !== 200 || custPaymentsRes.body.data.length < 2) {
        throw new Error('Order payments retrieval failed');
      }

      // Test 9: Get Security Deposit Details (Customer 1)
      console.log('\n[TEST 9] Customer 1 GET Security Deposit for Order 1...');
      const custDepositRes = await request('GET', `/api/orders/${order1Id}/security-deposit`, null, cust1Token);
      console.log('-> Response:', custDepositRes.body.data);
      if (custDepositRes.status !== 200 || custDepositRes.body.data.status !== 'HELD' || Number(custDepositRes.body.data.amount) !== 200) {
        throw new Error('Security deposit details retrieval failed');
      }

      // Test 10: Admin GET All Payments
      console.log('\n[TEST 10] Admin GET All Payments...');
      const adminPaymentsRes = await request('GET', '/api/admin/payments', null, adminToken);
      console.log(`-> Found ${adminPaymentsRes.body.data.length} payment(s) in system`);
      if (adminPaymentsRes.status !== 200 || adminPaymentsRes.body.data.length < 3) {
        throw new Error('Admin payments retrieval failed');
      }

      // Test 11: Admin GET All Security Deposits
      console.log('\n[TEST 11] Admin GET All Security Deposits...');
      const adminDepositsRes = await request('GET', '/api/admin/security-deposits', null, adminToken);
      console.log(`-> Found ${adminDepositsRes.body.data.length} deposit(s) in system`);
      if (adminDepositsRes.status !== 200 || adminDepositsRes.body.data.length < 2) {
        throw new Error('Admin deposits retrieval failed');
      }

      console.log('\n======================================================');
      console.log('🎉 ALL 11 PHASE 4 INTEGRATION TESTS PASSED SUCCESSFULLY!');
      console.log('======================================================\n');
    } catch (err) {
      console.error('\n❌ Phase 4 Test Error:', err.message);
      process.exitCode = 1;
    } finally {
      server.close();
      await sequelize.close();
    }
  });
};

runPhase4Tests();
