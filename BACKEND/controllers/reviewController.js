import mongoose from 'mongoose';
import Review from '../models/Review.js';
import ParkingLot from '../models/ParkingLot.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { getIO } from '../config/socket.js';

// Get all reviews for a lot with breakdown stats
export const getLotReviews = async (req, res, next) => {
  try {
    const lotId = req.params.lotId || req.query.lotId;

    let targetLotId = null;
    if (lotId && mongoose.Types.ObjectId.isValid(lotId)) {
      targetLotId = lotId;
    } else {
      const defaultLot = await ParkingLot.findOne({});
      if (defaultLot) targetLotId = defaultLot._id;
    }

    const query = targetLotId ? { lotId: targetLotId } : {};
    const reviews = await Review.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    // Calculate rating breakdown
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    
    reviews.forEach(review => {
      const star = Math.min(5, Math.max(1, Math.round(review.rating || 5)));
      sum += review.rating || 5;
      if (breakdown[star] !== undefined) {
        breakdown[star]++;
      }
    });

    const ratingCount = reviews.length;
    const averageRating = ratingCount > 0 
      ? Math.round((sum / ratingCount) * 10) / 10 
      : 5.0;

    res.json({
      reviews,
      rating: averageRating,
      ratingCount,
      breakdown
    });
  } catch (error) {
    next(error);
  }
};

// Create or update a review
export const createReview = async (req, res, next) => {
  try {
    const { lotId } = req.params;
    const { rating, feedback, guestName } = req.body;
    
    let userId = null;

    // Check if token is passed for authenticated users
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        console.warn('Optional token verification failed:', err.message);
      }
    }

    const parsedRating = Number(rating);
    if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ message: 'Please provide a rating between 1 and 5 stars' });
    }

    // Resolve parking lot
    let lot = null;
    if (lotId && mongoose.Types.ObjectId.isValid(lotId)) {
      lot = await ParkingLot.findById(lotId);
    }
    if (!lot) {
      lot = await ParkingLot.findOne({});
    }

    if (!lot) {
      return res.status(404).json({ message: 'Parking lot not found' });
    }

    const targetLotId = lot._id;

    // If no authenticated user, use/create a guest user account
    if (!userId) {
      const name = (guestName && guestName.trim()) || 'Guest Visitor';
      let guestUser = await User.findOne({ name, role: 'user' });
      if (!guestUser) {
        guestUser = await User.create({
          name,
          email: `guest_${Date.now()}_${Math.floor(Math.random() * 100000)}@parksmart.ph`,
          password: 'GuestPassword123!',
          role: 'user',
          isVerified: true
        });
      }
      userId = guestUser._id;
    }

    // Check if user already reviewed this lot
    let review = await Review.findOne({ lotId: targetLotId, userId });

    if (review) {
      // Update existing review
      review.rating = parsedRating;
      review.feedback = feedback || '';
      await review.save();
    } else {
      // Create new review
      review = await Review.create({
        lotId: targetLotId,
        userId,
        rating: parsedRating,
        feedback: feedback || ''
      });
    }

    // Recalculate average rating and ratingCount for the lot
    const reviews = await Review.find({ lotId: targetLotId });
    const ratingCount = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = ratingCount > 0 ? Math.round((sum / ratingCount) * 10) / 10 : 5.0;

    // Update ParkingLot document
    await ParkingLot.findByIdAndUpdate(targetLotId, {
      rating: averageRating,
      ratingCount: ratingCount
    });

    // Populate user info to return
    const populatedReview = await review.populate('userId', 'name email');

    // Emit live WebSocket event so all connected devices update their reviews & stars automatically
    try {
      const io = getIO();
      io.emit('review:new', {
        lotId: targetLotId,
        review: populatedReview,
        lotRating: averageRating,
        lotRatingCount: ratingCount
      });
    } catch (socketErr) {
      console.warn('Socket broadcast warning:', socketErr.message);
    }

    res.status(200).json({
      message: 'Review saved successfully',
      review: populatedReview,
      lotRating: averageRating,
      lotRatingCount: ratingCount
    });
  } catch (error) {
    next(error);
  }
};
