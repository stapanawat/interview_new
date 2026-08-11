require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { checkInterviewReminders } = require('./reminderEngine');
const authRoutes = require('./routes/auth');
const applicantsRoutes = require('./routes/applicants');
const interviewsRoutes = require('./routes/interviews');
const employeesRoutes = require('./routes/employees');
const auditLogsRoutes = require('./routes/auditLogs');
const lineSimulatorRoutes = require('./routes/lineSimulator');
const lineWebhookRoutes = require('./routes/lineWebhook');
const positionsRoutes = require('./routes/positions');

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5000')
  .split(',').map((origin) => origin.trim()).filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
// LINE signature verification requires the original request body, before JSON parsing.
app.use('/api/line', lineWebhookRoutes);
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/applicants', applicantsRoutes);
app.use('/api/interviews', interviewsRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/audit-logs', auditLogsRoutes);
app.use('/api/positions', positionsRoutes);
app.use('/api/line', lineSimulatorRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Call this from an external scheduler every 15 minutes on Vercel Hobby.
app.get('/api/internal/reminders', async (req, res, next) => {
  try {
    const suppliedSecret = req.query.secret || req.get('authorization')?.replace(/^Bearer\s+/i, '');
    if (!process.env.CRON_SECRET || suppliedSecret !== process.env.CRON_SECRET) return res.status(401).json({ error: 'Unauthorized' });
    await checkInterviewReminders();
    res.json({ ok: true, checkedAt: new Date().toISOString() });
  } catch (error) { next(error); }
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
});

module.exports = app;
