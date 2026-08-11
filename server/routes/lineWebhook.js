const crypto = require('crypto');
const express = require('express');
const { readData, writeData } = require('../db');

const router = express.Router();

function isValidSignature(rawBody, signature) {
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (!secret || !signature) return false;

  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('base64');
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  return expectedBuffer.length === signatureBuffer.length
    && crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}

async function reply(replyToken, text) {
  const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!accessToken || !replyToken) return;

  const response = await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ replyToken, messages: [{ type: 'text', text }] })
  });

  if (!response.ok) throw new Error(`LINE reply failed: ${response.status}`);
}

router.get('/webhook', (req, res) => {
  res.status(200).json({ ok: true, message: 'LINE webhook endpoint is ready. LINE sends webhook events with POST.' });
});

// This route must be mounted before express.json() so the HMAC uses LINE's unmodified body.
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res, next) => {
  try {
    const rawBody = req.body;
    if (!Buffer.isBuffer(rawBody) || !isValidSignature(rawBody, req.get('x-line-signature'))) {
      return res.status(401).json({ error: 'Invalid LINE webhook signature' });
    }

    const payload = JSON.parse(rawBody.toString('utf8'));
    const events = Array.isArray(payload.events) ? payload.events : [];

    for (const event of events) {
      if (event.type !== 'message' || event.message?.type !== 'text') continue;

      const lineUserId = event.source?.userId;
      const text = event.message.text || '';
      if (!lineUserId) continue;

      const data = await readData();
      data.lineMessages.push({
        id: `line-in-${event.webhookEventId || Date.now()}`,
        lineUserId,
        sender: 'user',
        text,
        timestamp: new Date(event.timestamp || Date.now()).toISOString()
      });
      await writeData(data);

      const baseUrl = process.env.APP_BASE_URL || `${req.protocol}://${req.get('host')}`;
      const applicationUrl = `${baseUrl}/#apply?lineUserId=${encodeURIComponent(lineUserId)}`;
      const isApplicationRequest = /สมัครงาน|สวัสดี|สนใจ/i.test(text);
      const responseText = isApplicationRequest
        ? `ยินดีต้อนรับสู่ระบบรับสมัครงาน กรุณากรอกใบสมัครที่ ${applicationUrl}`
        : 'ได้รับข้อความแล้ว เจ้าหน้าที่จะติดต่อกลับโดยเร็วที่สุด';

      await reply(event.replyToken, responseText);
    }

    // LINE expects a 2xx response, including for its Verify request with events: [].
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
