const { WebSocketServer } = require('ws');

let wss = null;

/**
 * Initialize WebSocket server on the same HTTP server
 * @param {http.Server} server - The HTTP server instance
 */
function initWebSocket(server) {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log(`[WS] Client connected. Total clients: ${wss.clients.size}`);

    // Send current rate immediately on connect
    const Settings = require('./models/Settings');
    Settings.findOne({ key: 'usdt_rate' }).then(setting => {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({
          type: 'RATE_UPDATE',
          data: { rate: setting ? setting.value : 85 }
        }));
      }
    }).catch(() => {});

    Settings.findOne({ key: 'exchange_rates' }).then(setting => {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({
          type: 'RATES_UPDATE',
          data: { rates: setting ? setting.value : { USDT: 85, BTC: 8540000, ETH: 210000, USDC: 88, TRX: 10 } }
        }));
      }
    }).catch(() => {});

    ws.on('message', (message) => {
      try {
        const parsed = JSON.parse(message);
        if (parsed.type === 'SUBSCRIBE_USER' && parsed.userId) {
          ws.userId = String(parsed.userId);
          console.log(`[WS] Client subscribed to updates for user ID: ${ws.userId}`);
        } else if (parsed.type === 'SUBSCRIBE_TICKET' && parsed.ticketId) {
          ws.ticketId = String(parsed.ticketId);
          console.log(`[WS] Client subscribed to ticket: ${ws.ticketId}`);
        } else if (parsed.type === 'SUBSCRIBE_ADMIN_TICKETS') {
          ws.isAdminTicketsSubscribed = true;
          console.log('[WS] Client subscribed to admin ticket list updates');
        } else if (parsed.type === 'UNSUBSCRIBE_TICKET') {
          delete ws.ticketId;
          console.log('[WS] Client unsubscribed from ticket');
        }
      } catch (err) {
        console.error('[WS] Error parsing incoming client message:', err.message);
      }
    });

    ws.on('close', () => {
      console.log(`[WS] Client disconnected. Total clients: ${wss.clients.size}`);
    });

    ws.on('error', (err) => {
      console.error('[WS] Client error:', err.message);
    });
  });

  console.log('[WS] WebSocket server initialized on /ws');
}

/**
 * Send a direct update message to a specific user ID
 * @param {string} userId - The target user ID
 * @param {string} type - Message notification identifier
 * @param {Object} data - Payload content
 */
function sendToUser(userId, type, data) {
  if (!wss) return;

  const message = JSON.stringify({ type, data });
  let count = 0;

  wss.clients.forEach(client => {
    if (client.userId === String(userId) && client.readyState === client.OPEN) {
      client.send(message);
      count++;
    }
  });

  console.log(`[WS] Dispatched direct update type ${type} to user ID ${userId} across ${count} connections`);
}

/**
 * Send a ticket message update to all clients subscribed to a specific ticket
 * @param {string} ticketId - The target ticket ID
 * @param {Object} messageData - The message payload
 */
function sendTicketMessage(ticketId, messageData, status) {
  if (!wss) return;

  const message = JSON.stringify({
    type: 'TICKET_MESSAGE',
    data: { ticketId, message: messageData, status }
  });

  let count = 0;
  wss.clients.forEach(client => {
    if (client.ticketId === String(ticketId) && client.readyState === client.OPEN) {
      client.send(message);
      count++;
    }
  });

  console.log(`[WS] Dispatched ticket message to room ${ticketId} across ${count} connections`);
}

/**
 * Broadcast ticket list updates to all subscribed admins
 * @param {Object} ticketData - The ticket payload
 */
function broadcastAdminTicketUpdate(ticketData) {
  if (!wss) return;

  const message = JSON.stringify({
    type: 'ADMIN_TICKET_UPDATE',
    data: ticketData
  });

  let count = 0;
  wss.clients.forEach(client => {
    if (client.isAdminTicketsSubscribed && client.readyState === client.OPEN) {
      client.send(message);
      count++;
    }
  });

  console.log(`[WS] Broadcasted ticket update to ${count} admin connections`);
}

/**
 * Broadcast USDT rate update to all connected clients
 * @param {number} rate - The new USDT rate
 */
function broadcastRateUpdate(rate) {
  if (!wss) return;

  const message = JSON.stringify({
    type: 'RATE_UPDATE',
    data: { rate }
  });

  let count = 0;
  wss.clients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(message);
      count++;
    }
  });

  console.log(`[WS] Broadcasted rate ₹${rate} to ${count} clients`);
}

/**
 * Broadcast all exchange rates to all connected clients
 * @param {Object} rates - The new rates object
 */
function broadcastAllRatesUpdate(rates) {
  if (!wss) return;

  const message = JSON.stringify({
    type: 'RATES_UPDATE',
    data: { rates }
  });

  let count = 0;
  wss.clients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(message);
      count++;
    }
  });

  console.log(`[WS] Broadcasted all rates updates to ${count} clients`);
}

module.exports = { 
  initWebSocket, 
  broadcastRateUpdate, 
  broadcastAllRatesUpdate, 
  sendToUser,
  sendTicketMessage,
  broadcastAdminTicketUpdate
};
