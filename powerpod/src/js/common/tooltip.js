import { HtmlElementType } from './constants.js';
import { Logger } from './logger.js';

const logger = Logger('common/tooltip');

export function setupTooltip(field) {
  const { name, tooltipText, tooltipTargetElementId, elementType } = field;

  if (tooltipText) {
    let tooltipTargetElement = $(`#${tooltipTargetElementId ?? name}`);

    if (!tooltipTargetElement) {
      logger.error({
        fn: setupTooltip,
        message: 'Could not find tooltipTargetElement',
        data: { field },
      });
    }

    // DatePicker Tooltip doesn't work unless we target parentNode (control div)
    if (elementType === HtmlElementType.DatePicker) {
      tooltipTargetElement = tooltipTargetElement.parent();
    }

    logger.info({
      fn: setupTooltip,
      message: `Start configuring tooltip for fieldName: ${name}`,
      data: { field, tooltipTargetElement },
    });

    tooltipTargetElement.attr('data-content', tooltipText);
    tooltipTargetElement.attr('data-placement', 'bottom');
    tooltipTargetElement.attr('data-html', 'true');
    tooltipTargetElement.attr('data-trigger', 'hover');
    tooltipTargetElement.attr('data-original-title', '');

    tooltipTargetElement
      // @ts-ignore
      .popover({
        trigger: 'manual',
        html: true,
        animation: false,
      })
      .on('mouseenter', function () {
        var _this = this;
        // @ts-ignore
        $(this).popover('show');
        $('.popover').on('mouseleave', function () {
          // @ts-ignore
          $(_this).popover('hide');
        });
      })
      .on('mouseleave', function () {
        var _this = this;
        setTimeout(function () {
          if (!$('.popover:hover').length) {
            // @ts-ignore
            $(_this).popover('hide');
          }
        }, 300);
      });
  }
}
