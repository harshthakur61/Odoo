const express = require('express');
const prisma = require('../lib/prisma');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken);

// Create emergency report (Driver only)
router.post('/', requireRole(['Driver']), async (req, res) => {
  try {
    const { tripId, message } = req.body;

    if (!tripId || !message) {
      return res.status(400).json({ error: 'Trip ID and message are required' });
    }

    const driver = await prisma.driver.findUnique({ where: { userId: req.user.id } });
    if (!driver) return res.status(404).json({ error: 'Driver not found' });

    const trip = await prisma.trip.findUnique({ where: { id: Number(tripId) } });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    if (trip.driverId !== driver.id) {
      return res.status(403).json({ error: 'You can only report emergencies for your own trips' });
    }
    if (trip.status !== 'DISPATCHED') {
      return res.status(400).json({ error: 'You can only report emergencies for active trips' });
    }

    const report = await prisma.emergencyReport.create({
      data: {
        tripId: Number(tripId),
        driverId: driver.id,
        message,
        status: 'PENDING',
      },
      include: {
        trip: { include: { driver: true, vehicle: true } },
        driver: true,
      },
    });

    res.status(201).json(report);
  } catch (error) {
    console.error('Create emergency report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all emergency reports (Safety Officer only)
router.get('/', requireRole(['Safety Officer', 'Fleet Manager']), async (req, res) => {
  try {
    const reports = await prisma.emergencyReport.findMany({
      include: {
        trip: { include: { driver: true, vehicle: true } },
        driver: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reports);
  } catch (error) {
    console.error('Get emergency reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update emergency report status (Safety Officer or Fleet Manager)
router.put('/:id/status', requireRole(['Safety Officer', 'Fleet Manager']), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['PENDING', 'REVIEWED', 'RESOLVED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const report = await prisma.emergencyReport.update({
      where: { id: Number(req.params.id) },
      data: { status },
      include: {
        trip: { include: { driver: true, vehicle: true } },
        driver: true,
      },
    });

    res.json(report);
  } catch (error) {
    console.error('Update emergency report status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
