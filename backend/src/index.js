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
const emergencyReportsRoutes = require('./routes/emergencyReports');
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
app.use('/api/emergency-reports', emergencyReportsRoutes);

// Fallback error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const ensureDemoData = async () => {
  const bcrypt = require('bcrypt');

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
  const createdUsers = [];

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
      createdUsers.push(user);

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
    } else {
      createdUsers.push(existingUser);
    }
  }

  // Seed 5 Vehicles
  const vehiclesCount = await prisma.vehicle.count();
  if (vehiclesCount === 0) {
    const vehiclesData = [
      { regNumber: 'VAN-001', name: 'Delivery Van Alpha', type: 'Van', maxLoad: 2000, odometer: 12000, acquisitionCost: 35000, region: 'North' },
      { regNumber: 'TRK-002', name: 'Cargo Truck Bravo', type: 'Truck', maxLoad: 5000, odometer: 35000, acquisitionCost: 85000, region: 'South' },
      { regNumber: 'VAN-003', name: 'City Van Charlie', type: 'Van', maxLoad: 1800, odometer: 8500, acquisitionCost: 32000, region: 'East' },
      { regNumber: 'TRK-004', name: 'Heavy Truck Delta', type: 'Truck', maxLoad: 7500, odometer: 52000, acquisitionCost: 120000, region: 'West' },
      { regNumber: 'VAN-005', name: 'Utility Van Echo', type: 'Van', maxLoad: 2200, odometer: 4500, acquisitionCost: 38000, region: 'Central' },
    ];
    for (const v of vehiclesData) {
      await prisma.vehicle.create({ data: v });
    }
  }

  // Seed additional Drivers (5 total)
  const driversCount = await prisma.driver.count();
  if (driversCount < 5) {
    const additionalDrivers = [
      { name: 'Michael Scott', licenseNumber: 'MIC-1234', licenseCategory: 'Class A', contact: '555-0101' },
      { name: 'Dwight Schrute', licenseNumber: 'DWI-5678', licenseCategory: 'Class B', contact: '555-0102' },
      { name: 'Jim Halpert', licenseNumber: 'JIM-9012', licenseCategory: 'Class C', contact: '555-0103' },
    ];
    const now = new Date();
    const expiry = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    for (const d of additionalDrivers) {
      const existing = await prisma.driver.findUnique({ where: { licenseNumber: d.licenseNumber } });
      if (!existing) {
        await prisma.driver.create({
          data: {
            ...d,
            licenseExpiry: expiry,
            status: 'AVAILABLE',
            safetyScore: 100,
          },
        });
      }
    }
  }

  // Get all drivers and admin user for document verification
  const drivers = await prisma.driver.findMany();
  const adminUser = await prisma.user.findFirst({ where: { role: 'Fleet Manager' } });

  // Seed Driver Documents (verified) for each driver
  for (const driver of drivers) {
    const docsCount = await prisma.driverDocument.count({ where: { driverId: driver.id } });
    if (docsCount === 0) {
      const expiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      await prisma.driverDocument.createMany({
        data: [
          { driverId: driver.id, type: 'LICENSE', fileUrl: '/uploads/demo-license.pdf', status: 'VERIFIED', expiresAt: expiry, verifiedAt: new Date(), verifiedByUserId: adminUser?.id },
          { driverId: driver.id, type: 'INSURANCE', fileUrl: '/uploads/demo-insurance.pdf', status: 'VERIFIED', expiresAt: expiry, verifiedAt: new Date(), verifiedByUserId: adminUser?.id },
        ],
      });
    }
  }

  // Seed 5 Maintenance Logs
  const maintenanceCount = await prisma.maintenanceLog.count();
  if (maintenanceCount === 0) {
    const vehicles = await prisma.vehicle.findMany();
    const maintenanceData = [
      { type: 'Oil Change', description: 'Regular oil and filter change', cost: 120.50, status: 'CLOSED', vehicleId: vehicles[0]?.id },
      { type: 'Tire Replacement', description: 'Replaced all 4 tires', cost: 450.00, status: 'CLOSED', vehicleId: vehicles[1]?.id },
      { type: 'Brake Inspection', description: 'Full brake system check', cost: 85.00, status: 'ACTIVE', vehicleId: vehicles[2]?.id },
      { type: 'Engine Tune-up', description: 'Spark plugs and filters', cost: 320.75, status: 'CLOSED', vehicleId: vehicles[3]?.id },
      { type: 'Alignment', description: 'Wheel alignment', cost: 150.00, status: 'ACTIVE', vehicleId: vehicles[4]?.id },
    ];
    for (const m of maintenanceData.filter(m => m.vehicleId)) {
      await prisma.maintenanceLog.create({ data: m });
    }
  }

  // Seed 5 Fuel Logs
  const fuelCount = await prisma.fuelLog.count();
  if (fuelCount === 0) {
    const vehicles = await prisma.vehicle.findMany();
    const fuelData = [
      { liters: 50.5, cost: 3.85 * 50.5, vehicleId: vehicles[0]?.id },
      { liters: 120.0, cost: 3.75 * 120, vehicleId: vehicles[1]?.id },
      { liters: 45.0, cost: 3.90 * 45, vehicleId: vehicles[2]?.id },
      { liters: 150.5, cost: 3.65 * 150.5, vehicleId: vehicles[3]?.id },
      { liters: 55.0, cost: 3.80 * 55, vehicleId: vehicles[4]?.id },
    ];
    for (const f of fuelData.filter(f => f.vehicleId)) {
      await prisma.fuelLog.create({ data: f });
    }
  }

  // Seed 5 Expenses
  const expenseCount = await prisma.expense.count();
  if (expenseCount === 0) {
    const vehicles = await prisma.vehicle.findMany();
    const expenseData = [
      { type: 'Tolls', amount: 45.00, description: 'Highway tolls', vehicleId: vehicles[0]?.id },
      { type: 'Parking', amount: 25.50, description: 'City parking fees', vehicleId: vehicles[1]?.id },
      { type: 'Washing', amount: 30.00, description: 'Vehicle wash and detail', vehicleId: vehicles[2]?.id },
      { type: 'Repairs', amount: 280.00, description: 'Minor repair', vehicleId: vehicles[3]?.id },
      { type: 'Insurance', amount: 500.00, description: 'Monthly insurance premium', vehicleId: vehicles[4]?.id },
    ];
    for (const e of expenseData.filter(e => e.vehicleId)) {
      await prisma.expense.create({ data: e });
    }
  }

  // Assign 1 Trip to each verified driver
  const vehicles = await prisma.vehicle.findMany();
  const tripSources = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];
  const tripDestinations = ['Boston', 'San Diego', 'Detroit', 'Dallas', 'Denver'];

  for (let i = 0; i < drivers.length; i++) {
    const driver = drivers[i];
    const existingTrip = await prisma.trip.findFirst({ where: { driverId: driver.id } });
    if (!existingTrip && vehicles.length > 0) {
      const vehicle = vehicles[i % vehicles.length];
      await prisma.trip.create({
        data: {
          source: tripSources[i % tripSources.length],
          destination: tripDestinations[i % tripDestinations.length],
          cargoWeight: 1000 + (i * 200),
          plannedDistance: 200 + (i * 50),
          status: 'DISPATCHED',
          dispatchedAt: new Date(),
          vehicleId: vehicle.id,
          driverId: driver.id,
        },
      });
    }
  }
};

ensureDemoData().catch((e) => console.error(e));

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
