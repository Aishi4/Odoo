const { sequelize, User, Order } = require('../src/models');
const orderService = require('../src/services/order.service');

async function testPhase6() {
  try {
    console.log('--- 1. Syncing Database Schemas ---');
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced successfully!');

    console.log('--- 2. Creating Customer User ---');
    let user = await User.findOne({ where: { role: 'CUSTOMER' } });
    if (!user) {
      user = await User.create({
        name: 'Portal Customer',
        email: `portal-${Date.now()}@example.com`,
        password_hash: 'hashedpass',
        role: 'CUSTOMER',
      });
    }
    console.log(`✅ Customer active: ${user.email}`);

    console.log('--- 3. Testing Online Quotation Acceptance (SENT -> CONFIRMED) ---');
    const quoteOrder1 = await Order.create({
      customer_id: user.id,
      order_number: `QUOTE-ACC-${Date.now()}`,
      status: 'SENT',
      subtotal: 3500.00,
      delivery_method: 'STORE_PICKUP',
      start_date: '2026-08-25',
      end_date: '2026-08-30',
    });
    console.log(`✅ Quotation Created: #${quoteOrder1.order_number} (Status: ${quoteOrder1.status})`);

    const acceptedOrder = await orderService.acceptCustomerQuotation(user.id, quoteOrder1.id);
    console.log(`✅ Quotation Accepted Online! New Status: ${acceptedOrder.status}`);
    if (acceptedOrder.status !== 'CONFIRMED') {
      throw new Error(`Expected CONFIRMED status, got ${acceptedOrder.status}`);
    }

    console.log('--- 4. Testing Online Quotation Decline (SENT -> CANCELLED) ---');
    const quoteOrder2 = await Order.create({
      customer_id: user.id,
      order_number: `QUOTE-REJ-${Date.now()}`,
      status: 'SENT',
      subtotal: 1500.00,
      delivery_method: 'STORE_PICKUP',
      start_date: '2026-09-01',
      end_date: '2026-09-05',
    });
    console.log(`✅ Quotation Created: #${quoteOrder2.order_number} (Status: ${quoteOrder2.status})`);

    const rejectedOrder = await orderService.rejectCustomerQuotation(user.id, quoteOrder2.id);
    console.log(`✅ Quotation Declined Online! New Status: ${rejectedOrder.status}`);
    if (rejectedOrder.status !== 'CANCELLED') {
      throw new Error(`Expected CANCELLED status, got ${rejectedOrder.status}`);
    }

    console.log('\n🎉 ALL PHASE 6 VERIFICATION TESTS PASSED!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Phase 6 Verification Failed:', error);
    process.exit(1);
  }
}

testPhase6();
