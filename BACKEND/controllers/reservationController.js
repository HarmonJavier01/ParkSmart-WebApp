import Reservation from '../models/Reservation.js';
import Slot from '../models/Slot.js';
import ParkingLot from '../models/ParkingLot.js';
import User from '../models/User.js';
import generateQR from '../utils/generateQR.js';
import sendEmail from '../utils/sendEmail.js';
import { getIO } from '../config/socket.js';

export const createReservation = async (req, res, next) => {
  try {
    const { slotId, lotId, userId, guestInfo, startTime, endTime, duration } = req.body;

    const slot = await Slot.findById(slotId);
    if (!slot || slot.status !== 'available') {
      return res.status(400).json({ message: 'Slot is not available' });
    }

    const lot = await ParkingLot.findById(lotId);
    if (!lot) {
      return res.status(404).json({ message: 'Parking lot not found' });
    }

    const fee = lot.ratePerHour * duration;
    const qrCode = await generateQR(`${slotId}-${Date.now()}`);

    const reservation = await Reservation.create({
      slotId,
      lotId,
      userId: userId || null,
      guestInfo: userId ? undefined : guestInfo,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      duration,
      fee,
      qrCode
    });

    await Slot.findByIdAndUpdate(slotId, { status: 'reserved' });

    const populatedReservation = await Reservation.findById(reservation._id)
      .populate('slotId', 'slotNumber')
      .populate('lotId', 'name address');

    const io = getIO();
    io.emit('reservation:new', {
      reservationId: reservation._id,
      slotId,
      lotId
    });
    io.emit('slot:update', {
      slotId,
      status: 'reserved',
      lotId,
      timestamp: new Date().toISOString()
    });

    // Send response immediately so the user isn't kept waiting
    res.status(201).json({
      message: 'Reservation created',
      reservation: populatedReservation
    });

    // Fire-and-forget: send confirmation email in background (non-blocking)
    try {
      if (userId) {
        const user = await User.findById(userId);
        if (user && user.email) {
          sendEmail({
            to: user.email,
            subject: 'ParkSmart - Reservation Confirmed',
            html: `
              <h2>Reservation Confirmed</h2>
              <p>Hello ${user.name},</p>
              <p>Your parking reservation has been confirmed.</p>
              <ul>
                <li><strong>Lot:</strong> ${lot.name}</li>
                <li><strong>Slot:</strong> ${slot.slotNumber}</li>
                <li><strong>Start:</strong> ${new Date(startTime).toLocaleString()}</li>
                <li><strong>End:</strong> ${new Date(endTime).toLocaleString()}</li>
                <li><strong>Fee:</strong> ₱${fee}</li>
              </ul>
              <p>Show your QR code at the entrance.</p>
            `
          }).catch(err => console.warn('⚠️ Reservation email failed:', err.message));
        }
      } else if (guestInfo && guestInfo.email) {
        sendEmail({
          to: guestInfo.email,
          subject: 'ParkSmart - Reservation Confirmed',
          html: `
            <h2>Reservation Confirmed</h2>
            <p>Hello ${guestInfo.name},</p>
            <p>Your parking reservation has been confirmed.</p>
            <ul>
              <li><strong>Lot:</strong> ${lot.name}</li>
              <li><strong>Slot:</strong> ${slot.slotNumber}</li>
              <li><strong>Start:</strong> ${new Date(startTime).toLocaleString()}</li>
              <li><strong>End:</strong> ${new Date(endTime).toLocaleString()}</li>
              <li><strong>Fee:</strong> ₱${fee}</li>
            </ul>
            <p>Show your QR code at the entrance.</p>
          `
        }).catch(err => console.warn('⚠️ Reservation email failed:', err.message));
      }
    } catch (emailErr) {
      console.warn('⚠️ Email sending error (non-blocking):', emailErr.message);
    }
  } catch (error) {
    next(error);
  }
};

export const getReservationById = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('slotId', 'slotNumber type')
      .populate('lotId', 'name address ratePerHour')
      .populate('userId', 'name email phone');

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    res.json(reservation);
  } catch (error) {
    next(error);
  }
};

export const getUserReservations = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const reservations = await Reservation.find({ userId })
      .populate('slotId', 'slotNumber')
      .populate('lotId', 'name address')
      .sort({ createdAt: -1 });
    res.json(reservations);
  } catch (error) {
    next(error);
  }
};

export const getAllReservations = async (req, res, next) => {
  try {
    const { lot, status, dateFrom, dateTo } = req.query;
    const filter = {};

    if (lot) filter.lotId = lot;
    if (status) filter.status = status;
    if (dateFrom || dateTo) {
      filter.startTime = {};
      if (dateFrom) filter.startTime.$gte = new Date(dateFrom);
      if (dateTo) filter.startTime.$lte = new Date(dateTo);
    }

    const reservations = await Reservation.find(filter)
      .populate('slotId', 'slotNumber')
      .populate('lotId', 'name')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(reservations);
  } catch (error) {
    next(error);
  }
};

export const cancelReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    if (reservation.status === 'cancelled' || reservation.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel this reservation' });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    await Slot.findByIdAndUpdate(reservation.slotId, { status: 'available' });

    const io = getIO();
    io.emit('slot:update', {
      slotId: reservation.slotId,
      status: 'available',
      lotId: reservation.lotId,
      timestamp: new Date().toISOString()
    });

    res.json({ message: 'Reservation cancelled', reservation });
  } catch (error) {
    next(error);
  }
};

export const completeReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    reservation.status = 'completed';
    await reservation.save();

    await Slot.findByIdAndUpdate(reservation.slotId, { status: 'available' });

    const io = getIO();
    io.emit('slot:update', {
      slotId: reservation.slotId,
      status: 'available',
      lotId: reservation.lotId,
      timestamp: new Date().toISOString()
    });

    res.json({ message: 'Reservation completed', reservation });
  } catch (error) {
    next(error);
  }
};

