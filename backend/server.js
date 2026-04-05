const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const hpp = require('hpp');
const logger = require('./utils/logger');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const io = new Server(httpServer, {
  cors: { origin: [FRONTEND_URL, 'http://localhost:3000', 'http://localhost:3001'], credentials: true }
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  socket.on('joinOrder', (orderId) => {
    socket.join(orderId);
    console.log(`📦 Socket ${socket.id} joined order room ${orderId}`);
  });

  socket.on('joinUser', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`👤 Socket ${socket.id} joined user room ${userId}`);
  });

  socket.on('joinAdmin', () => {
    socket.join('admin_room');
    console.log(`🛡️ Socket ${socket.id} joined admin room`);
  });

  socket.on('joinRestaurant', (restaurantId) => {
    socket.join(`restaurant_${restaurantId}`);
    console.log(`🍽️ Socket ${socket.id} joined restaurant room ${restaurantId}`);
  });

  socket.on('joinDelivery', (partnerId) => {
    socket.join(`delivery_${partnerId}`);
    console.log(`🛵 Socket ${socket.id} joined delivery room ${partnerId}`);
  });

  socket.on('deliveryLocationUpdate', (data) => {
    const { orderId, lat, lng } = data;
    io.to(orderId).emit('deliveryLocation', { lat, lng });
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

app.use(helmet()); 
app.use(hpp()); 

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 500 
});
app.use('/api/', limiter);

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use(cors({ origin: [FRONTEND_URL, 'http://localhost:3000', 'http://localhost:3001'], credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date(), version: '2.0.0' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/addresses', require('./routes/addresses'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/delivery', require('./routes/delivery'));

app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀 CraveBite Server running on port ${PORT}`));

module.exports = app;
