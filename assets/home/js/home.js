if (window.jQuery) {
  (function ($) {
    $(document).ready(function () {
      updateBceidLoginUrls();
    });

    this.updateElementUrl = function (element, newUrl) {
      if (!element) return;
      $(element).attr("href", newUrl);
      $(element).attr("value", newUrl);
    };

    this.updateBceidLoginUrls = function () {
      const bceidBasicUrlElement = document.querySelector("#bceid-basic-link");
      const bceidBusinessUrlElement = document.querySelector(
        "#bceid-business-link"
      );

      const DEV_URL = "https://af-pods-dev.powerappsportals.com";
      const TEST_URL = "https://af-pods-test.powerappsportals.com";
      const PROD_URL = "https://af-pods.powerappsportals.com";

      const DEV_BCEID_LOGIN_URL = (type) =>
        `https://www.development.bceid.ca/os/?3604&SkipTo=${type}`;
      const TEST_BCEID_LOGIN_URL = (type) =>
        `https://www.test.bceid.ca/os/?10285&SkipTo=${type}`;
      const PROD_BCEID_LOGIN_URL = (type) =>
        `https://www.bceid.ca/os/?9649&SkipTo=${type}`;

      const origin = window.location.origin;

      if (origin === DEV_URL) {
        updateElementUrl(bceidBasicUrlElement, DEV_BCEID_LOGIN_URL("Basic"));
        updateElementUrl(
          bceidBusinessUrlElement,
          DEV_BCEID_LOGIN_URL("Business")
        );
      } else if (origin === TEST_URL) {
        updateElementUrl(bceidBasicUrlElement, TEST_BCEID_LOGIN_URL("Basic"));
        updateElementUrl(
          bceidBusinessUrlElement,
          TEST_BCEID_LOGIN_URL("Business")
        );
      } else if (origin === PROD_URL) {
        updateElementUrl(bceidBasicUrlElement, PROD_BCEID_LOGIN_URL("Basic"));
        updateElementUrl(
          bceidBusinessUrlElement,
          PROD_BCEID_LOGIN_URL("Business")
        );
      }
    };
  })(window.jQuery);
}
