var PODS = window.PODS || {};
(function () {
    // Global variables
    var projectReviewBpfStepsAutoSelectRulesMap =  new Map();

    // Code to run in the form OnLoad event
    this.formOnLoad = async function (executionContext) {
		formContext = executionContext.getFormContext();
	    
	    PODS.initDocumentsTabClickedHandler(formContext);
        
		PODS.displayNotificationForSupplierNumber(formContext);

        PODS.customizeFormByProgram(formContext);
    }

    this.customizeFormByProgram = async function (formContext) {
        PODS.customizeFormByConfiguredProgramBusinessLogics(formContext);
    }
    
    this.customizeFormByConfiguredProgramBusinessLogics = async function (formContext) {
        const programBusinessLogics = await PODS.getSelectedProgramData(formContext);

        PODS.customizeFormByJsonConfig(formContext, programBusinessLogics.quartech_staffportalprojectformjsonconfig)
        PODS.customizeFormUsingJsonConfigForKTTP(formContext, programBusinessLogics.quartech_staffportalprojectformjsonconfig) // legacy code for KTTP

        const isBusinessLogicsNotEnabled = !programBusinessLogics?.quartech_businesslogicsenabled;
        if (isBusinessLogicsNotEnabled) return;

        const podsConfigData = JSON.parse(programBusinessLogics.quartech_StaffPortalConfig?.quartech_configdata);

        if (!podsConfigData) return;

        const agreementSignedStepFieldName = "quartech_agreementcomplete";
        PODS.addLogicsToBpfChecklist(formContext,
            podsConfigData.BusinessLogics?.ProjectReview?.AgreementSigned_FieldNamesValues_Map,
            programBusinessLogics.quartech_agreementchecklistitemstodisplay,
            programBusinessLogics.quartech_agreementautocompleteagreement,
            programBusinessLogics.quartech_agreementsetagreementtomoreinforequired,
            agreementSignedStepFieldName);

        // Show Hide for Project Review's Claim Submission section
        PODS.showHideFieldsBySelectedProgram(formContext, 
            podsConfigData.BusinessLogics?.ProjectReview?.ClaimSubmission_FieldNamesValues_Map,
            programBusinessLogics.quartech_claimsubmissionchecklistitemstodisplay);

        // Show Hide for Project Review's Claim Processing section
        PODS.showHideFieldsBySelectedProgram(formContext, 
            podsConfigData.BusinessLogics?.ProjectReview?.ClaimProcessing_FieldNamesValues_Map,
            programBusinessLogics.quartech_claimprocessingchecklistitemstodisplay);
               
         // Show Hide for Project Review's Payment section
         PODS.showHideFieldsBySelectedProgram(formContext, 
            podsConfigData.BusinessLogics?.ProjectReview?.Payment_FieldNamesValues_Map,
            programBusinessLogics.quartech_paymentchecklistitemstodisplay);
    }

    this.customizeFormUsingJsonConfigForKTTP = async function (formContext, jsonConfig) {
        if (!jsonConfig) return

        const configData = JSON.parse(jsonConfig)

        configData.tabs?.forEach((tabConfig) => {
            if (tabConfig.fields) { // Previous structure being used for KTTP S1, S2 and S3
                tabConfig.fields.forEach((field) => {
                    if (field.label) {
                        formContext.getControl(field.name)?.setLabel(field.label)
                    }

                    if (!field.hidden) {
                        formContext.getControl(field.name)?.setVisible(true)
                    }
                });
            }
        });
    }

    this.addLogicsToBpfChecklist = async function (formContext, checklistFieldNamesValuesMap, checklistFieldsValuesToDisplayString, isAutoComplete, isAutoSetMoreInfoRequired, bpfStepFieldName) {
        if (!checklistFieldNamesValuesMap) return;

        let fieldsValuesToDisplay = [];

        if(checklistFieldsValuesToDisplayString) {
            fieldsValuesToDisplay = checklistFieldsValuesToDisplayString.split(',');
        }
        
        var bpfStepAutoSelectRules = {
            BpfStepFieldName: bpfStepFieldName,
            AutoComplete: isAutoComplete,
            FieldNamesForAutoComplete: [],
            AutoSetToMoreInfoRequired: isAutoSetMoreInfoRequired,
        };

        for (const fieldData of checklistFieldNamesValuesMap) {
            const fieldName = fieldData?.FieldName;
            const fieldVisible = fieldsValuesToDisplay.includes(`${fieldData?.Value}`);
            
            try {
                formContext.getControl(fieldName).setVisible(fieldVisible);
                
                if (fieldVisible) {
                    bpfStepAutoSelectRules.FieldNamesForAutoComplete.push(fieldName);

                    projectReviewBpfStepsAutoSelectRulesMap.set(fieldName, bpfStepAutoSelectRules);

                    PODS.initChecklistItemFieldOnChange(formContext, fieldName);
                }
            }
            catch {
                console.warn(`${fieldName} field name is not found on the form.`);
            }
        }
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
                formContext.getControl(fieldName).setVisible(fieldVisible);
            }
            catch {
                console.warn(`${fieldName} field name is not found on the form.`);
            }
        }
    }

    this.initChecklistItemFieldOnChange = async function (formContext, fieldName) {
        formContext.getControl(fieldName).getAttribute().addOnChange(PODS.handleChecklistItemField_OnChange);
    }
	
    const PODS_CHECKLIST_ITEM_OSV_YES = 255550000;
    const PODS_CHECKLIST_ITEM_OSV_MORE_INFO_REQUIRED = 255550001;

    this.handleChecklistItemField_OnChange = async function (executionContext) {
        
        const formContext = executionContext.getFormContext();
        const attributeName = executionContext?._eventSource?._attributeName; // i.e. "quartech_eaapproval"
        
        const bpfStepAutoSelectRules = projectReviewBpfStepsAutoSelectRulesMap.get(attributeName);

        const bpfStepAttribute = formContext?.getAttribute(bpfStepAutoSelectRules?.BpfStepFieldName);

        if (!bpfStepAttribute) return;

        const selectedValue = formContext?.getAttribute(attributeName).getValue();

        const bpfStepSelectedValue = bpfStepAttribute.getValue();
        
        if (selectedValue === PODS_CHECKLIST_ITEM_OSV_MORE_INFO_REQUIRED) {
            if (bpfStepAutoSelectRules.AutoSetToMoreInfoRequired && bpfStepSelectedValue !== PODS_CHECKLIST_ITEM_OSV_MORE_INFO_REQUIRED)
            {
                bpfStepAttribute.setValue(PODS_CHECKLIST_ITEM_OSV_MORE_INFO_REQUIRED);
            }
            return;
        }
        
        if (bpfStepAutoSelectRules.AutoComplete && selectedValue === PODS_CHECKLIST_ITEM_OSV_YES) {            
            let allRequiredItemsCompleted = true;
            for (const fieldName of bpfStepAutoSelectRules.FieldNamesForAutoComplete) {
                if (fieldName === attributeName)
                    continue;

                const itemNotCompleted = (formContext?.getAttribute(fieldName).getValue() !== PODS_CHECKLIST_ITEM_OSV_YES);

                if (itemNotCompleted)
                {
                    allRequiredItemsCompleted = false;
                    break;
                }
            }

            if (allRequiredItemsCompleted) {
                bpfStepAttribute.setValue(PODS_CHECKLIST_ITEM_OSV_YES);
            }
        }
        else if (bpfStepSelectedValue === PODS_CHECKLIST_ITEM_OSV_YES)
        {
            bpfStepAttribute.setValue(null);
        }
    }

    this.getSelectedProgramData = async function (formContext) {
        const programGuid = await PODS.getSelectedProgramOrStreamGuid(formContext);

        var programData = await Xrm.WebApi.retrieveRecord("msgov_program", programGuid, `?$select=quartech_staffportalprojectformjsonconfig, quartech_businesslogicsenabled, quartech_businesssummarychecklistitemstodisplay, quartech_applicationnaicscodefieldstodisplay, quartech_documentsubmissionchecklistitemstodisplay, quartech_documentsubmissionautocomplete, quartech_programeligibilitychecklistitemstodisplay, quartech_programeligibilityautocompleteeligibility, quartech_programeligibilityautosetmoreinforequired, quartech_evaluationchecklistitemstodisplay, quartech_agreementchecklistitemstodisplay, quartech_agreementautocompleteagreement, quartech_agreementsetagreementtomoreinforequired, quartech_claimsubmissionchecklistitemstodisplay, quartech_claimsubmissionautocompleteclaimreceived, quartech_claimprocessingchecklistitemstodisplay, quartech_paymentchecklistitemstodisplay, quartech_paymentautocompleteprojectcompleted&$expand=quartech_StaffPortalConfig($select=quartech_name,quartech_configdata)`);

        return programData;
    }
    
    this.getSelectedProgramOrStreamGuid = async function (formContext) {
        const programLookupValue = formContext.getControl('quartech_program')?.getAttribute()?.getValue();
        if (!programLookupValue) return null;
        
        const programGuid = programLookupValue[0].id;
        const programCleanGuid = programGuid?.replace('{', '')?.replace('}', '');
        
        return programCleanGuid;
    }

    this.initDocumentsTabClickedHandler = async function (formContext) {
        var projectGuid = formContext.data.entity.getId();
		
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
    
    this.displayNotificationForSupplierNumber = async function (formContext) {
        
        var assignedProgramStaff = formContext.getAttribute('quartech_programstaff').getValue();
        
        if(!assignedProgramStaff) return;
        
        var assignedProgramStaffId = assignedProgramStaff[0].id;
        
        var currentlyAssignedTo = formContext.getControl('header_quartech_currentlyassignedto')?.getAttribute()?.getValue();
        var currentlyAssignedToId = currentlyAssignedTo[0].id;
        
        var isNotCurrentlyAssignedToProgramStaff = (currentlyAssignedToId != assignedProgramStaffId);
        
        if (isNotCurrentlyAssignedToProgramStaff) {
            return;
        }
        
        var projectGuid = formContext.data.entity.getId();
        
        var fetchXml = `<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">
                                  <entity name="quartech_grantproject">
                                    <attribute name="quartech_name" />
                                    <attribute name="createdon" />
                                    <attribute name="quartech_recipient" />
                                    <attribute name="quartech_pt_projectidentifier" />
                                    <attribute name="quartech_grantprojectid" />
                                    <order attribute="quartech_name" descending="false" />
                                    <filter type="and">
                                      <condition attribute="quartech_grantprojectid" operator="eq" uiname="LeoTest0530_01" uitype="quartech_grantproject" value="${projectGuid}" />
                                    </filter>
                                    <link-entity name="account" from="accountid" to="quartech_recipient" visible="false" link-type="outer" alias="supplier">
                                      <attribute name="quartech_suppliernumber" />
                                      <attribute name="name" />
                                      <attribute name="quartech_businessnumber" />
                                      <attribute name="quartech_crabusinessname" />
                                    </link-entity>
                                  </entity>
                                </fetch>`;
         
        fetchXml = "?fetchXml=" + encodeURIComponent(fetchXml);
        
        var result = await Xrm.WebApi.retrieveMultipleRecords("quartech_grantproject", fetchXml);
        
        var supplierNumber = result?.entities[0]['supplier.quartech_suppliernumber'];
        
        if (supplierNumber) {
            return;
        }
        
        formContext.ui.setFormNotification("Program Staff must verify if the supplier # is in place in Oracle. If that is not the case, the request has to be sent to CSNR.", "WARNING");
    }
    
}).call(PODS);