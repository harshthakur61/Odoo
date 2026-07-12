const express = require('express');
const prisma = require('../lib/prisma');
const { verifyToken, requireRole } = require('../middleware/auth');
const { logEvent } = require('../lib/logEvent');
const { sendTripAssignedEmail } = require('../lib/mailer');

const router = express.Router();

router.use(verifyToken);

router.get('/', async (req, res) => {
  try {
    const where = {};

    if (req.user.role === 'Driver') {
      const driver = await prisma.driver.findUnique({ where: { userId: req.user.id } });
      if (!driver) return res.json([]);
      where.driverId = driver.id;
    }

    const trips = await prisma.trip.findMany({
      where,
      include: {
        driver: true,
        vehicle: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(trips);
  } catch (error) {
    console.error('Trips list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', requireRole(['Dispatcher', 'Fleet Manager']), async (req, res) => {
  try {
    const { source, destination, cargoWeight, plannedDistance, vehicleId, driverId } = req.body;

    if (!source || !destination || vehicleId == null || driverId == null || cargoWeight == null || plannedDistance == null) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id: Number(vehicleId) } });
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    if (vehicle.status !== 'AVAILABLE') return res.status(400).json({ error: 'Vehicle is not available' });

    const driver = await prisma.driver.findUnique({ where: { id: Number(driverId) } });
    if (!driver) return res.status(404).json({ error: 'Driver not found' });
    if (driver.status !== 'AVAILABLE') return res.status(400).json({ error: 'Driver is not available' });
    if (new Date(driver.licenseExpiry).getTime() < Date.now()) return res.status(400).json({ error: 'Driver license is expired' });

    if (Number(cargoWeight) > Number(vehicle.maxLoad)) {
      return res.status(400).json({ error: 'Cargo weight exceeds vehicle max load' });
    }

    const created = await prisma.trip.create({
      data: {
        source,
        destination,
        cargoWeight: Number(cargoWeight),
        plannedDistance: Number(plannedDistance),
        vehicleId: vehicle.id,
        driverId: driver.id,
        status: 'DRAFT',
      },
    });

    await logEvent({
      tripId: created.id,
      type: 'CREATED',
      message: `Trip created: ${source} → ${destination}`,
      createdByUserId: req.user.id,
    });

    res.status(201).json(created);
  } catch (error) {
    console.error('Trip create error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/dispatch', requireRole(['Dispatcher', 'Fleet Manager']), async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid trip id' });

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: { driver: { include: { user: true } }, vehicle: true },
    });

    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    if (trip.status !== 'DRAFT') return res.status(400).json({ error: 'Only DRAFT trips can be dispatched' });

    const dispatchedAt = new Date();

    const updated = await prisma.$transaction(async (tx) => {
      const t = await tx.trip.update({
        where: { id },
        data: {
          status: 'DISPATCHED',
          dispatchedAt,
        },
      });

      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: 'ON_TRIP' },
      });

      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: 'ON_TRIP' },
      });

      return t;
    });

    await logEvent({
      tripId: id,
      type: 'DISPATCHED',
      message: 'Trip dispatched',
      createdByUserId: req.user.id,
    });

    let email = null;
    const to = trip.driver.user?.email;
    if (to) {
      try {
        email = await sendTripAssignedEmail({
          to,
          driverName: trip.driver.name,
          trip: { ...trip, ...updated, dispatchedAt },
        });
      } catch (e) {
        email = { error: true };
      }
    } else {
      email = { skipped: true };
    }

    res.json({ trip: updated, email });
  } catch (error) {
    console.error('Trip dispatch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/complete', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid trip id' });

    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    if (trip.status !== 'DISPATCHED') return res.status(400).json({ error: 'Only DISPATCHED trips can be completed' });

    if (req.user.role === 'Driver') {
      const driver = await prisma.driver.findUnique({ where: { userId: req.user.id } });
      if (!driver || trip.driverId !== driver.id) {
        return res.status(403).json({ error: 'Access denied: insufficient permissions' });
      }
    }

    const completedAt = new Date();

    const updated = await prisma.$transaction(async (tx) => {
      const t = await tx.trip.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          completedAt,
          actualDistance: req.body.actualDistance != null ? Number(req.body.actualDistance) : null,
        },
      });

      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: 'AVAILABLE' },
      });

      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: 'AVAILABLE' },
      });

      return t;
    });

    await logEvent({
      tripId: id,
      type: 'COMPLETED',
      message: 'Trip completed',
      createdByUserId: req.user.id,
    });

    res.json(updated);
  } catch (error) {
    console.error('Trip complete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/cancel', requireRole(['Dispatcher', 'Fleet Manager']), async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid trip id' });

    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    if (!['DRAFT', 'DISPATCHED'].includes(trip.status)) {
      return res.status(400).json({ error: 'Only DRAFT or DISPATCHED trips can be cancelled' });
    }

    const cancelledAt = new Date();

    const updated = await prisma.$transaction(async (tx) => {
      const t = await tx.trip.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelledAt,
        },
      });

      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: 'AVAILABLE' },
      });

      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: 'AVAILABLE' },
      });

      return t;
    });

    await logEvent({
      tripId: id,
      type: 'CANCELLED',
      message: 'Trip cancelled',
      createdByUserId: req.user.id,
    });

    res.json(updated);
  } catch (error) {
    console.error('Trip cancel error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

