const DateTimePicker = ({ label, value, onChange, required, min }) => {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        min={min || new Date().toISOString().slice(0, 16)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
      />
    </div>
  );
};

export default DateTimePicker;

