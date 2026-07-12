
const prisma = require('./src/lib/prisma');
const bcrypt = require('bcrypt');

async function seedDB() {
  console.log('Seeding database...');

  // Delete all existing data
  await prisma.tripEvent.deleteMany();
  await prisma.emergencyReport.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.fuelLog.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.driverDocument.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  console.log('Deleted old data');

  // Create demo users
  const hashedPassword = await bcrypt.hash('demo', 10);
  const demoUsers = [
    { email: 'admin@transitops.com', name: 'Admin User', role: 'Fleet Manager' },
    { email: 'dispatcher@transitops.com', name: 'Mark Reynolds', role: 'Dispatcher' },
    { email: 'field@transitops.com', name: 'Elena Rodriguez', role: 'Driver' },
    { email: 'phantomking176@gmail.com', name: 'Akash Thakur', role: 'Driver' },
    { email: 'safety@transitops.com', name: 'Sarah Chen', role: 'Safety Officer' },
    { email: 'finance@transitops.com', name: 'James Wright', role: 'Financial Analyst' },
  ];

  const users = [];
  for (const userData of demoUsers) {
    const user = await prisma.user.create({
      data: { ...userData, password: hashedPassword },
    });
    users.push(user);
    console.log('Created user:', user.email);
  }

  // Create drivers for the driver users
  const drivers = [];
  const now = new Date();
  const expiry = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  for (const user of users) {
    if (user.role === 'Driver') {
      const driver = await prisma.driver.create({
        data: {
          name: user.name,
          licenseNumber: `DEMO-LIC-${user.id}`,
          licenseCategory: 'Class B',
          licenseExpiry: expiry,
          status: 'AVAILABLE',
          safetyScore: 100,
          userId: user.id,
        },
      });
      drivers.push(driver);
      console.log('Created driver:', driver.name);
    }
  }

  // Add additional drivers to make 5 total
  const additionalDrivers = [
    { name: 'Michael Scott', licenseNumber: 'MIC-1234', licenseCategory: 'Class A', contact: '555-0101' },
    { name: 'Dwight Schrute', licenseNumber: 'DWI-5678', licenseCategory: 'Class B', contact: '555-0102' },
    { name: 'Jim Halpert', licenseNumber: 'JIM-9012', licenseCategory: 'Class C', contact: '555-0103' },
  ];
  for (const d of additionalDrivers) {
    const driver = await prisma.driver.create({
      data: { ...d, licenseExpiry: expiry, status: 'AVAILABLE', safetyScore: 100 },
    });
    drivers.push(driver);
    console.log('Created additional driver:', driver.name);
  }

  // Create 5 vehicles
  const vehiclesData = [
    { regNumber: 'VAN-001', name: 'Delivery Van Alpha', type: 'Van', maxLoad: 2000, odometer: 12000, acquisitionCost: 35000, region: 'North', status: 'AVAILABLE' },
    { regNumber: 'TRK-002', name: 'Cargo Truck Bravo', type: 'Truck', maxLoad: 5000, odometer: 35000, acquisitionCost: 85000, region: 'South', status: 'AVAILABLE' },
    { regNumber: 'VAN-003', name: 'City Van Charlie', type: 'Van', maxLoad: 1800, odometer: 8500, acquisitionCost: 32000, region: 'East', status: 'AVAILABLE' },
    { regNumber: 'TRK-004', name: 'Heavy Truck Delta', type: 'Truck', maxLoad: 7500, odometer: 52000, acquisitionCost: 120000, region: 'West', status: 'AVAILABLE' },
    { regNumber: 'VAN-005', name: 'Utility Van Echo', type: 'Van', maxLoad: 2200, odometer: 4500, acquisitionCost: 38000, region: 'Central', status: 'AVAILABLE' },
  ];
  const vehicles = [];
  for (const v of vehiclesData) {
    const vehicle = await prisma.vehicle.create({ data: v });
    vehicles.push(vehicle);
    console.log('Created vehicle:', vehicle.name);
  }

  // Get admin user for document verification
  const adminUser = users.find(u => u.role === 'Fleet Manager');

  // Create driver documents (verified) for each driver
  for (const driver of drivers) {
    await prisma.driverDocument.createMany({
      data: [
        { driverId: driver.id, type: 'LICENSE', fileUrl: '/uploads/demo-license.pdf', status: 'VERIFIED', expiresAt: expiry, verifiedAt: now, verifiedByUserId: adminUser?.id },
        { driverId: driver.id, type: 'INSURANCE', fileUrl: '/uploads/demo-insurance.pdf', status: 'VERIFIED', expiresAt: expiry, verifiedAt: now, verifiedByUserId: adminUser?.id },
      ],
    });
    console.log('Created documents for driver:', driver.name);
  }

  // Create 5 maintenance logs
  const maintenanceData = [
    { type: 'Oil Change', description: 'Regular oil and filter change', cost: 120.50, status: 'CLOSED', vehicleId: vehicles[0]?.id },
    { type: 'Tire Replacement', description: 'Replaced all 4 tires', cost: 450.00, status: 'CLOSED', vehicleId: vehicles[1]?.id },
    { type: 'Brake Inspection', description: 'Full brake system check', cost: 85.00, status: 'ACTIVE', vehicleId: vehicles[2]?.id },
    { type: 'Engine Tune-up', description: 'Spark plugs and filters', cost: 320.75, status: 'CLOSED', vehicleId: vehicles[3]?.id },
    { type: 'Alignment', description: 'Wheel alignment', cost: 150.00, status: 'ACTIVE', vehicleId: vehicles[4]?.id },
  ];
  for (const m of maintenanceData) {
    if (m.vehicleId) {
      await prisma.maintenanceLog.create({ data: m });
      console.log('Created maintenance log for vehicle:', m.vehicleId);
    }
  }

  // Create 5 fuel logs
  const fuelData = [
    { liters: 50.5, cost: 3.85 * 50.5, vehicleId: vehicles[0]?.id },
    { liters: 120.0, cost: 3.75 * 120, vehicleId: vehicles[1]?.id },
    { liters: 45.0, cost: 3.90 * 45, vehicleId: vehicles[2]?.id },
    { liters: 150.5, cost: 3.65 * 150.5, vehicleId: vehicles[3]?.id },
    { liters: 55.0, cost: 3.80 * 55, vehicleId: vehicles[4]?.id },
  ];
  for (const f of fuelData) {
    if (f.vehicleId) {
      await prisma.fuelLog.create({ data: f });
      console.log('Created fuel log for vehicle:', f.vehicleId);
    }
  }

  // Create 5 expenses
  const expenseData = [
    { type: 'Tolls', amount: 45.00, description: 'Highway tolls', vehicleId: vehicles[0]?.id },
    { type: 'Parking', amount: 25.50, description: 'City parking fees', vehicleId: vehicles[1]?.id },
    { type: 'Washing', amount: 30.00, description: 'Vehicle wash and detail', vehicleId: vehicles[2]?.id },
    { type: 'Repairs', amount: 280.00, description: 'Minor repair', vehicleId: vehicles[3]?.id },
    { type: 'Insurance', amount: 500.00, description: 'Monthly insurance premium', vehicleId: vehicles[4]?.id },
  ];
  for (const e of expenseData) {
    if (e.vehicleId) {
      await prisma.expense.create({ data: e });
      console.log('Created expense for vehicle:', e.vehicleId);
    }
  }

  // Create a trip for each driver (but keep vehicles/drivers AVAILABLE, don't mark as ON_TRIP yet)
  const tripSources = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];
  const tripDestinations = ['Boston', 'San Diego', 'Detroit', 'Dallas', 'Denver'];
  for (let i = 0; i < drivers.length; i++) {
    const driver = drivers[i];
    const vehicle = vehicles[i % vehicles.length];
    await prisma.trip.create({
      data: {
        source: tripSources[i % tripSources.length],
        destination: tripDestinations[i % tripDestinations.length],
        cargoWeight: 1000 + (i * 200),
        plannedDistance: 200 + (i * 50),
        status: 'DRAFT', // Keep as draft so vehicles/drivers stay available
        vehicleId: vehicle.id,
        driverId: driver.id,
      },
    });
    console.log('Created draft trip for driver:', driver.name);
  }

  console.log('Database seeded successfully!');
}

seedDB()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
