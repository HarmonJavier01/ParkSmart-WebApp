const durations = [
  { label: '30 min', value: 0.5 },
  { label: '1 hr', value: 1 },
  { label: '2 hrs', value: 2 },
  { label: '4 hrs', value: 4 },
  { label: '8 hrs', value: 8 }
];

const DurationChips = ({ selected, onSelect }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
      <div className="flex flex-wrap gap-2">
        {durations.map((d) => (
          <button
            key={d.value}
            type="button"
            onClick={() => onSelect(d.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition border ${
              selected === d.value
                ? 'bg-parking-primary text-white border-parking-primary'
                : 'bg-white text-gray-700 border-gray-300 hover:border-teal-400'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DurationChips;

