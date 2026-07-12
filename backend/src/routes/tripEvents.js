const express = require('express');
const prisma = require('../lib/prisma');
const { verifyToken } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

const normalizeEventType = (value) => {
  if (!value) return null;
  const upper = String(value).toUpperCase();
  const allowed = ['CREATED', 'DISPATCHED', 'DRIVER_UPDATE', 'COMPLETED', 'CANCELLED', 'NOTE'];
  if (allowed.includes(upper)) return upper;
  return null;
};

router.use(verifyToken);

router.get('/', async (req, res) => {
  try {
    const tripId = Number(req.params.tripId);
    if (!tripId) {
      return res.status(400).json({ error: 'Invalid trip id' });
    }

    const events = await prisma.tripEvent.findMany({
      where: { tripId },
      orderBy: { createdAt: 'asc' },
    });

    res.json(events);
  } catch (error) {
    console.error('Trip events list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const tripId = Number(req.params.tripId);
    if (!tripId) {
      return res.status(400).json({ error: 'Invalid trip id' });
    }

    const message = String(req.body.message || '').trim();
    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { driver: true },
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if (req.user.role === 'Driver') {
      const driver = await prisma.driver.findUnique({ where: { userId: req.user.id } });
      if (!driver || trip.driverId !== driver.id) {
        return res.status(403).json({ error: 'Access denied: insufficient permissions' });
      }
    }

    const requestedType = normalizeEventType(req.body.type);
    const type = req.user.role === 'Driver' ? 'DRIVER_UPDATE' : (requestedType || 'NOTE');

    const created = await prisma.tripEvent.create({
      data: {
        tripId,
        type,
        message,
        createdByUserId: req.user.id,
      },
    });

    res.status(201).json(created);
  } catch (error) {
    console.error('Trip event create error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

