import { useState } from 'react';
import InputField from '../forms/InputField.jsx';
import DateTimePicker from '../forms/DateTimePicker.jsx';
import DurationChips from '../forms/DurationChips.jsx';
import FeeCalculator from './FeeCalculator.jsx';

const ReservationForm = ({ slot, lot, user, onSubmit, loading }) => {
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(1);
  const [guestInfo, setGuestInfo] = useState({ name: '', email: '', phone: '' });

  const isLoggedIn = !!user;

  const handleSubmit = (e) => {
    e.preventDefault();
    const start = new Date(startTime);
    const end = new Date(start.getTime() + duration * 60 * 60 * 1000);

    const payload = {
      slotId: slot._id,
      lotId: lot._id,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      duration,
      fee: lot.ratePerHour * duration
    };

    if (isLoggedIn) {
      payload.userId = user._id;
    } else {
      payload.guestInfo = guestInfo;
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <DateTimePicker
        label="Start Time"
        value={startTime}
        onChange={setStartTime}
        required
      />

      <DurationChips
        selected={duration}
        onSelect={setDuration}
      />

      <FeeCalculator rate={lot.ratePerHour} duration={duration} />

      {!isLoggedIn && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700">Guest Information</h4>
          <InputField
            label="Full Name"
            value={guestInfo.name}
            onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
            required
          />
          <InputField
            label="Email"
            type="email"
            value={guestInfo.email}
            onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
            required
          />
          <InputField
            label="Phone"
            value={guestInfo.phone}
            onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
            required
          />
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !startTime}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : 'Confirm Reservation'}
      </button>
    </form>
  );
};

export default ReservationForm;

