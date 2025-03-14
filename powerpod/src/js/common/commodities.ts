import { POWERPOD } from './constants';
import { getCommoditiesData } from './fetch';
import { Logger } from './logger';

const logger = Logger('common/commodities');

POWERPOD.commodities = {
  getCommodities,
  processCommoditiesData,
};

type CommoditiesDataBlob = {
  value: Array<CommoditiesBlob>;
};

type CommoditiesBlob = {
  quartech_name: string;
  quartech_category: string;
  'quartech_category@OData.Community.Display.V1.FormattedValue': string;
  '_quartech_naicscode_value@OData.Community.Display.V1.FormattedValue': string;
};

export type Commodities = {
  [key: string]: Commodity;
};

type Commodity = {
  name: string;
  category: number;
  categoryDescription: string;
  naicsDescription: string;
};

export async function getCommodities() {
  const { data } = await getCommoditiesData();

  if (data) {
    logger.info({
      fn: getCommodities,
      message: 'successfully extracted commodity options',
    });
    const res = processCommoditiesData(data);
    logger.info({
      fn: getCommodities,
      message: 'successfully extracted commodities:',
      data: res,
    });
    return Promise.resolve(res);
  }

  let errorMsg = 'failed to extract commodities from data';
  logger.warn({
    fn: getCommodities,
    message: errorMsg,
    data,
  });
  return Promise.reject(new Error(errorMsg));
}

export function processCommoditiesData(json: CommoditiesDataBlob) {
  const dataArray = json?.value;
  const res = dataArray.reduce(
    (acc: Commodities, commodity: CommoditiesBlob) => {
      const {
        quartech_name: name,
        quartech_category: category,
        'quartech_category@OData.Community.Display.V1.FormattedValue':
          categoryDescription,
        '_quartech_naicscode_value@OData.Community.Display.V1.FormattedValue':
          naicsDescription,
      } = commodity;

      if (!acc[categoryDescription]) {
        acc[categoryDescription] = [
          {
            name,
            category,
            categoryDescription,
            naicsDescription,
          },
        ];
      } else {
        acc[categoryDescription].push({
          name,
          category,
          categoryDescription,
          naicsDescription,
        });
      }

      return acc;
    },
    []
  );

  return res;
}
