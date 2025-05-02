import { Server } from "socket.io";
import http from "http";
import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const server = http.createServer(app);

const allowedOrigin = process.env.ORIGIN;

const io = new Server(server, {
  cors: {
    origin: [allowedOrigin],  // This should match your domain
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket'],  // Enforce WebSocket transport (No polling fallback)
  secure: true, // Ensure the WebSocket uses secure connection (wss://)
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

const userSocketMap = {}; // Used to store online users

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.auth.userId;
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

io.on("botTyping", (data) => {
  console.log("🔴 botTyping event received:", data); // Debugging log

  if (data.senderId === process.env.BOT_USER_ID) {
    io.emit("botTyping", data);
  }
});

export { io, app, server };
