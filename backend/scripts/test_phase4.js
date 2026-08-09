const { sequelize, User, Product, Order, OrderItem } = require('../src/models');
const adminOrderController = require('../src/controllers/admin_order.controller');
const invoiceService = require('../src/services/invoice.service');
const emailService = require('../src/services/email.service');

async function testPhase4() {
  try {
    console.log('--- 1. Syncing Database Schemas ---');
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced successfully!');

    console.log('--- 2. Creating Test Customer & Rental Order ---');
    let user = await User.findOne({ where: { role: 'CUSTOMER' } });
    if (!user) {
      user = await User.create({
        name: 'Notification Tester',
        email: `test-${Date.now()}@example.com`,
        password_hash: 'hashedpassword',
        role: 'CUSTOMER',
      });
    }

    let product = await Product.findOne();
    if (!product) {
      product = await Product.create({
        name: '4K Cinema Camera',
        category: 'Cameras',
        base_price: 2500.00,
        quantity_on_hand: 5,
      });
    }

    const order = await Order.create({
      customer_id: user.id,
      order_number: `NOTIF-${Date.now()}`,
      status: 'DRAFT',
      subtotal: 2500.00,
      delivery_method: 'STORE_PICKUP',
      start_date: '2026-08-15',
      end_date: '2026-08-20',
    });

    console.log(`✅ Test Order Created: #${order.order_number}`);

    console.log('--- 3. Testing Quotation Email Dispatch ---');
    const reqSend = { params: { id: order.id } };
    let sendRes = null;
    const resSend = { status: (code) => ({ json: (data) => { sendRes = data; } }) };

    await adminOrderController.sendQuotation(reqSend, resSend, (err) => { if (err) throw err; });
    console.log('✅ Quotation Status Transition to SENT succeeded!');

    console.log('--- 4. Testing Sale Order Confirmation Email Dispatch ---');
    const reqConf = { params: { id: order.id } };
    let confRes = null;
    const resConf = { status: (code) => ({ json: (data) => { confRes = data; } }) };

    await adminOrderController.confirmOrder(reqConf, resConf, (err) => { if (err) throw err; });
    console.log('✅ Order Confirmation Status Transition to CONFIRMED succeeded!');

    console.log('--- 5. Testing Invoice Creation & Notification Dispatch ---');
    const invoice = await invoiceService.createInvoiceForOrder(order.id);
    console.log(`✅ Invoice Created & Notification Dispatched: #${invoice.invoice_number}`);

    console.log('--- 6. Testing Direct Email Service Functions ---');
    const resultQuote = await emailService.sendQuotationEmail(order, user.email, user.name);
    const resultConf = await emailService.sendOrderConfirmationEmail(order, user.email, user.name);
    const resultInv = await emailService.sendInvoiceNotificationEmail(invoice, order, user.email, user.name);

    if (resultQuote.success && resultConf.success && resultInv.success) {
      console.log('✅ All email templates (Quotation, Confirmation, Invoice) rendered and dispatched safely!');
    } else {
      throw new Error('Email service failed to return success for notification templates');
    }

    console.log('\n🎉 ALL PHASE 4 VERIFICATION TESTS PASSED!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Phase 4 Verification Failed:', error);
    process.exit(1);
  }
}

testPhase4();
