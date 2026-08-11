/**
 * LINE Messaging API Service
 * Handles pushing real notifications with interactive Quick Reply buttons directly into candidates' LINE apps
 */

async function sendLinePushMessage(toLineUserId, text, options = {}) {
  const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

  if (!accessToken) {
    console.log(`[LINE Push Skipped] LINE_CHANNEL_ACCESS_TOKEN is not set.`);
    return { ok: false, error: 'LINE_CHANNEL_ACCESS_TOKEN is not configured' };
  }

  // Real LINE User IDs start with 'U' and are usually 33 characters long.
  // Skip non-real/simulated test IDs (e.g., 'LINE-123456')
  if (!toLineUserId || !toLineUserId.startsWith('U')) {
    console.log(`[LINE Push Skipped] lineUserId "${toLineUserId}" is not a real LINE User ID.`);
    return { ok: false, error: 'Invalid LINE User ID' };
  }

  const messageObj = options.flexMessage || {
    type: 'text',
    text
  };

  // Add interactive Quick Reply buttons if confirmation is requested
  if (!options.flexMessage && options.requiresConfirmation) {
    messageObj.quickReply = {
      items: [
        {
          type: 'action',
          action: {
            type: 'message',
            label: '✅ ยืนยันเข้าร่วม',
            text: 'ยืนยัน'
          }
        },
        {
          type: 'action',
          action: {
            type: 'message',
            label: '🗓️ ขอเลื่อนนัดหมาย',
            text: 'ขอเลื่อน'
          }
        },
        {
          type: 'action',
          action: {
            type: 'message',
            label: '❌ ขอยกเลิกนัดหมาย',
            text: 'ยกเลิก'
          }
        }
      ]
    };
  } else if (options.quickReplies) {
    messageObj.quickReply = {
      items: options.quickReplies
    };
  }

  try {
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: toLineUserId,
        messages: [messageObj]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[LINE Push Error] Status ${response.status}: ${errText}`);
      return { ok: false, status: response.status, error: errText || `LINE API returned ${response.status}` };
    }

    console.log(`[LINE Push Success] Message pushed successfully to ${toLineUserId}`);
    return { ok: true, status: response.status };
  } catch (error) {
    console.error(`[LINE Push Exception]`, error);
    return { ok: false, error: error.message || 'Unable to reach LINE Messaging API' };
  }
}

module.exports = {
  sendLinePushMessage
};
