import User from '../models/User.js';
import Reservation from '../models/Reservation.js';

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const totalReservations = await Reservation.countDocuments({ userId: user._id });
        return {
          ...user.toObject(),
          totalReservations
        };
      })
    );

    res.json(usersWithStats);
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: `User ${isActive ? 'activated' : 'deactivated'}`, user });
  } catch (error) {
    next(error);
  }
};

