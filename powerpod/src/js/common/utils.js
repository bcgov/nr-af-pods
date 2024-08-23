// @ts-nocheck
import { showFieldRow } from './html.js';
import { POWERPOD } from './constants.js';

POWERPOD.utils = {
  enableDebugging,
};

export function enableDebugging() {
  localStorage.setItem('debug_pp', true);
  localStorage.getItem('debug_pp');
  location.reload();
}

/**
 * Equivalent of jQuery function $().
 */
export function $(selector, context) {
  context = arguments.length > 1 ? context : document;
  return context ? context.querySelectorAll(selector) : null;
}

/**
 * Extends a given Object properties and its childs.
 */
export function deepExtend(out) {
  out = out || {};
  for (var i = 1, len = arguments.length; i < len; ++i) {
    var obj = arguments[i];

    if (!obj) {
      continue;
    }

    for (var key in obj) {
      if (
        !obj.hasOwnProperty(key) ||
        key == '__proto__' ||
        key == 'constructor'
      ) {
        continue;
      }

      // based on https://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
      if (Object.prototype.toString.call(obj[key]) === '[object Object]') {
        out[key] = deepExtend(out[key], obj[key]);
        continue;
      }

      out[key] = obj[key];
    }
  }
  return out;
}

// function to merge 2 similar objects, note: obj2 props will take priority
export function mergeObjects(a, b) {
  for (let key in b) {
    if (b.hasOwnProperty(key)) {
      a[key] = b[key];
    }
  }
  return a;
}

// Merges two arrays of objects joining on a given prop, e.g. "name"
export function mergeFieldArrays(a, b, prop) {
  const mergedObj = {};

  // Merge objects from ArrayB and ArrayA into the object
  for (const obj of [...b, ...a]) {
    const key = obj[prop];

    if (key in mergedObj) {
      // Merge properties if the object already exists in the object
      mergedObj[key] = { ...mergedObj[key], ...obj };
    } else {
      // If the object doesn't exist in the object, add it
      mergedObj[key] = { ...obj };
    }
  }

  // Check if the result should be an array or object
  return prop ? Object.values(mergedObj) : mergedObj;
}

// Sorts an array of objects by a given property
export function sortArrayByProperty(array, propertyName) {
  // Sort the array alphabetically by the specified property
  array.sort((a, b) => {
    const propertyA = a[propertyName].toLowerCase();
    const propertyB = b[propertyName].toLowerCase();

    // Compare the values and return the comparison result
    if (propertyA < propertyB) return -1;
    if (propertyA > propertyB) return 1;
    return 0;
  });

  return array;
}

export function hasUpperCase(str) {
  return str && str !== str.toLowerCase();
}

export function filterEmptyRows(rowData) {
  return rowData.filter((obj) => {
    return Object.values(obj).some((value) => value.trim() !== '');
  });
}

export function isLastObjectEmpty(array) {
  if (array.length === 0) {
    return false; // If the array is empty, return false
  }

  const lastObject = array[array.length - 1]; // Get the last object in the array

  // Check if all values of the last object are empty strings
  return Object.values(lastObject).every((value) => value.trim() === '');
}

export function sha256(str) {
  // Convert the string to a Uint8Array
  const buffer = new TextEncoder().encode(str);
  // Hash the buffer using SHA-256
  return crypto.subtle.digest('SHA-256', buffer).then((hash) => {
    // Convert the hash to a hexadecimal string
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  });
}

export const delay = (delayInms) => {
  return new Promise((resolve) => setTimeout(resolve, delayInms));
};

export const isObjectEmpty = (objectName) => {
  return (
    objectName &&
    Object.keys(objectName).length === 0 &&
    objectName.constructor === Object
  );
};
