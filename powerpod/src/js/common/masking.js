import { Logger } from './logger.js';
import { Scripts, useScript } from './scripts.js';

const logger = Logger('common/masking');

// supported masking types
export const FieldMaskType = {
  CRA: 'CRA',
  PostalCode: 'PostalCode',
  PhoneNumber: 'PhoneNumber',
  Number: 'Number',
  Email: 'Email',
};

// map mask type to jquery mask format
export const MaskTypeFormat = {
  CRA: '000000000',
  PostalCode: 'S0S 0S0',
  PhoneNumber: '(000) 000-0000',
};

export function maskInput(fieldName, type) {
  logger.info({
    fn: maskInput,
    message: `applying mask input to fieldName: ${fieldName} of type: ${type}`,
  });
  if (!(Object.keys(FieldMaskType).includes(type))) {
    logger.error({
      fn: maskInput,
      message: `unsupported mask, cannot mask input for fieldName: ${fieldName} and type: ${type}`,
    });
    return;
  }
  useScript(Scripts.jquerymask, function() {
    switch (type) {
      case FieldMaskType.CRA:
      case FieldMaskType.PostalCode:
      case FieldMaskType.PhoneNumber:
        // @ts-ignore
        $(`#${fieldName}`)?.mask(MaskTypeFormat[type]);
        break;
      case FieldMaskType.Email:
        // @ts-ignore
        $(`#${fieldName}`)?.mask('A', {
          translation: {
            A: { pattern: /[\w@\-.+]/, recursive: true },
          },
        });
        break;
      case FieldMaskType.Number:
        // @ts-ignore
        $(`#${fieldName}`)?.mask('Z#', {
          translation: {
            Z: {
              pattern: /[1-9]/,
            },
          },
        });
        break;
      default:
        logger.error({
          fn: maskInput,
          message: `did NOT apply masking to fieldName: ${fieldName} of type: ${type}`,
        });
        return;
    }

    logger.info({
      fn: maskInput,
      message: `successfully applied mask input to fieldName: ${fieldName} of type: ${type}`,
    });
  });
}
