const dotenv = require('dotenv');
dotenv.config();

const http = require('http');
const { initDb, sequelize } = require('../src/config/db');
const app = require('../src/app');

let server;
const PORT = 5020;
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

const runSuperAdminTest = async () => {
  console.log('\n======================================================');
  console.log('--- STARTING SUPER ADMIN INTEGRATION TEST SUITE ---');
  console.log('======================================================\n');

  await initDb();

  server = app.listen(PORT, async () => {
    try {
      // 1. Login with Super Admin credentials
      console.log('[1] Logging in with Super Admin credentials (super@admin123 / pass1234)...');
      const loginRes = await request('POST', '/api/auth/login', {
        email: 'super@admin123',
        password: 'pass1234',
      });
      console.log('-> Response Status:', loginRes.status);
      console.log('-> Response Data:', loginRes.body);

      if (loginRes.status !== 200 || !loginRes.body.data.token) {
        throw new Error('Super Admin login failed!');
      }

      const superToken = loginRes.body.data.token;
      const superUser = loginRes.body.data.user;

      if (superUser.role !== 'SUPERADMIN') {
        throw new Error(`Expected role SUPERADMIN but got ${superUser.role}`);
      }
      console.log('-> Super Admin login verified successfully with role SUPERADMIN!');

      // 2. Super Admin accesses Admin Dashboard Overview
      console.log('\n[2] Testing Super Admin access to Admin Dashboard Overview...');
      const adminRes = await request('GET', '/api/admin/dashboard/overview', null, superToken);
      console.log('-> Admin Overview Status:', adminRes.status);
      if (adminRes.status !== 200) {
        throw new Error('Super Admin was blocked from admin dashboard!');
      }

      // 3. Super Admin accesses all users
      console.log('\n[3] Testing Super Admin GET /api/users...');
      const usersRes = await request('GET', '/api/users', null, superToken);
      console.log(`-> Found ${usersRes.body.data.length} registered user(s) in system`);
      if (usersRes.status !== 200) {
        throw new Error('Super Admin failed to retrieve user list!');
      }

      // 4. Register a regular customer and promote them to VENDOR/ADMIN using Super Admin authority
      const tempCustomerEmail = `cust_promote_${Date.now()}@example.com`;
      console.log('\n[4] Creating test customer account:', tempCustomerEmail);
      const regRes = await request('POST', '/api/auth/register', {
        name: 'Promote Target',
        email: tempCustomerEmail,
        password: 'password123',
        role: 'CUSTOMER',
      });
      const targetUserId = regRes.body.data.id;
      console.log(`-> Customer created with ID: ${targetUserId}`);

      console.log('\n[5] Super Admin promoting customer to VENDOR role...');
      const roleUpdateRes = await request('PUT', `/api/users/${targetUserId}/role`, { role: 'VENDOR' }, superToken);
      console.log('-> Update Role Status:', roleUpdateRes.status, roleUpdateRes.body.message);
      if (roleUpdateRes.status !== 200 || roleUpdateRes.body.data.role !== 'VENDOR') {
        throw new Error('Failed to promote user role!');
      }

      console.log('\n======================================================');
      console.log('🎉 ALL SUPER ADMIN INTEGRATION TESTS PASSED SUCCESSFULLY!');
      console.log('======================================================\n');
    } catch (err) {
      console.error('\n❌ Super Admin Test Error:', err.message);
      process.exitCode = 1;
    } finally {
      server.close();
      await sequelize.close();
    }
  });
};

runSuperAdminTest();
