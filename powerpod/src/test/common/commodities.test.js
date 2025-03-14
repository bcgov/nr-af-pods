import getCommoditiesDataJson from '../mock/api/get_commodities_data.json';
import { getCommodities } from '../../js/common/commodities.ts';
import * as fetch from '../../js/common/fetch.js';

const EXPECTED_RESULT = [
  'Smallholder Swine',
  'Commercial Poultry',
  'Commercial Swine',
  'Beef Cattle',
  'Dairy Cattle',
  'Small Ruminant',
  'Smallholder Poultry',
  'Equine',
  'Companion Animal',
];

describe('commodities - getCommodities', () => {
  it('should return commodities array', async () => {
    fetch.getCommoditiesData = jest.fn(() => getCommoditiesDataJson);

    const result = getCommodities();

    expect(result).resolves.toEqual(EXPECTED_RESULT);
  });
});
