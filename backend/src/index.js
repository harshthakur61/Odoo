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
  const bcrypt = require('bcrypt');
  
  // Create demo vehicle if none exist
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

  // Create demo users and drivers
  const demoUsers = [
    { email: 'admin@transitops.com', name: 'Admin User', role: 'Fleet Manager' },
    { email: 'dispatcher@transitops.com', name: 'Mark Reynolds', role: 'Dispatcher' },
    { email: 'field@transitops.com', name: 'Elena Rodriguez', role: 'Driver' },
    { email: 'phantomking176@gmail.com', name: 'Akash Thakur', role: 'Driver' },
    { email: 'safety@transitops.com', name: 'Sarah Chen', role: 'Safety Officer' },
    { email: 'finance@transitops.com', name: 'James Wright', role: 'Financial Analyst' },
  ];

  const hashedPassword = await bcrypt.hash('demo', 10);

  for (const userData of demoUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (!existingUser) {
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          role: userData.role,
          password: hashedPassword,
        },
      });

      // If the user is a driver, create a corresponding driver record
      if (userData.role === 'Driver') {
        const existingDriver = await prisma.driver.findUnique({
          where: { userId: user.id },
        });

        if (!existingDriver) {
          const now = new Date();
          const expiry = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
          await prisma.driver.create({
            data: {
              name: userData.name,
              licenseNumber: `DEMO-LIC-${user.id}`,
              licenseCategory: 'Class B',
              licenseExpiry: expiry,
              status: 'AVAILABLE',
              safetyScore: 100,
              userId: user.id,
            },
          });
        }
      }
    }
  }
};

ensureDemoData().catch((e) => console.error(e));

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
