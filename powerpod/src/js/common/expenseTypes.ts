import { getExpenseTypeData } from './fetch';
import { Logger } from './logger';

const logger = new Logger('common/expenseTypes');

type ExpenseTypesDataBlob = {
  value: Array<ExpenseTypeBlob>;
};

type ExpenseTypeBlob = {
  quartech_expensetype: string;
  quartech_expensetypeid: string;
};

export type ExpenseType = string;

export async function getExpenseTypes() {
  const data = await getExpenseTypeData();

  if (data) {
    logger.info({
      fn: getExpenseTypes,
      message: 'successfully extracted expense type options',
    });
    const res = processExpenseTypesData(data);
    logger.info({
      fn: getExpenseTypes,
      message: 'successfully extracted expense types:',
      data: res,
    });
    return Promise.resolve(res);
  }

  let errorMsg = 'failed to extract expense types from data';
  logger.warn({
    fn: getExpenseTypes,
    message: errorMsg,
    data,
  });
  return Promise.reject(new Error(errorMsg));
}

export function processExpenseTypesData(json: ExpenseTypesDataBlob) {
  const dataArray = json?.value;

  const res = dataArray.reduce(
    (acc: ExpenseType[], expenseType: ExpenseTypeBlob) => {
      const { quartech_expensetype: expenseTypeName } = expenseType;
      if (expenseTypeName) {
        acc.push(expenseTypeName);
      }

      return acc;
    },
    []
  );

  return res;
}
