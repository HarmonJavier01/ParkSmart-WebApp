import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  lotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingLot',
    required: [true, 'Parking lot ID is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1 star'],
    max: [5, 'Rating cannot exceed 5 stars']
  },
  feedback: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

// Ensure a user can only review a lot once to prevent spam
reviewSchema.index({ lotId: 1, userId: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
