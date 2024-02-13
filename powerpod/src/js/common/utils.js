import { showFieldRow } from './html.js';

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

// Merges two arrays of objects joining on a given prop, e.g. "name"
export function mergeFieldArrays(ArrayA, ArrayB, prop) {
  const mergedObj = {};

  // Merge objects from ArrayB and ArrayA into the object
  for (const obj of [...ArrayB, ...ArrayA]) {
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
