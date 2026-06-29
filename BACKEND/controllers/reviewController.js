import Review from '../models/Review.js';
import ParkingLot from '../models/ParkingLot.js';

// Get all reviews for a lot with breakdown stats
export const getLotReviews = async (req, res, next) => {
  try {
    const { lotId } = req.params;

    // Verify lot exists
    const lot = await ParkingLot.findById(lotId);
    if (!lot) {
      return res.status(404).json({ message: 'Parking lot not found' });
    }

    const reviews = await Review.find({ lotId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    // Calculate rating breakdown
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    
    reviews.forEach(review => {
      sum += review.rating;
      if (breakdown[review.rating] !== undefined) {
        breakdown[review.rating]++;
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
    const { rating, feedback } = req.body;
    const userId = req.user._id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Please provide a rating between 1 and 5 stars' });
    }

    // Verify lot exists
    const lot = await ParkingLot.findById(lotId);
    if (!lot) {
      return res.status(404).json({ message: 'Parking lot not found' });
    }

    // Check if user already reviewed this lot
    let review = await Review.findOne({ lotId, userId });

    if (review) {
      // Update existing review
      review.rating = rating;
      review.feedback = feedback || '';
      await review.save();
    } else {
      // Create new review
      review = await Review.create({
        lotId,
        userId,
        rating,
        feedback: feedback || ''
      });
    }

    // Recalculate average rating and ratingCount for the lot
    const reviews = await Review.find({ lotId });
    const ratingCount = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = ratingCount > 0 ? Math.round((sum / ratingCount) * 10) / 10 : 5.0;

    // Update ParkingLot document
    await ParkingLot.findByIdAndUpdate(lotId, {
      rating: averageRating,
      ratingCount: ratingCount
    });

    // Populate user info to return
    const populatedReview = await review.populate('userId', 'name email');

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
