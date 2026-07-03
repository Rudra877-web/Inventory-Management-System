import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';

// Route imports
import authRoutes from './routes/auth.js';
import investmentRoutes from './routes/investments.js';
import transactionRoutes from './routes/transactions.js';
import goalRoutes from './routes/goals.js';
import notificationRoutes from './routes/notifications.js';
import kycRoutes from './routes/kyc.js';
import watchlistRoutes from './routes/watchlist.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/admin', adminRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Investment Management System API' });
});

// Seed admin user
const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await User.create({
        name: 'System Administrator',
        email: 'admin@investly.com',
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        kycStatus: 'Approved',
        balance: 10000000 // Infinite virtual money for admin
      });
      console.log('👑 Default Admin Account Seeded:');
      console.log('   Email: admin@investly.com');
      console.log('   Password: admin123');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error.message);
  }
};

// Start Server
const startServer = async () => {
  // Connect to Database (failover to mock is handled inside)
  await connectDB();
  
  // Seed initial Admin
  await seedAdmin();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
