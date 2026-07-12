const prisma = require('./prisma');

const logEvent = async ({ tripId, type, message, createdByUserId }) => {
  return prisma.tripEvent.create({
    data: {
      tripId,
      type,
      message,
      createdByUserId: createdByUserId ?? null,
    },
  });
};

module.exports = {
  logEvent,
};

