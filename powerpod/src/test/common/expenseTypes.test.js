import getExpenseTypeDataJson from '../mock/api/get_expense_type_data.json';
import { getExpenseTypes } from '../../js/common/expenseTypes.ts';
import * as fetch from '../../js/common/fetch.js';

const EXPECTED_RESULT = [
  'SME Fee',
  'Facilitator Fee',
  'SME/Facilitator Travel',
  'Facility, equipment, technology rental',
  'Advertising/communications',
  'Administration Costs',
  'Other Costs',
];

describe('env - getEnvVars', () => {
  it('should return environment variables map', async () => {
    fetch.getExpenseTypeData = jest.fn(() => getExpenseTypeDataJson);

    const result = getExpenseTypes();

    expect(result).resolves.toEqual(EXPECTED_RESULT);
  });
});
