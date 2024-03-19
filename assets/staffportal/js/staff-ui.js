var PODS = window.PODS || {};
(function () {
    
    this.customizeFormByJsonConfig = async function (formContext, formJsonConfig) {
        if (!formJsonConfig) return

        console.log(`Customizing the form using the Form JSON Config: ${formJsonConfig}`)

        const formConfig = JSON.parse(formJsonConfig)
        if (!formJsonConfig) 
        { 
            console.log(`Application Information form's JSON Config is MAL FORMATTED.`)
            return
        }

        formConfig.tabs?.forEach((tabConfig) => {
            tabConfig.sections?.forEach(function customizeSection(sectionConfig) {
                const tabConfig = this

                const tabCtr = Xrm.Page.ui.tabs.get(tabConfig.name)
                if (!tabCtr) {
                    console.error(`'${tabConfig.name}' tab name is not FOUND on this form - Application Information form's JSON Config.`)
                    return // continue on the next section
                }
                
                const sectionCtr = tabCtr.sections.get(sectionConfig.name)
                if (!sectionCtr) {
                    console.error(`'${sectionConfig.name}' section name is not FOUND on this form - Application Information form's JSON Config.`)
                    return // continue on the next section
                }

                if (sectionConfig.visible) {
                    sectionCtr.setVisible(true)
                }
                
                sectionConfig.fields?.forEach(function customizeField(fieldConfig) {
                    const fieldControl = formContext.getControl(fieldConfig.name)
                    
                    if (!fieldControl) {
                        console.error(`'${fieldConfig.name}' field name is not FOUND on this form - Application Information form's JSON Config.`)
                        return // continue on the next field
                    }
                    const fieldAttribute = formContext.getAttribute(fieldConfig.name)

                    if (fieldConfig.label)
                    {
                        fieldControl.setLabel(fieldConfig.label)
                        fieldConfig.visible = true
                    }

                    if (fieldConfig.visible === true || fieldConfig.visible === false)
                    {
                        fieldControl.setVisible(fieldConfig.visible)
                    }

                    if (fieldConfig.disabled === true || fieldConfig.disabled === false)
                    {
                        fieldControl.setDisabled(fieldConfig.disabled)
                    }

                    if (fieldConfig.autoFillValue)
                    {
                        const controlType = fieldControl.getControlType()
                        switch (controlType) {
                            case "optionset":
                                if (!fieldAttribute.getValue()) {
                                    fieldAttribute.setValue(fieldConfig.autoFillValue);
                                }
                                break
                            case "lookup":
                                if (!fieldAttribute.getValue()) {
                                    const lookupEntityType = fieldControl.getEntityTypes()[0]
                                    var lookupValue = new Array()
                                    lookupValue[0] = new Object()
                                    lookupValue[0].id = fieldConfig.autoFillValue
                                    lookupValue[0].name = fieldConfig.autoFillLabel
                                    lookupValue[0].entityType = lookupEntityType
                                    fieldAttribute.setValue(lookupValue)
                                }
                                break
                            case "standard":
                                if (fieldAttribute.getValue() !== fieldConfig.autoFillValue) {
                                    fieldAttribute.setValue(fieldConfig.autoFillValue)
                                }
                                break
                            default:
                                break
                        }
                    }
                });
                

            }, tabConfig);
        });
    }
    
}).call(PODS);