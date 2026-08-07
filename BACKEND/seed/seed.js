import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dns from 'dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);

import User from '../models/User.js';
import ParkingLot from '../models/ParkingLot.js';
import Slot from '../models/Slot.js';
import Reservation from '../models/Reservation.js';
import Review from '../models/Review.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const loadJSON = async (filename) => {
  const data = await readFile(join(__dirname, 'data', filename), 'utf-8');
  return JSON.parse(data);
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    await User.deleteMany();
    await ParkingLot.deleteMany();
    await Slot.deleteMany();
    await Reservation.deleteMany();
    await Review.deleteMany();
    console.log('Cleared existing data');

    const usersData = await loadJSON('users.json');
    let lotsData = await loadJSON('lots.json');
    let slotsData = await loadJSON('slots.json');
    let reservationsData = await loadJSON('reservations.json');
    let reviewsData = await loadJSON('reviews.json');

    // Commented out: Manaoag Church Lot and Manaoag Public Market Lot.
    // We filter the loaded array to only include 'LCC Pay Parking'.
    /*
    // Manaoag Church Lot:
    {
      "_id": "6648a1b2c3d4e5f6a7b8c9d0",
      "name": "Manaoag Church Lot",
      "address": "Rizal Street, Manaoag, Pangasinan",
      "lat": 15.9766,
      "lng": 120.4869,
      "totalSlots": 10,
      "ratePerHour": 20,
      "operatingHours": { "open": "05:00", "close": "21:00" },
      "isActive": true,
      "imageUrl": "/images/church_lot.png",
      "images": [
        "/images/church_lot.png"
      ],
      "rating": 5.0,
      "ratingCount": 0
    }
    // Manaoag Public Market Lot:
    {
      "_id": "6648a1b2c3d4e5f6a7b8c9d1",
      "name": "Manaoag Public Market Lot",
      "address": "Market Road, Manaoag, Pangasinan",
      "lat": 15.978,
      "lng": 120.4885,
      "totalSlots": 10,
      "ratePerHour": 15,
      "operatingHours": { "open": "06:00", "close": "19:00" },
      "isActive": true,
      "imageUrl": "/images/market_lot.png",
      "images": [
        "/images/market_lot.png"
      ],
      "rating": 5.0,
      "ratingCount": 0
    }
    */
    lotsData = lotsData.filter(lot => lot.name === 'LCC Pay Parking');
    slotsData = slotsData.filter(slot => slot.lotId === '6648a1b2c3d4e5f6a7b8c9d2');
    reservationsData = reservationsData.filter(res => res.lotId === '6648a1b2c3d4e5f6a7b8c9d2');
    reviewsData = reviewsData.filter(rev => rev.lotId === '6648a1b2c3d4e5f6a7b8c9d2');

    await User.create(usersData);
    console.log(`Seeded ${usersData.length} users`);

    await ParkingLot.insertMany(lotsData);
    console.log(`Seeded ${lotsData.length} parking lots`);

    await Slot.insertMany(slotsData);
    console.log(`Seeded ${slotsData.length} slots`);

    await Reservation.insertMany(reservationsData);
    console.log(`Seeded ${reservationsData.length} reservations`);

    await Review.insertMany(reviewsData);
    console.log(`Seeded ${reviewsData.length} reviews`);

    console.log('✅ Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();

