const https = require('https');
const Settings = require('../models/Settings');

/**
 * Sends a telegram message to all configured chat IDs.
 * @param {string} text - Message content
 */
const sendTelegramNotification = async (text) => {
  try {
    const configSetting = await Settings.findOne({ key: 'telegram_config' });
    if (!configSetting || !configSetting.value) return;

    const { botToken, chatIds, enabled } = configSetting.value;
    if (!enabled || !botToken || !chatIds || !chatIds.length) return;

    for (const chatId of chatIds) {
      if (!chatId) continue;
      const data = JSON.stringify({
        chat_id: chatId.trim(),
        text: text,
        parse_mode: 'HTML'
      });

      const options = {
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${botToken.trim()}/sendMessage`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      };

      const req = https.request(options, (res) => {
        res.on('data', () => {});
      });

      req.on('error', (e) => {
        console.error('Telegram notification error:', e);
      });

      req.write(data);
      req.end();
    }
  } catch (err) {
    console.error('Telegram notification error:', err);
  }
};

module.exports = {
  sendTelegramNotification
};
