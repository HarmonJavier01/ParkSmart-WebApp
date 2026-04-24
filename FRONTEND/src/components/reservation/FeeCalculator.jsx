const FeeCalculator = ({ rate, duration }) => {
  const fee = rate * duration;

  return (
    <div className="bg-teal-50 border border-teal-100 rounded-lg p-4">
      <div className="flex justify-between items-center">
        <span className="text-gray-600">Rate per hour</span>
        <span className="font-medium">₱{rate}</span>
      </div>
      <div className="flex justify-between items-center mt-1">
        <span className="text-gray-600">Duration</span>
        <span className="font-medium">{duration} hr{duration > 1 ? 's' : ''}</span>
      </div>
      <div className="border-t border-teal-200 mt-2 pt-2 flex justify-between items-center">
        <span className="font-bold text-gray-800">Total Fee</span>
        <span className="font-bold text-parking-primary text-xl">₱{fee}</span>
      </div>
    </div>
  );
};

export default FeeCalculator;

