const express = require('express');
const prisma = require('../lib/prisma');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken);

router.get('/', async (req, res) => {
  try {
    const where = {};
    if (req.query.status) where.status = String(req.query.status);
    if (req.query.type) where.type = String(req.query.type);
    if (req.query.region) where.region = String(req.query.region);

    const vehicles = await prisma.vehicle.findMany({
      where,
      orderBy: { id: 'asc' },
    });

    res.json(vehicles);
  } catch (error) {
    console.error('Vehicles list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', requireRole(['Fleet Manager']), async (req, res) => {
  try {
    const { regNumber, name, type, maxLoad, odometer, acquisitionCost, status, region } = req.body;
    if (!regNumber || !name || !type || maxLoad == null) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const created = await prisma.vehicle.create({
      data: {
        regNumber,
        name,
        type,
        maxLoad: Number(maxLoad),
        odometer: odometer != null ? Number(odometer) : 0,
        acquisitionCost: acquisitionCost != null ? Number(acquisitionCost) : 0,
        status: status ?? 'AVAILABLE',
        region: region ?? null,
      },
    });

    res.status(201).json(created);
  } catch (error) {
    console.error('Vehicle create error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

