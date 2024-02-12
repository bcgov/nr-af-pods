var PODS = window.PODS || {};
(function () {
    var documentsTabClicksCount = 0;
    
    this.documentsTabClicked = async function (formContext, projectGuid) {
        var fetchXml = `<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">
                                  <entity name="quartech_grantproject">
                                    <attribute name="quartech_pt_projectidentifier" />
                                    <attribute name="quartech_documentfoldername" />
                                    <attribute name="quartech_documentsfoldercreated" />
                                    <attribute name="quartech_name" />
                                    <attribute name="quartech_grantprojectid" />
                                    <order attribute="quartech_name" descending="false" />
                                    <filter type="and">
                                      <condition attribute="quartech_grantprojectid" operator="eq" uiname="LeoTest0530_01" uitype="quartech_grantproject" value="${projectGuid}" />
                                    </filter>
                                    <link-entity name="msgov_program" from="msgov_programid" to="quartech_program" visible="false" link-type="inner" alias="program">
                                      <attribute name="quartech_programdocumentlocation" />
                                      <attribute name="quartech_projectsfoldersrelativeurl" />
                                    </link-entity>
                                  </entity>
                                </fetch>`;
         
        fetchXml = "?fetchXml=" + encodeURIComponent(fetchXml);
        
        var result = await Xrm.WebApi.retrieveMultipleRecords("quartech_grantproject", fetchXml);
        
        var programDocumentsLocation = result?.entities[0]['program.quartech_programdocumentlocation'];
        var projectsFoldersRelatedURL = result?.entities[0]['program.quartech_projectsfoldersrelativeurl'];
        
        var ptProjectIdentifier = result?.entities[0]['quartech_pt_projectidentifier'];
        var projectDocumentsFolderName = result?.entities[0]['quartech_documentfoldername'];
        
        var isProjectForm = formContext._entityName === 'quartech_grantproject';
        
        if (!projectDocumentsFolderName) {
            projectDocumentsFolderName = ptProjectIdentifier;
            if(isProjectForm) {
                console.log(`Updating Documents Folder Name with the '${ptProjectIdentifier}' PT Project Identifer...`);
                formContext.getAttribute('quartech_documentfoldername').setValue(projectDocumentsFolderName);
            }
        }
        
        var isProjectDocumentsFolderCreated = result?.entities[0]['quartech_documentsfoldercreated'];
        
        var projectDocumentsFolderUrl = `${programDocumentsLocation}/${projectsFoldersRelatedURL ? projectsFoldersRelatedURL : ''}`;
        if (isProjectDocumentsFolderCreated) {
            projectDocumentsFolderUrl += `/${projectDocumentsFolderName ? projectDocumentsFolderName : ''}`;
        }
        else {
            if (documentsTabClicksCount == 0) {
                var additionalDetailsForNonProjectForm = '';
                
                if (!isProjectForm) {
                    additionalDetailsForNonProjectForm = 'Navigate to the Documents tab on the Project form to ';
                }
                
                formContext.ui.setFormNotification(`Please (1) CREATE the ${projectDocumentsFolderName} folder. Then (2) ${additionalDetailsForNonProjectForm}confirm by updating the value of Document Folder Created to Yes.`, "WARNING");
            }
        }
        
        console.log(`Reloading iFrame with the '${projectDocumentsFolderUrl}' URL...`);
        
        var spoDocumentsIFrame = formContext.getControl("IFRAME_SpoDocuments");
        spoDocumentsIFrame.setSrc(projectDocumentsFolderUrl);
        
        documentsTabClicksCount++;
    }

    var documentsIframLoaded = false

    this.loadDocumentsIframe = async function (formContext, projectGuid, folderName = '') {
        if (documentsIframLoaded) return

        const documentsUrl = await PODS.getProjectDocumentsFolderUrl(formContext, projectGuid)

        console.log(`Loading iFrame using Documents Url (${documentsUrl}) ...`)
        
        var spoDocumentsIFrame = formContext.getControl("IFRAME_SpoDocuments")
        spoDocumentsIFrame.setSrc(`${documentsUrl}/${folderName}`)
        
        documentsIframLoaded = true
    }
    
    this.getProjectDocumentsFolderUrl = async function (formContext, projectGuid) {
        let fetchXml = `<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false">
                                  <entity name="quartech_grantproject">
                                    <attribute name="quartech_pt_projectidentifier" />
                                    <attribute name="quartech_documentfoldername" />
                                    <order attribute="quartech_name" descending="false" />
                                    <filter type="and">
                                      <condition attribute="quartech_grantprojectid" operator="eq" uiname="LeoTest0530_01" uitype="quartech_grantproject" value="${projectGuid}" />
                                    </filter>
                                    <link-entity name="msgov_program" from="msgov_programid" to="quartech_program" visible="false" link-type="inner" alias="program">
                                      <attribute name="quartech_sharepointsiteaddress" />
                                      <attribute name="quartech_sharepointdocumentlibraryrelativeurl" />
                                      <attribute name="quartech_sharepointdocumentlibraryfolderpath" />
                                    </link-entity>
                                  </entity>
                                </fetch>`;
         
        fetchXml = "?fetchXml=" + encodeURIComponent(fetchXml);
        
        let result = await Xrm.WebApi.retrieveMultipleRecords("quartech_grantproject", fetchXml);
        
        let spSiteAddress = result?.entities[0]['program.quartech_sharepointsiteaddress']; // i.e. "https://bcgov.sharepoint.com/sites/AF-PODS-DEV"
        let docLibRelativeUrl = result?.entities[0]['program.quartech_sharepointdocumentlibraryrelativeurl']; // i.e. "Shared Documents"
        let programStreamFolderPath = result?.entities[0]['program.quartech_sharepointdocumentlibraryfolderpath']; // i.e. "ABPP/ABPP PODS DOC S1"

        const ptProjectIdentifier = result?.entities[0]['quartech_pt_projectidentifier'];
        let projectDocumentsFolderName = result?.entities[0]['quartech_documentfoldername'];
        
        if (!projectDocumentsFolderName) {
            projectDocumentsFolderName = ptProjectIdentifier;
        }
        
        var projectDocumentsFolderUrl = `${spSiteAddress}/${docLibRelativeUrl}/${programStreamFolderPath}/${projectDocumentsFolderName}`;
        
        console.log(`Project Documents' Folder URL: '${projectDocumentsFolderUrl}'`);

        return projectDocumentsFolderUrl
    }
}).call(PODS);