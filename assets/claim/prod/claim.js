if (window.jQuery) {
  (function ($) {
    "use strict";

    var YES_VALUE = "255550000",
      NO_VALUE = "255550001",
      OTHER_VALUE = "255550010",
      GROUP_APPLICATION_VALUE = "255550001",
      SECTOR_WIDE_ID_VALUE = "6ce2584f-4740-ee11-be6e-000d3af3ac95",
      HtmlElementTypeEnum = {
        Input: "Input",
        FileInput: "FileInput",
        SingleOptionSet: "SingleOptionSet",
        MultiOptionSet: "MultiOptionSet",
        DropdownSelect: "DropdownSelect",
        DatePicker: "DatePicker",
      },
      FormStepEnum = {
        ClaimInfoStep: "ClaimInfoStep",
        ProjectIndicatorsStep: "ProjectIndicatorsStep",
        DocumentsStep: "DocumentsStep",
        ConsentStep: "ConsentStep",
        UnknownStep: "UnknownStep",
      };

    function getCurrentStep() {
      let isClaimInfoStep = $("[data-name='claimInfoTab']").length > 0;
      if (isClaimInfoStep) return FormStepEnum.ClaimInfoStep;

      let isProjectIndicatorsStep =
        $("[data-name='projectIndicatorsTab']").length > 0;
      if (isProjectIndicatorsStep) return FormStepEnum.ProjectIndicatorsStep;

      let isDocumentsStep = $("[data-name='documentsTab']").length > 0;
      if (isDocumentsStep) return FormStepEnum.DocumentsStep;

      let isConsentStep = $("[data-name='consentTab']").length > 0;
      if (isConsentStep) return FormStepEnum.ConsentStep;

      return FormStepEnum.UnknownStep;
    }

    function getProgramId() {
      var programId = $("#quartech_program").val(),
        params = new URLSearchParams(document.location.search),
        programIdParam = params.get("programid");

      if (!programIdParam) {
        return programId;
      }

      if (programId && programIdParam && programId != programIdParam) {
        let newUrl = document.location.href.replace(programIdParam, programId);
        location.replace(newUrl);
        return programId;
      } else {
        return programIdParam;
      }
    }

    function updatePageForSelectedProgram() {
      var programid = getProgramId();

      console.debug(
        `Retrieving Program data for the selected programid querystring: ${programid}`
      );

      $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        datatype: "json",
        url: `/_api/msgov_programs(${programid})?$select=msgov_programid, msgov_programname, quartech_applicantportalprogramname, quartech_claimformheaderhtmlcontent, quartech_applicantportalclaimformjson, quartech_applicantportalprogramstreamjsonconfig, quartech_portalapplicationpagetitle, quartech_portalapplicationpagesubtitle, quartech_portalapplicationpagedescription, quartech_programabbreviation, quartech_programemailaddress, quartech_portalappactivityinfohiddenfields, quartech_portalappprojectdeschiddenfields, quartech_portalappfieldsdisplaynamesmapping, quartech_typesofbusinesstodisplay, quartech_activitiestypestodisplay&$expand=quartech_ApplicantPortalConfig($select=quartech_name,quartech_configdata)`,
        beforeSend: function (XMLHttpRequest) {
          XMLHttpRequest.setRequestHeader("Accept", "application/json");
          XMLHttpRequest.setRequestHeader("OData-MaxVersion", "4.0");
          XMLHttpRequest.setRequestHeader("OData-Version", "4.0");
          XMLHttpRequest.setRequestHeader(
            "Prefer",
            'odata.include-annotations="*"'
          );

          // clear any cached data from previous page loads
          localStorage.clear();
        },
        async: false,
        success: function (programData, textStatus, xhr) {
          if (programData) {
            console.debug(
              `Retrieved Program data:${JSON.stringify(
                programData
              )}. Update application page with the program data.`
            );
            localStorage.setItem("programData", JSON.stringify(programData));
            populateContentForSelectedProgramStream(programData);
          }
        },
        error: function (xhr, textStatus, errorThrown) {
          console.error(xhr?.responseText);
        },
      });
    }

    function populateContentForSelectedProgramStream(programData) {
      // cleanup unnecessary divs
      document
        .querySelector("#page-title-container > p:nth-child(5)")
        ?.remove();
      document.querySelector("#page-title")?.remove();
      document.querySelector("#page-subtitle")?.remove();
      document.querySelector("#page-title-container > p.smallText")?.remove();
      document.querySelector("#page-description")?.remove();

      // Populate the Page Title, Sub-Title and Description
      $("#page-title-container").prepend(
        programData.quartech_claimformheaderhtmlcontent
      );

      updateClaimFormStepForSelectedProgram(programData);
    }

    function updateClaimFormStepForSelectedProgram(programData) {
      const currentStep = getCurrentStep();
      switch (currentStep) {
        case FormStepEnum.ClaimInfoStep:
          customizeClaimInfoStep();
          break;
        case FormStepEnum.ProjectIndicatorsStep:
          customizeProjectIndicatorStep(currentStep);
          break;
        case FormStepEnum.DocumentsStep:
          customizeDocumentsStep(currentStep);
          break;
        case FormStepEnum.ConsentStep:
          customizeDeclarationConsentStep(programData);
          break;
        default:
          break;
      }
    }

    function customizeBusinessPlanDocumentsQuestions() {
      const iframe = document.querySelector(
        'fieldset[aria-label="Coding Section (DO NOT REMOVE)"] iframe'
      );
      const innerDoc = iframe?.contentDocument
        ? iframe.contentDocument
        : iframe.contentWindow.document;
      const completingCategoryElement = innerDoc?.getElementById(
        "quartech_completingcategory"
      );
      if (!!completingCategoryElement) {
        if (completingCategoryElement?.value === "255550000") {
          hideQuestion('quartech_invoices');
          hideQuestion('quartech_proofofpayment');
        }
      }
    }

    function customizeDocumentsStep(currentStep) {
      setStepRequiredFields(currentStep);

      const programAbbreviation = getProgramAbbreviation();

      if (programAbbreviation === "NEFBA") {
        observeIframeChanges(
          customizeBusinessPlanDocumentsQuestions,
          null,
          'quartech_completingcategory'
        )
      }

      if (
        programAbbreviation.includes("ABPP") ||
        programAbbreviation === "NEFBA"
      ) {
        if (!document.querySelector("#supportingDocumentationNote")) {
          const supportingDocumentationNoteHtmlContent = `
          <div id="supportingDocumentationNote" style="padding-bottom: 20px;">
            Please Choose or Drag & Drop files to the grey box below to upload the following documents as attachments (as applicable)
          </div>`;

          $('fieldset[aria-label="Supporting Documents"] > legend').after(
            supportingDocumentationNoteHtmlContent
          );
        }

        if (!document.querySelector("#beforeContinuingNote")) {
          const beforeContinuingNoteHtmlContent = `
            <div id="beforeContinuingNote" style="padding-bottom: 20px;">
              Please ensure you have the correct files before clicking “Next”. If you move to the next stage of the Claim for Payment form you can no longer delete uploaded files. However, you can always add new files.<br />
              <br />
              If you have moved to the next stage and then wish to change an uploaded file, simply return to the document submission and upload the replacement file as an additional file. Give the file a name with an indication that it is a replacement (e.g. "Budget NEW.xls").
            </div>
          `;

          $("#EntityFormView").after(beforeContinuingNoteHtmlContent);
        }
      }
    }

    function customizeProjectIndicatorStep(currentStep) {
      initInputMasking();
      setStepRequiredFields(currentStep);

      const programAbbreviation = getProgramAbbreviation();

      if (
        programAbbreviation.includes("ABPP") ||
        programAbbreviation === "NEFBA"
      ) {
        initOnChange_DependentRequiredField({
          dependentOnValue: YES_VALUE,
          dependentOnElementTag: "quartech_adoptedprojectresults",
          requiredFieldTag: "quartech_adoptednumber",
        });
        initOnChange_DependentRequiredField({
          dependentOnValue: YES_VALUE,
          dependentOnElementTag:
            "quartech_environmentallybeneficialadoptedresults",
          requiredFieldTag: "quartech_environmentallybeneficialadoptednumber",
        });
      }

      if (programAbbreviation === "ABPP2") {
        observeIframeChanges(
          customizeSingleOrGroupApplicantQuestions,
          "quartech_groupprojectsupportingsectorcapacitybuilding",
          "quartech_singleorgroupapplication"
        );
      }
    }

    function observeIframeChanges(
      funcToExecute,
      fieldNameToPass,
      fieldNameToObserve
    ) {
      const iframe = document.querySelector(
        'fieldset[aria-label="Coding Section (DO NOT REMOVE)"] iframe'
      );
      // wait for iframe to load / watch for changes
      if (iframe?.nodeType) {
        observeChanges($(iframe)[0], function () {
          funcToExecute(fieldNameToPass);
          const iframe = document.querySelector(
            'fieldset[aria-label="Coding Section (DO NOT REMOVE)"] iframe'
          );
          const innerDoc = iframe?.contentDocument
            ? iframe?.contentDocument
            : iframe?.contentWindow.document;
          if (innerDoc?.nodeType) {
            observeChanges(innerDoc, function () {
              const iframe = document.querySelector(
                'fieldset[aria-label="Coding Section (DO NOT REMOVE)"] iframe'
              );
              const innerDoc = iframe.contentDocument
                ? iframe.contentDocument
                : iframe.contentWindow.document;
              funcToExecute(fieldNameToPass);
              const element =
                innerDoc?.getElementById(fieldNameToObserve);
              if (element?.nodeType) {
                observeChanges(element, function () {
                  funcToExecute(fieldNameToPass);
                });
              }
            });
          }
        });
      }
    }

    function customizeSingleOrGroupApplicantQuestions(fieldToHide) {
      const iframe = document.querySelector(
        'fieldset[aria-label="Coding Section (DO NOT REMOVE)"] iframe'
      );
      const innerDoc = iframe?.contentDocument
        ? iframe.contentDocument
        : iframe.contentWindow.document;
      const singleOrGroupApplicationElement = innerDoc?.getElementById(
        "quartech_singleorgroupapplication"
      );
      if (!!singleOrGroupApplicationElement) {
        if (
          singleOrGroupApplicationElement?.value !== GROUP_APPLICATION_VALUE
        ) {
          hideQuestion(fieldToHide);
        }
      }
    }

    function customizeBusinessPlanDependentQuestions() {
      if (document.querySelector("#claimInformationNote")) return;
      const iframe = document.querySelector(
        'fieldset[aria-label="Coding Section (DO NOT REMOVE)"] iframe'
      );
      const innerDoc = iframe?.contentDocument
        ? iframe.contentDocument
        : iframe.contentWindow.document;
      const completingCategoryElement = innerDoc?.getElementById(
        "quartech_completingcategory"
      );
      if (!!completingCategoryElement) {
        if (completingCategoryElement?.value === "255550000") {
          if (!document.querySelector("#claimInformationNote")) {
            const claimInformationNoteHtmlContent = `<div id="claimInformationNote" style="padding-bottom: 20px;">
            The Reimbursement Amount Requested should be the same as your approved Authorization Letter.</div>`;

            $('fieldset[aria-label="Claim Information"] > legend').after(
              claimInformationNoteHtmlContent
            );
          }
        } else if (completingCategoryElement?.value === "255550001") {
          if (!document.querySelector("#claimInformationNote")) {
            const claimInformationNoteHtmlContent = `<div id="claimInformationNote" style="padding-bottom: 20px;">
            The Reimbursement Amount Requested should be the same as your approved Authorization Letter.<br />
            <br />
            The Program requires paid invoice(s) from the Consultant and proof of payment such as a cancelled cheque(s) or credit card transaction receipt(s).</div>`;

            $('fieldset[aria-label="Claim Information"] > legend').after(
              claimInformationNoteHtmlContent
            );
          }
        }
      }
    }

    function customizeClaimInfoStep() {
      setStepRequiredFields("ClaimInfoStep");

      const programAbbreviation = getProgramAbbreviation();

      // START step specific functions
      function addRequestedClaimAmountNote() {
        if (!document.querySelector("#requestedClaimAmountNote")) {
          const requestedClaimAmountNoteHtmlContent = `<div id="requestedClaimAmountNote" style="padding-bottom: 20px;">
            The Program covers costs up to the maximum amount indicated in your Approval Letter.<br />
            Any additional fees invoiced will not be covered by the B.C. Ministry of Agriculture and Food
          </div>`;

          $("#quartech_totalfees")
            .closest("tr")
            .before(requestedClaimAmountNoteHtmlContent);
        }
      }

      function addClaimAmountCaveatNote() {
        if ($("#quartech_interimorfinalpayment").val() === "255550000") {
          if (!document.querySelector("#claimAmountCaveatNote")) {
            const claimAmountCaveatNoteHtmlContent = `
              <div id='claimAmountCaveatNote' style="padding-bottom: 20px;">
                The requested amount must fall within the range of $500.00 to the authorized amount specified on the Authorization Letter.
              </div>
            `;

            $("#requestedClaimAmountNote").after(
              claimAmountCaveatNoteHtmlContent
            );
          } else {
            $("#claimAmountCaveatNote")?.css({ display: "" });
          }
        } else {
          $("#claimAmountCaveatNote")?.css({ display: "none" });
        }
      }
      // END step specific functions

      if (programAbbreviation === "NEFBA") {
        initOnChange_DependentRequiredField({
          dependentOnValue: NO_VALUE,
          dependentOnElementTag: "quartech_applicantinformationconfirmation",
          requiredFieldTag: "quartech_applicantinformationcorrections",
        });

        addRequestedClaimAmountNote();

        observeIframeChanges(
          customizeBusinessPlanDependentQuestions,
          null,
          "quartech_completingcategory"
        );
      }

      if (programAbbreviation.includes("ABPP")) {
        initOnChange_DependentRequiredField({
          dependentOnValue: NO_VALUE,
          dependentOnElementTag: "quartech_applicantinformationconfirmation",
          requiredFieldTag: "quartech_applicantinformationcorrections",
        });

        const iframe = document.querySelector(
          'fieldset[aria-label="Coding Section (DO NOT REMOVE)"] iframe'
        );
        const innerDoc = iframe.contentDocument
          ? iframe.contentDocument
          : iframe.contentWindow.document;
        const singleOrGroupApplicationElement = innerDoc.getElementById(
          "quartech_singleorgroupapplication"
        );

        if (!!singleOrGroupApplicationElement) {
          if (
            singleOrGroupApplicationElement?.value !== GROUP_APPLICATION_VALUE
          ) {
            hideQuestion("quartech_claimcoapplicants");
          }
        }

        addRequestedClaimAmountNote();

        addClaimAmountCaveatNote();
        $('select[id*="quartech_interimorfinalpayment"]').on(
          "change",
          function () {
            addClaimAmountCaveatNote();
          }
        );
      }

      if (programAbbreviation === "ABPP1") {
        if (!document.querySelector("#claimInformationNote")) {
          const claimInformationNoteHtmlContent = `<div id="claimInformationNote" style="padding-bottom: 20px;">
            The Program requires paid invoice(s) from the Learning Provider(s), and proof of payment such as a cancelled cheque(s) or credit card transaction receipt(s).<br />
            <br />
            The Reimbursement Amount Requested for specialized training  should be the same as your approved Learning Action Plan  and Authorization Letter.<br />
            <br />
            Reimbursement Amount Requested includes registration fees (such as training, courses, registration, tuition) GST and total.</div>`;

          $('fieldset[aria-label="Claim Information"] > legend').after(
            claimInformationNoteHtmlContent
          );
        }
      } else if (programAbbreviation === "ABPP2") {
        if (!document.querySelector("#claimInformationNote")) {
          const claimInformationNoteHtmlContent = `<div id="claimInformationNote" style="padding-bottom: 20px;">
            The Program requires paid invoice(s) from the Consultant and proof of payment such as a cancelled cheque(s) or credit card transaction receipt(s).<br />
            <br />
            The Reimbursement Amount Requested should be the same as your approved Authorization Letter.<br />
            <br />
            Reimbursement Amount Requested includes Consultant Fee, GST, and total.</div>`;

          $('fieldset[aria-label="Claim Information"] > legend').after(
            claimInformationNoteHtmlContent
          );
        }

        observeChanges(
          $("#quartech_requestedinterimpaymentamount")[0],
          customizeInterimPaymentAmountField()
        );

        observeIframeChanges(
          customizeSingleOrGroupApplicantQuestions,
          "quartech_claimcoapplicants",
          "quartech_singleorgroupapplication"
        );
      }
    }

    function customizeInterimPaymentAmountField() {
      const iterimPaymentAmount = $(
        "#quartech_requestedinterimpaymentamount"
      )?.val();
      let value = parseFloat(iterimPaymentAmount.replace(/,/g, ""));
      if (isNaN(value)) value = 0.0;

      if (value > 0) {
        setQuestionToReadOnly("quartech_requestedinterimpaymentamount");
        setQuestionToReadOnly("quartech_interimorfinalpayment");
      } else {
        hideQuestion("quartech_requestedinterimpaymentamount");
      }
    }

    function customizeDeclarationConsentStep(programData) {
      hideFieldsAndSections(false);
      addConsent(programData?.quartech_applicantportalprogramname);
      hideLoadingElement();
    }

    function addConsent(programName) {
      const programNameTag = "%%ProgramName%%";

      let htmlConsent = `
        <div style='font-style: italic;'>
          <span>BY SUBMITTING THIS CLAIM FOR PAYMENT FORM TO %%ProgramName%% (the "Program"), I:</span>
          <u style='text-decoration:none;'>
              <li>represent that I am the applicant or the fully authorized signatory of the applicant;</li>
              <li>declare that I have/the applicant has not knowingly submitted false or misleading information and that the information provided in this claim for payment form and attachments is true and correct in every respect to the best of my/the applicant's knowledge;</li>
              <li>acknowledge the information provided on this claim for payment and attachments will be used by the Ministry of Agriculture and Food (the "Ministry") to assess the applicant's eligibility for funding from the Program;</li>
              <li>understand that failing to comply with all application requirements may delay the processing of the application or make the applicant ineligible to receive funding under the Program;</li>
              <li>represent that I have/the applicant has read and understood the Program Terms and Conditions and agree(s) to be bound by the Program Terms and Conditions;</li>
              <li>represent that the applicant is in compliance with all Program eligibility requirements as described in the Program Terms and Conditions, and in this document;</li>
              <li>agree to proactively disclose to the Program all other sources of funding the applicant or any partners within the same organization or the same farming or food processing operation receives with respect to the projects funded by this Program, including financial and/or in-kind contributions from federal, provincial, or municipal government;</li>
              <li>understand that the Program covers costs up to the maximum Approved amount. Any additional fees over and above the approved amount are the responsibility of the applicant and will not be covered by the B.C. Ministry of Agriculture and Food.</li>
              <li>acknowledge that the Business Number (GST Number) is collected by the Ministry under the authority of the Income Tax Act for the purpose of reporting income.</li>
          </u>
          <br/>
      </div>`;
      htmlConsent = htmlConsent.replace(programNameTag, programName);

      let consentDiv = document.createElement("div");
      consentDiv.innerHTML = htmlConsent;

      const applicantDeclarationSection = $(
        "[data-name='applicantDeclarationSection']"
      );

      $("[data-name='applicantDeclarationSection']")
        .parent()
        .prepend(consentDiv);
    }

    function hideFieldsAndSections(hidden = true) {
      const selector = 'tr:has([id$="_label"])';
      const fieldRows = document.querySelectorAll(selector);

      fieldRows.forEach((row) => {
        if (hidden) {
          row.style.display = "none";
        } else {
          row.style.display = "";
        }
      });

      const fieldsetsWithAriaLabel = document.querySelectorAll(
        "fieldset[aria-label]"
      );

      fieldsetsWithAriaLabel.forEach((fieldset) => {
        if (hidden) {
          fieldset.style.display = "none";
        } else {
          fieldset.style.display = "";
        }
      });
    }

    $(document).ready(function () {
      hideFieldsAndSections();

      showLoadingElement();

      updatePageForSelectedProgram();

      addNewAppSystemNotice();
    });

    function showLoadingElement() {
      // if loading element exists already, just display it
      if (document.querySelector("#loading-container")) {
        $("#loading-container").css({ display: "" });
        return;
      }

      // if loader is not present, add it
      const loadingElement = `
        <div id="loading-container" class="text-center">
          <div class="loader" id="loader-1"></div>
        </div>`;

      const parentDiv = $("fieldset").parent();

      parentDiv.append(loadingElement);
    }

    function hideLoadingElement() {
      $("#loading-container")?.css({ display: "none" });
    }

    function addValidationCheck(fieldName) {
      $(`input[id*='${fieldName}']`).on("change", function () {
        validateRequiredFields();
      });
    }

    function addNewAppSystemNotice() {
      const newAppSystemNoticeDiv = document.createElement("div");
      newAppSystemNoticeDiv.id = `new_app_system_notice_div`;
      newAppSystemNoticeDiv.style = "float: left;";
      const systemNotice = getConfigDataJson()?.SystemNotice;
      newAppSystemNoticeDiv.innerHTML = systemNotice;

      const actionsDiv = $(`#NextButton`).parent().parent().parent();
      actionsDiv.append(newAppSystemNoticeDiv);
    }

    function addTextAboveField(fieldName, htmlContentToAdd) {
      const fieldLabelDivContainer = $(`#${fieldName}_label`).parent();
      if (!fieldLabelDivContainer) return;

      fieldLabelDivContainer.prepend(htmlContentToAdd);
    }

    function addTextBelowField(fieldName, htmlContentToAdd) {
      const fieldLabelDivContainer = $(`#${fieldName}_label`).parent().parent();
      if (!fieldLabelDivContainer) return;

      fieldLabelDivContainer.append(htmlContentToAdd);
    }

    function setDynamicallyRequiredFields(stepName) {
      // check which fields we are dynamically being required
      const fields = getFieldsBySection(stepName);

      if (!fields) return;

      Object.keys(localStorage)
        .filter((x) => x.startsWith("shouldRequire_"))
        .forEach((x) => {
          const fieldId = x.replace("shouldRequire_", "");
          const fieldDefinition = fields.find(
            (field) => field.name === fieldId
          );
          if (fieldDefinition && fieldDefinition.elementType) {
            setRequiredField(fieldId, fieldDefinition.elementType);
          } else {
            setRequiredField(fieldId);
          }
        });
    }

    function setStepRequiredFields(stepName) {
      const fields = getFieldsBySection(stepName);

      if (!fields) return;

      for (let i = 0; i < fields.length; i++) {
        const {
          name,
          elementType,
          required,
          validation,
          hidden,
          format,
          allowNegatives,
          maxDigits,
          maxLength,
          emptyInitialValue,
          label,
          type,
          tooltipText,
          skipCalculatingBudget = undefined,
          hideLabel,
          readOnly,
          doNotBlank = false,
          fileTypes,
        } = fields[i];
        if (type === "SectionTitle" && hidden) {
          const sectionElement = $(`fieldset[aria-label="${name}"]`);
          if (sectionElement) {
            sectionElement.css("display", "none");
          }
          // continuing for type SectionTitle because nothing else is supported for this field type
          continue;
        }
        if (tooltipText) {
          let namePostfix = "";
          if (elementType) {
            namePostfix = "_datepicker_description";
          }
          $(`#${name}${namePostfix}`).attr("data-content", tooltipText);
          $(`#${name}${namePostfix}`).attr("data-placement", "bottom");
          $(`#${name}${namePostfix}`).attr("data-html", "true");
          $(`#${name}${namePostfix}`).attr("data-trigger", "hover");
          $(`#${name}${namePostfix}`).attr("data-original-title", "");

          $(`#${name}${namePostfix}`)
            .popover({
              trigger: "manual",
              html: true,
              animation: false,
              placement: "bottom",
            })
            .on("mouseenter", function () {
              var _this = this;
              $(this).popover("show");
              $(".popover").on("mouseleave", function () {
                $(_this).popover("hide");
              });
            })
            .on("mouseleave", function () {
              var _this = this;
              setTimeout(function () {
                if (!$(".popover:hover").length) {
                  $(_this).popover("hide");
                }
              }, 300);
            });
        }
        if (label) {
          const obj = $(`#${name}_label`).text(label);
          obj.html(obj.html().replace(/\n/g, "<br/>"));
          validateRequiredFields();
        }
        if (hideLabel) {
          $(`#${name}_label`).css("display", "none");
        }
        if (required) {
          if (elementType) {
            setRequiredField(name, elementType);
          } else {
            setRequiredField(name);
          }
        }
        if (validation) {
          addValidationCheck(name);
        }
        if (hidden) {
          hideFieldByFieldName(name, validateStepFields(stepName), doNotBlank);
        }
        // max characters
        if (maxLength) {
          setInputMaxLength(name, maxLength);
        }
        if (readOnly) {
          setQuestionToReadOnly(name);
        }
        if (format === "email") {
          validateEmailAddressField(name);
        } else if (format === "currency") {
          customizeCurrencyInput({
            inputId: name,
            ...(skipCalculatingBudget !== undefined
              ? { skipCalculatingBudget }
              : { skipCalculatingBudget: true }),
            ...(maxDigits ? { maxDigits } : { maxDigits: 13 }),
            ...(emptyInitialValue && { emptyInitialValue }),
            ...(allowNegatives && { allowNegatives }),
          });
        } else if (format === "percentage") {
          customizeCurrencyInput({
            inputId: name,
            skipCalculatingBudget: true,
            maxDigits: 5,
            limitInputValue: "100.00",
            hideDollarSign: true,
          });
        } else if (format === "number") {
          $(`#${name}`).attr("type", "number");
        }

        if (elementType === HtmlElementTypeEnum.FileInput) {
          let defaultFileTypes =
            ".csv,.doc,.docx,.odt,.pdf,.xls,.xlsx,.ods,.gif,.jpeg,.jpg,.png,.svg,.tif";
          $(`#${name}_AttachFile`).attr(
            "accept",
            fileTypes ?? defaultFileTypes
          );
        }
      }

      setDynamicallyRequiredFields(stepName);
    }

    function camelToFlat(camel) {
      const camelCase = camel.replace(/([a-z])([A-Z])/g, "$1 $2").split(" ");

      let flat = "";

      camelCase.forEach((word) => {
        flat = flat + word.charAt(0).toLowerCase() + word.slice(1) + " ";
      });
      return flat;
    }

    function validateStepFields(stepName, returnString) {
      let validationErrorHtml = "";

      const fields = getFieldsBySection(stepName);

      if (!fields) return "";

      for (let i = 0; i < fields.length; i++) {
        const { name, required, elementType, validation } = fields[i];
        if (required) {
          let errorMsg = "";
          if (elementType) {
            errorMsg = validateRequiredField(name, elementType);
          } else {
            errorMsg = validateRequiredField(name);
          }
          validationErrorHtml = validationErrorHtml.concat(errorMsg);
        }
        if (validation?.type === "numeric") {
          const { value, comparison } = validation;
          const errorMsg = validateNumericFieldValue(name, value, comparison);
          validationErrorHtml = validationErrorHtml.concat(errorMsg);
        }
        if (validation?.type === "length") {
          const {
            value,
            comparison,
            forceRequired,
            postfix,
            overrideDisplayValue,
          } = validation;
          const errorMsg = validateFieldLength(
            name,
            value,
            comparison,
            forceRequired,
            postfix,
            overrideDisplayValue
          );
          // Display instant feedback on field input
          if (errorMsg && errorMsg.length > 0) {
            $(`#${name}_error_message`).html(errorMsg);
            $(`#${name}`).on("focusout", function () {
              $(`#${name}_error_message`).css({ display: "" });
              $(`#${name}`).css({ border: "1px solid #e5636c" });
            });
            const fieldLabelText = $(`#${name}_label`).text();
            const errorMsgPrefix = `<span>"${fieldLabelText}"</span>`;
            validationErrorHtml = validationErrorHtml.concat(
              `<div>${errorMsgPrefix}${errorMsg}</div>`
            );
          } else {
            $(`#${name}`).off("focusout");
            $(`#${name}_error_message`).css({ display: "none" });
            $(`#${name}`).css({ border: "" });
          }
        }
      }

      // check which fields we are dynamically requiring validation
      Object.keys(localStorage)
        .filter((x) => x.startsWith("shouldRequire_"))
        .forEach((x) => {
          const fieldId = x.replace("shouldRequire_", "");
          const fieldDefinition = fields.find(
            (field) => field.name === fieldId
          );

          // if the field has already been required via JSON, no need to generate another error msg
          if (fieldDefinition && fieldDefinition.required) return;

          let errorMsg = "";
          if (fieldDefinition && fieldDefinition.elementType) {
            errorMsg = validateRequiredField(
              fieldId,
              fieldDefinition.elementType
            );
          } else {
            errorMsg = validateRequiredField(fieldId);
          }
          validationErrorHtml = validationErrorHtml.concat(errorMsg);
        });

      if (returnString) {
        return validationErrorHtml;
      }
      if (stepName === "ProjectStep") {
        const programAbbreviation = getProgramAbbreviation();
        if (programAbbreviation && programAbbreviation === "NEFBA") {
          const consultantBciaOrCpaErrorMsg =
            validateIsConsultantEitherBciaOrCpa();
          validationErrorHtml = validationErrorHtml.concat(
            consultantBciaOrCpaErrorMsg
          );
        }
      }
      displayValidationErrors(validationErrorHtml);
    }

    function showFieldsetElement(fieldsetName) {
      const sectionElement = $(`fieldset[aria-label="${fieldsetName}"]`);
      if (sectionElement) {
        sectionElement.css({ display: "" });
      }
    }

    function showFieldRow(fieldName) {
      const fieldLabelElement = document.querySelector(`#${fieldName}_label`);
      if (!fieldLabelElement) return;
      const fieldRow = fieldLabelElement.closest("tr");

      if (!fieldRow) return;

      $(fieldRow).css({ display: "" });
    }

    function hideFieldByFieldName(
      fieldName,
      validationFunc,
      doNotBlank = false
    ) {
      const fieldLabelElement = document.querySelector(`#${fieldName}_label`);
      if (!fieldLabelElement) return;
      const fieldRow = fieldLabelElement.closest("tr");

      const fieldInputElement = document.querySelector(`#${fieldName}`);

      if (!fieldRow || !fieldInputElement) return;

      $(fieldRow).css({ display: "none" });
      $(`#${fieldName}_label`).parent().removeClass("required");
      localStorage.removeItem(`shouldRequire_${fieldName}`);
      if (validationFunc) {
        validationFunc();
      }
      $(fieldInputElement).off("change");

      if (!doNotBlank) {
        $(fieldInputElement).val("");
      }
    }

    function getProgramEmailAddress() {
      const programData = localStorage.getItem("programData");
      const programEmailAddress =
        JSON.parse(programData)?.quartech_programemailaddress;
      return programEmailAddress;
    }

    function getProgramAbbreviation() {
      const programData = localStorage.getItem("programData");
      const programAbbreviation =
        JSON.parse(programData)?.quartech_programabbreviation;
      return programAbbreviation;
    }

    function getConfigDataJson() {
      const programData = localStorage.getItem("programData");
      const configDataJSON =
        JSON.parse(programData)?.quartech_applicantportalclaimformjson;
      const podsConfigData = JSON.parse(configDataJSON);
      return podsConfigData;
    }

    function getFieldsBySection(sectionName, forceRefresh = false) {
      let programName = getProgramAbbreviation();

      // load cached results unless forceRefresh flag is passed
      if (!forceRefresh) {
        const savedData = localStorage.getItem(
          `fieldsData-${programName}-${sectionName}`
        );
        if (savedData) {
          return JSON.parse(savedData);
        }
      }

      const fieldsConfigData = getConfigDataJson()?.FieldsConfig;

      if (!fieldsConfigData || !fieldsConfigData.programs) return;

      let fields = [];

      fieldsConfigData?.programs
        .filter((program) => program.name === programName)
        .forEach((program) => {
          if (!program.sections) return;

          const programSection = program?.sections?.find(
            (section) => section?.name === sectionName
          );

          if (!programSection || !programSection.fieldsets) return;

          const sectionFieldsets = programSection.fieldsets;

          sectionFieldsets.forEach((fieldset) => {
            if (!fieldset.name || !fieldset.fields) return;
            const fieldsetName = fieldset.name;
            const fieldsetFields = fieldset.fields;

            // if config exists for a fieldset, unhide it
            showFieldsetElement(fieldsetName);

            fieldsetFields.forEach((field) => {
              // if config exists for a field, unhide it
              showFieldRow(field.name);
              fields.push(field);
            });
          });
        });

      // cache results to avoid future processing for config
      localStorage.setItem(
        `fieldsData-${programName}-${sectionName}`,
        JSON.stringify(fields)
      );

      hideLoadingElement();

      return fields;
    }

    function customizeCurrencyInput({
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
        inputCtr.parent().addClass("input-group");

        let span = document.createElement("span");
        span.id = `${inputId}_span_currency_label`;
        span.innerText = "$";
        span.className = "input-group-addon";
        inputCtr.parent().prepend(span);

        // inputCtr.val("0.00");
      }

      inputCtr.on("keydown", function (event) {
        const inputValue = inputCtr.val();

        let pressedKeyCode = event.which; // pressed key on the keyboard.

        let currentInputCursor = document.getElementById(
          inputCtr[0].id
        ).selectionStart;

        // pressed '.'
        // if pressed next to a decimal point, just move cursor over 1 space to right
        if (pressedKeyCode === 190) {
          const nextChar = inputValue.charAt(currentInputCursor);
          if (nextChar === ".") {
            document
              .getElementById(inputCtr[0].id)
              .setSelectionRange(
                currentInputCursor + 1,
                currentInputCursor + 1
              );
            event.preventDefault();
            return;
          }
        }

        //delete
        if (pressedKeyCode === 46) {
          const charToDelete = inputValue.charAt(currentInputCursor);
          if (charToDelete === "0" && currentInputCursor === 0) {
            document
              .getElementById(inputCtr[0].id)
              .setSelectionRange(
                currentInputCursor + 1,
                currentInputCursor + 1
              );
            event.preventDefault();
            return;
          }

          if (charToDelete === "." || charToDelete === ",") {
            document
              .getElementById(inputCtr[0].id)
              .setSelectionRange(
                currentInputCursor + 1,
                currentInputCursor + 1
              );
            event.preventDefault();
            return;
          }

          let isDecimalPlace = false;
          if (currentInputCursor >= inputValue.length - 2) {
            isDecimalPlace = true;
          }

          if (isDecimalPlace && currentInputCursor !== inputValue.length) {
            const newValue =
              inputValue.substring(0, currentInputCursor) +
              "0" +
              inputValue.substring(currentInputCursor + 1);
            inputCtr.val(newValue);
            document
              .getElementById(inputCtr[0].id)
              .setSelectionRange(
                currentInputCursor + 1,
                currentInputCursor + 1
              );
            event.preventDefault();
            return;
          }
        }

        // backspace
        if (pressedKeyCode === 8) {
          const charToDelete = inputValue.charAt(currentInputCursor - 1);

          // if backspace pressed behind a decimal point, just move cursor over 1 space to left
          if (charToDelete === "." || charToDelete === ",") {
            document
              .getElementById(inputCtr[0].id)
              .setSelectionRange(
                currentInputCursor - 1,
                currentInputCursor - 1
              );
            event.preventDefault();
            return;
          }

          // pressing backspace on any number values after the decimal place should set them to zero
          // and move cursor over 1 position to the left
          if (currentInputCursor >= inputValue.length - 2) {
            const newValue =
              inputValue.substring(0, currentInputCursor - 1) +
              "0" +
              inputValue.substring(currentInputCursor);
            inputCtr.val(newValue);
            document
              .getElementById(inputCtr[0].id)
              .setSelectionRange(
                currentInputCursor - 1,
                currentInputCursor - 1
              );
            event.preventDefault();
            return;
          }
        }
      });

      inputCtr.on("focusin", function (event) {
        $(this).data("val", $(this).val());
      });

      inputCtr.on("input", function (event) {
        handleNewValueEntered($(this), skipCalculatingBudget);
      });

      inputCtr.on("keypress", function (event) {
        let pressedKeyCode = event.which; // pressed key on the keyboard.

        if (
          (pressedKeyCode >= 48 && pressedKeyCode <= 57) || // key 0's code: 48 |Key 1's code: 49 | key 9's code: 57
          (pressedKeyCode === 45 && allowNegatives) // negative value is allowed
        ) {
          let inputValue = inputCtr.val();

          const isNegative = inputValue.includes("-");

          let currentInputCursor = document.getElementById(
            inputCtr[0].id
          ).selectionStart;

          if (
            pressedKeyCode >= 49 &&
            pressedKeyCode <= 57 &&
            inputValue === "0.00" &&
            currentInputCursor === 0
          ) {
            let newVal = inputValue.split("");
            newVal[0] = String.fromCharCode(pressedKeyCode);
            newVal = newVal.join("");
            inputCtr.val(newVal);
            document
              .getElementById(inputCtr[0].id)
              .setSelectionRange(
                currentInputCursor + 1,
                currentInputCursor + 1
              );
            event.preventDefault();
            return;
          }

          if (
            ((inputValue.length > 0 && !isNegative) ||
              (inputValue.length > 1 && isNegative)) &&
            inputValue.length === currentInputCursor
          ) {
            event.preventDefault();
            return;
          }

          if (pressedKeyCode === 45 && allowNegatives) {
            if (currentInputCursor !== 0 || inputValue.includes("-")) {
              event.preventDefault();
              return;
            }
            if (currentInputCursor === 0) {
              let value = parseFloat(inputValue.replace(/,/g, ""));
              if (value && value != 0) {
                inputCtr.val(`-${value.toFixed(2)}`);
                document.getElementById(inputCtr[0].id).setSelectionRange(0, 0);
                handleNewValueEntered(inputCtr, skipCalculatingBudget);
                event.preventDefault();
              } else if (inputValue == "" || inputValue === "0.00") {
                inputCtr.val("-");
              }
            }
            event.preventDefault();
            return;
          }

          if (limitInputValue) {
            let value = parseFloat(inputValue.replace(/,/g, ""));
            let limitValue = parseFloat(limitInputValue.replace(/,/g, ""));
            if (isNaN(value)) value = 0.0;

            if (value > limitValue) {
              inputCtr.val(limitInputValue);
            }
          }

          let totalMaxDigits = maxDigits;
          let relativeCursorPosition = currentInputCursor;
          let relativeLength = inputValue.length;
          if (isNegative) {
            totalMaxDigits += 1;
            relativeCursorPosition -= 1;
            relativeLength -= 1;
          }
          if (
            currentInputCursor > 0 &&
            inputValue.length - 2 > 0 &&
            currentInputCursor >= inputValue.length - 2 // || adding number after decimal place
            /*             inputValue.length <= totalMaxDigits */
          ) {
            let newVal = inputValue.split("");
            newVal[currentInputCursor] = String.fromCharCode(pressedKeyCode);
            newVal = newVal.join("");
            inputCtr.val(newVal);
            document
              .getElementById(inputCtr[0].id)
              .setSelectionRange(
                currentInputCursor + 1,
                currentInputCursor + 1
              );
            // if (inputValue == "0.00") {
            //   inputCtr.val(""); // Solve issue when entering the 1st number before '0.00'
            // }
            event.preventDefault();
            return;
          } // Only allow max 9,999,999.99

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

    const CURRENCY_FORMAT = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "CAD",
      maximumFractionDigits: 2,
    });

    function handleNewValueEntered(inputCtr, skipCalculatingBudget = false) {
      let newAmount = inputCtr.val();

      const isNegative = newAmount.includes("-");

      let cleanDecimalValue = newAmount
        .replace(/,/g, "")
        .replace("$", "")
        .replaceAll("-", "");

      if (isNaN(cleanDecimalValue)) cleanDecimalValue = 0.0;
      let newAmountWithCurrencyFormat =
        CURRENCY_FORMAT.format(cleanDecimalValue);

      if (newAmountWithCurrencyFormat) {
        console.debug(
          `newAmountWithCurrencyFormat: ${newAmountWithCurrencyFormat}`
        );

        let currentInputCursor = document.getElementById(
          inputCtr[0].id
        ).selectionStart;

        const newValue = newAmountWithCurrencyFormat.replace("CA$", "");

        inputCtr.val(`${isNegative ? "-" : ""}${newValue}`);

        if (!skipCalculatingBudget) {
          calculateEstimatedActivityBudget();
        }
        let isAddition = false;

        if (newAmount.length > inputCtr.data("val").length) {
          isAddition = true;
        }
        let prevNumberOfCommas = (inputCtr.data("val").match(/,/g) || [])
          .length;
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
          .setSelectionRange(currentInputCursor, currentInputCursor);
      }

      inputCtr.data("val", inputCtr.val());
    }

    function setInputMaxLength(fieldName, maxLength) {
      $(`#${fieldName}`).attr("maxlength", maxLength);
    }

    /* COMMON FUNCTIONS */
    function setQuestionToReadOnly(fieldName) {
      $(`#${fieldName}`).attr("readonly", true);
      $(`#${fieldName}`).on("mousedown", function (e) {
        e.preventDefault();
        this.blur();
        window.focus();
      });
      $(`#${fieldName}`).attr("style", "background-color: #eee !important");
    }

    function hideQuestion(fieldName) {
      $(`#${fieldName}`).css("display", "none");
      $(`#${fieldName}`).val("");
      const fieldLabelElement = document.querySelector(`#${fieldName}_label`);
      const fieldRow = fieldLabelElement.closest("tr");
      $(fieldRow).css({ display: "none" });
      validateRequiredFields();
    }

    function observeChanges(element, customFunc) {
      // initial load:
      if (customFunc) {
        customFunc();
      } else {
        validateRequiredFields();
      }

      // watch for changes
      var observer = new MutationObserver(function (mutations, observer) {
        if (customFunc) {
          customFunc();
        } else {
          validateRequiredFields();
        }
      });
      observer.observe(element, {
        attributes: true,
        childList: true,
        characterData: true,
      });
    }

    function setRequiredField(
      fieldName,
      elemType = HtmlElementTypeEnum.Input,
      validationErrorMessage = "Required field"
    ) {
      $(`#${fieldName}_label`).parent().addClass("required");
      $(`#${fieldName}`).attr("required", true);

      let div = document.createElement("div");
      div.id = `${fieldName}_error_message`;
      div.className = "error_message";
      div.style = "display:none;";
      div.innerHTML = `<span'>${validationErrorMessage}</span>`;
      $(`#${fieldName}`).parent().append(div);

      switch (elemType) {
        case HtmlElementTypeEnum.FileInput:
          observeChanges($(`input[id=${fieldName}_AttachFile]`)[0]);
          $(`#${fieldName}_AttachFile`).on("blur input", () => {
            validateRequiredFields();
          });
          break;
        case HtmlElementTypeEnum.DatePicker:
          observeChanges(
            $(`input[id=${fieldName}_datepicker_description]`).parent()[0]
          );
          $(`#${fieldName}_datepicker_description`).on("blur input", () => {
            validateRequiredFields();
          });
          break;
        case HtmlElementTypeEnum.SingleOptionSet:
        case HtmlElementTypeEnum.MultiOptionSet:
          $(`input[id*='${fieldName}']`).on("change", function () {
            validateRequiredFields();
            console.debug(`Q3 updated... validateRequiredFields...`);
          });
          break;
        case HtmlElementTypeEnum.DropdownSelect:
          $(`select[id*='${fieldName}']`).on("change", function () {
            validateRequiredFields();
          });
          break;
        default: // HtmlElementTypeEnum.Input
          $(`#${fieldName}`).on("keyup", function (event) {
            validateRequiredFields();
          });
          break;
      }
    }

    function validateRequiredFields() {
      const currentStep = getCurrentStep();
      validateStepFields(currentStep);
    }

    function validateRequiredField(
      fieldName,
      elemType = HtmlElementTypeEnum.Input,
      errorMessage = "IS REQUIRED"
    ) {
      let isVisible = $(`#${fieldName}_label`).is(":visible");

      let skipValidationAsNotVisible = !isVisible;
      if (skipValidationAsNotVisible) return "";

      let validationErrorHtml = "";

      var isEmptyField = true;
      switch (elemType) {
        case HtmlElementTypeEnum.FileInput:
          isEmptyField =
            $(`#${fieldName}_AttachFile`)?.val().length === 0 &&
            $(`#${fieldName}`)?.val().length === 0;
          break;
        case HtmlElementTypeEnum.MultiOptionSet:
          isEmptyField = $(`li[id*='${fieldName}-selected-item-']`).length == 0;
          break;
        case HtmlElementTypeEnum.DropdownSelect:
          isEmptyField =
            document.querySelector(`#${fieldName}`).value.length == 0;
          break;
        case HtmlElementTypeEnum.SingleOptionSet:
        case HtmlElementTypeEnum.DatePicker:
        default: // HtmlElementTypeEnum.Input
          isEmptyField = $(`#${fieldName}`).val() == "";
          break;
      }

      if (isEmptyField) {
        const fieldLabelText = $(`#${fieldName}_label`).text();
        validationErrorHtml = `<div><span>"${fieldLabelText}"</span><span style="color:red;"> ${errorMessage}</span></div>`;
        // $(`#${fieldName}`).on("focusout", function () {
        //   $(`#${fieldName}_error_message`).css({ display: "" });
        //   $(`#${fieldName}`).css({ border: "1px solid #e5636c" });
        // });
        // Display the field's validation error div here?
      }
      // else {
      //   $(`#${fieldName}`).off("focusout");
      //   $(`#${fieldName}_error_message`).css({ display: "none" });
      //   $(`#${fieldName}`).css({ border: "" });
      // }

      return validationErrorHtml;
    }

    function validateNumericFieldValue(
      fieldName,
      comparisonValue,
      operator,
      forceRequired
    ) {
      const element = document.querySelector(`#${fieldName}`);

      if (!element) return;

      if (element.value === "" && !forceRequired) {
        return "";
      }

      const value = parseFloat(
        element.value.replace(/,/g, "").replace("$", "")
      );
      const fieldLabelText = $(`#${fieldName}_label`).text();
      const genericErrorMsg = `<div><span>"${fieldLabelText}"</span><span style="color:red;"> Please enter a valid number`;
      switch (operator) {
        case "greaterThan":
          return !(value > comparisonValue) || value === ""
            ? `${genericErrorMsg}. The value must be greater than ${comparisonValue}.</span></div>`
            : "";
        case "lessThan":
          return !(value < comparisonValue) || value === ""
            ? `${genericErrorMsg}. The value must be less than ${comparisonValue}.</span></div>`
            : "";
        case "equalTo":
          return !(value === comparisonValue) || value === ""
            ? `${genericErrorMsg}. The value must be equal to ${comparisonValue}.</span></div>`
            : "";
        case "greaterThanOrEqualTo":
          return !(value >= comparisonValue) || value === ""
            ? `${genericErrorMsg}. The value must be greater than or equal to ${comparisonValue}.</span></div>`
            : "";
        case "lessThanOrEqualTo":
          return !(value <= comparisonValue) || value === ""
            ? `${genericErrorMsg}. The value must be less than or equal to ${comparisonValue}.</span></div>`
            : "";
        default:
          return "Invalid operator";
      }
    }

    function validateFieldLength(
      fieldName,
      comparisonValue,
      operator,
      forceRequired = true,
      postfix = undefined,
      overrideDisplayValue = undefined
    ) {
      let isVisible = $(`#${fieldName}_label`).is(":visible");

      let skipValidationAsNotVisible = !isVisible;
      if (skipValidationAsNotVisible) return "";

      const element = document.querySelector(`#${fieldName}`);

      if (!element) return;

      if (element.value === "" && !forceRequired) {
        return "";
      }

      const value = element.value.length;
      const genericErrorMsg = `<span style="color:red;"> Please enter a valid length`;
      switch (operator) {
        case "greaterThan":
          return !(value > comparisonValue) || value === ""
            ? `${genericErrorMsg}. The length must be greater than ${
                overrideDisplayValue ?? comparisonValue
              }${postfix ? ` ${postfix}` : ""}.</span>`
            : "";
        case "lessThan":
          return !(value < comparisonValue) || value === ""
            ? `${genericErrorMsg}. The length must be less than ${
                overrideDisplayValue ?? comparisonValue
              }${postfix ? ` ${postfix}` : ""}.</span>`
            : "";
        case "equalTo":
          return !(value === comparisonValue) || value === ""
            ? `${genericErrorMsg}. The length must be equal to ${
                overrideDisplayValue ?? comparisonValue
              }${postfix ? ` ${postfix}` : ""}.</span>`
            : "";
        case "greaterThanOrEqualTo":
          return !(value >= comparisonValue) || value === ""
            ? `${genericErrorMsg}. The length must be greater than or equal to ${
                overrideDisplayValue ?? comparisonValue
              }${postfix ? ` ${postfix}` : ""}.</span>`
            : "";
        case "lessThanOrEqualTo":
          return !(value <= comparisonValue) || value === ""
            ? `${genericErrorMsg}. The length must be less than or equal to ${
                overrideDisplayValue ?? comparisonValue
              }${postfix ? ` ${postfix}` : ""}.</span>`
            : "";
        default:
          return "Invalid operator";
      }
    }

    function displayValidationErrors(validationErrorHtml) {
      let validationErrorsDiv = $("#error_messages_div");

      console.debug("displaying Validation Errors...");

      if (validationErrorsDiv.length == 0) {
        validationErrorsDiv = document.createElement("div");
        validationErrorsDiv.id = `error_messages_div`;

        const actionsDiv = $(`#NextButton`).parent().parent();
        actionsDiv.prepend(validationErrorsDiv);

        actionsDiv.attr("id", "actions_div");
      } else {
        validationErrorsDiv = validationErrorsDiv[0];
      }

      if (validationErrorHtml == "") {
        validationErrorsDiv.innerHTML = "";
        validationErrorsDiv.style = "display:none;";
        $("#NextButton").prop("disabled", false);
      } else {
        validationErrorsDiv.innerHTML = validationErrorHtml + "</br>";
        validationErrorsDiv.style = "display:block;";
        $("#NextButton").prop("disabled", true);
      }
    }

    function allowNumbersOnly(fieldName) {
      $(`#${fieldName}`).mask("Z#", {
        translation: {
          Z: {
            pattern: /[1-9]/,
          },
        },
      });
    }

    function initInputMasking() {
      try {
        $.getScript(
          "https://cdnjs.cloudflare.com/ajax/libs/jquery.mask/1.14.16/jquery.mask.min.js"
        )
          .done(function (script, textStatus) {
            $("#quartech_businessregistrationnumber").mask("000000000");
            $("#quartech_consultantbusinessregistrationgstnumber").mask(
              "000000000"
            );
            allowNumbersOnly("quartech_businessmanagementtrainingparticipants");
            allowNumbersOnly("quartech_adoptednumber");
            allowNumbersOnly("quartech_environmentallybeneficialadoptednumber");
            $("#quartech_businesspostalcode").mask("S0S 0S0");
            $("#quartech_businessphonenumber").mask("(000) 000-0000");
            $("#quartech_telephone").mask("(000) 000-0000");
            $("#quartech_smephonenumber").mask("(000) 000-0000");
            $("#quartech_consultantphonenumber").mask("(000) 000-0000");
            $("#quartech_businessemailaddress").mask("A", {
              translation: {
                A: { pattern: /[\w@\-.+]/, recursive: true },
              },
            });
            $("#quartech_smeemail").mask("A", {
              translation: {
                A: { pattern: /[\w@\-.+]/, recursive: true },
              },
            });
            $("#quartech_consultantemailaddress").mask("A", {
              translation: {
                A: { pattern: /[\w@\-.+]/, recursive: true },
              },
            });
          })
          .fail(function (jqxhr, settings, exception) {
            console.error("Unable to initialize input masking", exception);
          });
      } catch (e) {
        console.error("Unable to initialize input masking", e);
      }
    }

    function validateEmailAddressField(fieldName) {
      const fieldElement = document.querySelector(`#${fieldName}`);
      let errorMessageElement = document.querySelector(
        `#${fieldName}_error_message`
      );

      if (!fieldElement) return;
      if (!errorMessageElement) {
        let div = document.createElement("div");
        div.id = `${fieldName}_error_message`;
        div.className = "error_message";
        div.style = "display:none;";
        $(`#${fieldName}`).parent().append(div);

        errorMessageElement = document.querySelector(
          `#${fieldName}_error_message`
        );

        if (!errorMessageElement) return;
      }

      const pattern = /^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i;

      $(fieldElement).keyup(function () {
        const input = fieldElement.value;
        if (!input || !pattern.test(input)) {
          $(fieldElement).css({ border: "1px solid #e5636c" });
          $(errorMessageElement).html(
            "<span>Email: must be a valid email.</span>"
          );
          $(errorMessageElement).css({ display: "" });
        } else {
          $(fieldElement).css({ border: "" });
          $(errorMessageElement).css({ display: "none" });
        }
      });
    }

    function shouldRequireDependentField({
      shouldBeRequired,
      requiredFieldTag,
      validationFunc = validateStepFields,
      setRequiredFieldsFunc = setDynamicallyRequiredFields,
      disableRequiredProp,
      customFunc,
    }) {
      const requiredFieldLabelElement = document.querySelector(
        `#${requiredFieldTag}_label`
      );
      const requiredFieldRow = requiredFieldLabelElement.closest("tr");
      const requiredFieldInputElement = document.querySelector(
        `#${requiredFieldTag}`
      );

      if (
        !requiredFieldLabelElement ||
        !requiredFieldRow ||
        !requiredFieldInputElement
      )
        return;

      if (shouldBeRequired) {
        $(requiredFieldRow).css({ display: "" });

        if (!disableRequiredProp) {
          localStorage.setItem(`shouldRequire_${requiredFieldTag}`, true);
          if (setRequiredFieldsFunc) {
            setRequiredFieldsFunc(getCurrentStep());
          }

          if (validationFunc) {
            validationFunc(getCurrentStep());
            // re-validate every time user modifies additional info input
            $(requiredFieldInputElement).change(function () {
              validationFunc(getCurrentStep());
            });
          }
        }
      } else {
        $(requiredFieldRow).css({ display: "none" });

        if (!disableRequiredProp) {
          $(`#${requiredFieldTag}_label`).parent().removeClass("required");
          localStorage.removeItem(`shouldRequire_${requiredFieldTag}`);
          if (setRequiredFieldsFunc) {
            setRequiredFieldsFunc(getCurrentStep());
          }
          if (validationFunc) {
            validationFunc(getCurrentStep());
          }
          $(requiredFieldInputElement).off("change");
        }
        $(requiredFieldInputElement).val("");
      }

      if (customFunc) {
        customFunc();
      }
    }

    function setupDependentRequiredField({
      dependentOnValue,
      dependentOnValueArray = [],
      dependentOnElementTag,
      requiredFieldTag,
      overrideTruthyClause = undefined,
      validationFunc,
      setRequiredFieldsFunc,
      disableRequiredProp = false,
      customFunc,
    }) {
      const dependentOnElement = document.querySelector(
        `#${dependentOnElementTag}`
      );
      if (!dependentOnElement) return;
      const input = dependentOnElement.value;
      if (overrideTruthyClause != undefined) {
        if (overrideTruthyClause === true) {
          shouldRequireDependentField({
            shouldBeRequired: true,
            requiredFieldTag,
            validationFunc,
            setRequiredFieldsFunc,
            disableRequiredProp,
            customFunc,
          });
        } else {
          shouldRequireDependentField({
            shouldBeRequired: false,
            requiredFieldTag,
            validationFunc,
            setRequiredFieldsFunc,
            disableRequiredProp,
            customFunc,
          });
        }
      } else {
        if (
          input === dependentOnValue ||
          dependentOnValueArray.includes(input)
        ) {
          shouldRequireDependentField({
            shouldBeRequired: true,
            requiredFieldTag,
            validationFunc,
            setRequiredFieldsFunc,
            disableRequiredProp,
            customFunc,
          });
        } else {
          shouldRequireDependentField({
            shouldBeRequired: false,
            requiredFieldTag,
            validationFunc,
            setRequiredFieldsFunc,
            disableRequiredProp,
            customFunc,
          });
        }
      }
    }

    function initOnChange_DependentRequiredField({
      dependentOnValue,
      dependentOnValueArray,
      dependentOnElementTag,
      requiredFieldTag,
      overrideTruthyClause = undefined,
      validationFunc,
      setRequiredFieldsFunc,
      disableRequiredProp = false,
      customFunc,
    }) {
      const dependentOnElement = document.querySelector(
        `#${dependentOnElementTag}`
      );
      if (!dependentOnElement) return;

      // INITIAL LOAD/SETUP:
      setupDependentRequiredField({
        dependentOnValue,
        dependentOnValueArray,
        dependentOnElementTag,
        requiredFieldTag,
        overrideTruthyClause,
        validationFunc,
        setRequiredFieldsFunc,
        disableRequiredProp,
        customFunc,
      });

      // ON CHANGE:
      $(dependentOnElement).change(function () {
        setupDependentRequiredField({
          dependentOnValue,
          dependentOnValueArray,
          dependentOnElementTag,
          requiredFieldTag,
          overrideTruthyClause,
          validationFunc,
          setRequiredFieldsFunc,
          disableRequiredProp,
          customFunc,
        });
      });
    }
  })(window.jQuery);
}
