const registerReservationEvents = (socket) => {
  socket.on('reservation:subscribe', () => {
    socket.join('reservations');
    console.log(`Socket ${socket.id} subscribed to reservations`);
  });

  socket.on('reservation:unsubscribe', () => {
    socket.leave('reservations');
    console.log(`Socket ${socket.id} unsubscribed from reservations`);
  });
};

export default registerReservationEvents;

