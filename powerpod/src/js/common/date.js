export function getCurrentTimeUTC() {
  const now = new Date();
  const month = now.getUTCMonth() + 1;
  const day = now.getUTCDate();
  const year = now.getUTCFullYear();
  const hours = now.getUTCHours();
  const minutes = now.getUTCMinutes();
  const seconds = now.getUTCSeconds();
  const meridiem = hours < 12 ? 'AM' : 'PM';
  const formattedHours = hours % 12 || 12; // Convert to 12-hour format

  return `${month}/${day}/${year} ${formattedHours}:${minutes}:${seconds} ${meridiem} UTC`;
}
