import Reservation from '../models/Reservation.js';
import SensorLog from '../models/SensorLog.js';
import ParkingLot from '../models/ParkingLot.js';

export const getDaily = async (req, res, next) => {
  try {
    const { dateFrom, dateTo, lotId } = req.query;
    const match = {};

    if (dateFrom || dateTo) {
      match.createdAt = {};
      if (dateFrom) match.createdAt.$gte = new Date(dateFrom);
      if (dateTo) match.createdAt.$lte = new Date(dateTo);
    }
    if (lotId) match.lotId = lotId;

    const daily = await Reservation.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: '$fee' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(daily);
  } catch (error) {
    next(error);
  }
};

export const getHourlyHeatmap = async (req, res, next) => {
  try {
    const { dateFrom, dateTo, lotId } = req.query;
    const match = {};

    if (dateFrom || dateTo) {
      match.startTime = {};
      if (dateFrom) match.startTime.$gte = new Date(dateFrom);
      if (dateTo) match.startTime.$lte = new Date(dateTo);
    }
    if (lotId) match.lotId = lotId;

    const hourly = await Reservation.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $hour: '$startTime' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const heatmap = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: hourly.find((h) => h._id === i)?.count || 0
    }));

    res.json(heatmap);
  } catch (error) {
    next(error);
  }
};

export const getRevenue = async (req, res, next) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const match = { status: { $in: ['completed', 'confirmed'] } };

    if (dateFrom || dateTo) {
      match.createdAt = {};
      if (dateFrom) match.createdAt.$gte = new Date(dateFrom);
      if (dateTo) match.createdAt.$lte = new Date(dateTo);
    }

    const revenue = await Reservation.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$lotId',
          totalRevenue: { $sum: '$fee' },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'parkinglots',
          localField: '_id',
          foreignField: '_id',
          as: 'lot'
        }
      },
      { $unwind: '$lot' },
      {
        $project: {
          lotName: '$lot.name',
          totalRevenue: 1,
          count: 1
        }
      }
    ]);

    res.json(revenue);
  } catch (error) {
    next(error);
  }
};

export const getSensorLogs = async (req, res, next) => {
  try {
    const { lotId, limit = 100 } = req.query;
    const filter = {};
    if (lotId) filter.lotId = lotId;

    const logs = await SensorLog.find(filter)
      .populate('slotId', 'slotNumber')
      .populate('lotId', 'name')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json(logs);
  } catch (error) {
    next(error);
  }
};

