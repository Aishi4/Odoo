const dotenv = require('dotenv');
dotenv.config();

const http = require('http');
const { initDb, sequelize } = require('../src/config/db');
const app = require('../src/app');

let server;
const PORT = 5005;
const BASE_URL = `http://localhost:${PORT}`;

const rawRequest = (method, path, rawBody, token = null) => {
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

    if (rawBody) {
      req.write(rawBody);
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('\n--- Testing Chained Dual Error Handlers ---');

  await initDb();

  const timestamp = Date.now();
  const adminEmail = `duplicate_2nd_${timestamp}@example.com`;
  const password = 'password123';

  server = app.listen(PORT, async () => {
    try {
      // 1. Test 404 Route Error (Handled by 1st Error Handler for AppError)
      console.log('\n[1] Testing 404 Route (Handled by 1st Handler)...');
      const res404 = await rawRequest('GET', '/api/non-existent-route');
      console.log(`Status: ${res404.status}`, res404.body);

      // 2. Test Invalid Token (Handled by 1st Error Handler)
      console.log('\n[2] Testing Invalid JWT (Handled by 1st Handler)...');
      const resJwt = await rawRequest('GET', '/api/cart', null, 'invalid_token_xyz');
      console.log(`Status: ${resJwt.status}`, resJwt.body);

      // 3. Register user & test duplicate email (1st handler calls next(err) -> Handled by 2nd Handler!)
      console.log('\n[3] Testing Duplicate Email Registration (Delegated to 2nd Handler)...');
      await rawRequest('POST', '/api/auth/register', JSON.stringify({ name: 'Admin', email: adminEmail, password, role: 'ADMIN' }));
      const dupRes = await rawRequest('POST', '/api/auth/register', JSON.stringify({ name: 'Admin Dup', email: adminEmail, password, role: 'ADMIN' }));
      console.log(`Status: ${dupRes.status}`, dupRes.body);
      if (dupRes.status !== 409 || dupRes.body.handledBy !== 'secondErrorHandler') {
        throw new Error('Duplicate email was not handled by second error handler');
      }

      console.log('\n✅ VERIFIED: SECOND ERROR HANDLER HANDLED THE DUPLICATE REGISTRATION EMAIL ERROR!\n');
    } catch (err) {
      console.error('\n❌ Test Error:', err.message);
      process.exitCode = 1;
    } finally {
      server.close();
      await sequelize.close();
    }
  });
};

runTests();
