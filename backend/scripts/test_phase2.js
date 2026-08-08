const http = require('http');
const dotenv = require('dotenv');
const { initDb, sequelize } = require('../src/config/db');
const app = require('../src/app');

dotenv.config();

let server;
const PORT = 5004;
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

const runTests = async () => {
  console.log('\n--- Starting Phase 2 Comprehensive Integration Tests ---');

  await initDb();

  const timestamp = Date.now();
  const adminEmail = `admin_${timestamp}@example.com`;
  const customerEmail = `customer_${timestamp}@example.com`;
  const password = 'password123';

  let adminToken = '';
  let customerToken = '';
  let createdProductId = '';
  let createdVariantId = '';
  let createdRentalPeriodId = '';

  server = app.listen(PORT, async () => {
    try {
      // 1. Setup Admin Account & Login
      console.log('\n[1] Setting up ADMIN user & logging in...');
      await request('POST', '/api/auth/register', {
        name: 'Admin User',
        email: adminEmail,
        password: password,
        role: 'ADMIN',
      });

      const adminLoginRes = await request('POST', '/api/auth/login', {
        email: adminEmail,
        password: password,
      });
      adminToken = adminLoginRes.body.data.token;
      console.log('ADMIN Token acquired successfully.');

      // 2. Setup Customer Account & Login
      console.log('\n[2] Setting up CUSTOMER user & logging in...');
      await request('POST', '/api/auth/register', {
        name: 'Customer User',
        email: customerEmail,
        password: password,
        role: 'CUSTOMER',
      });

      const customerLoginRes = await request('POST', '/api/auth/login', {
        email: customerEmail,
        password: password,
      });
      customerToken = customerLoginRes.body.data.token;
      console.log('CUSTOMER Token acquired successfully.');

      // 3. Admin creates product
      console.log('\n[3] Admin creates product (POST /api/products)...');
      const createProdRes = await request(
        'POST',
        '/api/products',
        {
          name: 'Canon EOS R5',
          description: 'Full-frame mirrorless camera',
          category: 'Cameras',
          base_price: 2500,
        },
        adminToken
      );
      console.log(`Status: ${createProdRes.status}`, createProdRes.body);
      if (createProdRes.status !== 201 || !createProdRes.body.data?.id) {
        throw new Error('Product creation failed');
      }
      createdProductId = createProdRes.body.data.id;

      // 4. Customer attempts to create product -> 403 Forbidden
      console.log('\n[4] Customer attempts to create product (POST /api/products)...');
      const custProdRes = await request(
        'POST',
        '/api/products',
        {
          name: 'Unauthorized Product',
          category: 'Cameras',
          base_price: 100,
        },
        customerToken
      );
      console.log(`Status: ${custProdRes.status}`, custProdRes.body);
      if (custProdRes.status !== 403) {
        throw new Error('Authorization check failed for non-admin');
      }

      // 5. Get all products with status filter
      console.log('\n[5] Get all products with status filter (GET /api/products?status=ACTIVE)...');
      const getProdsRes = await request('GET', '/api/products?status=ACTIVE', null, customerToken);
      console.log(`Status: ${getProdsRes.status}`, `Count: ${getProdsRes.body.data.length}`);
      if (getProdsRes.status !== 200 || !Array.isArray(getProdsRes.body.data)) {
        throw new Error('Get products failed');
      }

      // 6. Admin creates product variant
      console.log('\n[6] Admin creates product variant (POST /api/products/:productId/variants)...');
      const createVariantRes = await request(
        'POST',
        `/api/products/${createdProductId}/variants`,
        {
          brand: 'Canon',
          manufacturer: 'Canon Inc.',
          color: 'Matte Black',
          size: 'Body Only',
        },
        adminToken
      );
      console.log(`Status: ${createVariantRes.status}`, createVariantRes.body);
      if (createVariantRes.status !== 201 || !createVariantRes.body.data?.id) {
        throw new Error('Product variant creation failed');
      }
      createdVariantId = createVariantRes.body.data.id;

      // 7. Get product by ID (includes variants)
      console.log('\n[7] Get product by ID (GET /api/products/:id)...');
      const getProdByIdRes = await request('GET', `/api/products/${createdProductId}`, null, customerToken);
      console.log(`Status: ${getProdByIdRes.status}`, getProdByIdRes.body);
      if (
        getProdByIdRes.status !== 200 ||
        !getProdByIdRes.body.data?.variants ||
        getProdByIdRes.body.data.variants.length === 0
      ) {
        throw new Error('Get product by ID failed or variants missing');
      }

      // 8. Admin updates product
      console.log('\n[8] Admin updates product (PUT /api/products/:id)...');
      const updateProdRes = await request(
        'PUT',
        `/api/products/${createdProductId}`,
        {
          name: 'Canon EOS R5 Mark II',
          base_price: 2800,
        },
        adminToken
      );
      console.log(`Status: ${updateProdRes.status}`, updateProdRes.body);
      if (updateProdRes.status !== 200 || updateProdRes.body.data?.name !== 'Canon EOS R5 Mark II') {
        throw new Error('Update product failed');
      }

      // 9. Admin updates variant
      console.log('\n[9] Admin updates variant (PUT /api/products/:productId/variants/:variantId)...');
      const updateVariantRes = await request(
        'PUT',
        `/api/products/${createdProductId}/variants/${createdVariantId}`,
        {
          color: 'Satin Black',
        },
        adminToken
      );
      console.log(`Status: ${updateVariantRes.status}`, updateVariantRes.body);
      if (updateVariantRes.status !== 200 || updateVariantRes.body.data?.color !== 'Satin Black') {
        throw new Error('Update variant failed');
      }

      // 10. Admin deactivates variant
      console.log('\n[10] Admin deactivates variant (DELETE /api/products/:productId/variants/:variantId)...');
      const deactVariantRes = await request(
        'DELETE',
        `/api/products/${createdProductId}/variants/${createdVariantId}`,
        null,
        adminToken
      );
      console.log(`Status: ${deactVariantRes.status}`, deactVariantRes.body);
      if (deactVariantRes.status !== 200 || deactVariantRes.body.data?.status !== 'INACTIVE') {
        throw new Error('Deactivate variant failed');
      }

      // 11. Admin deactivates product
      console.log('\n[11] Admin deactivates product (DELETE /api/products/:id)...');
      const deactProdRes = await request('DELETE', `/api/products/${createdProductId}`, null, adminToken);
      console.log(`Status: ${deactProdRes.status}`, deactProdRes.body);
      if (deactProdRes.status !== 200 || deactProdRes.body.data?.status !== 'INACTIVE') {
        throw new Error('Deactivate product failed');
      }

      // 12. Admin creates rental period
      console.log('\n[12] Admin creates rental period (POST /api/rental-periods)...');
      const createPeriodRes = await request(
        'POST',
        '/api/rental-periods',
        {
          name: 'Weekly Pass',
          duration: 7,
          unit: 'DAY',
        },
        adminToken
      );
      console.log(`Status: ${createPeriodRes.status}`, createPeriodRes.body);
      if (createPeriodRes.status !== 201 || !createPeriodRes.body.data?.id) {
        throw new Error('Rental period creation failed');
      }
      createdRentalPeriodId = createPeriodRes.body.data.id;

      // 13. Customer gets rental periods
      console.log('\n[13] Customer gets rental periods (GET /api/rental-periods)...');
      const getPeriodsRes = await request('GET', '/api/rental-periods', null, customerToken);
      console.log(`Status: ${getPeriodsRes.status}`, `Count: ${getPeriodsRes.body.data.length}`);
      if (getPeriodsRes.status !== 200 || !Array.isArray(getPeriodsRes.body.data)) {
        throw new Error('Get rental periods failed');
      }

      // 14. Admin updates and deactivates rental period
      console.log('\n[14] Admin updates & deactivates rental period...');
      const updatePeriodRes = await request(
        'PUT',
        `/api/rental-periods/${createdRentalPeriodId}`,
        {
          name: '7-Day Pass',
        },
        adminToken
      );
      if (updatePeriodRes.status !== 200 || updatePeriodRes.body.data?.name !== '7-Day Pass') {
        throw new Error('Update rental period failed');
      }

      const deactPeriodRes = await request('DELETE', `/api/rental-periods/${createdRentalPeriodId}`, null, adminToken);
      console.log(`Status: ${deactPeriodRes.status}`, deactPeriodRes.body);
      if (deactPeriodRes.status !== 200 || deactPeriodRes.body.data?.status !== 'INACTIVE') {
        throw new Error('Deactivate rental period failed');
      }

      // 15. Invalid resource tests
      console.log('\n[15] Testing 404 handling for invalid product ID...');
      const notFoundRes = await request('GET', '/api/products/00000000-0000-0000-0000-000000000000', null, customerToken);
      console.log(`Status: ${notFoundRes.status}`, notFoundRes.body);
      if (notFoundRes.status !== 404) {
        throw new Error('404 handling failed');
      }

      console.log('\n✅ ALL PHASE 2 INTEGRATION TESTS PASSED SUCCESSFULLY!\n');
    } catch (err) {
      console.error('\n❌ Phase 2 Test Suite Error:', err.message);
      process.exitCode = 1;
    } finally {
      server.close();
      await sequelize.close();
    }
  });
};

runTests();
