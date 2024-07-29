import { POWERPOD } from './constants.js';
import { getContactData } from '../common/fetch.js';
import { Logger } from './logger.js';

const logger = Logger('common/contacts');

POWERPOD.contacts = {
  getContactName,
};

export async function getContactName(contactId) {
  const { data } = await getContactData({ contactId });

  if (!data || !data.value?.length) {
    logger.error({
      fn: getContactName,
      message: 'Failed to get contact',
    });
    return;
  }

  const { fullname } = data.value?.[0];

  if (!fullname || !fullname.length) {
    logger.error({
      fn: getContactName,
      message: 'Failed to get contact name',
    });
    return;
  }

  logger.info({
    fn: getContactName,
    message: `Successfully retrieved fullname: ${fullname}`,
  });

  return fullname;
}
