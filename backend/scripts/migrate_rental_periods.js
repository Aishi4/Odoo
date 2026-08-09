const { sequelize } = require('../src/models');

async function migrate() {
  try {
    console.log('Migrating rental_periods table...');

    await sequelize.query(`
      ALTER TABLE rental_periods
        ADD COLUMN IF NOT EXISTS vendor_id UUID DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00;
    `);

    // Add HOUR to the unit ENUM if not already present
    await sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum
          WHERE enumlabel = 'HOUR'
          AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_rental_periods_unit')
        ) THEN
          ALTER TYPE "enum_rental_periods_unit" ADD VALUE 'HOUR';
        END IF;
      END
      $$;
    `);

    console.log('✅ rental_periods migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
