import { addDocumentsStepText } from '../../common/documents.ts';
import { getApplicationData } from '../../common/fetch.js';
import {
  configureFields,
  setRequiredField,
  unsetRequiredField,
} from '../../common/fieldConfiguration.js';
import {
  validateStepField,
  validateStepFields,
} from '../../common/fieldValidation.js';
import { getFormId } from '../../common/form.js';
import { hideFieldRow, showFieldRow } from '../../common/html.js';
import { Logger } from '../../common/logger.js';
import { getProgramAbbreviation } from '../../common/program.ts';
import store from '../../store/index.js';

const logger = Logger('steps/documents');

export function customizeDocumentsStep() {
  const programAbbreviation = getProgramAbbreviation();
  logger.info({
    fn: customizeDocumentsStep,
    message: `Start customizing documents step`,
  });
  if (
    programAbbreviation.includes('ABPP') ||
    programAbbreviation === 'NEFBA2' ||
    programAbbreviation === 'VLB' ||
    programAbbreviation.includes('KTTP') ||
    programAbbreviation === 'TFCR' ||
    programAbbreviation === 'TFCCRF'
  ) {
    addDocumentsStepText();
  }
  configureFields();

  if (programAbbreviation === 'TFCCRF') {
    customizeDocumentsStepForTFCCRF();
  }
}

async function customizeDocumentsStepForTFCCRF() {
  logger.info({
    fn: customizeDocumentsStepForTFCCRF,
    message: `Start customizing documents step for TFCCRF`,
  });
  const formId = getFormId();
  const applicationDataRes = await getApplicationData({ id: formId });

  if (!applicationDataRes?.data?.value?.[0]) {
    logger.error({
      fn: customizeDocumentsStepForTFCCRF,
      message: `Could not get application data result to determine whether individual or business`,
    });
  }

  const {
    quartech_ownorleaseland,
    quartech_originalsource,
    quartech_reportnewtreefruitinventory,
  } = applicationDataRes?.data?.value?.[0];

  logger.info({
    fn: customizeDocumentsStepForTFCCRF,
    message: `Found application value quartech_originalsource: ${quartech_originalsource}`,
  });

  // If original source is NOT import
  if ([255550000, 255550002].includes(quartech_originalsource)) {
    showFieldRow('quartech_taxdocument');
  } else {
    hideFieldRow({ fieldName: 'quartech_taxdocument' });
  }

  logger.info({
    fn: customizeDocumentsStep,
    message: `Found application value quartech_ownorleaseland: ${quartech_ownorleaseland}`,
  });

  // 00 corresponds to I own the land
  // 01 corresponds to I lease the land
  // 03 corresponds to Both
  // 02 is N/A
  // Visible IF quartech_OwnOrLeaseLand IN ('I own the land', 'Both')	
  if ([255550000, 255550003].includes(quartech_ownorleaseland)) {
    showFieldRow('quartech_propertyassessmentnotice');
  } else {
    hideFieldRow({ fieldName: 'quartech_propertyassessmentnotice' });
  }

  // Visible IF quartech_OwnOrLeaseLand IN ('I lease the land', 'Both')
  if ([255550001, 255550003].includes(quartech_ownorleaseland)) {
    showFieldRow('quartech_leaseagreement');
  } else {
    hideFieldRow({ fieldName: 'quartech_leaseagreement' });
  }

  logger.info({
    fn: customizeDocumentsStepForTFCCRF,
    message: `Found application value quartech_reportnewtreefruitinventory: ${quartech_reportnewtreefruitinventory}`,
  });
  // Mandatory if quartech_originalsource != Import OR quartech_reportnewtreefruitinventory = YES
  if (
    [255550000, 255550002].includes(quartech_originalsource) ||
    quartech_reportnewtreefruitinventory === 255550000
  ) {
    logger.info({
      fn: customizeDocumentsStepForTFCCRF,
      message: `Found application value quartech_reportnewtreefruitinventory: ${quartech_reportnewtreefruitinventory}, setting quartech_uploadasitemap to REQUIRED`,
    });
    // showFieldRow('quartech_uploadasitemap');
    store.dispatch('addFieldData', {
      name: 'quartech_uploadasitemap',
      required: true,
    });
    setRequiredField('quartech_uploadasitemap');
    validateStepField('quartech_uploadasitemap');
    validateStepFields();
  } else {
    // hideFieldRow({ fieldName: 'quartech_uploadasitemap' });
    logger.info({
      fn: customizeDocumentsStepForTFCCRF,
      message: `Found application value quartech_reportnewtreefruitinventory: ${quartech_reportnewtreefruitinventory}, setting quartech_uploadasitemap to NOT required`,
    });
    store.dispatch('addFieldData', {
      name: 'quartech_uploadasitemap',
      error: '',
      required: false,
    });
    unsetRequiredField('quartech_uploadasitemap');
    validateStepField('quartech_uploadasitemap');
    validateStepFields();
  }
}
