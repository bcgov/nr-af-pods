var PODS = window.PODS || {};
(function () {
    // Global variables
    var fieldsDisplayLogicMap =  new Map();

    this.formOnLoad = async function (executionContext) {
		const formContext = executionContext.getFormContext()

        await PODS.hideAllFields(formContext)

        const configData = await PODS.getConfigData(formContext)

        if (!configData) return

        PODS.hideTabs(configData?.hiddenSteps)

        PODS.hideCodingSection()

        PODS.displayFormFields(formContext, configData)
    }
	
    this.hideAllFields = async function (formContext) {
        let formControls = formContext.ui.controls;

        formControls.forEach(control => {
            if (control.getName() != "" && control.getName() != null) {
                control.setVisible(false);
            }
        });
    }
	
    this.getConfigData = async function (formContext) {
        const programGuid = await PODS.getSelectedProgramOrStreamGuid(formContext);

        const result = await Xrm.WebApi.retrieveRecord("msgov_program", programGuid, "?$select=quartech_applicantportalapplicationformconfigjson&$expand=quartech_ApplicantPortalConfig($select=quartech_name,quartech_configdata)");

        const streamApplicationFormConfigJson = result.quartech_applicantportalapplicationformconfigjson
        
        if (!streamApplicationFormConfigJson) 
        {
            console.log('Application Form Config JSON is not configured yet for this program/stream.')
            return
        }

        const formConfig = JSON.parse(streamApplicationFormConfigJson)

        const applicantPortalConfig = result.quartech_ApplicantPortalConfig?.quartech_configdata
        const configDataJSON = JSON.parse(applicantPortalConfig)

        const allProgramSections = configDataJSON?.FieldsConfig?.programs[0]?.sections
        formConfig.sections = formConfig.sections.concat(allProgramSections)
        
        return formConfig
    }

    this.getSelectedProgramOrStreamGuid = async function (formContext) {
        const programLookupValue = formContext.getControl('quartech_program')?.getAttribute()?.getValue()
        if (!programLookupValue) return null
        
        const programGuid = programLookupValue[0].id
        const programCleanGuid = programGuid?.replace('{', '')?.replace('}', '')
        
        return programCleanGuid
    }

    this.displayFormFields = async function (formContext, configData) {
        configData.sections.forEach((stepConfig) => {
            stepConfig.fields.forEach((field) => {
                if (field.label) {
                    formContext.getControl(field.name)?.setLabel(field.label)
                }

                if (!field.hidden) {
                    formContext.getControl(field.name)?.setVisible(true)
                }

                if (field.visibleIf) {
                    const dependOnFieldName = field.visibleIf.fieldName

                    let displayConditions = []
                    if (fieldsDisplayLogicMap.has(dependOnFieldName)) {
                        displayConditions = fieldsDisplayLogicMap.get(dependOnFieldName)
                    }
                    else {
                        fieldsDisplayLogicMap.set(dependOnFieldName, displayConditions)
                    }

                    let selectedValueIn = []
                    if(field.visibleIf.selectedValueIn) {
                        selectedValueIn.push(...field.visibleIf.selectedValueIn)
                    }
                    else {
                        selectedValueIn.push(field.visibleIf.selectedValue)
                    }
                    
                    displayConditions.push({ selectedValueIn: selectedValueIn
                                            , fieldNameToShowOrHide: field.name })
                }
            });
        });

        PODS.initFieldsDisplayLogic(formContext, fieldsDisplayLogicMap)
    }
    
    this.initFieldsDisplayLogic = async function (formContext, fieldsDisplayLogicMap) {
        fieldsDisplayLogicMap.forEach(function(displayConditions, fieldName) {
            const control = formContext.getControl(fieldName)
            if (control) {
                const selectedValue = control.getAttribute()?.getValue()
                
                PODS.runDisplayConditions(formContext, selectedValue, displayConditions)

                control.getAttribute().addOnChange(PODS.handleSelectOptionField_OnChange);
            }
            else {
                console.error(`Program JSON contains a wrong field name. Configured Field Name: ${fieldName} `)
            }
        })
    }

    this.runDisplayConditions = async function (formContext, selectedValues, displayConditions) {
        displayConditions.forEach(function(displayCondition) {
            let visible = false
            if (Array.isArray(selectedValues)) { // Multi-select control
                for(let i = 0; i < selectedValues.length; i++) {
                    visible = displayCondition.selectedValueIn.includes(selectedValues[i])

                    if (visible) break
                }
            }
            else { // normal single select control
                visible = displayCondition.selectedValueIn.includes(selectedValues)
            }
            
            formContext.getControl(displayCondition.fieldNameToShowOrHide)?.setVisible(visible)
        })
    }
	
    this.handleSelectOptionField_OnChange = async function (execContext) {
        const eventSource = execContext.getEventSource();
        const fieldName = eventSource.getName();
        const selectedValue = eventSource.getValue();

        const displayConditions = fieldsDisplayLogicMap.get(fieldName);

        if (!displayConditions) return

        const formContext = execContext.getFormContext();
        PODS.runDisplayConditions(formContext, selectedValue, displayConditions)
    }

    this.hideTabs = async function (hiddenTabsNames) {
        let tabsToHide = [];

        hiddenTabsNames += ',tab_Demographic_Information,tab_Supporting_Documentation,tab_Declaration_Consent'

        if(hiddenTabsNames) {
            tabsToHide = hiddenTabsNames.split(',');
        }
        
        tabsToHide.forEach(tabName => {
            if (tabName != '')
            {
                const tabControl = Xrm.Page.ui.tabs.get(tabName)
                if (tabControl) {
                    tabControl.setVisible(false)
                }
            }
        });
    }

    this.hideCodingSection = async function () {
        Xrm.Page.ui.tabs.get("tab_ApplicantInfo").sections.get("applicantInfoTab_CodingSection").setVisible(false);
        Xrm.Page.ui.tabs.get("tab_eligibility").sections.get("eligibilityTab_CodingSection").setVisible(false);
        Xrm.Page.ui.tabs.get("tab_Project").sections.get("projectTab_CodingSection").setVisible(false);
        Xrm.Page.ui.tabs.get("tab_Deliverables_Budget").sections.get("tab_Deliverables_Budget_section_Coding").setVisible(false);
        Xrm.Page.ui.tabs.get("tab_Supporting_Documentation").sections.get("documentsTab_CodingSection").setVisible(false);
        Xrm.Page.ui.tabs.get("tab_Declaration_Consent").sections.get("tab_Declaration_Consent_section_Coding").setVisible(false);
    }

}).call(PODS);