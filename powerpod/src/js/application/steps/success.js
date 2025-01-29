import { configureFields } from '../../common/fieldConfiguration.js';
import { Logger } from '../../common/logger.js';

const logger = Logger('application/steps/success');

export function customizeSuccessStep(programData) {
  logger.info({
    fn: customizeSuccessStep,
    message: `Start customizing success step...`,
  });
  configureFields();
}
