import '../config/env.js';
import mongoose from 'mongoose';
import dns from 'dns';
import Slot from '../models/Slot.js';
import ParkingLot from '../models/ParkingLot.js';

dns.setServers(['8.8.8.8', '1.1.1.1']);

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    const lotId = '6648a1b2c3d4e5f6a7b8c9d2';

    // 1. Update ParkingLot totalSlots to 20
    const lot = await ParkingLot.findByIdAndUpdate(lotId, { totalSlots: 20 }, { new: true });
    console.log(`Updated lot "${lot?.name}" totalSlots to ${lot?.totalSlots}`);

    // 2. Define slots 11 to 20
    const slots11to20 = [
      {
        _id: new mongoose.Types.ObjectId('6648b2c3d4e5f6a7b8c9d0b0'),
        lotId,
        slotNumber: 'SLOT_11',
        type: 'regular',
        status: 'available',
        sensorId: 'SENSOR_031',
        availableSince: new Date(Date.now() - 65 * 60 * 1000) // 1h 5m available
      },
      {
        _id: new mongoose.Types.ObjectId('6648b2c3d4e5f6a7b8c9d0b1'),
        lotId,
        slotNumber: 'SLOT_12',
        type: 'regular',
        status: 'occupied',
        sensorId: 'SENSOR_032',
        parkedAt: new Date(Date.now() - 42 * 60 * 1000), // Parked 42 mins ago
        expectedEndTime: new Date(Date.now() + 78 * 60 * 1000), // Available in 1h 18m
        occupiedBy: 'Honda Civic (ABC-8821)'
      },
      {
        _id: new mongoose.Types.ObjectId('6648b2c3d4e5f6a7b8c9d0b2'),
        lotId,
        slotNumber: 'SLOT_13',
        type: 'regular',
        status: 'available',
        sensorId: 'SENSOR_033',
        availableSince: new Date(Date.now() - 140 * 60 * 1000) // 2h 20m available
      },
      {
        _id: new mongoose.Types.ObjectId('6648b2c3d4e5f6a7b8c9d0b3'),
        lotId,
        slotNumber: 'SLOT_14',
        type: 'PWD',
        status: 'available',
        sensorId: 'SENSOR_034',
        availableSince: new Date(Date.now() - 180 * 60 * 1000) // 3h available
      },
      {
        _id: new mongoose.Types.ObjectId('6648b2c3d4e5f6a7b8c9d0b4'),
        lotId,
        slotNumber: 'SLOT_15',
        type: 'motorcycle',
        status: 'available',
        sensorId: 'SENSOR_035',
        availableSince: new Date(Date.now() - 25 * 60 * 1000) // 25m available
      },
      {
        _id: new mongoose.Types.ObjectId('6648b2c3d4e5f6a7b8c9d0b5'),
        lotId,
        slotNumber: 'SLOT_16',
        type: 'regular',
        status: 'available',
        sensorId: 'SENSOR_036',
        availableSince: new Date(Date.now() - 95 * 60 * 1000) // 1h 35m available
      },
      {
        _id: new mongoose.Types.ObjectId('6648b2c3d4e5f6a7b8c9d0b6'),
        lotId,
        slotNumber: 'SLOT_17',
        type: 'regular',
        status: 'available',
        sensorId: 'SENSOR_037',
        availableSince: new Date(Date.now() - 50 * 60 * 1000) // 50m available
      },
      {
        _id: new mongoose.Types.ObjectId('6648b2c3d4e5f6a7b8c9d0b7'),
        lotId,
        slotNumber: 'SLOT_18',
        type: 'regular',
        status: 'occupied',
        sensorId: 'SENSOR_038',
        parkedAt: new Date(Date.now() - 75 * 60 * 1000), // Parked 1h 15m ago
        expectedEndTime: new Date(Date.now() + 45 * 60 * 1000), // Available in 45m
        occupiedBy: 'Toyota Vios (XYZ-4392)'
      },
      {
        _id: new mongoose.Types.ObjectId('6648b2c3d4e5f6a7b8c9d0b8'),
        lotId,
        slotNumber: 'SLOT_19',
        type: 'regular',
        status: 'available',
        sensorId: 'SENSOR_039',
        availableSince: new Date(Date.now() - 110 * 60 * 1000) // 1h 50m available
      },
      {
        _id: new mongoose.Types.ObjectId('6648b2c3d4e5f6a7b8c9d0b9'),
        lotId,
        slotNumber: 'SLOT_20',
        type: 'ev',
        status: 'available',
        sensorId: 'SENSOR_040',
        availableSince: new Date(Date.now() - 210 * 60 * 1000) // 3h 30m available
      }
    ];

    // Upsert slots 11-20
    for (const s of slots11to20) {
      const existing = await Slot.findOne({ lotId, slotNumber: s.slotNumber });
      if (existing) {
        await Slot.findByIdAndUpdate(existing._id, s);
        console.log(`Updated ${s.slotNumber}`);
      } else {
        await Slot.create(s);
        console.log(`Created ${s.slotNumber}`);
      }
    }

    // Also update slots 1-10 with realistic availableSince or parkedAt if they don't have it
    const existingSlots1to10 = await Slot.find({ lotId, slotNumber: { $in: ['SLOT_01','SLOT_02','SLOT_03','SLOT_04','SLOT_05','SLOT_06','SLOT_07','SLOT_08','SLOT_09','SLOT_10'] } });
    for (const slot of existingSlots1to10) {
      if (slot.slotNumber === 'SLOT_02') {
        // Keep or set occupied for demo
        slot.status = 'occupied';
        slot.parkedAt = new Date(Date.now() - 28 * 60 * 1000); // 28 mins ago
        slot.expectedEndTime = new Date(Date.now() + 92 * 60 * 1000); // in 1h 32m
        slot.occupiedBy = 'Mitsubishi Montero (NBD-5512)';
        slot.availableSince = null;
        await slot.save();
        console.log('Set SLOT_02 with occupied timing');
      } else if (!slot.availableSince) {
        const randomMinutes = Math.floor(Math.random() * 180) + 15;
        slot.availableSince = new Date(Date.now() - randomMinutes * 60 * 1000);
        await slot.save();
        console.log(`Set ${slot.slotNumber} availableSince (${randomMinutes}m ago)`);
      }
    }

    const allSlots = await Slot.find({ lotId }).sort('slotNumber');
    console.log(`\n=== ALL SLOTS FOR LOT (${allSlots.length} TOTAL) ===`);
    allSlots.forEach(s => {
      console.log(`- ${s.slotNumber} (${s.type}): ${s.status} | parkedAt: ${s.parkedAt?.toISOString() || 'null'} | expectedEndTime: ${s.expectedEndTime?.toISOString() || 'null'} | availableSince: ${s.availableSince?.toISOString() || 'null'}`);
    });

    await mongoose.disconnect();
    console.log('Done.');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

run();
