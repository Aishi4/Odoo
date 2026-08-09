const { sequelize, User, Product, Order, OrderItem, Invoice } = require('../src/models');
const invoiceService = require('../src/services/invoice.service');
const orderService = require('../src/services/order.service');

async function testPhase1() {
  try {
    console.log('--- 1. Syncing Database Schemas ---');
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced successfully!');

    console.log('--- 2. Fetching test User & Product ---');
    let user = await User.findOne({ where: { role: 'CUSTOMER' } });
    if (!user) {
      user = await User.findOne();
    }
    console.log('Using User:', user ? user.email : 'None');

    if (!user) {
      console.log('No user found to test order creation');
      process.exit(0);
    }

    console.log('--- 3. Creating Test Order (DRAFT) ---');
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const orderNumber = `TEST-RNT-${dateStr}-${Math.floor(Math.random() * 8999 + 1000)}`;

    const newOrder = await Order.create({
      customer_id: user.id,
      order_number: orderNumber,
      status: 'DRAFT',
      subtotal: 4500.00,
      delivery_method: 'STORE_PICKUP',
      start_date: new Date().toISOString().slice(0, 10),
      end_date: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
    });

    console.log(`✅ Test Order Created: ${newOrder.order_number} (Status: ${newOrder.status})`);

    console.log('--- 4. Transitioning Order: DRAFT -> SENT ---');
    const sentOrder = await orderService.updateOrderStatus(newOrder.id, 'SENT');
    console.log(`✅ Order updated: Status=${sentOrder.status}`);

    console.log('--- 5. Transitioning Order: SENT -> CONFIRMED ---');
    const confirmedOrder = await orderService.updateOrderStatus(newOrder.id, 'CONFIRMED');
    console.log(`✅ Order updated: Status=${confirmedOrder.status}`);

    console.log('--- 6. Creating Draft Invoice for Order ---');
    const draftInvoice = await invoiceService.createInvoiceForOrder(newOrder.id);
    console.log(`✅ Invoice Created: ${draftInvoice.invoice_number} (Status: ${draftInvoice.status}, Payment: ${draftInvoice.payment_status}, Amount: ₹${draftInvoice.amount})`);

    console.log('--- 7. Posting Draft Invoice ---');
    const postedInvoice = await invoiceService.postInvoice(draftInvoice.id);
    console.log(`✅ Invoice Posted: ${postedInvoice.invoice_number} (Status: ${postedInvoice.status})`);

    console.log('\n🎉 ALL PHASE 1 VERIFICATION TESTS PASSED!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Phase 1 Verification Failed:', error);
    process.exit(1);
  }
}

testPhase1();
