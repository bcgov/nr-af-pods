var PODS = window.PODS || {};
(function () {
    this.formOnLoad = async function (executionContext) {
		const formContext = executionContext.getFormContext();
        PODS.initDocumentsTabClickedHandler(formContext);
    }
	
    this.initDocumentsTabClickedHandler = async function (formContext) {
        debugger
        
        const projectLookupCtrAtt = formContext.getControl('quartech_project').getAttribute();
        if (!projectLookupCtrAtt) return;

        const claimFolder = formContext.getControl('quartech_name').getValue();

		var projectLookupValue = projectLookupCtrAtt.getValue();
        var projectGuid = projectLookupValue[0].id;
		
		var documentsTab = formContext.ui.tabs.get("tab_Documents");
        documentsTab.addTabStateChange(
            function() {
                try {
                    PODS.loadDocumentsIframe(formContext, projectGuid, claimFolder);
                } catch (err) {
                    console.error(err);
                    
                    var documentsTabScriptsNotConfigured = error?.message === 'PODS.loadDocumentsIframe is not a function';
                    if (documentsTabScriptsNotConfigured) {
                        formContext.ui.setFormNotification("Please contact the PODS team to configure the form and JS code to handle Documents tab <documents-management-script.js>", "ERROR");
                    }
                    
                }
            }
        );
    }

}).call(PODS);