const http = require('http');
const { initDb, sequelize } = require('../src/config/db');
const app = require('../src/app');

let server;
const PORT = 5025;
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

const runProfileImageTest = async () => {
  console.log('\n======================================================');
  console.log('--- STARTING PROFILE IMAGE UPDATE TEST SUITE ---');
  console.log('======================================================\n');

  await initDb();

  server = app.listen(PORT, async () => {
    try {
      const email = `img_test_${Date.now()}@example.com`;
      console.log('[1] Registering test user:', email);
      await request('POST', '/api/auth/register', {
        name: 'Profile Tester',
        email,
        password: 'password123',
      });

      const loginRes = await request('POST', '/api/auth/login', {
        email,
        password: 'password123',
      });
      const token = loginRes.body.data.token;

      console.log('\n[2] Updating profile with Base64 Avatar Image & Address...');
      const sampleBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const updateRes = await request('PUT', '/api/users/profile', {
        name: 'Profile Tester Updated',
        profile_image: sampleBase64,
        address: '123 Test Street, Suite 400',
      }, token);

      console.log('-> Update Status:', updateRes.status);
      console.log('-> Updated Name:', updateRes.body.data.name);
      console.log('-> Updated Image Saved:', updateRes.body.data.profile_image ? 'YES (Base64/URL)' : 'NO');
      console.log('-> Updated Address:', updateRes.body.data.address);

      if (updateRes.status !== 200 || !updateRes.body.data.profile_image) {
        throw new Error('Profile image failed to update!');
      }

      console.log('\n======================================================');
      console.log('🎉 PROFILE IMAGE UPDATE TEST PASSED SUCCESSFULLY!');
      console.log('======================================================\n');
    } catch (err) {
      console.error('\n❌ Test Error:', err.message);
      process.exitCode = 1;
    } finally {
      server.close();
      await sequelize.close();
    }
  });
};

runProfileImageTest();
