import 'dotenv/config';
import http from 'http';
import app from './app.js';
import { initializeSocket } from './config/socket.js';
import { validateEnv } from './config/env.js';
import connectDB from './config/db.js';
import { registerSocketEvents } from './sockets/index.js';

// BEFORE (CommonJS)
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');

// AFTER (ES Module)
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';

validateEnv();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

initializeSocket(server);
registerSocketEvents();

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Socket.IO ready`);
  });
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

const cors = require('cors');
app.use(cors({
  origin: 'https://park-smart-web-app-7rx8.vercel.app'
}));
