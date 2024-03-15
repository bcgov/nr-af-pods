// @ts-nocheck
import { Logger } from './logger.js';
import { setTabName } from './tabs.js';

const logger = new Logger('common/sections');

export function configureSections(sections) {
  if (!sections || !sections.length) {
    logger.warn({
      fn: configureSections,
      message: 'Configure sections called with empty data',
    });
  }
  sections.forEach((section) => {
    const { name, displayName } = section;

    if (!name) {
      logger.error({
        fn: configureSections,
        message: 'Could not find section name',
      });
      return;
    }

    if (displayName) {
      setTabName(name, displayName);
    }

    logger.info({
      fn: configureSections,
      message: `Successfully configured section for name: ${name}`,
      data: { section },
    });
  });
}
