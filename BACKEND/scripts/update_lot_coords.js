import '../config/env.js';
import mongoose from 'mongoose';
import dns from 'dns';
import ParkingLot from '../models/ParkingLot.js';

dns.setServers(['8.8.8.8', '1.1.1.1']);

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    const result = await ParkingLot.updateMany(
      {},
      {
        $set: {
          lat: 16.04507,
          lng: 120.49125,
          imageUrl: '/images/IMG20260604134124.jpg',
          images: [
            '/images/IMG20260604134124.jpg',
            '/images/IMG20260604134315.jpg',
            '/images/IMG20260604134341.jpg',
            '/images/IMG20260604134345.jpg',
            '/images/IMG20260604134348.jpg',
            '/images/IMG20260604134353.jpg'
          ]
        }
      }
    );

    console.log('Update result:', result);

    const lots = await ParkingLot.find({});
    console.log('Updated Lots in DB:', JSON.stringify(lots, null, 2));

    await mongoose.disconnect();
    console.log('Done.');
  } catch (err) {
    console.error('Error updating DB:', err);
    process.exit(1);
  }
};

run();
