const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');
const tableRoutes = require('./routes/tables');
const waiterRoutes = require('./routes/waiters');
const billRoutes = require('./routes/bills');
const stockRoutes = require('./routes/stock');
const reportRoutes = require('./routes/reports');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Initialize express app
const app = express();

// Security middleware
app.use(helmet());

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all API routes
app.use('/api/', limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
});

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',') 
    : '*',
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/waiters', waiterRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB with production-ready options
const mongoOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

mongoose
  .connect(process.env.MONGODB_URI, mongoOptions)
  .then(() => {
    console.log('✅ Connected to MongoDB (bhinna_shad database)');
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Seed initial data if needed (only in development)
    // if (process.env.NODE_ENV !== 'production') {
    //   seedInitialData();
    // }
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Seed initial data
async function seedInitialData() {
  const User = require('./models/User');
  const MenuItem = require('./models/MenuItem');
  const Table = require('./models/Table');

  try {
    // Check if admin exists
    const adminExists = await User.findOne({ email: 'admin@bhinnashad.com' });
    
    if (!adminExists) {
      console.log('🌱 Seeding initial data...');
      
      // Create demo users
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('123456', 10);
      
      await User.insertMany([
        {
          name: 'Admin User',
          email: 'admin@bhinnashad.com',
          password: hashedPassword,
          role: 'admin',
          status: 'approved',
        },
        {
          name: 'Manager User',
          email: 'manager@bhinnashad.com',
          password: hashedPassword,
          role: 'manager',
          status: 'approved',
        },
        {
          name: 'Arjun Waiter',
          email: 'arjun@bhinnashad.com',
          password: hashedPassword,
          role: 'waiter',
          status: 'approved',
        },
      ]);
      
      // Create demo menu items
      await MenuItem.insertMany([
        {
          name: 'Chicken Curry',
          price: 250,
          category: 'Main Course',
          imageUrl: '',
          isAvailable: true,
          ingredients: [],
          costOfGoods: 0,
        },
        {
          name: 'Paneer Tikka',
          price: 200,
          category: 'Starter',
          imageUrl: '',
          isAvailable: true,
          ingredients: [],
          costOfGoods: 0,
        },
        {
          name: 'Biryani',
          price: 300,
          category: 'Main Course',
          imageUrl: '',
          isAvailable: true,
          ingredients: [],
          costOfGoods: 0,
        },
        {
          name: 'Naan',
          price: 30,
          category: 'Bread',
          imageUrl: '',
          isAvailable: true,
          ingredients: [],
          costOfGoods: 0,
        },
        {
          name: 'Dal Makhani',
          price: 180,
          category: 'Main Course',
          imageUrl: '',
          isAvailable: true,
          ingredients: [],
          costOfGoods: 0,
        },
      ]);
      
      // Create tables
      const tables = [];
      for (let i = 1; i <= 12; i++) {
        tables.push({
          tableNumber: i,
          status: 'available',
          waiterId: null,
        });
      }
      await Table.insertMany(tables);
      
      console.log('✅ Initial data seeded successfully');
    }
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
}

// Start server
const PORT = process.env.PORT || 9002;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 API available at http://localhost:${PORT}/api`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});
