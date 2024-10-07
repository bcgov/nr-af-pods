import { win, POWERPOD } from './constants.js';
import { Logger } from './logger.js';
import { fetch } from './fetch.js';
import { saveBrowserInfo } from './utils.js';

const logger = Logger('common/dynamics');

POWERPOD.dynamics = {
  getCurrentUser,
  getRequestVerificationToken,
  preloadRequestVerificationToken,
};

type User = {
  contactId: string;
  userName: string;
};

export function getCurrentUser(): User {
  logger.info({
    fn: getCurrentUser,
    message: 'Start getting current user',
  });

  // @ts-ignore
  const { User } = win?.Microsoft?.Dynamic365?.Portal;

  if (!User) {
    logger.error({
      fn: getCurrentUser,
      message: 'Could not get current user',
      // @ts-ignore
      data: { dynamic365: win?.Microsoft?.Dynamic365 },
    });
  }

  logger.info({
    fn: getCurrentUser,
    message: 'Successfully retrieved current user data',
    data: { currentUser: User },
  });
  return User;
}

export async function preloadRequestVerificationToken() {
  let requestVerificationToken = $(
    'input[name=__RequestVerificationToken]'
  ).val();
  if (requestVerificationToken) {
    logger.info({
      fn: preloadRequestVerificationToken,
      message: `No need to preload token, exists already, __RequestVerificationToken: ${requestVerificationToken}`,
    });
    saveBrowserInfo();
    return;
  }

  logger.info({
    fn: preloadRequestVerificationToken,
    message:
      'Could not find input[name=__RequestVerificationToken], attempt finding antiforgerytoken div',
  });

  const tokenUrlDiv = document.getElementById('antiforgerytoken');
  if (!tokenUrlDiv) {
    logger.error({
      fn: preloadRequestVerificationToken,
      message:
        'Could not find antiforgerytoken, failed to find verificationtoken',
    });
    return;
  }
  const tokenUrl = tokenUrlDiv.getAttribute('data-url');
  if (!tokenUrl) {
    logger.error({
      fn: preloadRequestVerificationToken,
      message:
        'Could not find antiforgerytoken URL, failed to find verificationtoken',
    });
    return;
  }
  const { data: tokenResultString } = await fetch({
    url: tokenUrl,
    returnData: true,
  });

  // Create a temporary container element in memory
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = tokenResultString;
  const inputElement = tempDiv.querySelector('input');
  const token = inputElement?.getAttribute('value');

  if (!token) {
    logger.error({
      fn: preloadRequestVerificationToken,
      message: 'Failed to load verification token from antiforgery url',
    });
    return;
  }

  requestVerificationToken = token;

  // set DOM HTML content for easy/immediate fetching later
  tokenUrlDiv.innerHTML = `<input name="__RequestVerificationToken" type="hidden" value="${requestVerificationToken}">`;

  saveBrowserInfo();
  logger.info({
    fn: preloadRequestVerificationToken,
    message: `Successfully created token input element with __RequestVerificationToken: ${requestVerificationToken}`,
  });
}

export function getRequestVerificationToken() {
  let requestVerificationToken = $(
    'input[name=__RequestVerificationToken]'
  ).val();
  if (!requestVerificationToken) {
    logger.error({
      fn: getRequestVerificationToken,
      message: 'Could not find input[name=__RequestVerificationToken]',
    });
  }
  logger.info({
    fn: getRequestVerificationToken,
    message: `Successfully found __RequestVerificationToken: ${requestVerificationToken}`,
  });
  return requestVerificationToken;
}
