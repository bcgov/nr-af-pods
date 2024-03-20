import { calculateEstimatedActivityBudget } from '../application/steps/deliverablesBudget.js';
import { Logger } from './logger.js';

const logger = Logger('common/currency');

export const CURRENCY_FORMAT = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'CAD',
  maximumFractionDigits: 2,
});

export function customizeCurrencyInput({
  inputId,
  skipCalculatingBudget = false,
  maxDigits = 10,
  limitInputValue = undefined,
  hideDollarSign = false,
  emptyInitialValue = false,
  allowNegatives = false,
}) {
  let inputCtr = $(`#${inputId}`);
  const existingLabel = document.querySelector(
    `#${inputId}_span_currency_label`
  );
  if (!existingLabel && !inputCtr.val() && !hideDollarSign) {
    inputCtr.parent().addClass('input-group');

    let span = document.createElement('span');
    span.id = `${inputId}_span_currency_label`;
    span.innerText = '$';
    span.className = 'input-group-addon';
    inputCtr.parent().prepend(span);

    // inputCtr.val("0.00");
  }

  inputCtr.on('keydown', function (event) {
    const inputValue = inputCtr.val();

    let pressedKeyCode = event.which; // pressed key on the keyboard.

    logger.info({
      fn: customizeCurrencyInput,
      message: `KEYDOWN ACTION: Detected pressedKeyCode: ${pressedKeyCode}`,
    });

    if (pressedKeyCode <= 40 && pressedKeyCode >= 37) {
      logger.info({
        fn: customizeCurrencyInput,
        message:
          'KEYDOWN ACTION: Arrow keys pressed, allowing default event behaviour',
      });
      return;
    }

    let currentInputCursor = document.getElementById(
      inputCtr[0].id
      // @ts-ignore
    )?.selectionStart;

    // pressed '.'
    // if pressed next to a decimal point, just move cursor over 1 space to right
    if (pressedKeyCode === 190) {
      // @ts-ignore
      const nextChar = inputValue.charAt(currentInputCursor);
      if (nextChar === '.') {
        document
          .getElementById(inputCtr[0].id)
          // @ts-ignore
          ?.setSelectionRange(currentInputCursor + 1, currentInputCursor + 1);
        event.preventDefault();
        return;
      }
    }

    //delete
    if (pressedKeyCode === 46) {
      // @ts-ignore
      const charToDelete = inputValue.charAt(currentInputCursor);
      if (charToDelete === '0' && currentInputCursor === 0) {
        document
          .getElementById(inputCtr[0].id)
          // @ts-ignore
          ?.setSelectionRange(currentInputCursor + 1, currentInputCursor + 1);
        event.preventDefault();
        return;
      }

      if (charToDelete === '.' || charToDelete === ',') {
        document
          .getElementById(inputCtr[0].id)
          // @ts-ignore
          ?.setSelectionRange(currentInputCursor + 1, currentInputCursor + 1);
        event.preventDefault();
        return;
      }

      let isDecimalPlace = false;
      // @ts-ignore
      logger.info({
        fn: customizeCurrencyInput,
        message: 'DELETE ACTION: Attempting to detect if decimal place',
        data: { currentInputCursor, inputValueLength: inputValue?.length },
      });
      if (currentInputCursor >= inputValue.length - 2) {
        isDecimalPlace = true;
      }

      // @ts-ignore
      if (isDecimalPlace && currentInputCursor !== inputValue.length) {
        logger.info({
          fn: customizeCurrencyInput,
          message: 'DELETE ACTION: Decimal place input detected',
          data: { inputValue },
        });
        const newValue =
          // @ts-ignore
          inputValue.substring(0, currentInputCursor) +
          '0' +
          // @ts-ignore
          inputValue.substring(currentInputCursor + 1);
        inputCtr.val(newValue);
        document
          .getElementById(inputCtr[0].id)
          // @ts-ignore
          ?.setSelectionRange(currentInputCursor + 1, currentInputCursor + 1);
        event.preventDefault();
        logger.info({
          fn: customizeCurrencyInput,
          message: 'DELETE ACTION: Decimal place value updated',
          data: { inputValue, newValue },
        });
        return;
      }
    }

    // backspace
    if (pressedKeyCode === 8) {
      // @ts-ignore
      const charToDelete = inputValue.charAt(currentInputCursor - 1);

      // if backspace pressed behind a decimal point, just move cursor over 1 space to left
      if (charToDelete === '.' || charToDelete === ',') {
        document
          .getElementById(inputCtr[0].id)
          // @ts-ignore
          ?.setSelectionRange(currentInputCursor - 1, currentInputCursor - 1);
        event.preventDefault();
        return;
      }

      // pressing backspace on any number values after the decimal place should set them to zero
      // and move cursor over 1 position to the left
      // @ts-ignore
      if (currentInputCursor >= inputValue.length - 2) {
        const newValue =
          // @ts-ignore
          inputValue.substring(0, currentInputCursor - 1) +
          '0' +
          // @ts-ignore
          inputValue.substring(currentInputCursor);
        inputCtr.val(newValue);
        document
          .getElementById(inputCtr[0].id)
          // @ts-ignore
          ?.setSelectionRange(currentInputCursor - 1, currentInputCursor - 1);
        event.preventDefault();
        return;
      }
    }
  });

  inputCtr.on('focusin', function (event) {
    $(this).data('val', $(this).val());
  });

  inputCtr.on('input', function (event) {
    handleNewValueEntered($(this), skipCalculatingBudget);
  });

  inputCtr.on('keypress', function (event) {
    let pressedKeyCode = event.which; // pressed key on the keyboard.

    if (
      (pressedKeyCode >= 48 && pressedKeyCode <= 57) || // key 0's code: 48 |Key 1's code: 49 | key 9's code: 57
      (pressedKeyCode === 45 && allowNegatives) // negative value is allowed
    ) {
      let inputValue = inputCtr.val();

      // @ts-ignore
      const isNegative = inputValue.includes('-');

      let currentInputCursor = document.getElementById(
        inputCtr[0].id
        // @ts-ignore
      )?.selectionStart;

      if (
        pressedKeyCode >= 49 &&
        pressedKeyCode <= 57 &&
        inputValue === '0.00' &&
        currentInputCursor === 0
      ) {
        let newVal = inputValue.split('');
        newVal[0] = String.fromCharCode(pressedKeyCode);
        // @ts-ignore
        newVal = newVal.join('');
        inputCtr.val(newVal);
        document
          .getElementById(inputCtr[0].id)
          // @ts-ignore
          ?.setSelectionRange(currentInputCursor + 1, currentInputCursor + 1);
        event.preventDefault();
        return;
      }

      if (
        // @ts-ignore
        ((inputValue.length > 0 && !isNegative) ||
          // @ts-ignore
          (inputValue.length > 1 && isNegative)) &&
        // @ts-ignore
        inputValue.length === currentInputCursor
      ) {
        event.preventDefault();
        return;
      }

      if (pressedKeyCode === 45 && allowNegatives) {
        // @ts-ignore
        if (currentInputCursor !== 0 || inputValue.includes('-')) {
          event.preventDefault();
          return;
        }
        if (currentInputCursor === 0) {
          // @ts-ignore
          let value = parseFloat(inputValue.replace(/,/g, ''));
          if (value && value != 0) {
            inputCtr.val(`-${value.toFixed(2)}`);
            // @ts-ignore
            document.getElementById(inputCtr[0].id).setSelectionRange(0, 0);
            handleNewValueEntered(inputCtr, skipCalculatingBudget);
            event.preventDefault();
          } else if (inputValue == '' || inputValue === '0.00') {
            inputCtr.val('-');
          }
        }
        event.preventDefault();
        return;
      }

      if (limitInputValue) {
        // @ts-ignore
        let value = parseFloat(inputValue.replace(/,/g, ''));
        let limitValue = parseFloat(limitInputValue.replace(/,/g, ''));
        if (isNaN(value)) value = 0.0;

        if (value > limitValue) {
          inputCtr.val(limitInputValue);
        }
      }

      let totalMaxDigits = maxDigits;
      let relativeCursorPosition = currentInputCursor;
      // @ts-ignore
      let relativeLength = inputValue.length;
      if (isNegative) {
        totalMaxDigits += 1;
        relativeCursorPosition -= 1;
        relativeLength -= 1;
      }

      if (
        currentInputCursor > 0 &&
        // @ts-ignore
        inputValue.length - 2 > 0 &&
        // @ts-ignore
        currentInputCursor >= inputValue.length - 2 // || adding number after decimal place
        /*             inputValue.length <= totalMaxDigits */
      ) {
        logger.info({
          fn: customizeCurrencyInput,
          message: 'KEYDOWN ACTION: Decimal input detected',
          data: { inputValue },
        });
        // @ts-ignore
        let newVal = inputValue.split('');
        newVal[currentInputCursor] = String.fromCharCode(pressedKeyCode);
        newVal = newVal.join('');
        inputCtr.val(newVal);
        document
          .getElementById(inputCtr[0].id)
          // @ts-ignore
          ?.setSelectionRange(currentInputCursor + 1, currentInputCursor + 1);
        // if (inputValue == "0.00") {
        //   inputCtr.val(""); // Solve issue when entering the 1st number before '0.00'
        // }
        event.preventDefault();
        event.stopImmediatePropagation();
        logger.info({
          fn: customizeCurrencyInput,
          message: 'KEYDOWN ACTION: Decimal input detected... set new value',
          data: { newVal },
        });
        return;
      } // Only allow max 9,999,999.99

      // @ts-ignore
      if (inputValue.length <= totalMaxDigits) {
        return;
      }

      /*           if (inputValue == "-0.00") {
                  inputCtr.val("0.00");
                } */
    }
    event.preventDefault();
  });

  // if (emptyInitialValue && inputCtr.val() === "0.00") {
  //   inputCtr.val("");
  // }
}

