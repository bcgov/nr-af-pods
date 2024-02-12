var PODS = window.PODS || {};
(function () {
    this.formOnLoad = async function (executionContext) {
		const formContext = executionContext.getFormContext()

        await PODS.prepNewEmailForm(formContext)
    }
	
    this.prepNewEmailForm = async function (formContext) {
        
        const isCreatingEmail = formContext.ui.getFormType() === 1
        var regardingLookup = formContext.getAttribute("regardingobjectid").getValue();  // regarding lookup on email form

        if (!isCreatingEmail || !regardingLookup) return

        let dataToDisplay = null
        switch (regardingLookup[0].entityType)
        {
            case 'msgov_businessgrantapplication':
                dataToDisplay = await PODS.getApplicationData(regardingLookup[0].id)

                break;
            case 'quartech_grantproject':
                dataToDisplay = await PODS.getProjectData(regardingLookup[0].id)
                break;
            default:
                break;
        }

        if (dataToDisplay) {
            PODS.populateNewEmail(formContext, dataToDisplay)
        }
    }
	
    this.getProjectData = async function (projectGuid) {
        const result = await Xrm.WebApi.retrieveRecord("quartech_grantproject", projectGuid, "?$select=quartech_name, quartech_pt_projectidentifier&$expand=quartech_application($select=quartech_legalnamefirst,quartech_legalnamelast,quartech_email;$expand=quartech_ProgramIntake($select=quartech_name)),quartech_program($select=msgov_programname)")

        let applicationData = {
            applicantContactFirstName: result?.quartech_application?.quartech_legalnamefirst,
            applicantContactLastName: result?.quartech_application?.quartech_legalnamelast,
            applicantContactEmail: result?.quartech_application?.quartech_email,
            programName: result?.quartech_program?.msgov_programname,
            intakeNumber: result?.quartech_application?.quartech_ProgramIntake?.quartech_name,
            projectName: result?.quartech_name,
            ptProjectId: result?.quartech_pt_projectidentifier,
        }

        return applicationData
    }
	
    this.populateNewEmail = async function (formContext, data) {
        // from
        const afPodsNotificationUserData = await PODS.getAfPodsNotificationUserGuidByEmail()
        var obj = new Object();
        obj.name = `${afPodsNotificationUserData.firstName} ${afPodsNotificationUserData.lastName}`;
        obj.entityType = "systemuser";
        obj.id = afPodsNotificationUserData.userId;
        var fromField = formContext.getAttribute("from");
        var value = new Array();
        value[0] = obj;
        fromField.setValue(value);

        // to
        obj = new Object();
        obj.name = data.applicantContactEmail;
        obj.entityType = "unresolvedaddress";
        obj.id = "{00000000-0000-0000-0000-000000000000}";
        var toField = formContext.getAttribute("to");
        value = new Array();
        value[0] = obj;
        toField.setValue(value);

        //subject
        let subject = `Re. ${data.projectName}`
        if (data.intakeNumber) {
            subject += ` - ${data.intakeNumber}`
        }
        formContext.getAttribute("subject").setValue(subject);

        //email description
        let description = `Hi ${data.applicantContactFirstName},\n\r`
        
        description += `${data.applicantContactFirstName} ${data.applicantContactLastName}, ${data.projectName}`

        if (data.intakeNumber) {
            description += ` - ${data.intakeNumber}`
        }
        description += `, ${data.projectName} with the ${data.ptProjectId} project id`
        
        formContext.getAttribute("description").setValue(description);
    }
	
    this.getAfPodsNotificationUserGuidByEmail = async function () {
        const afPodsNotificationEmail = 'af.podsnotification@gov.bc.ca'
        const result = await Xrm.WebApi.retrieveMultipleRecords("systemuser",`?$filter=domainname eq '${afPodsNotificationEmail}'&$select=systemuserid,firstname,lastname`)

        const userRow = result?.entities[0]
        let userData = {
            userId: userRow?.systemuserid,
            firstName: userRow?.firstname,
            lastName: userRow?.lastname,
        }

        return userData
    }
	
    this.getApplicationData = async function (applicationGuid) {
        const result = await Xrm.WebApi.retrieveRecord("msgov_businessgrantapplication", applicationGuid, "?$select=quartech_legalnamefirst,quartech_legalnamelast,quartech_email,msgov_name,quartech_applicationid&$expand=quartech_Program($select=msgov_programname),quartech_ProgramIntake($select=quartech_name)")

        let applicationData = {
            applicantContactFirstName: result?.quartech_legalnamefirst,
            applicantContactLastName: result?.quartech_legalnamelast,
            applicantContactEmail: result?.quartech_email,
            programName: result?.quartech_Program?.msgov_programname,
            intakeNumber: result?.quartech_ProgramIntake?.quartech_name,
            projectName: result?.msgov_name,
            ptProjectId: result?.quartech_applicationid,
        }

        return applicationData
    }
	
    this.getAfPodsNotificationUserGuid = async function () {
        const result = await Xrm.WebApi.retrieveMultipleRecords("environmentvariabledefinition","?$filter=schemaname eq 'quartech_AfPodsNotificationUserGuid'&$select=environmentvariabledefinitionid&$expand=environmentvariabledefinition_environmentvariablevalue($select=value)")

        const userGuid = result?.entities[0]?.environmentvariabledefinition_environmentvariablevalue[0]?.value

        return userGuid
    }
}).call(PODS);