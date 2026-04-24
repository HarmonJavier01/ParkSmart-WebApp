import SlotCell from './SlotCell.jsx';

const SlotGrid = ({ slots, onSlotClick, title }) => {
  if (!slots || slots.length === 0) {
    return <p className="text-gray-500 text-center py-8">No slots available</p>;
  }

  return (
    <div className="card">
      {title && <h3 className="font-bold text-lg mb-4">{title}</h3>}
      <div className="flex flex-wrap gap-3 justify-center">
        {slots.map((slot) => (
          <SlotCell
            key={slot._id}
            slot={slot}
            onClick={onSlotClick}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-4 justify-center mt-4 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-100 border border-green-400" /> Available</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100 border border-red-400" /> Occupied</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-100 border border-yellow-400" /> Reserved</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-100 border border-gray-300" /> Disabled</span>
      </div>
    </div>
  );
};

export default SlotGrid;

