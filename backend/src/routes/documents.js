const express = require('express');
const path = require('path');
const multer = require('multer');
const prisma = require('../lib/prisma');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'public', 'uploads'));
  },
  filename: (req, file, cb) => {
    const safeOriginal = (file.originalname || 'file').replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}_${Math.random().toString(16).slice(2)}_${safeOriginal}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const normalizeDocumentType = (value) => {
  if (!value) return null;
  const upper = String(value).toUpperCase();
  if (upper === 'LICENSE' || upper === 'LICENCE') return 'LICENSE';
  if (upper === 'INSURANCE') return 'INSURANCE';
  if (upper === 'OTHER') return 'OTHER';
  return null;
};

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

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (req.user.role !== 'Driver') {
      return res.status(403).json({ error: 'Access denied: insufficient permissions' });
    }

    const type = normalizeDocumentType(req.body.type);
    if (!type) {
      return res.status(400).json({ error: 'Invalid document type' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'File is required' });
    }

    const driver = await ensureDriverForUser(req.user);
    const fileUrl = `/uploads/${req.file.filename}`;

    const created = await prisma.driverDocument.create({
      data: {
        driverId: driver.id,
        type,
        fileUrl,
        status: 'PENDING',
      },
    });

    res.status(201).json(created);
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/me', async (req, res) => {
  try {
    if (req.user.role !== 'Driver') {
      return res.status(403).json({ error: 'Access denied: insufficient permissions' });
    }

    const driver = await ensureDriverForUser(req.user);

    const docs = await prisma.driverDocument.findMany({
      where: { driverId: driver.id },
      orderBy: { uploadedAt: 'desc' },
    });

    res.json(docs);
  } catch (error) {
    console.error('My documents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/driver/:id', requireRole(['Fleet Manager']), async (req, res) => {
  try {
    const driverId = Number(req.params.id);
    if (!driverId) {
      return res.status(400).json({ error: 'Invalid driver id' });
    }

    const docs = await prisma.driverDocument.findMany({
      where: { driverId },
      orderBy: { uploadedAt: 'desc' },
    });

    res.json(docs);
  } catch (error) {
    console.error('Driver documents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/verify', requireRole(['Fleet Manager']), async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'Invalid document id' });
    }

    const updated = await prisma.driverDocument.update({
      where: { id },
      data: {
        status: 'VERIFIED',
        rejectionReason: null,
        verifiedAt: new Date(),
        verifiedByUserId: req.user.id,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Verify document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/reject', requireRole(['Fleet Manager']), async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'Invalid document id' });
    }

    const reason = String(req.body.rejectionReason || '').trim();
    if (!reason) {
      return res.status(400).json({ error: 'rejectionReason is required' });
    }

    const updated = await prisma.driverDocument.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        verifiedAt: new Date(),
        verifiedByUserId: req.user.id,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Reject document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

