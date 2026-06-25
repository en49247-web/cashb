require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const { initWebSocket } = require('./websocket');

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server (needed for WebSocket upgrade)
const server = http.createServer(app);

// Connect Database
connectDB();

// Middleware
// Configure CORS for production - allow all origins
app.use(cors({
    origin: true,  // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'timeout'],
    credentials: true
}))
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'cashXcrypto API is running...' });
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Initialize WebSocket server on the same HTTP server
initWebSocket(server);

// Start Binance rates sync service (every 10 seconds)
const { startBinanceSync } = require('./services/binanceService');
startBinanceSync(10000);

// Start HTTP + WebSocket server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket available at ws://localhost:${PORT}/ws`);
});
