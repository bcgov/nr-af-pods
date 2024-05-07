export function getCurrentTimeUTC() {
  const now = new Date();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const year = now.getUTCFullYear();
  const hours = String(now.getUTCHours()).padStart(2, '0');
  const minutes = String(now.getUTCMinutes()).padStart(2, '0');
  const seconds = String(now.getUTCSeconds()).padStart(2, '0');
  const meridiem = hours < 12 ? 'AM' : 'PM';
  const formattedHours = hours % 12 || 12; // Convert to 12-hour format

  return `${day}/${month}/${year} ${formattedHours}:${minutes}:${seconds} ${meridiem} UTC`;
}
