const { readData, writeData } = require('./db');

async function logAudit({ user, userName, action, details, req }) {
  const data = await readData();
  const newLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    user: user || 'system',
    userName: userName || user || 'ผู้ใช้งานระบบ',
    action: action || 'UNKNOWN_ACTION',
    details: details || '',
    ip: req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1') : '127.0.0.1',
    userAgent: req ? (req.headers['user-agent'] || 'Browser') : 'System'
  };

  data.auditLogs.unshift(newLog);
  // Keep max 500 audit logs to prevent file bloating
  if (data.auditLogs.length > 500) {
    data.auditLogs = data.auditLogs.slice(0, 500);
  }
  await writeData(data);
  return newLog;
}

module.exports = {
  logAudit
};
