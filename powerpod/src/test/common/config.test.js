import getApplicationFormDataJson from '../mock/api/get_application_form_data_kttp1.json';
import {
  getApplicationConfigData,
  getGlobalConfigData,
} from '../../js/common/config.js';
import * as fetch from '../../js/common/fetch.js';

describe('config - getApplicationConfigData', () => {
  it('should return global config data', () => {
    jest.spyOn(Storage.prototype, 'getItem');
    Storage.prototype.getItem = jest.fn(() =>
      JSON.stringify(getApplicationFormDataJson)
    );

    const result = getGlobalConfigData();
    expect(localStorage.getItem).toHaveBeenCalled();
    expect(result).toEqual(
      JSON.parse(
        getApplicationFormDataJson.quartech_ApplicantPortalConfig
          .quartech_configdata
      )
    );
  });

  it('should return application-specific config data', () => {
    jest.spyOn(Storage.prototype, 'getItem');
    Storage.prototype.getItem = jest.fn(() =>
      JSON.stringify(getApplicationFormDataJson)
    );

    const result = getApplicationConfigData();

    expect(result).toEqual(
      JSON.parse(
        getApplicationFormDataJson.quartech_applicantportalapplicationformconfigjson
      )
    );
  });
});
