const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const dns = require('dns');

// Fix for ENOTFOUND querySrv issues on some networks
dns.setServers(['8.8.8.8', '1.1.1.1']);

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));

// Koi Centre Routes
const { protect, authorize } = require('./middleware/authMiddleware');
app.use('/api/koi/enquiries', protect, authorize('admin', 'KOI_MANAGER', 'STAFF', 'BRANCH_MANAGER'), require('./routes/koiEnquiryRoutes'));
app.use('/api/koi/orders', protect, authorize('admin', 'KOI_MANAGER', 'STAFF', 'BRANCH_MANAGER'), require('./routes/koiOrderRoutes'));
app.use('/api/koi/invoices', protect, authorize('admin', 'KOI_MANAGER', 'STAFF', 'BRANCH_MANAGER'), require('./routes/koiInvoiceRoutes'));
app.use('/api/koi/payments', protect, authorize('admin', 'KOI_MANAGER', 'STAFF', 'BRANCH_MANAGER'), require('./routes/koiPaymentRoutes'));
app.use('/api/koi/inventory', protect, authorize('admin', 'KOI_MANAGER', 'STAFF', 'BRANCH_MANAGER'), require('./routes/koiInventoryRoutes'));
app.use('/api/koi/customers', protect, authorize('admin', 'KOI_MANAGER', 'STAFF', 'BRANCH_MANAGER'), require('./routes/koiCustomerRoutes'));


// Database Connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/pvr_aqua';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
