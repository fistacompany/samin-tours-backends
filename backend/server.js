require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Serve admin dashboard static files
app.use('/admin', express.static(path.join(__dirname, 'public/admin')));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// API Routes
app.use('/api/cars', require('./routes/cars'));
app.use('/api/bookings', require('./routes/bookings'));

// Redirect root to login page
app.get('/', (req, res) => {
    res.redirect('/admin/login.html');
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Samin Tours & Travels API is running',
        timestamp: new Date().toISOString()
    });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 API: http://localhost:${PORT}/api`);
    console.log(`🔧 Admin Login: http://localhost:${PORT}/admin/login.html`);
    console.log(`🔧 Admin Dashboard: http://localhost:${PORT}/admin/cars.html`);
});
