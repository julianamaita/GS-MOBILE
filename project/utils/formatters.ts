import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';

// Configure dayjs plugins
dayjs.extend(relativeTime);
dayjs.extend(duration);

// Format date to readable string
export const formatDate = (dateString: string): string => {
  return dayjs(dateString).format('DD/MM/YYYY');
};

// Format time to readable string
export const formatTime = (dateString: string): string => {
  return dayjs(dateString).format('HH:mm');
};

// Format date and time to readable string
export const formatDateTime = (dateString: string): string => {
  return dayjs(dateString).format('DD/MM/YYYY HH:mm');
};

// Get relative time (e.g., "2 hours ago")
export const getRelativeTime = (dateString: string): string => {
  return dayjs(dateString).fromNow();
};

// Calculate duration between two dates in hours
export const calculateDurationHours = (startTime: string, endTime?: string): number => {
  if (!endTime) {
    return dayjs().diff(dayjs(startTime), 'hour', true);
  }
  return dayjs(endTime).diff(dayjs(startTime), 'hour', true);
};

// Format duration in a human-readable way
export const formatDuration = (hours: number): string => {
  const duration = dayjs.duration(hours, 'hours');
  const days = Math.floor(duration.asDays());
  const remainingHours = Math.floor(duration.asHours() % 24);
  
  if (days > 0) {
    return `${days}d ${remainingHours}h`;
  }
  
  return `${Math.floor(hours)}h ${Math.floor((hours % 1) * 60)}m`;
};

// Calculate average duration from an array of durations
export const calculateAverageDuration = (durations: number[]): number => {
  if (durations.length === 0) return 0;
  const sum = durations.reduce((acc, curr) => acc + curr, 0);
  return sum / durations.length;
};