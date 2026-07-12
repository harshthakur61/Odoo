const express = require('express');
const prisma = require('../lib/prisma');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

const ensureDriverForUser = async (user) => {
  const existing = await prisma.driver.findUnique({
    where: { userId: user.id },
  });

  if (existing) return existing;

  const now = new Date();
  const expiry = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

  return prisma.driver.create({
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
};

router.use(verifyToken);

router.get('/me', async (req, res) => {
  try {
    if (req.user.role !== 'Driver') {
      return res.status(403).json({ error: 'Access denied: insufficient permissions' });
    }

    const driver = await ensureDriverForUser(req.user);
    res.json(driver);
  } catch (error) {
    console.error('Driver me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', requireRole(['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst']), async (req, res) => {
  try {
    const drivers = await prisma.driver.findMany({
      orderBy: { id: 'asc' },
      include: { documents: true },
    });
    res.json(drivers);
  } catch (error) {
    console.error('Drivers list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', requireRole(['Fleet Manager']), async (req, res) => {
  try {
    const { name, licenseNumber, licenseCategory, licenseExpiry, contact, safetyScore, status, userId } = req.body;

    if (!name || !licenseNumber || !licenseCategory || !licenseExpiry) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const created = await prisma.driver.create({
      data: {
        name,
        licenseNumber,
        licenseCategory,
        licenseExpiry: new Date(licenseExpiry),
        contact: contact ?? null,
        safetyScore: safetyScore != null ? Number(safetyScore) : 100,
        status: status ?? 'AVAILABLE',
        userId: userId != null ? Number(userId) : null,
      },
    });

    res.status(201).json(created);
  } catch (error) {
    console.error('Driver create error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