function handleNewValueEntered(inputCtr, skipCalculatingBudget = false) {
  let newAmount = inputCtr.val();

  const isNegative = newAmount.includes('-');

  let cleanDecimalValue = newAmount
    .replace(/,/g, '')
    .replace('$', '')
    .replaceAll('-', '');

  if (isNaN(cleanDecimalValue)) cleanDecimalValue = 0.0;
  let newAmountWithCurrencyFormat = CURRENCY_FORMAT.format(cleanDecimalValue);

  if (newAmountWithCurrencyFormat) {
    logger.info({
      fn: handleNewValueEntered,
      message: `newAmountWithCurrencyFormat: ${newAmountWithCurrencyFormat}`,
    });

    let currentInputCursor = document.getElementById(
      inputCtr[0].id
      // @ts-ignore
    ).selectionStart;

    const newValue = newAmountWithCurrencyFormat.replace('CA$', '');

    inputCtr.val(`${isNegative ? '-' : ''}${newValue}`);

    if (!skipCalculatingBudget) {
      calculateEstimatedActivityBudget();
    }
    let isAddition = false;

    if (newAmount.length > inputCtr.data('val').length) {
      isAddition = true;
    }
    let prevNumberOfCommas = (inputCtr.data('val').match(/,/g) || []).length;
    let newNumberOfCommas = (inputCtr.val().match(/,/g) || []).length;

    if (newNumberOfCommas !== prevNumberOfCommas) {
      if (isAddition) {
        currentInputCursor++; // fixed issue when the current input cursor jump back
      } else {
        if (currentInputCursor - 1 >= 0) {
          currentInputCursor--;
        } else {
          currentInputCursor = 0;
        }
      }
    }
    document
      .getElementById(inputCtr[0].id)
      // @ts-ignore
      .setSelectionRange(currentInputCursor, currentInputCursor);
  }

  inputCtr.data('val', inputCtr.val());
}
