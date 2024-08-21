// @ts-nocheck
import { Logger } from './logger.js';
import { getCurrentStep } from './program.js';
import { setTabName, setHeadings } from './tabs.js';

const logger = Logger('common/sections');

export function configureSections(sections) {
  if (!sections || !sections.length) {
    logger.warn({
      fn: configureSections,
      message: 'Configure sections called with empty data',
    });
  }
  sections.forEach((section) => {
    logger.info({
      fn: configureSubsections,
      message: `Start configuring section for section.name: ${section.name}...`,
      data: {
        section,
      },
    });
    const { name: sectionName, displayName, headings, subsections } = section;

    if (!sectionName) {
      logger.error({
        fn: configureSections,
        message: 'Could not find section name',
      });
      return;
    }

    if (displayName) {
      setTabName(sectionName, displayName);
    }

    if (headings && headings.length) {
      setHeadings(sectionName, headings);
    }

    if (subsections && subsections.length) {
      configureSubsections(sectionName, subsections);
    }

    logger.info({
      fn: configureSections,
      message: `Successfully configured section for sectionName: ${sectionName}`,
      data: { section },
    });
  });
}

export function configureSubsections(sectionName, subsections) {
  if (!subsections || !subsections.length) {
    logger.error({
      fn: configureSubsections,
      message: 'Configure subsections called with empty data',
    });
    return;
  }
  const currentStep = getCurrentStep();
  if (currentStep !== sectionName) {
    logger.warn({
      fn: configureSubsections,
      message: `Skip configuring subsections for nonactive step sectionName: ${sectionName}`,
    });
    return;
  }
  logger.info({
    fn: configureSubsections,
    message: `Start configuring subsections currentStep: ${currentStep} for sectionName: ${sectionName}... ${JSON.stringify(
      subsections
    )}`,
    data: {
      sectionName,
      subsections,
    },
  });
  subsections.forEach((subsection) => {
    const { name, newLabel, hidden } = subsection;

    if (!name) {
      logger.error({
        fn: configureSections,
        message: 'Could not find section name',
      });
      return;
    }

    if (hidden) {
      const sectionElement = $(`fieldset[aria-label="${name}"]`);
      if (sectionElement) {
        sectionElement?.css('display', 'none');
      }
    }
    if (newLabel) {
      var fieldset = document.querySelector(`fieldset[aria-label="${name}"]`);
      if (!fieldset) {
        logger.error({
          fn: configureSubsections,
          message: `Failed to find fieldset for name: ${name}, newLabel: ${newLabel}`,
        });
        return;
      }
      fieldset.setAttribute('aria-label', newLabel);
      var h3Tag = fieldset.querySelector('h3');
      if (!h3Tag) {
        logger.error({
          fn: configureSubsections,
          message: `Failed to find h3Tag for name: ${name}, newLabel: ${newLabel}`,
        });
        return;
      }
      h3Tag.innerHTML = newLabel;
    }

    logger.info({
      fn: configureSubsections,
      message: `Successfully configured sectionName: ${sectionName} subsection for subsection: ${name}`,
      data: { sectionName, subsections },
    });
  });
}
