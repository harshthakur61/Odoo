
const prisma = require('./src/lib/prisma');

async function checkDB() {
  console.log('Checking database...');
  const vehicles = await prisma.vehicle.findMany();
  const drivers = await prisma.driver.findMany();
  const trips = await prisma.trip.findMany({ include: { vehicle: true, driver: true } });
  const users = await prisma.user.findMany();

  console.log('Vehicles:', vehicles);
  console.log('Drivers:', drivers);
  console.log('Trips:', trips);
  console.log('Users:', users.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role })));
}

checkDB().finally(() => prisma.$disconnect());
