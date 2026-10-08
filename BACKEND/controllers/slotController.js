import Slot from '../models/Slot.js';
import SensorLog from '../models/SensorLog.js';
import { getIO } from '../config/socket.js';

export const getSlotsByLot = async (req, res, next) => {
  try {
    const slots = await Slot.find({ lotId: req.params.id }).sort('slotNumber');
    res.json(slots);
  } catch (error) {
    next(error);
  }
};

export const updateSlot = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    const now = new Date();

    if (updates.status === 'occupied') {
      if (!updates.parkedAt) updates.parkedAt = now;
      if (!updates.expectedEndTime) {
        const durationMin = updates.durationMinutes || (updates.durationHours ? updates.durationHours * 60 : 120);
        updates.expectedEndTime = new Date(now.getTime() + durationMin * 60 * 1000);
      }
      updates.availableSince = null;
    } else if (updates.status === 'available') {
      updates.availableSince = now;
      updates.parkedAt = null;
      updates.expectedEndTime = null;
      updates.occupiedBy = null;
    }

    const slot = await Slot.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

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
      timestamp: now.toISOString()
    });

    res.json({ message: 'Slot updated', slot });
  } catch (error) {
    next(error);
  }
};

export const startParking = async (req, res, next) => {
  try {
    const { durationMinutes, durationHours, occupiedBy, vehiclePlate } = req.body;
    const duration = durationHours ? (durationHours * 60) : (durationMinutes ? parseInt(durationMinutes, 10) : 120);

    const slot = await Slot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    const now = new Date();
    const endTime = new Date(now.getTime() + duration * 60 * 1000);

    slot.status = 'occupied';
    slot.parkedAt = now;
    slot.expectedEndTime = endTime;
    slot.availableSince = null;
    slot.occupiedBy = occupiedBy || vehiclePlate || 'Active Driver';

    await slot.save();

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
      timestamp: now.toISOString()
    });

    res.json({ message: 'Parking session started', slot });
  } catch (error) {
    next(error);
  }
};

export const endParking = async (req, res, next) => {
  try {
    const slot = await Slot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    const now = new Date();
    slot.status = 'available';
    slot.availableSince = now;
    slot.parkedAt = null;
    slot.expectedEndTime = null;
    slot.occupiedBy = null;

    await slot.save();

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
      timestamp: now.toISOString()
    });

    res.json({ message: 'Parking session ended, slot is now available', slot });
  } catch (error) {
    next(error);
  }
};

export const sensorUpdate = async (req, res, next) => {
  try {
    const { sensorId, slotId, lotId, status, distance_cm, timestamp } = req.body;

    if (!sensorId || !slotId || !lotId || !status) {
      return res.status(400).json({ message: 'Missing required sensor fields' });
    }

    const existingSlot = await Slot.findOne({ _id: slotId, lotId });
    if (!existingSlot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    const targetStatus = status === 'occupied' ? 'occupied' : 'available';
    const now = new Date(timestamp || Date.now());

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

    const isAnomaly = distance_cm < 0 || distance_cm > 400;

    await SensorLog.create({
      sensorId,
      slotId,
      lotId,
      status,
      distanceCm: distance_cm,
      timestamp: now,
      isAnomaly
    });

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
      timestamp: now.toISOString()
    });

    res.json({ message: 'Sensor update received', slot });
  } catch (error) {
    next(error);
  }
};
