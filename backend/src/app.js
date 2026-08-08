const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const productRoutes = require('./routes/product.routes');
const rentalPeriodRoutes = require('./routes/rental_period.routes');
const errorHandler = require('./middleware/error.middleware');
const AppError = require('./utils/errors');

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());

// Serve static HTML/CSS files for cURL & Postman explorer dashboard
app.use(express.static(path.join(__dirname, '../public')));

// API Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Rental Management API is running smoothly',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/rental-periods', rentalPeriodRoutes);

// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Handle Unhandled Routes (404)
app.use('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
