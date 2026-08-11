const express = require('express');
const router = express.Router();
const { readData, writeData } = require('../db');

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

    if (/สมัครงาน|สวัสดี|สนใจ/.test(text)) {
      const baseUrl = process.env.APP_BASE_URL || `${req.protocol}://${req.get('host')}`;
      const formUrl = `${baseUrl}/apply?lineUserId=${encodeURIComponent(userId)}`;
      data.lineMessages.push({
        id: `msg-bot-${Date.now()}`,
        lineUserId: userId,
        sender: 'system',
        text: `ยินดีต้อนรับสู่ระบบรับสมัครงาน กรุณากรอกใบสมัคร: ${formUrl}`,
        timestamp: new Date().toISOString(),
        actionLink: formUrl
      });
    }
    await writeData(data);
    res.json({ message: 'ส่งข้อความสำเร็จ', data: data.lineMessages.filter((m) => m.lineUserId === userId) });
  } catch (error) { next(error); }
});

module.exports = router;
