/**
 * LINE Messaging API Service
 * Handles pushing real notifications directly into candidates' LINE apps
 */

async function sendLinePushMessage(toLineUserId, text) {
  const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

  if (!accessToken) {
    console.log(`[LINE Push Skipped] LINE_CHANNEL_ACCESS_TOKEN is not set.`);
    return false;
  }

  // Real LINE User IDs start with 'U' and are usually 33 characters long.
  // Skip non-real/simulated test IDs (e.g., 'LINE-123456')
  if (!toLineUserId || !toLineUserId.startsWith('U')) {
    console.log(`[LINE Push Skipped] lineUserId "${toLineUserId}" is not a real LINE User ID.`);
    return false;
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
        messages: [{ type: 'text', text }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[LINE Push Error] Status ${response.status}: ${errText}`);
      return false;
    }

    console.log(`[LINE Push Success] Message pushed successfully to ${toLineUserId}`);
    return true;
  } catch (error) {
    console.error(`[LINE Push Exception]`, error);
    return false;
  }
}

module.exports = {
  sendLinePushMessage
};
