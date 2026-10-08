import axios from 'axios';
import Slot from '../models/Slot.js';
import SensorLog from '../models/SensorLog.js';
import { getIO } from '../config/socket.js';

const ESP32_URL = process.env.ESP32_URL || 'http://192.168.1.100/status';

/**
 * GET /api/esp32/fetch
 * Poll the ESP32 sensor, save reading, and update the linked slot.
 * Query params: ?slotId=xxx&lotId=xxx&sensorId=xxx
 */
export const fetchFromESP32 = async (req, res, next) => {
  try {
    const { slotId, lotId, sensorId } = req.query;

    if (!slotId || !lotId || !sensorId) {
      return res.status(400).json({
        message: 'Missing required query params: slotId, lotId, sensorId'
      });
    }

    // Fetch live data from ESP32
    const response = await axios.get(ESP32_URL, { timeout: 5000 });
    const { distance, status, led } = response.data;

    // Find slot to detect status transition
    const existingSlot = await Slot.findOne({ _id: slotId, lotId });
    if (!existingSlot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    const now = new Date();
    const targetStatus = status === 'occupied' ? 'occupied' : 'available';

    existingSlot.sensorId = sensorId;
    existingSlot.lastPingAt = now;

    if (targetStatus === 'occupied') {
      if (existingSlot.status !== 'occupied') {
        existingSlot.status = 'occupied';
        existingSlot.parkedAt = now;
        existingSlot.expectedEndTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        existingSlot.availableSince = null;
      }
    } else {
      if (existingSlot.status !== 'available') {
        existingSlot.status = 'available';
        existingSlot.availableSince = now;
        existingSlot.parkedAt = null;
        existingSlot.expectedEndTime = null;
        existingSlot.occupiedBy = null;
      }
    }

    const slot = await existingSlot.save();

    // Log the sensor reading
    const isAnomaly = distance < 0 || distance > 400;
    await SensorLog.create({
      sensorId,
      slotId,
      lotId,
      status,
      distanceCm: distance,
      timestamp: now,
      isAnomaly
    });

    // Emit real-time update via Socket.IO
    const io = getIO();
    io.emit('slot:update', {
      slotId: slot._id,
      status: slot.status,
      lotId: slot.lotId,
      slotNumber: slot.slotNumber,
      type: slot.type,
      sensorId: slot.sensorId,
      parkedAt: slot.parkedAt,
      expectedEndTime: slot.expectedEndTime,
      availableSince: slot.availableSince,
      occupiedBy: slot.occupiedBy,
      lastPingAt: slot.lastPingAt,
      distance,
      led,
      timestamp: now.toISOString()
    });

    res.json({
      message: 'ESP32 data fetched and saved',
      data: { distance, status, led },
      slot
    });
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({
        message: 'Cannot reach ESP32 sensor',
        esp32Url: ESP32_URL
      });
    }
    next(error);
  }
};

/**
 * GET /api/esp32/status
 * Check if the ESP32 is reachable and return its current reading.
 */
export const getESP32Status = async (req, res) => {
  try {
    const response = await axios.get(ESP32_URL, { timeout: 5000 });
    res.json({
      online: true,
      esp32Url: ESP32_URL,
      data: response.data
    });
  } catch (error) {
    res.json({
      online: false,
      esp32Url: ESP32_URL,
      error: error.message
    });
  }
};

/**
 * GET /api/esp32/history
 * Get recent sensor readings.
 * Query params: ?sensorId=xxx&limit=10
 */
export const getSensorHistory = async (req, res, next) => {
  try {
    const { sensorId, limit = 10 } = req.query;

    const query = sensorId ? { sensorId } : {};
    const data = await SensorLog.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json(data);
  } catch (error) {
    next(error);
  }
};
