import getEnvVarsDataJson from '../mock/api/get_env_vars_data.json';
import { getEnvVars } from '../../js/common/env.ts';
import * as fetch from '../../js/common/fetch.js';

const EXPECTED_RESULT = {
  quartech_AfPodsNotificationUserGuid: '8c1303c1-2c1c-ee11-8f6d-002248ae0846',
  quartech_ChefsDemographicDataFormId: 'bf28608c-905e-4e89-a17d-6164b7a16cb1',
};

describe('env - getEnvVars', () => {
  it('should return environment variables map', async () => {
    fetch.getEnvVarsData = jest.fn(() => getEnvVarsDataJson);

    const result = getEnvVars();

    expect(result).resolves.toEqual(EXPECTED_RESULT);
  });

  it('should fail to return environment variables map', async () => {
    fetch.getEnvVarsData = jest.fn(() => {});

    const result = getEnvVars();

    expect(result).rejects.toThrow('failed to extract env vars from data');
  });
});
