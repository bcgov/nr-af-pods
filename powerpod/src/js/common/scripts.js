import { doc, POWERPOD } from './constants.js';
import { Logger } from './logger.js';

const logger = Logger('common/scripts');

POWERPOD.useScript = useScript;

export const Scripts = {
  jquerymask: 'jquerymask',
  canadapost: 'canadapost',
  chosen: 'chosen',
  jquery: 'jquery',
  jqueryui: 'jqueryui',
};

const script = {
  loadmap: [], // used to track already loaded scripts
  sourcemap: {
    jquery: 'https://code.jquery.com/jquery-3.6.2.min.js',
    jqueryui: 'https://code.jquery.com/ui/1.12.1/jquery-ui.min.js',
    chosen:
      'https://cdnjs.cloudflare.com/ajax/libs/chosen/1.4.2/chosen.jquery.js',
    jquerymask:
      'https://cdnjs.cloudflare.com/ajax/libs/jquery.mask/1.14.16/jquery.mask.min.js',
    canadapost:
      'https://ws1.postescanada-canadapost.ca/js/addresscomplete-2.30.min.js',
  },
  callstack: {}, // used to handle stacked function calls while loading a script
};

/**
 * Marks a script as fully loaded in memory.
 * @function
 * @param {string} id - The id of the associated script.
 */
function markScriptFullyLoaded(id) {
  script.loadmap[id] = true;
}

/**
 * Checks if a script is added.
 * @function
 * @param {string} id - The id of the associated script.
 */
function isScriptAdded(id) {
  if (!id || !script.sourcemap?.[id]) return;
  const src = script.sourcemap[id];
  return Boolean(doc.querySelector('script[src="' + src + '"]'));
}

/**
 * Marks a script fully loaded.
 * @function
 * @param {string} id - The id of the associated script.
 */
function isScriptFullyLoaded(id) {
  return id in script.loadmap && script.loadmap[id];
}

/**
 * Allows use of a pre-defined script, employs lazy-loading.
 * @function
 * @param {string} id - The id of the associated script.
 * @param {function} onload - A function to be executed on load of the script.
 * @param {function} onerror - A function to be executed on error.
 */
export function useScript(id, onload = null, onerror = null) {
  if (!id || !script.sourcemap?.[id]) return;

  const src = script.sourcemap[id];

  // Check if the script is already loaded
  if (isScriptAdded(id)) {
    // If script already loaded successfully, trigger the callback function
    if (isScriptFullyLoaded(id)) {
      logger.warn({
        fn: useScript,
        message: `Script already loaded. Skipping: ${id}`,
      });
      if (onload) {
        logger.warn({
          fn: useScript,
          message: `Script already loaded. Calling onload for: ${id}`,
        });
        onload();
      }
      return;
    }

    if (onload) {
      logger.warn({
        fn: useScript,
        message: `Script still loading, adding to call stack: ${id}`,
        data: script,
      });
      script.callstack = {
        ...(script.callstack ? script.callstack : {}),
        [id]: [
          ...(script.callstack?.[id] ? script.callstack?.[id] : []),
          onload,
        ],
      };
    } else {
      logger.warn({
        fn: useScript,
        message: `Script still loading: ${id}`,
      });
    }
    return;
  }

  // Loading the script using DOM...
  const scriptEl = doc.createElement('script');
  scriptEl.setAttribute('async', '');
  scriptEl.src = src;
  doc.head.appendChild(scriptEl);

  if (onload && typeof onload === 'function') {
    script.callstack = {
      [id]: [onload],
      ...script.callstack,
    };
  }

  scriptEl.onload = () => {
    logger.info({
      fn: useScript,
      message: `script onload successfully called ${id}`,
      data: script,
    });
    markScriptFullyLoaded(id);

    if (script.callstack?.[id]) {
      script.callstack?.[id].forEach((fn) => fn());
      script.callstack = {
        ...(script.callstack ? script.callstack : {}),
        [id]: [],
      };
    }
  };

  scriptEl.onerror = () => {
    logger.error({
      fn: useScript,
      message: `Failed to load: ${id}`,
    });

    // Optional callback on script load failure
    if (onerror && typeof onerror === 'function') onerror();
  };
}
