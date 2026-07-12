const nodemailer = require('nodemailer');

const getTransporter = () => {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) return null;

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
};

const sendTripAssignedEmail = async ({ to, driverName, trip }) => {
  const transporter = getTransporter();
  if (!transporter) return { skipped: true };

  const subject = `New Trip Assigned: ${trip.source} → ${trip.destination}`;
  const textLines = [
    `Hi ${driverName || 'Driver'},`,
    '',
    'A new trip has been assigned to you.',
    '',
    `Trip ID: ${trip.id}`,
    `From: ${trip.source}`,
    `To: ${trip.destination}`,
    trip.plannedDistance != null ? `Planned Distance: ${trip.plannedDistance}` : null,
    trip.dispatchedAt ? `Dispatched At: ${new Date(trip.dispatchedAt).toISOString()}` : null,
    '',
    'Please open the TransitOps app for details.',
  ].filter(Boolean);

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to,
    subject,
    text: textLines.join('\n'),
  });

  return { sent: true };
};

module.exports = {
  sendTripAssignedEmail,
};

