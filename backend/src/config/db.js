const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('FATAL ERROR: DATABASE_URL environment variable is not defined.');
  process.exit(1);
}

const sequelize = new Sequelize(connectionString, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
  },
});

const initDb = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL database connection established successfully via Sequelize.');
    // Use { alter: true } so new columns like reset_password_token get created automatically
    await sequelize.sync({ alter: true });
    console.log('Sequelize models synchronized with database tables.');
  } catch (error) {
    console.error('Unable to connect to PostgreSQL database or sync models:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  initDb,
};
