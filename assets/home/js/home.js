if (window.jQuery) {
  (function ($) {
    $(document).ready(function () {
      updateBceidLoginUrls();

      // displayWarningForOldBrowser();
    });

    this.displayWarningForOldBrowser = function () {
      const browserInfo = detectBrowserInfo()
      console.log(`browserInfo: ${JSON.stringify(browserInfo)}`)
      
      if (!browserInfo) return
      let isNonSupportedBrowser = false
      if (browserInfo.name == "Chrome") {
        isNonSupportedBrowser = browserInfo.majorVersion < 122
      }
      else if (browserInfo.name == "Edge") {
        isNonSupportedBrowser = browserInfo.majorVersion < 121
      }
      else if (browserInfo.name == "Firefox") {
        isNonSupportedBrowser = browserInfo.majorVersion < 123
      }
      else if (browserInfo.name == "Opera") {
        isNonSupportedBrowser = browserInfo.majorVersion < 106
      }
      else if (browserInfo.name == "Safari") {
        isNonSupportedBrowser = browserInfo.majorVersion < 17
      }

      if (isNonSupportedBrowser) {
        console.error('This browser version is NOT supported')
        $('#oldBrowserAlert').show()
      }
      else {
        $('#oldBrowserAlert').hide()
      }
    };

    this.detectBrowserInfo = function () {
      let browserInfo = { 
        name : '',
        version : '',
        majorVersion : 999999
      }
      const browserAgent = navigator.userAgent;
      var Offset, OffsetVersion, ix;
      
      if ((OffsetVersion = browserAgent.indexOf("Edg/")) != -1) { 
        browserInfo.name = "Edge"; 
        browserInfo.version = browserAgent.substring(OffsetVersion + 7); 
      }
      else if ((OffsetVersion = browserAgent.indexOf("OPR/")) != -1) { 
        browserInfo.name = "Opera"; 
        browserInfo.version = browserAgent.substring(OffsetVersion + 7); 
      }
      else if ((OffsetVersion = browserAgent.indexOf("Chrome")) != -1) { 
        browserInfo.name = "Chrome"; 
        browserInfo.version = browserAgent.substring(OffsetVersion + 7); 
      }  
      else if ((OffsetVersion = browserAgent.indexOf("MSIE")) != -1) { 
        browserInfo.name = "Microsoft Internet Explorer"; 
        browserInfo.version = browserAgent.substring(OffsetVersion + 5); 
      } 
      else if ((OffsetVersion = browserAgent.indexOf("Firefox")) != -1) { 
        browserInfo.name = "Firefox"; 
      } 
      else if ((OffsetVersion = browserAgent.indexOf("Safari")) != -1) { 
        browserInfo.name = "Safari"; 
        browserInfo.version = browserAgent.substring(OffsetVersion + 7); 
          if ((OffsetVersion = browserAgent.indexOf("Version")) != -1) 
          browserInfo.version = browserAgent.substring(OffsetVersion + 8); 
      } 
      // For other browser "name/version" is at the end of userAgent  
      else if ((Offset = browserAgent.lastIndexOf(' ') + 1) < 
          (OffsetVersion = browserAgent.lastIndexOf('/'))) { 
          browserInfo.name = browserAgent.substring(Offset, OffsetVersion); 
          browserInfo.version = browserAgent.substring(OffsetVersion + 1); 
      } 

      // Trimming the fullVersion string at  
      // semicolon/space if present  
      if ((ix = browserInfo.version.indexOf(";")) != -1) 
        browserInfo.version = browserInfo.version.substring(0, ix); 
      if ((ix = browserInfo.version.indexOf(" ")) != -1) 
        browserInfo.version = browserInfo.version.substring(0, ix); 
        
      browserInfo.majorVersion = parseInt('' + browserInfo.version, 10);

      return browserInfo
    };

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
