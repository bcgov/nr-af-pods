import { win, POWERPOD } from './constants.js';
import { Logger } from './logger.js';

const logger = Logger('common/dynamics');

POWERPOD.dynamics = {
  getCurrentUser,
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
