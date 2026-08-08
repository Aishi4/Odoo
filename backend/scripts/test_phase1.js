const http = require('http');
const dotenv = require('dotenv');
const { initDb, sequelize } = require('../src/config/db');
const app = require('../src/app');

dotenv.config();

let server;
const PORT = 5003;
const BASE_URL = `http://localhost:${PORT}`;

const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
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

const runTests = async () => {
  console.log('\n--- Starting Integration Tests (Auth, Profile & Nodemailer Password Reset) ---');
  
  await initDb();
  
  const testEmail = `test_pwd_${Date.now()}@example.com`;
  const testPassword = 'password123';
  const updatedPassword = 'newpassword456';
  let authToken = '';
  let resetToken = '';

  server = app.listen(PORT, async () => {
    try {
      // 1. Register User
      console.log('\n[1] Testing User Registration (POST /api/auth/register)...');
      const regRes = await request('POST', '/api/auth/register', {
        name: 'Test User',
        email: testEmail,
        password: testPassword,
      });
      console.log(`Status: ${regRes.status}`, regRes.body);
      if (regRes.status !== 201 || !regRes.body.success) {
        throw new Error('Registration test failed');
      }

      // 2. Register Duplicate Email
      console.log('\n[2] Testing Duplicate Email Registration (POST /api/auth/register)...');
      const dupRes = await request('POST', '/api/auth/register', {
        name: 'Duplicate User',
        email: testEmail,
        password: testPassword,
      });
      console.log(`Status: ${dupRes.status}`, dupRes.body);
      if (dupRes.status !== 409 || dupRes.body.success !== false) {
        throw new Error('Duplicate email test failed');
      }

      // 3. Login with Correct Credentials
      console.log('\n[3] Testing Login with Valid Credentials (POST /api/auth/login)...');
      const loginRes = await request('POST', '/api/auth/login', {
        email: testEmail,
        password: testPassword,
      });
      console.log(`Status: ${loginRes.status}`, loginRes.body);
      if (loginRes.status !== 200 || !loginRes.body.data?.token) {
        throw new Error('Login test failed');
      }
      authToken = loginRes.body.data.token;

      // 4. Login with Wrong Password
      console.log('\n[4] Testing Login with Wrong Password (POST /api/auth/login)...');
      const wrongPassRes = await request('POST', '/api/auth/login', {
        email: testEmail,
        password: 'wrong_password',
      });
      console.log(`Status: ${wrongPassRes.status}`, wrongPassRes.body);
      if (wrongPassRes.status !== 401 || wrongPassRes.body.success !== false) {
        throw new Error('Wrong password test failed');
      }

      // 5. Get Current User with Valid JWT
      console.log('\n[5] Testing Get Current User with JWT (GET /api/auth/me)...');
      const meRes = await request('GET', '/api/auth/me', null, authToken);
      console.log(`Status: ${meRes.status}`, meRes.body);
      if (meRes.status !== 200 || meRes.body.data?.email !== testEmail) {
        throw new Error('Get current user test failed');
      }

      // 6. Get Current User without JWT
      console.log('\n[6] Testing Get Current User without JWT (GET /api/auth/me)...');
      const noAuthRes = await request('GET', '/api/auth/me');
      console.log(`Status: ${noAuthRes.status}`, noAuthRes.body);
      if (noAuthRes.status !== 401 || noAuthRes.body.success !== false) {
        throw new Error('Unauthorized endpoint test failed');
      }

      // 7. Get User Profile
      console.log('\n[7] Testing Get Profile (GET /api/users/profile)...');
      const profileRes = await request('GET', '/api/users/profile', null, authToken);
      console.log(`Status: ${profileRes.status}`, profileRes.body);
      if (profileRes.status !== 200 || !profileRes.body.data?.id) {
        throw new Error('Get profile test failed');
      }

      // 8. Update User Profile
      console.log('\n[8] Testing Update Profile (PUT /api/users/profile)...');
      const updateRes = await request('PUT', '/api/users/profile', {
        name: 'Updated Test User',
        profile_image: 'https://example.com/avatar.jpg',
        address: '123 Tech Lane, Silicon Valley',
      }, authToken);
      console.log(`Status: ${updateRes.status}`, updateRes.body);
      if (updateRes.status !== 200 || updateRes.body.data?.name !== 'Updated Test User') {
        throw new Error('Update profile test failed');
      }

      // 9. Forgot Password (Trigger Nodemailer)
      console.log('\n[9] Testing Forgot Password (POST /api/auth/forgot-password)...');
      const forgotRes = await request('POST', '/api/auth/forgot-password', {
        email: testEmail,
      });
      console.log(`Status: ${forgotRes.status}`, forgotRes.body);
      if (forgotRes.status !== 200 || !forgotRes.body.data?.resetToken) {
        throw new Error('Forgot password test failed');
      }
      resetToken = forgotRes.body.data.resetToken;

      // 10. Reset Password
      console.log('\n[10] Testing Reset Password (POST /api/auth/reset-password)...');
      const resetRes = await request('POST', '/api/auth/reset-password', {
        token: resetToken,
        newPassword: updatedPassword,
      });
      console.log(`Status: ${resetRes.status}`, resetRes.body);
      if (resetRes.status !== 200 || !resetRes.body.success) {
        throw new Error('Reset password test failed');
      }

      // 11. Login with New Password
      console.log('\n[11] Testing Login with New Password (POST /api/auth/login)...');
      const newLoginRes = await request('POST', '/api/auth/login', {
        email: testEmail,
        password: updatedPassword,
      });
      console.log(`Status: ${newLoginRes.status}`, newLoginRes.body);
      if (newLoginRes.status !== 200 || !newLoginRes.body.data?.token) {
        throw new Error('Login with reset password failed');
      }

      console.log('\n✅ ALL 11 TESTS PASSED SUCCESSFULLY (AUTH + PROFILE + NODEMAILER RESET)!\n');
    } catch (err) {
      console.error('\n❌ Test Suite Error:', err.message);
      process.exitCode = 1;
    } finally {
      server.close();
      await sequelize.close();
    }
  });
};

runTests();
