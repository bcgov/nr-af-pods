// @ts-nocheck
import { showFieldRow } from './html.js';
import { POWERPOD, Form } from './constants.js';
import { Logger } from './logger.js';
import { getFormType } from './applicationUtils.js';
import { getFormId } from './form.js';
import { patchApplicationData } from './fetch.js';

const logger = Logger('common/utils');

POWERPOD.utils = {
  enableDebugging,
  disableDebugging,
  enableCanadaPostIntegration,
  disableCanadaPostIntegration,
};

export function enableDebugging() {
  localStorage.setItem('debug_pp', true);
  localStorage.getItem('debug_pp');
  location.reload();
}

export function disableDebugging() {
  localStorage.removeItem('debug_pp');
  location.reload();
}

export function enableCanadaPostIntegration() {
  localStorage.setItem('debug_canadapost', true);
  localStorage.getItem('debug_canadapost');
  location.reload();
}

export function disableCanadaPostIntegration() {
  localStorage.removeItem('debug_canadapost');
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

export function getBrowserInfo() {
  const userAgent = navigator.userAgent;

  let browserName = 'Unknown';
  let browserVersion = 'Unknown';

  const browserData = userAgent.match(
    /(firefox|msie|trident|chrome|safari|opera|edg|opr|crios)\/?\s*(\d+)/i
  );
  if (browserData && browserData.length >= 3) {
    browserName = browserData[1].toLowerCase();
    browserVersion = browserData[2];
  }

  let operatingSystem = 'Unknown OS';
  if (userAgent.indexOf('Windows NT') !== -1) {
    operatingSystem = 'Windows';
  } else if (
    userAgent.indexOf('Macintosh') !== -1 ||
    userAgent.indexOf('Mac OS X') !== -1
  ) {
    operatingSystem = 'macOS';
  } else if (userAgent.indexOf('Android') !== -1) {
    operatingSystem = 'Android';
  } else if (
    userAgent.indexOf('iPhone') !== -1 ||
    userAgent.indexOf('iPad') !== -1
  ) {
    operatingSystem = 'iOS';
  } else if (userAgent.indexOf('Linux') !== -1) {
    operatingSystem = 'Linux';
  } else if (userAgent.indexOf('CrOS') !== -1) {
    operatingSystem = 'Chrome OS';
  }

  const isMobileDevice = /Mobi|Android/i.test(userAgent);
  const deviceType = isMobileDevice ? 'Mobile' : 'Desktop';

  const jsEnabled = true;

  const userInfo = {
    userAgent: userAgent,
    browser: {
      name: browserName,
      version: browserVersion,
    },
    operatingSystem: operatingSystem,
    deviceType: deviceType,
    javascriptEnabled: jsEnabled,
  };

  return JSON.stringify(userInfo, null, 2);
}

export async function saveBrowserInfo() {
  const data = getBrowserInfo();

  if (!data) {
    logger.error({
      fn: saveBrowserInfo,
      message: 'Failed to get browser info',
    });
    return;
  }

  const payload = {
    quartech_applicantbrowserinformation: data,
  };

  const formId = getFormId();
  const formType = getFormType();

  try {
    let res;

    if (formType === Form.Application) {
      res = await patchApplicationData({ id: formId, fieldData: payload });
    } else if (formType === Form.Claim) {
      res = await patchClaimData({ id: formId, fieldData: payload });
    }

    logger.info({
      fn: saveBrowserInfo,
      message:
        'successfully patched form data with browser information payload',
      data: { formId, formType, payload },
    });
  } catch (e) {
    logger.error({
      fn: saveBrowserInfo,
      message: `failed to patch form data with browser info for formType: ${formType}`,
      data: { e, formId, formType, payload },
    });
  }
}
