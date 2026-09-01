import '../config/env.js';
import mongoose from 'mongoose';
import dns from 'dns';
import Review from '../models/Review.js';
import ParkingLot from '../models/ParkingLot.js';
import User from '../models/User.js';

dns.setServers(['8.8.8.8', '1.1.1.1']);

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    const lot = await ParkingLot.findOne({});
    if (!lot) throw new Error('No lot found');

    // Create standard guest users if they don't exist
    let user1 = await User.findOne({ name: 'John D.' });
    if (!user1) {
      user1 = await User.create({
        name: 'John D.',
        email: 'john_d_guest@parksmart.ph',
        password: 'GuestPassword123!',
        role: 'user',
        isVerified: true
      });
    }

    let user2 = await User.findOne({ name: 'Maria Santos' });
    if (!user2) {
      user2 = await User.create({
        name: 'Maria Santos',
        email: 'maria_santos_guest@parksmart.ph',
        password: 'GuestPassword123!',
        role: 'user',
        isVerified: true
      });
    }

    let user3 = await User.findOne({ name: 'Melvin G. Sibuma' });
    if (!user3) {
      user3 = await User.create({
        name: 'Melvin G. Sibuma',
        email: 'melvin_sibuma@parksmart.ph',
        password: 'GuestPassword123!',
        role: 'user',
        isVerified: true
      });
    }

    // Update existing reviews
    await Review.updateMany(
      { feedback: /Nice parking space/i },
      { $set: { userId: user1._id, lotId: lot._id, rating: 5 } }
    );

    await Review.updateMany(
      { feedback: /Excellent and secure/i },
      { $set: { userId: user2._id, lotId: lot._id, rating: 5 } }
    );

    await Review.updateMany(
      { feedback: /amazing and very Helpful/i },
      { $set: { userId: user3._id, lotId: lot._id, rating: 5, feedback: 'Your app is amazing and very helpful for me' } }
    );

    const allReviews = await Review.find({ lotId: lot._id }).populate('userId', 'name email');
    console.log('All Reviews after fix:');
    console.log(JSON.stringify(allReviews, null, 2));

    // Update ParkingLot rating and count
    const count = allReviews.length;
    const avg = count > 0 ? Math.round((allReviews.reduce((a, r) => a + r.rating, 0) / count) * 10) / 10 : 5.0;

    lot.rating = avg;
    lot.ratingCount = count;
    await lot.save();

    console.log(`Updated ParkingLot ${lot.name}: Rating = ${lot.rating}, Count = ${lot.ratingCount}`);

    await mongoose.disconnect();
    console.log('Done.');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

run();
