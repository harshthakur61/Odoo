const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const prisma = require('../lib/prisma');

const DEMO_USERS = {
  'admin@transitops.com': { name: 'Admin User', email: 'admin@transitops.com', role: 'Fleet Manager' },
  'dispatcher@transitops.com': { name: 'Mark Reynolds', email: 'dispatcher@transitops.com', role: 'Dispatcher' },
  'field@transitops.com': { name: 'Elena Rodriguez', email: 'field@transitops.com', role: 'Driver' },
  'phantomking176@gmail.com': { name: 'Akash Thakur', email: 'phantomking176@gmail.com', role: 'Driver' },
  'safety@transitops.com': { name: 'Sarah Chen', email: 'safety@transitops.com', role: 'Safety Officer' },
  'finance@transitops.com': { name: 'James Wright', email: 'finance@transitops.com', role: 'Financial Analyst' },
};

const ensureUser = async ({ email, name, role }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;

  const hashed = await bcrypt.hash('demo', 10);
  const user = await prisma.user.create({
    data: {
      email,
      name,
      role,
      password: hashed,
    },
  });

  if (role === 'Driver') {
    const existingDriver = await prisma.driver.findUnique({ where: { userId: user.id } });
    if (!existingDriver) {
      const now = new Date();
      const expiry = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      await prisma.driver.create({
        data: {
          name,
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

  return user;
};

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied, token missing or invalid' });
  }

  const token = authHeader.split(' ')[1];

  try {
    if (token.startsWith('demo_')) {
      const email = Buffer.from(token.slice(5), 'base64').toString('utf8');
      const demo = DEMO_USERS[email];
      if (!demo) return res.status(403).json({ error: 'Invalid or expired token' });

      const user = await ensureUser(demo);
      req.user = { id: user.id, name: user.name, role: user.role, email: user.email };
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied: insufficient permissions' });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  requireRole,
};
