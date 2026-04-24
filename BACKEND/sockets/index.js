import { getIO } from '../config/socket.js';
import registerSlotEvents from './slotEvents.js';
import registerReservationEvents from './reservationEvents.js';

export const registerSocketEvents = () => {
  const io = getIO();

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    registerSlotEvents(socket);
    registerReservationEvents(socket);

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

export default registerSocketEvents;

