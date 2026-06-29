import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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
    const lotsData = await loadJSON('lots.json');
    const slotsData = await loadJSON('slots.json');
    const reservationsData = await loadJSON('reservations.json');
    const reviewsData = await loadJSON('reviews.json');

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

