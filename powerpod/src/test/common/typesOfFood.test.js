import getTypesOfFoodDataJson from '../mock/api/get_expense_type_data.json';
import { getTypesOfFood } from '../../js/common/typesOfFood.ts';
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

describe('typesOfFood - getTypesOfFood', () => {
  it('should return types of food array', async () => {
    fetch.getTypesOfFoodData = jest.fn(() => getTypesOfFoodDataJson);

    const result = getTypesOfFood();

    expect(result).resolves.toEqual(EXPECTED_RESULT);
  });
});
