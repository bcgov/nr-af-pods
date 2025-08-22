import { POWERPOD } from './constants.js';

POWERPOD.dateUtils = {
  getCurrentTimeUTC,
  convertDateToISO,
};

export function getCurrentTimeUTC() {
  const now = new Date();
  const month = now.getUTCMonth() + 1;
  const day = now.getUTCDate();
  const year = now.getUTCFullYear();
  const hours = now.getUTCHours();
  const minutes = String(now.getUTCMinutes()).padStart(2, '0');
  const seconds = String(now.getUTCSeconds()).padStart(2, '0');
  const meridiem = hours < 12 ? 'AM' : 'PM';
  const formattedHours = hours % 12 || 12; // Convert to 12-hour format

  return `${day}/${month}/${year} ${formattedHours}:${minutes}:${seconds} ${meridiem} UTC`;
}

export function convertDateToISO(dateString) {
  // Split the date string by '/'
  var parts = dateString.split('/');

  if (parts[0] && parts[1] && parts[2]) {
    // Extract month, day, and year from the parts
    var month = parts[0]?.padStart(2, '0'); // Ensures month is 2 digits
    var day = parts[1]?.padStart(2, '0'); // Ensures day is 2 digits
    var year = parts[2];
  
    // Return the date in YYYY-MM-DD format
    return `${year}-${month}-${day}`;
  }
}

export function formatDateToISOString(dateString) {
  // Parse the input date string (e.g., "1/15/2025")
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return '';
  }

  // Extract individual components of the date
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const day = String(date.getDate()).padStart(2, '0');

  // Build the desired format: 'YYYY-MM-DDTHH:mm:ss.sssssss'
  const formattedDate = `${year}-${month}-${day}T00:00:00.0000000`;

  // Wrap it in single quotes
  return formattedDate;
}
