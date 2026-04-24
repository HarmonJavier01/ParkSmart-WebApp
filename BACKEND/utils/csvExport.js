import { Parser } from 'json2csv';

export const exportReservationsToCSV = (reservations) => {
  const fields = [
    { label: 'Reservation ID', value: '_id' },
    { label: 'User', value: (row) => row.userId?.name || row.guestInfo?.name || 'Guest' },
    { label: 'Email', value: (row) => row.userId?.email || row.guestInfo?.email || '' },
    { label: 'Lot', value: (row) => row.lotId?.name || '' },
    { label: 'Slot', value: (row) => row.slotId?.slotNumber || '' },
    { label: 'Start Time', value: 'startTime' },
    { label: 'End Time', value: 'endTime' },
    { label: 'Duration (hrs)', value: 'duration' },
    { label: 'Fee (PHP)', value: 'fee' },
    { label: 'Status', value: 'status' },
    { label: 'Created At', value: 'createdAt' }
  ];

  const parser = new Parser({ fields });
  return parser.parse(reservations);
};

export default exportReservationsToCSV;

