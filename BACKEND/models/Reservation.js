import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slot',
    required: [true, 'Slot is required']
  },
  lotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingLot',
    required: [true, 'Parking lot is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  guestInfo: {
    name: { type: String, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true }
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required']
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 hour']
  },
  fee: {
    type: Number,
    required: [true, 'Fee is required'],
    min: [0, 'Fee cannot be negative']
  },
  status: {
    type: String,
    enum: ['confirmed', 'occupied', 'completed', 'cancelled', 'expired'],
    default: 'confirmed'
  },
  qrCode: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

reservationSchema.index({ slotId: 1, startTime: 1, status: 1 });

const Reservation = mongoose.model('Reservation', reservationSchema);
export default Reservation;

