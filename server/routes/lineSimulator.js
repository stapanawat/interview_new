const express = require('express');
const router = express.Router();
const { readData, writeData } = require('../db');
const { handleLineCommand } = require('./lineHelper');

function getKnownLineUsers(data) {
  const users = new Map();
  (data.lineMessages || []).forEach((message) => {
    if (message.lineUserId && message.lineUserId.startsWith('U')) users.set(message.lineUserId, { id: message.lineUserId, name: null, applicationOpen: data.lineApplicationAccess?.[message.lineUserId] !== false });
  });
  (data.applicants || []).forEach((applicant) => {
    if (applicant.lineUserId && applicant.lineUserId.startsWith('U')) users.set(applicant.lineUserId, { id: applicant.lineUserId, name: applicant.lineDisplayName || applicant.name || null, applicationOpen: data.lineApplicationAccess?.[applicant.lineUserId] !== false });
  });
  return [...users.values()].sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id));
}

router.get('/users', async (req, res, next) => {
  try { res.json(getKnownLineUsers(await readData())); } catch (error) { next(error); }
});

router.put('/users/:lineUserId/application-access', async (req, res, next) => {
  try {
    const lineUserId = req.params.lineUserId;
    if (!lineUserId.startsWith('U')) return res.status(400).json({ error: 'LINE User ID must be a real LINE ID' });
    const data = await readData();
    data.lineApplicationAccess = data.lineApplicationAccess || {};
    data.lineApplicationAccess[lineUserId] = Boolean(req.body.open);
    await writeData(data);
    res.json({ lineUserId, applicationOpen: data.lineApplicationAccess[lineUserId] });
  } catch (error) { next(error); }
});

router.get('/messages', async (req, res, next) => {
  try {
    const data = await readData();
    const { lineUserId } = req.query;
    res.json(lineUserId ? data.lineMessages.filter((m) => m.lineUserId === lineUserId) : data.lineMessages);
  } catch (error) { next(error); }
});

router.post('/send-message', async (req, res, next) => {
  try {
    const { lineUserId, text = '' } = req.body;
    const data = await readData();
    const now = new Date().toISOString();
    const userId = lineUserId || 'U1002948182';
    data.lineMessages.push({ id: `msg-${Date.now()}`, lineUserId: userId, sender: 'user', text, timestamp: now });

    const baseUrl = process.env.APP_BASE_URL || `${req.protocol}://${req.get('host')}`;
    const { text: botResponseText, actionLink } = handleLineCommand(text, userId, baseUrl, data);

    data.lineMessages.push({
      id: `msg-bot-${Date.now()}`,
      lineUserId: userId,
      sender: 'system',
      text: botResponseText,
      timestamp: new Date().toISOString(),
      actionLink: actionLink || null
    });

    await writeData(data);
    res.json({ message: 'ส่งข้อความสำเร็จ', data: data.lineMessages.filter((m) => m.lineUserId === userId) });
  } catch (error) { next(error); }
});

module.exports = router;
