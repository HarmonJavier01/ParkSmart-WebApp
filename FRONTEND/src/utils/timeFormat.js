/**
 * Formatting utilities for real-time parking start & end times and duration.
 */

export const formatClockTime = (dateInput) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
};

export const formatElapsed = (dateInput, short = false) => {
  if (!dateInput) return short ? '' : 'Recently';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return short ? '0m' : 'Just now';

  const totalMin = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMin / 60);
  const minutes = totalMin % 60;

  if (hours === 0) {
    if (minutes === 0) return short ? '<1m' : 'Just now';
    return short ? `${minutes}m` : `${minutes} min${minutes > 1 ? 's' : ''}`;
  }

  if (short) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return minutes > 0 ? `${hours} hr${hours > 1 ? 's' : ''} ${minutes} min${minutes > 1 ? 's' : ''}` : `${hours} hr${hours > 1 ? 's' : ''}`;
};

export const formatRemaining = (dateInput, short = false) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  const diffMs = date.getTime() - Date.now();

  if (diffMs <= 0) {
    return short ? 'Due' : 'Ending now';
  }

  const totalMin = Math.ceil(diffMs / 60000);
  const hours = Math.floor(totalMin / 60);
  const minutes = totalMin % 60;

  if (hours === 0) {
    return short ? `${minutes}m` : `in ${minutes} min${minutes > 1 ? 's' : ''}`;
  }

  if (short) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return minutes > 0 ? `in ${hours} hr${hours > 1 ? 's' : ''} ${minutes} min${minutes > 1 ? 's' : ''}` : `in ${hours} hr${hours > 1 ? 's' : ''}`;
};
