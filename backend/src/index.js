const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const driversRoutes = require('./routes/drivers');
const vehiclesRoutes = require('./routes/vehicles');
const tripsRoutes = require('./routes/trips');
const documentsRoutes = require('./routes/documents');
const tripEventsRoutes = require('./routes/tripEvents');
const prisma = require('./lib/prisma');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/drivers', driversRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/trips/:tripId/events', tripEventsRoutes);

// Fallback error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const ensureDemoData = async () => {
  const vehiclesCount = await prisma.vehicle.count();
  if (vehiclesCount === 0) {
    await prisma.vehicle.create({
      data: {
        regNumber: 'VAN-001',
        name: 'Demo Van',
        type: 'Van',
        maxLoad: 2000,
        status: 'AVAILABLE',
        odometer: 0,
        acquisitionCost: 0,
        region: 'Demo',
      },
    });
  }
};

ensureDemoData().catch((e) => console.error(e));

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
