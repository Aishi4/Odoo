const { sequelize } = require('../src/models');
const templateService = require('../src/services/quotation_template.service');
const pricelistService = require('../src/services/pricelist.service');

async function testPhase2() {
  try {
    console.log('--- 1. Syncing Database Schemas for Phase 2 ---');
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced successfully!');

    console.log('--- 2. Creating Quotation Template ---');
    const templateName = `Test Template ${Date.now()}`;
    const tpl = await templateService.createTemplate({
      name: templateName,
      validity_days: 15,
      note: 'Terms: 50% advance deposit required.',
      items: [
        { product_name: 'Studio Camera Kit', quantity: 2, discount_pct: 10 },
      ],
    });
    console.log(`✅ Template Created: ID=${tpl.id}, Name="${tpl.name}", Validity=${tpl.validity_days} days`);

    console.log('--- 3. Fetching Quotation Templates ---');
    const allTemplates = await templateService.getAllTemplates();
    console.log(`✅ Total Templates in DB: ${allTemplates.length}`);

    console.log('--- 4. Creating Pricelist ---');
    const pricelistName = `Corporate VIP List ${Date.now()}`;
    const pl = await pricelistService.createPricelist({
      name: pricelistName,
      currency: 'INR',
      is_selectable: true,
      status: 'ACTIVE',
    });
    console.log(`✅ Pricelist Created: ID=${pl.id}, Name="${pl.name}"`);

    console.log('--- 5. Adding Dynamic Pricing Rule (15% OFF for Qty >= 3) ---');
    const updatedPl = await pricelistService.addRuleToPricelist(pl.id, {
      min_quantity: 3,
      rule_type: 'PERCENT',
      discount_percentage: 15.00,
    });
    console.log(`✅ Rule Added! Total Rules in Pricelist: ${updatedPl.rules.length}`);

    console.log('--- 6. Testing Dynamic Price Calculation Engine ---');
    const priceResult = await pricelistService.calculateDynamicPrice('dummy-product-id', 3, 10000, new Date(), pl.id);
    console.log(`Base Price: ₹10,000 | Calculated Final Price: ₹${priceResult.finalPrice} | Discount Applied: ₹${priceResult.discountApplied}`);

    if (priceResult.finalPrice === 8500) {
      console.log('✅ Dynamic Price Calculation engine accurately calculated 15% discount!');
    } else {
      throw new Error(`Expected final price 8500 but got ${priceResult.finalPrice}`);
    }

    console.log('\n🎉 ALL PHASE 2 VERIFICATION TESTS PASSED!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Phase 2 Verification Failed:', error);
    process.exit(1);
  }
}

testPhase2();
