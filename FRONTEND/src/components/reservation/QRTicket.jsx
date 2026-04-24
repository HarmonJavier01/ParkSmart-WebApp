import { QRCodeSVG } from 'qrcode.react';
import StatusBadge from '../common/StatusBadge.jsx';

const QRTicket = ({ reservation }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300 p-8 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">ParkSmart</h2>
        <p className="text-sm text-gray-500">Parking Reservation Ticket</p>
      </div>

      <div className="flex justify-center mb-6">
        <div className="p-4 bg-white rounded-xl shadow-sm border">
          <QRCodeSVG
            value={reservation._id}
            size={180}
            level="H"
            includeMargin={true}
          />
        </div>
      </div>

      <div className="text-center mb-6">
        <StatusBadge status={reservation.status} className="text-sm px-4 py-1" />
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between border-b border-gray-100 pb-2">
          <span className="text-gray-500">Reservation ID</span>
          <span className="font-mono font-medium">{reservation._id}</span>
        </div>
        <div className="flex justify-between border-b border-gray-100 pb-2">
          <span className="text-gray-500">Parking Lot</span>
          <span className="font-medium">{reservation.lotId?.name}</span>
        </div>
        <div className="flex justify-between border-b border-gray-100 pb-2">
          <span className="text-gray-500">Slot</span>
          <span className="font-medium">{reservation.slotId?.slotNumber}</span>
        </div>
        <div className="flex justify-between border-b border-gray-100 pb-2">
          <span className="text-gray-500">Start Time</span>
          <span className="font-medium">{new Date(reservation.startTime).toLocaleString()}</span>
        </div>
        <div className="flex justify-between border-b border-gray-100 pb-2">
          <span className="text-gray-500">End Time</span>
          <span className="font-medium">{new Date(reservation.endTime).toLocaleString()}</span>
        </div>
        <div className="flex justify-between border-b border-gray-100 pb-2">
          <span className="text-gray-500">Duration</span>
          <span className="font-medium">{reservation.duration} hr(s)</span>
        </div>
        <div className="flex justify-between pt-2">
          <span className="text-gray-500">Total Fee</span>
          <span className="font-bold text-parking-primary text-lg">₱{reservation.fee}</span>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-gray-400">
        <p>Show this QR code at the entrance</p>
        <p>Manaoag, Pangasinan</p>
      </div>
    </div>
  );
};

export default QRTicket;

