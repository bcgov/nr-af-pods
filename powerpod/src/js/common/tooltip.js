export function setupTooltip(field) {
  const { name, tooltipText, tooltipTargetElementId } = field;

  if (tooltipText) {
    const tooltipTargetElement = $(`#${tooltipTargetElementId ?? name}`);
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
