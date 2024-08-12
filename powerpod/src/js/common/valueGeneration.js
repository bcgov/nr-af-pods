import { POWERPOD } from './constants.js';
import { Logger } from './logger.js';

const logger = Logger('common/valueGeneration');

POWERPOD.valueGeneration = {
  generateVisibleValueForBusinessNameVLB,
};

export function generateVisibleValueForBusinessNameVLB() {
  const legalBusinessOrgNameTag = 'quartech_legalbusinessororganizationname';
  const legalBusinessOrgNameTagElement = document.querySelector(
    `#${legalBusinessOrgNameTag}`
  );

  if (!legalBusinessOrgNameTagElement) {
    logger.error({
      fn: generateVisibleValueForBusinessNameVLB,
      message: `Could not find Legal Business or Organization Name field tag: ${legalBusinessOrgNameTag}`,
    });
    return;
  }

  // only set the value of "Legal Business or Organization Name" to empty if loading has finished
  // i.e. it's not the initial state
  if (!POWERPOD.loading) {
    logger.info({
      fn: generateVisibleValueForBusinessNameVLB,
      message: `POWERPOD.loading: ${POWERPOD.loading}, setting ${legalBusinessOrgNameTag} to empty val: ''`,
    });
    return '';
  }

  logger.info({
    fn: generateVisibleValueForBusinessNameVLB,
    message: `POWERPOD.loading: ${POWERPOD.loading}, do not touch ${legalBusinessOrgNameTag}, returning undefined`,
  });
  return undefined;
}
