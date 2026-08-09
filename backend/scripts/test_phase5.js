const { sequelize, User, Product, Order, OrderItem, Invoice } = require('../src/models');
const invoiceService = require('../src/services/invoice.service');

async function testPhase5() {
  try {
    console.log('--- 1. Syncing Database Schemas ---');
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced successfully!');

    console.log('--- 2. Creating Customer & Rental Order ---');
    let user = await User.findOne({ where: { role: 'CUSTOMER' } });
    if (!user) {
      user = await User.create({
        name: 'Financial Tester',
        email: `fin-${Date.now()}@example.com`,
        password_hash: 'hashedpass',
        role: 'CUSTOMER',
      });
    }

    const order = await Order.create({
      customer_id: user.id,
      order_number: `FIN-ORD-${Date.now()}`,
      status: 'CONFIRMED',
      subtotal: 5000.00,
      delivery_method: 'STORE_PICKUP',
      start_date: '2026-08-20',
      end_date: '2026-08-25',
    });
    console.log(`✅ Order Created: #${order.order_number} (Subtotal: ₹5,000.00)`);

    console.log('--- 3. Creating Draft Invoice ---');
    const invoice = await invoiceService.createInvoiceForOrder(order.id);
    console.log(`✅ Draft Invoice Created: #${invoice.invoice_number} (Status: ${invoice.status}, Payment Status: ${invoice.payment_status})`);

    console.log('--- 4. Posting Invoice (DRAFT -> POSTED) ---');
    const postedInvoice = await invoiceService.postInvoice(invoice.id);
    if (postedInvoice.status !== 'POSTED') {
      throw new Error('Failed to post invoice');
    }
    console.log(`✅ Invoice Posted Successfully! (Status: ${postedInvoice.status})`);

    console.log('--- 5. Registering Partial Payment (₹2,000 out of ₹5,000) ---');
    const partialInv = await invoiceService.registerInvoicePayment(invoice.id, { paymentAmount: 2000, paymentMethod: 'ONLINE' });
    console.log(`✅ Partial Payment Registered! Paid: ₹${partialInv.amount_paid} | Payment Status: ${partialInv.payment_status}`);
    if (partialInv.payment_status !== 'PARTIALLY_PAID') {
      throw new Error(`Expected PARTIALLY_PAID status, got ${partialInv.payment_status}`);
    }

    console.log('--- 6. Registering Remaining Balance (₹3,000) ---');
    const fullInv = await invoiceService.registerInvoicePayment(invoice.id, { paymentAmount: 3000, paymentMethod: 'BANK_TRANSFER' });
    console.log(`✅ Full Payment Completed! Paid: ₹${fullInv.amount_paid} | Payment Status: ${fullInv.payment_status}`);
    if (fullInv.payment_status !== 'PAID') {
      throw new Error(`Expected PAID status, got ${fullInv.payment_status}`);
    }

    console.log('--- 7. Processing Security Deposit Refund ---');
    const refundResult = await invoiceService.processDepositRefund(order.id, { refundAmount: 100, note: 'Tested deposit refund' });
    console.log(`✅ Security Deposit Refund Processed! Amount: ₹${refundResult.refund_amount} | Status: ${refundResult.status}`);

    console.log('\n🎉 ALL PHASE 5 VERIFICATION TESTS PASSED!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Phase 5 Verification Failed:', error);
    process.exit(1);
  }
}

testPhase5();
