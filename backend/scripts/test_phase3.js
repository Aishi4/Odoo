const { sequelize, User, Product, Order, OrderItem } = require('../src/models');
const adminOrderController = require('../src/controllers/admin_order.controller');

async function testPhase3() {
  try {
    console.log('--- 1. Syncing Database Schemas ---');
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced successfully!');

    console.log('--- 2. Fetching/Creating Test User & Limited Stock Product ---');
    let user = await User.findOne();
    let product = await Product.create({
      name: `Limited Camera Kit ${Date.now()}`,
      category: 'Cameras',
      base_price: 1500.00,
      quantity_on_hand: 1.00, // Only 1 in stock!
    });
    console.log(`✅ Test Product Created: "${product.name}" (Stock: ${product.quantity_on_hand})`);

    console.log('--- 3. Creating Overlapping Orders (Conflict Trigger) ---');
    let rentalPeriod = await sequelize.models.RentalPeriod.findOne();
    if (!rentalPeriod) {
      rentalPeriod = await sequelize.models.RentalPeriod.create({
        name: 'Day',
        duration_hours: 24,
      });
    }

    const order1 = await Order.create({
      customer_id: user.id,
      order_number: `CONF-RNT-1-${Date.now()}`,
      status: 'CONFIRMED',
      subtotal: 1500.00,
      delivery_method: 'STORE_PICKUP',
      start_date: '2026-08-10',
      end_date: '2026-08-15',
    });
    await OrderItem.create({
      order_id: order1.id,
      product_id: product.id,
      product_name: product.name,
      rental_period_id: rentalPeriod.id,
      start_date: '2026-08-10',
      end_date: '2026-08-15',
      quantity: 1,
      unit_price: 1500.00,
      total_price: 1500.00,
    });

    const order2 = await Order.create({
      customer_id: user.id,
      order_number: `CONF-RNT-2-${Date.now()}`,
      status: 'CONFIRMED',
      subtotal: 1500.00,
      delivery_method: 'STORE_PICKUP',
      start_date: '2026-08-12',
      end_date: '2026-08-18',
    });
    await OrderItem.create({
      order_id: order2.id,
      product_id: product.id,
      product_name: product.name,
      rental_period_id: rentalPeriod.id,
      start_date: '2026-08-12',
      end_date: '2026-08-18',
      quantity: 1,
      unit_price: 1500.00,
      total_price: 1500.00,
    });
    console.log('✅ Two overlapping orders created for 2026-08-12 to 2026-08-15');

    console.log('--- 4. Testing Rental Schedule API & Conflict Engine ---');
    const req = { query: { month: '2026-08' } };
    let scheduleRes = null;
    const res = {
      status: (code) => ({
        json: (data) => {
          scheduleRes = data;
        },
      }),
    };

    await adminOrderController.getRentalSchedule(req, res, (err) => {
      if (err) throw err;
    });

    if (scheduleRes && scheduleRes.success) {
      const conflicts = scheduleRes.data.conflicts || [];
      console.log(`✅ Schedule Endpoint Executed! Total Conflicts Detected: ${conflicts.length}`);
      const productConflicts = conflicts.filter((c) => c.product_id === product.id);

      if (productConflicts.length > 0) {
        console.log(`✅ Conflict Engine successfully detected overbooking for product "${product.name}" on dates:`, productConflicts.map((c) => c.date));
      } else {
        throw new Error('Conflict Engine failed to detect overlapping orders!');
      }
    } else {
      throw new Error('Schedule controller failed to return success response');
    }

    console.log('\n🎉 ALL PHASE 3 VERIFICATION TESTS PASSED!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Phase 3 Verification Failed:', error);
    process.exit(1);
  }
}

testPhase3();
