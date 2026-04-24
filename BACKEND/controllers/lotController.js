import ParkingLot from '../models/ParkingLot.js';
import Slot from '../models/Slot.js';

export const getLots = async (req, res, next) => {
  try {
    const lots = await ParkingLot.find({ isActive: true });
    const lotsWithAvailability = await Promise.all(
      lots.map(async (lot) => {
        const availableCount = await Slot.countDocuments({
          lotId: lot._id,
          status: 'available'
        });
        return {
          ...lot.toObject(),
          availableSlots: availableCount
        };
      })
    );
    res.json(lotsWithAvailability);
  } catch (error) {
    next(error);
  }
};

export const getLotById = async (req, res, next) => {
  try {
    const lot = await ParkingLot.findById(req.params.id);
    if (!lot) {
      return res.status(404).json({ message: 'Parking lot not found' });
    }

    const availableCount = await Slot.countDocuments({
      lotId: lot._id,
      status: 'available'
    });

    res.json({ ...lot.toObject(), availableSlots: availableCount });
  } catch (error) {
    next(error);
  }
};

export const createLot = async (req, res, next) => {
  try {
    const { name, address, lat, lng, totalSlots, ratePerHour, operatingHours } = req.body;

    const lot = await ParkingLot.create({
      name,
      address,
      lat,
      lng,
      totalSlots,
      ratePerHour,
      operatingHours
    });

    const slots = [];
    for (let i = 1; i <= totalSlots; i++) {
      const slotNumber = `SLOT_${String(i).padStart(2, '0')}`;
      let type = 'regular';
      if (i % 10 === 0) type = 'ev';
      else if (i % 7 === 0) type = 'PWD';
      else if (i % 5 === 0) type = 'motorcycle';

      slots.push({
        lotId: lot._id,
        slotNumber,
        type
      });
    }

    await Slot.insertMany(slots);

    res.status(201).json({ message: 'Parking lot created', lot });
  } catch (error) {
    next(error);
  }
};

export const updateLot = async (req, res, next) => {
  try {
    const lot = await ParkingLot.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!lot) {
      return res.status(404).json({ message: 'Parking lot not found' });
    }
    res.json({ message: 'Parking lot updated', lot });
  } catch (error) {
    next(error);
  }
};

export const deleteLot = async (req, res, next) => {
  try {
    const lot = await ParkingLot.findByIdAndDelete(req.params.id);
    if (!lot) {
      return res.status(404).json({ message: 'Parking lot not found' });
    }
    await Slot.deleteMany({ lotId: lot._id });
    res.json({ message: 'Parking lot deleted' });
  } catch (error) {
    next(error);
  }
};

