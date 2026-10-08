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

    // Format reviews ensuring userId name is available
    const formattedReviews = reviews.map(r => {
      const obj = r.toObject();
      if (!obj.userId) {
        obj.userId = {
          name: r.reviewerName || 'Guest Visitor',
          email: ''
        };
      } else if (r.reviewerName && !obj.userId.name) {
        obj.userId.name = r.reviewerName;
      }
      return obj;
    });

    // Calculate rating breakdown
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    
    formattedReviews.forEach(review => {
      const star = Math.min(5, Math.max(1, Math.round(review.rating || 5)));
      sum += review.rating || 5;
      if (breakdown[star] !== undefined) {
        breakdown[star]++;
      }
    });

    const ratingCount = formattedReviews.length;
    const averageRating = ratingCount > 0 
      ? Math.round((sum / ratingCount) * 10) / 10 
      : 5.0;

    res.json({
      reviews: formattedReviews,
      rating: averageRating,
      ratingCount,
      breakdown
    });
  } catch (error) {
    next(error);
  }
};

// Create a review in MongoDB in real time
export const createReview = async (req, res, next) => {
  try {
    const { lotId } = req.params;
    const { rating, feedback, guestName } = req.body;
    
    let userId = null;
    let reviewerName = (guestName && guestName.trim()) || 'Guest Visitor';

    // Check if token is passed for authenticated users
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
        const authUser = await User.findById(userId);
        if (authUser && authUser.name) {
          reviewerName = authUser.name;
        }
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

    // If no authenticated user, create a unique guest user account
    if (!userId) {
      const guestUser = await User.create({
        name: reviewerName,
        email: `guest_${Date.now()}_${Math.floor(Math.random() * 100000)}@parksmart.ph`,
        password: 'GuestPassword123!',
        role: 'user',
        isVerified: true
      });
      userId = guestUser._id;
    }

    // Create a new review directly in MongoDB
    const review = await Review.create({
      lotId: targetLotId,
      userId,
      reviewerName,
      rating: parsedRating,
      feedback: feedback ? feedback.trim() : ''
    });

    // Recalculate average rating and ratingCount for the lot in MongoDB
    const reviews = await Review.find({ lotId: targetLotId });
    const ratingCount = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = ratingCount > 0 ? Math.round((sum / ratingCount) * 10) / 10 : 5.0;

    // Update ParkingLot document in MongoDB
    await ParkingLot.findByIdAndUpdate(targetLotId, {
      rating: averageRating,
      ratingCount: ratingCount
    });

    // Populate user info to return
    let populatedReview = await Review.findById(review._id).populate('userId', 'name email');
    const populatedObj = populatedReview ? populatedReview.toObject() : review.toObject();
    if (!populatedObj.userId) {
      populatedObj.userId = { name: reviewerName, email: '' };
    }

    // Emit live WebSocket event so all connected devices update their reviews & stars automatically
    try {
      const io = getIO();
      io.emit('review:new', {
        lotId: String(targetLotId),
        review: populatedObj,
        lotRating: averageRating,
        lotRatingCount: ratingCount
      });
      io.emit('lot:update', {
        _id: String(targetLotId),
        rating: averageRating,
        ratingCount: ratingCount
      });
    } catch (socketErr) {
      console.warn('Socket broadcast warning:', socketErr.message);
    }

    res.status(201).json({
      message: 'Review saved successfully in MongoDB',
      review: populatedObj,
      lotRating: averageRating,
      lotRatingCount: ratingCount
    });
  } catch (error) {
    next(error);
  }
};
