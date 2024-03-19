var PODS = window.PODS || {};
(function () {
    // Define some global variables
    var documentsTabClicksCount = 0;

    /*** TVC Program - Configs */
    const TVC_PROGRAM_RECORD_GUID = '66E45B15-C0CD-ED11-A7C6-000D3AFF121B';
    const PROGRAM_ENTITY_LOGICAL_NAME = 'msgov_program';
    // const PART_OF_APP_BUNDLE_VALUE_NO = 255550000;
    const PART_OF_APP_BUNDLE_VALUE_YES_LEAD_APPLICATION = 255550001;
    const PART_OF_APP_BUNDLE_VALUE_YES_CO_APPLICATION = 255550002;
    
    var programApplication = { };

    this.formOnLoad = async function (executionContext) {
		const formContext = executionContext.getFormContext();

        PODS.initProgramLookupOnChange(formContext);

        PODS.customizeFormByProgram(formContext);

		PODS.initDocumentsTabClickedHandler(formContext);
    }
    
    this.showSections = async function (visibleSections) {
        let sectionsToShow = [];
        
        if(visibleSections) {
            sectionsToShow = visibleSections.split(',');
        }
        
        sectionsToShow.forEach(sectionName => {
            if (sectionName != '')
            {
                const tabControl = Xrm.Page.ui.tabs.get(sectionName)
                if (tabControl) {
                    Xrm.Page.ui.tabs.get("tab_Deliverables_Budget").sections.get("tab_Deliverables_Budget_section_Coding").setVisible(false);

                    tabControl.setVisible(false)
                }
            }
        });
    }

    this.initProgramLookupOnChange = async function (formContext) {
        formContext.getControl("quartech_program").getAttribute().addOnChange(PODS.handleProgramLookup_OnChange);
    }
	
    this.handleProgramLookup_OnChange = async function (executionContext) {
        const formContext = executionContext.getFormContext();
        PODS.customizeFormByProgram(formContext);
    }

    this.customizeFormByProgram = async function (formContext) {
        const programConfigData = await PODS.getProgramStreamConfigData(formContext);

        PODS.customizeFormByConfiguredProgramBusinessLogics(formContext, programConfigData);
		
		PODS.customizeTVCprogram(formContext);

        PODS.customizeFormByJsonConfig(formContext, programConfigData.quartech_staffportalapplicationformjsonconfig);
    }
	
    this.customizeFormByConfiguredProgramBusinessLogics = async function (formContext, programBusinessLogics) {

        const isBusinessLogicsNotEnabled = !programBusinessLogics?.quartech_businesslogicsenabled;
        if (isBusinessLogicsNotEnabled) return;

        const podsConfigData = JSON.parse(programBusinessLogics.quartech_StaffPortalConfig?.quartech_configdata);

        if (!podsConfigData) return;

         // Show Hide for Application Information's Business Summary section
        PODS.showHideFieldsBySelectedProgram(formContext, 
            podsConfigData.BusinessLogics?.ApplicationInformation?.BusinessSummary_FieldNamesValues_Map,
            programBusinessLogics.quartech_businesssummarychecklistitemstodisplay);
        
        // Show Hide for Application Information's NAISC Code
        PODS.showHideFieldsBySelectedProgram(formContext, 
            podsConfigData.BusinessLogics?.ApplicationInformation?.NaicsCode_FieldNamesValues_Map,
            programBusinessLogics.quartech_applicationnaicscodefieldstodisplay);

        // Show Hide for Document Submission section
        PODS.showHideFieldsBySelectedProgram(formContext, 
            podsConfigData.BusinessLogics?.ApplicationInformation?.DocumentSubmission_FieldNamesValues_Map,
            programBusinessLogics.quartech_documentsubmissionchecklistitemstodisplay);

        // Show Hide for Program Eligibility section
        PODS.showHideFieldsBySelectedProgram(formContext, 
            podsConfigData.BusinessLogics?.ApplicationInformation?.ProgramEligibility_FieldNamesValues_Map,
            programBusinessLogics.quartech_programeligibilitychecklistitemstodisplay);

        // Show Hide for Evaluation section
        PODS.showHideFieldsBySelectedProgram(formContext, 
            podsConfigData.BusinessLogics?.ApplicationInformation?.Evaluation_FieldNamesValues_Map,
            programBusinessLogics.quartech_evaluationchecklistitemstodisplay);
    }
	
    this.showHideFieldsBySelectedProgram = async function (formContext, fieldNamesValuesMap, fieldsValuesToDisplayString) {
        if (!fieldNamesValuesMap) return;

        let fieldsValuesToDisplay = [];

        if(fieldsValuesToDisplayString) {
            fieldsValuesToDisplay = fieldsValuesToDisplayString.split(',');
        }
        
        for (const fieldData of fieldNamesValuesMap) {
            const fieldName = fieldData?.FieldName;
            const fieldVisible = fieldsValuesToDisplay.includes(`${fieldData?.Value}`);
            
            try {
                formContext.getControl(fieldName).setVisible(fieldVisible);}
            catch {
                console.warn(`${fieldName} field name is not found on the form.`);
            }
        }
    }
	
    this.getProgramStreamConfigData = async function (formContext) {
        const programGuid = await PODS.getSelectedProgramOrStreamGuid(formContext);

        var programData = await Xrm.WebApi.retrieveRecord(PROGRAM_ENTITY_LOGICAL_NAME, programGuid, `?$select=quartech_staffportalapplicationformjsonconfig,quartech_businesslogicsenabled, quartech_businesssummarychecklistitemstodisplay, quartech_applicationnaicscodefieldstodisplay, quartech_documentsubmissionchecklistitemstodisplay, quartech_documentsubmissionautocomplete, quartech_programeligibilitychecklistitemstodisplay, quartech_programeligibilityautocompleteeligibility, quartech_programeligibilityautosetmoreinforequired, quartech_evaluationchecklistitemstodisplay, quartech_agreementchecklistitemstodisplay, quartech_agreementautocompleteagreement, quartech_agreementsetagreementtomoreinforequired, quartech_claimsubmissionchecklistitemstodisplay, quartech_claimsubmissionautocompleteclaimreceived, quartech_claimprocessingchecklistitemstodisplay, quartech_paymentchecklistitemstodisplay, quartech_paymentautocompleteprojectcompleted&$expand=quartech_StaffPortalConfig($select=quartech_name,quartech_configdata)`);

        return programData;
    }
	
    this.customizeTVCprogram = async function (formContext) {
        PODS.customizeTvcCoApplicantForm(formContext);

		const isTvcProgram = await PODS.isTVCprogram(formContext);
		
		if (!isTvcProgram) return;

        PODS.customizeTvcPartOfAppBundle(formContext);
    }
	
    this.customizeTvcCoApplicantForm = async function (formContext) {
        const leadApplicationLookupCtr = formContext.getControl('quartech_leadapplication');
        if (!leadApplicationLookupCtr) return;

        const leadApplicationLookupValue = leadApplicationLookupCtr.getAttribute().getValue();

        const isNotA_TVCcoApplication = !leadApplicationLookupValue;
        if (isNotA_TVCcoApplication) return;
        
        const leadApplicationGuid = leadApplicationLookupValue[0].id;
        if (!leadApplicationGuid) return;

        leadApplicationLookupCtr.setVisible(true);
        
        const programGuid = await PODS.getSelectedProgramOrStreamGuid(formContext);
        if (!programGuid) {
            const programLookup = await PODS.convertToLookup(TVC_PROGRAM_RECORD_GUID, "Traceability Value Chain Program", PROGRAM_ENTITY_LOGICAL_NAME); // To-do: Nice to have - Get program name from PODS instead of hard coded it here.
            formContext.getAttribute("quartech_program").setValue(programLookup);

            PODS.customizeFormByProgram(formContext);
        }
        
        const partOfApplicationBundleCtr = formContext.getControl("quartech_partofapplicationbundle");

        const partOfApplicationBundleAttribute = partOfApplicationBundleCtr.getAttribute();

        const selectedBundleValue = partOfApplicationBundleAttribute.getValue();

        if (selectedBundleValue !== PART_OF_APP_BUNDLE_VALUE_YES_CO_APPLICATION) 
        {
            partOfApplicationBundleAttribute.setValue(PART_OF_APP_BUNDLE_VALUE_YES_CO_APPLICATION);
        }
        partOfApplicationBundleCtr.setDisabled(true);
        
        PODS.populateCoApplicationWithLeadApplication(formContext, leadApplicationGuid);

        // To-do: populating Application Contact Info's fields
    }

    this.populateCoApplicationWithLeadApplication = async function (formContext, leadApplicationGuid) {
        const isNewForm = formContext.ui.getFormType() === 1;

        if (!isNewForm) return;

        const leadAppData = await PODS.getApplicationData(leadApplicationGuid);

        if (!leadAppData) return;

        if (leadAppData?._quartech_applicant_value) {
            const applicantLookup = await PODS.convertToLookup(leadAppData?._quartech_applicant_value, leadAppData["_quartech_applicant_value@OData.Community.Display.V1.FormattedValue"], "contact");
            formContext.getAttribute("quartech_applicant").setValue(applicantLookup);
        }

        if (leadAppData?.quartech_bundleapplicationid) {
            formContext.getAttribute("quartech_bundleapplicationid").setValue(leadAppData?.quartech_bundleapplicationid);
        }
        if (leadAppData?.quartech_submittedon) {
            formContext.getAttribute("quartech_submittedon").setValue(new Date(leadAppData?.quartech_submittedon));
        }

        // Applicant Contact Info        
        if (leadAppData?.quartech_legalnamefirst) {
            formContext.getAttribute("quartech_legalnamefirst").setValue(leadAppData?.quartech_legalnamefirst);
        }
        if (leadAppData?.quartech_legalnamelast) {
            formContext.getAttribute("quartech_legalnamelast").setValue(leadAppData?.quartech_legalnamelast);
        }
        if (leadAppData?.quartech_positionorjobtitle) {
            formContext.getAttribute("quartech_positionorjobtitle").setValue(leadAppData?.quartech_positionorjobtitle);
        }
        if (leadAppData?.quartech_city) {
            formContext.getAttribute("quartech_city").setValue(leadAppData?.quartech_city);
        }
        if (leadAppData?.quartech_telephone) {
            formContext.getAttribute("quartech_telephone").setValue(leadAppData?.quartech_telephone);
        }
        if (leadAppData?.quartech_email) {
            formContext.getAttribute("quartech_email").setValue(leadAppData?.quartech_email);
        }

        if (leadAppData?._quartech_programintake_value) {
            const intakeLookup = await PODS.convertToLookup(leadAppData?._quartech_programintake_value, leadAppData["_quartech_programintake_value@OData.Community.Display.V1.FormattedValue"], "quartech_programintake");
            formContext.getAttribute("quartech_programintake").setValue(intakeLookup);
        }
    }

	
    this.getApplicationData = async function (applicationGuid) {
        var data = await Xrm.WebApi.retrieveRecord("msgov_businessgrantapplication", applicationGuid, `?$select=_quartech_applicant_value, quartech_bundleapplicationid, quartech_submittedon, _quartech_programintake_value, quartech_legalnamefirst, quartech_legalnamelast, quartech_positionorjobtitle, quartech_city, quartech_telephone, quartech_email, _quartech_programintake_value`);

        return data;
    }

    this.convertToLookup = async function (id, name, entityType) {
        let lookup = []; // // Creating a new lookup Array

        lookup[0] = {}; // new Object
        lookup[0].id = id; // GUID of the lookup id
        lookup[0].name = name; // Name of the lookup
        lookup[0].entityType = entityType; // Entity Type of the lookup entity

        return lookup;
    }

    this.customizeTvcPartOfAppBundle = async function (formContext) {
        const partOfApplicationBundleCtr = formContext.getControl("quartech_partofapplicationbundle");

        partOfApplicationBundleCtr.setVisible(true); // to show Part of Application Bundle
        PODS.displayTvcByPartOfAppBundle(formContext);
        
        partOfApplicationBundleCtr.getAttribute().addOnChange(PODS.handleTvcPartOfApplicationBundle_OnChange);
    }
	
    this.handleTvcPartOfApplicationBundle_OnChange = async function (executionContext) {
        const formContext = executionContext.getFormContext();
        PODS.displayTvcByPartOfAppBundle(formContext);
    }
	
    this.displayTvcByPartOfAppBundle = async function (formContext) {
        const selectedBundleValue = formContext.getControl("quartech_partofapplicationbundle")?.getAttribute()?.getValue();

        switch (selectedBundleValue) {
            case PART_OF_APP_BUNDLE_VALUE_YES_LEAD_APPLICATION:
                formContext.ui.tabs.get('Co-Applications')?.setVisible(true);
                formContext.getControl("quartech_bundleapplicationid").setVisible(true);
                break;
            case PART_OF_APP_BUNDLE_VALUE_YES_CO_APPLICATION:
                formContext.ui.tabs.get('Co-Applications')?.setVisible(false);
                formContext.getControl("quartech_bundleapplicationid").setVisible(true);
                break;
            default:
                formContext.getControl("quartech_bundleapplicationid").setVisible(false);
                formContext.ui.tabs.get('Co-Applications')?.setVisible(false);
                break;
        }
    }

    this.isTVCprogram = async function (formContext) {
        if (programApplication.IsTVCprogram) return programApplication.isTVCprogram;

        const programGuid = await PODS.getSelectedProgramOrStreamGuid(formContext);

		programApplication.IsTVCprogram = TVC_PROGRAM_RECORD_GUID === programGuid;
		
		return programApplication.IsTVCprogram;
    }
    
    this.getSelectedProgramOrStreamGuid = async function (formContext) {
        const programLookupValue = formContext.getControl('quartech_program')?.getAttribute()?.getValue();
        if (!programLookupValue) return null;
        
        const programGuid = programLookupValue[0].id;
        const programCleanGuid = programGuid?.replace('{', '')?.replace('}', '');
        
        return programCleanGuid;
    }
	
    this.initDocumentsTabClickedHandler = async function (formContext) {
        const projectLookupCtrAtt = formContext.getControl('quartech_project').getAttribute();
        if (!projectLookupCtrAtt) return;

		var projectLookupValue = projectLookupCtrAtt.getValue();
        var projectGuid = projectLookupValue[0].id;
		
		var documentsTab = formContext.ui.tabs.get("documentsTab");
        documentsTab.addTabStateChange(
            function() {
                try {
                    PODS.documentsTabClicked(formContext, projectGuid);
                } catch (err) {
                    console.error(err);
                    
                    var documentsTabScriptsNotConfigured = error?.message === 'PODS.documentsTabClicked is not a function';
                    if (documentsTabScriptsNotConfigured) {
                        formContext.ui.setFormNotification("Please contact the PODS development team to configure the form and JS code to handle Documents tab <documents-management-script.js>", "ERROR");
                    }
                    
                }
            }
        );
    }

}).call(PODS);