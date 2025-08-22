import { POWERPOD } from './constants';
import { getTypesOfFoodData } from './fetch';
import { Logger } from './logger';

const logger = Logger('common/typesOfFood');

POWERPOD.typesOfFood = {
  getTypesOfFood,
  processTypesOfFoodData,
};

type TypesOfFoodDataBlob = {
  value: Array<TypesOfFoodBlob>;
};

type TypesOfFoodBlob = {
  quartech_name: string;
  quartech_typeoffoodid: string;
};

export type TypesOfFood = string;

export async function getTypesOfFood() {
  const { data } = await getTypesOfFoodData();

  if (data) {
    logger.info({
      fn: getTypesOfFood,
      message: 'successfully extracted types of food options',
    });
    const res = processTypesOfFoodData(data);
    logger.info({
      fn: getTypesOfFood,
      message: 'successfully extracted types of food:',
      data: res,
    });
    return Promise.resolve(res);
  }

  let errorMsg = 'failed to extract types of food from data';
  logger.warn({
    fn: getTypesOfFood,
    message: errorMsg,
    data,
  });
  return Promise.reject(new Error(errorMsg));
}

export function processTypesOfFoodData(json: TypesOfFoodDataBlob) {
  const dataArray = json?.value;
  const res = dataArray.reduce(
    (acc: TypesOfFood[], typeOfFood: TypesOfFoodBlob) => {
      const { quartech_name: typeOfFoodName } = typeOfFood;
      if (typeOfFoodName) {
        acc.push(typeOfFoodName);
      }
      return acc;
    },
    []
  );

  return res;
}
