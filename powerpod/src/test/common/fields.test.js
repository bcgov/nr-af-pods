import getApplicationFormDataJsonAbpp1 from '../mock/api/get_application_form_data_abpp1.json';
import combinedApplicantFieldsKttp1 from '../mock/fields/combined_applicant_fields_kttp1.json';
import * as config from '../../js/common/config.js';
import * as program from '../../js/common/program.ts';
import {
  getFieldsBySectionApplication,
  getGlobalFieldsConfig,
} from '../../js/common/fields.js';
import { FormStep } from '../../js/common/constants.js';
import { sortArrayByProperty } from '../../js/common/utils.js';

describe('fields - getFieldsBySectionApplication', () => {
  it('should return fields for ApplicantInfo', () => {
    program.getProgramAbbreviation = jest.fn(() => 'ABPP1');
    config.getGlobalConfigData = jest.fn(() =>
      JSON.parse(
        getApplicationFormDataJsonAbpp1.quartech_ApplicantPortalConfig
          .quartech_configdata
      )
    );
    config.getApplicationConfigData = jest.fn(() =>
      JSON.parse(
        getApplicationFormDataJsonAbpp1.quartech_applicantportalapplicationformconfigjson
      )
    );
    jest.spyOn(Storage.prototype, 'getItem');
    Storage.prototype.getItem = jest.fn();

    const result = getFieldsBySectionApplication(FormStep.ApplicantInfo);
    expect(localStorage.getItem).toHaveBeenCalled();
    expect(sortArrayByProperty(result, 'name')).toEqual(
      sortArrayByProperty(combinedApplicantFieldsKttp1, 'name')
    );
  });
});

describe('fields - getGlobalFieldsConfig', () => {
  it('should return global fields under ALL', () => {
    config.getGlobalConfigData = jest.fn(() =>
      JSON.parse(
        getApplicationFormDataJsonAbpp1.quartech_ApplicantPortalConfig
          .quartech_configdata
      )
    );

    const result = getGlobalFieldsConfig();
    expect(result).toEqual(
      JSON.parse(
        getApplicationFormDataJsonAbpp1.quartech_ApplicantPortalConfig
          .quartech_configdata
      )?.FieldsConfig?.programs?.find((p) => p.name === 'ALL')
    );
  });
});
