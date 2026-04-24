import { STATUS_BG, STATUS_TEXT } from '../../constants/colors.js';

const StatusBadge = ({ status, className = '' }) => {
  const bgClass = STATUS_BG[status] || 'bg-gray-100';
  const textClass = STATUS_TEXT[status] || 'text-gray-500';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${bgClass} ${textClass} ${className}`}>
      {status}
    </span>
  );
};

export default StatusBadge;

