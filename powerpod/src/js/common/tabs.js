// @ts-nocheck
import { Logger } from './logger.js';
import { FormStep, POWERPOD, TabDisplayNames, TabNames } from './constants.js';

const logger = Logger('common/tabs');

POWERPOD.tabs = {
  setTabName,
  getTabElement,
};

export function hideTabs(hiddenTabsNames) {
  if (!hiddenTabsNames || !hiddenTabsNames.length) {
    logger.warn({
      fn: hideTabs,
      message: 'Hide tabs called with empty data',
    });
  }

  let tabsToHide = [];

  if (hiddenTabsNames) {
    tabsToHide = hiddenTabsNames.split(',');
  }

  logger.info({
    fn: hideTabs,
    message: 'Attempting to hide tabs...',
    data: {
      hiddenTabsNames,
      tabsToHide,
    },
  });

  tabsToHide.forEach((tabName) => {
    if (tabName) {
      const tabElement = getTabElement({ name: tabName });
      if (tabElement && tabElement.style) {
        tabElement.style.display = 'none';
        logger.info({
          fn: hideTabs,
          message: `Successfully hid tab for given tabName: ${tabName}`,
        });
      }
    }
  });
}

// Note: displayName could be "Project", and name is internal name, e.g. "tab_Project"
function getTabElement({ displayName, name }) {
  if (!displayName && !name) {
    logger.error({
      fn: getTabElement,
      message:
        'Need at least one param displayName or name to find tab element',
    });
    return;
  }

  if (!displayName && name) {
    const formStepIndex = Object.values(TabNames).findIndex((tabNames) =>
      tabNames.includes(name)
    );
    if (!formStepIndex) {
      logger.error({
        fn: getTabElement,
        message: `Could not find form step index for name: ${name}`,
      });
      return;
    }
    const formStep = Object.keys(TabNames)[formStepIndex];
    displayName = TabDisplayNames[formStep];
  }

  if (!displayName) {
    logger.error({
      fn: getTabElement,
      message: `Unable to find display name for tab name: ${name}`,
    });
    return;
  }

  let tabElement;

  if (Array.isArray(displayName) && displayName.length) {
    displayName.forEach((dispName) => {
      let match = $('ol.progress li').filter(function () {
        return $(this).text().includes(dispName);
      });
      if (match && match.length === 1) {
        tabElement = match;
        return;
      }
    });
  } else {
    tabElement = $('ol.progress li').filter(function () {
      return $(this).text().includes(displayName);
    });
  }

  if (!tabElement || !tabElement.length) {
    logger.warn({
      fn: getTabElement,
      message: 'Could not find tab element',
      data: {
        name,
        displayName,
      },
    });
    return;
  }

  if (tabElement.length !== 1) {
    logger.error({
      fn: setTabName,
      message: 'Matched multiple elements for one given tab',
      data: {
        displayName,
        name,
      },
    });
    return;
  }

  return tabElement[0];
}

export function setTabName(name, displayName) {
  if (!name || !displayName) {
    logger.warn({
      fn: setTabName,
      message: 'Missing required params of name or displayName',
    });
    return;
  }

  if (!Object.values(FormStep).includes(name)) {
    logger.warn({
      fn: setTabName,
      message: `Invalid section name passed, name: ${name}, displayName: ${displayName}`,
    });
    return;
  }

  const initialTabDisplayName = TabDisplayNames[name];

  if (!initialTabDisplayName) {
    logger.warn({
      fn: setTabName,
      message: 'Could not find original tab display name',
    });
    return;
  }

  const tabElement = getTabElement({ displayName: initialTabDisplayName });

  if (tabElement) {
    tabElement.firstChild.nodeValue = displayName; // Replace 'New Text' with your desired text
    logger.info({
      fn: setTabName,
      message: `Successfully updated tab name from ${name} to ${displayName}`,
    });
  }
}

export function setHeadings(sectionName, headings) {
  if (!sectionName || !headings || !headings?.length) {
    logger.error({
      fn: setHeadings,
      message: 'Missing required sectionName or headings',
      data: { sectionName, headings },
    });
    return;
  }

  headings.forEach((heading) => {
    const { name, displayName } = heading;
    if (!name || !displayName) {
      logger.error({
        fn: setHeadings,
        message: 'Failed to set heading, missing params',
        data: { name, displayName },
      });
      return;
    }

    setHeadingName(name, displayName);
  });
}

function setHeadingName(name, displayName) {
  const headerElements = $('fieldset legend h3').filter(function () {
    return $(this).text().includes(name);
  });
  if (!headerElements || !headerElements.length) {
    logger.warn({
      fn: setTabName,
      message: 'Could not find header element to rename',
      data: {
        name,
        displayName,
      },
    });
    return;
  }
  if (headerElements.length > 1) {
    logger.error({
      fn: setHeadingName,
      message: 'Matched more than one heading, could not update header',
      data: {
        name,
        displayName,
        headerElements,
      },
    });
    return;
  }
  headerElements[0].innerHTML = displayName;
  logger.info({
    fn: setTabName,
    message: `Successfully updated header from ${name} to ${displayName}`,
  });
}
