
const WebSocket = require('ws');
require("dotenv").config();
const jwt = require('jsonwebtoken');

const clients = new Map();
let wss;

const initializeWebSocket = (server) => {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws, req) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      ws.close(1008, 'Token is missing');
      return;
    }
    const token = authHeader && authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token,process.env.JWT_SECRET);
      
      const userId=decoded.userId;
      clients.set(userId, ws);
      console.log('Client connected with userId:', userId);
      
      ws.on('close', () => {
        clients.delete(userId);
        console.log('Client disconnected');
      });
    } catch (error) {
      ws.close(1008, 'Invalid or expired token');
    }
  });
};

const getWebSocketServer = () => {
  return wss;
};

const getClientByUserId = (userId) => {
  return clients.get(userId);
};

module.exports = { initializeWebSocket, getWebSocketServer ,getClientByUserId};

