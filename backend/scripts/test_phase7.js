const { sequelize } = require('../src/models');
const dashboardService = require('../src/services/dashboard.service');

async function testPhase7() {
  try {
    console.log('--- 1. Syncing Database Schemas ---');
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced successfully!');

    console.log('--- 2. Fetching Dashboard Overview Metrics ---');
    const overview = await dashboardService.getOverview();
    console.log('✅ Overview Metrics:', JSON.stringify(overview, null, 2));

    if (typeof overview.rental_revenue !== 'number' || typeof overview.utilization_rate !== 'number') {
      throw new Error('Invalid overview metrics structure');
    }

    console.log('--- 3. Fetching Top Rented Products Leaderboard ---');
    const topProducts = await dashboardService.getTopRentedProducts(5);
    console.log('✅ Top Products Leaderboard:', JSON.stringify(topProducts, null, 2));

    console.log('--- 4. Fetching Priority Action Center Tasks ---');
    const priorities = await dashboardService.getPriorities();
    console.log(`✅ Priority Tasks Found: ${priorities.total}`);

    console.log('\n🎉 ALL PHASE 7 VERIFICATION TESTS PASSED!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Phase 7 Verification Failed:', error);
    process.exit(1);
  }
}

testPhase7();
