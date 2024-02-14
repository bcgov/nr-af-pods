import { getExpenseTypeData } from './fetch';
import { Logger } from './logger';

const logger = new Logger('common/expenseTypes');

export async function getExpenseTypeOptions() {
  const data = await getExpenseTypeData();

  if (data) {
    logger.info({
      fn: getExpenseTypeOptions,
      message: 'successfully extracted expense type options',
    });
    return data;
  }
}
