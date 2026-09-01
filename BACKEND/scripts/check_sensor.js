import '../config/env.js';
import mongoose from 'mongoose';
import dns from 'dns';
import Slot from '../models/Slot.js';
import SensorLog from '../models/SensorLog.js';

dns.setServers(['8.8.8.8', '1.1.1.1']);

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // Find all slots with '02' or '2'
    const slots = await Slot.find({ slotNumber: /02|2/i });
    console.log('=== SLOT 02 STATUS IN DATABASE ===');
    console.log(JSON.stringify(slots, null, 2));

    // Find recent logs for SLOT_02
    const recentLogs = await SensorLog.find({})
      .sort({ timestamp: -1 })
      .limit(10);

    console.log('\n=== RECENT 10 SENSOR LOGS (ALL SLOTS) ===');
    console.log(JSON.stringify(recentLogs, null, 2));

    const slot02Logs = await SensorLog.find({ slotNumber: /02|2/i })
      .sort({ timestamp: -1 })
      .limit(5);

    console.log('\n=== LATEST SENSOR LOGS FOR SLOT 2 ===');
    console.log(JSON.stringify(slot02Logs, null, 2));

    await mongoose.disconnect();
    console.log('\nDone.');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

run();
