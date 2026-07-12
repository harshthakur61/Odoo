const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/dashboard/kpis
router.get('/kpis', verifyToken, async (req, res) => {
  try {
    const [
      activeVehicles,
      availableVehicles,
      inMaintenance,
      activeTrips,
      pendingTrips,
      driversOnDuty,
      totalVehicles,
      retiredVehicles
    ] = await Promise.all([
      prisma.vehicle.count({ where: { status: 'ON_TRIP' } }),
      prisma.vehicle.count({ where: { status: 'AVAILABLE' } }),
      prisma.vehicle.count({ where: { status: 'IN_SHOP' } }),
      prisma.trip.count({ where: { status: 'DISPATCHED' } }),
      prisma.trip.count({ where: { status: 'DRAFT' } }),
      prisma.driver.count({ where: { status: 'ON_TRIP' } }),
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { status: 'RETIRED' } })
    ]);

    const activeFleet = totalVehicles - retiredVehicles;
    const fleetUtilization = activeFleet > 0 ? Math.round((activeVehicles / activeFleet) * 100) : 0;

    res.json({
      activeVehicles,
      availableVehicles,
      inMaintenance,
      activeTrips,
      pendingTrips,
      driversOnDuty,
      fleetUtilization
    });
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard KPIs' });
  }
});

module.exports = router;
