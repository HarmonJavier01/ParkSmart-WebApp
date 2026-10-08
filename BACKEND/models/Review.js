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
    default: null
  },
  reviewerName: {
    type: String,
    trim: true,
    default: null
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

// Index for fast sorting and querying by lot
reviewSchema.index({ lotId: 1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
