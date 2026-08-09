const dotenv = require('dotenv');
dotenv.config();

const http = require('http');
const { initDb, sequelize } = require('../src/config/db');
const app = require('../src/app');

let server;
const PORT = 5015;
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

const runPasswordResetTest = async () => {
  console.log('\n======================================================');
  console.log('--- STARTING PASSWORD RESET INTEGRATION TEST SUITE ---');
  console.log('======================================================\n');

  await initDb();

  const timestamp = Date.now();
  const email = `test_reset_${timestamp}@example.com`;
  const initialPassword = 'OldPassword123';
  const newPassword = 'NewSecretPassword456';

  server = app.listen(PORT, async () => {
    try {
      // 1. Register test user
      console.log('[1] Registering test user:', email);
      const regRes = await request('POST', '/api/auth/register', {
        name: 'Reset Test User',
        email,
        password: initialPassword,
        role: 'CUSTOMER',
      });
      if (regRes.status !== 201) throw new Error(`Registration failed with status ${regRes.status}`);
      console.log('-> User registered successfully');

      // 2. Initial login check
      console.log('\n[2] Verifying login with initial password...');
      const initialLoginRes = await request('POST', '/api/auth/login', { email, password: initialPassword });
      if (initialLoginRes.status !== 200 || !initialLoginRes.body.data.token) {
        throw new Error('Initial login failed');
      }
      console.log('-> Login with initial password succeeded!');

      // 3. Trigger forgot password
      console.log('\n[3] Calling POST /api/auth/forgot-password...');
      const forgotRes = await request('POST', '/api/auth/forgot-password', { email });
      console.log('-> Response:', forgotRes.body);
      if (forgotRes.status !== 200) {
        throw new Error('Forgot password request failed');
      }
      
      const userService = require('../src/services/user.service');
      const userObj = await userService.findUserByEmail(email);
      const resetToken = userObj.reset_password_token;
      console.log(`-> Reset Token Retrieved from DB: ${resetToken}`);
      console.log(`-> Email Sent Status: ${forgotRes.body.data.emailSent}`);

      // 4. Submit reset password request with new password
      console.log('\n[4] Calling POST /api/auth/reset-password with token and new password...');
      const resetRes = await request('POST', '/api/auth/reset-password', {
        token: resetToken,
        newPassword,
      });
      console.log('-> Response:', resetRes.body);
      if (resetRes.status !== 200) {
        throw new Error(`Reset password failed with status ${resetRes.status}: ${resetRes.body.message}`);
      }
      console.log('-> Password reset completed successfully!');

      // 5. Try login with old password (should fail with 401)
      console.log('\n[5] Attempting login with OLD password (should fail)...');
      const oldLoginRes = await request('POST', '/api/auth/login', { email, password: initialPassword });
      console.log(`-> Status: ${oldLoginRes.status}`);
      if (oldLoginRes.status !== 401) {
        throw new Error('Old password was still accepted after reset!');
      }

      // 6. Login with new password (should succeed with 200)
      console.log('\n[6] Attempting login with NEW password (should succeed)...');
      const newLoginRes = await request('POST', '/api/auth/login', { email, password: newPassword });
      console.log(`-> Status: ${newLoginRes.status}`);
      if (newLoginRes.status !== 200 || !newLoginRes.body.data.token) {
        throw new Error('Login with new password failed!');
      }

      console.log('\n======================================================');
      console.log('🎉 ALL PASSWORD RESET TESTS PASSED SUCCESSFULLY!');
      console.log('======================================================\n');
    } catch (err) {
      console.error('\n❌ Password Reset Test Error:', err.message);
      process.exitCode = 1;
    } finally {
      server.close();
      await sequelize.close();
    }
  });
};

runPasswordResetTest();
