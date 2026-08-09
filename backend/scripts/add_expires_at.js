const { sequelize } = require('../src/models');

async function migrate() {
  try {
    console.log('Adding expires_at column to rental_orders...');
    await sequelize.query(`
      ALTER TABLE rental_orders ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT NULL;
    `);
    console.log('✅ expires_at column added successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
