var PODS = window.PODS || {};
(function () {
    this.formOnLoad = async function (executionContext) {
		const formContext = executionContext.getFormContext();

        let subject = formContext.getAttribute('subject')?.getValue()
        
        if (!subject) {
            PODS.populateCallToWithPortalUser(formContext);
        }
    }
	
    this.populateCallToWithPortalUser = async function (formContext) {
        let regardingLookup = formContext.getAttribute('regardingobjectid')?.getValue()
        if (!regardingLookup) return
        
        const regardingRecord = regardingLookup[0]
        let portalUser = null

        switch (regardingRecord.entityType) {
            case "msgov_businessgrantapplication":
                portalUser = await PODS.getPortalUserByApplicationGuid(regardingRecord.id)
                break
            case "quartech_claim":
                portalUser = await PODS.getPortalUserByClaimGuid(regardingRecord.id)
                break
            case "quartech_grantproject":
                portalUser = await PODS.getPortalUserByProjectGuid(regardingRecord.id)
                break
            default:
                break;
        }

        if (!portalUser) return

        // Populate the Call To field with the Portal User Guid        
        var callToLookupValue = new Array();
        callToLookupValue[0] = new Object();
        callToLookupValue[0].id = portalUser.contactid;
        callToLookupValue[0].name = portalUser.fullname;
        callToLookupValue[0].entityType = "contact";

        formContext.getAttribute('to')?.setValue(callToLookupValue)
    }

    this.getPortalUserByApplicationGuid = async function (applicationGuid) {
        const result = await Xrm.WebApi.retrieveRecord("msgov_businessgrantapplication", applicationGuid, "?$select=_quartech_applicant_value&$expand=quartech_Applicant($select=fullname,emailaddress1)");

        if (!result || !result.quartech_Applicant) return null
        
        const portalUser = {
            contactid:  result.quartech_Applicant.contactid,
            fullname:  result.quartech_Applicant.fullname,
            emailaddress1:  result.quartech_Applicant.emailaddress1 
        }

        return portalUser
    }

    this.getPortalUserByClaimGuid = async function (claimGuid) {
        const result = await Xrm.WebApi.retrieveRecord("quartech_claim", claimGuid, "?$select=quartech_portalcontact&$expand=quartech_portalcontact($select=fullname,emailaddress1)");

        if (!result || !result.quartech_portalcontact) return null
        
        const portalUser = {
            contactid:  result.quartech_portalcontact.contactid,
            fullname:  result.quartech_portalcontact.fullname,
            emailaddress1:  result.quartech_portalcontact.emailaddress1 
        }

        return portalUser
    }

    this.getPortalUserByProjectGuid = async function (projectGuid) {
        const result = await Xrm.WebApi.retrieveRecord("quartech_grantproject", projectGuid, "?$select=_quartech_projectcontact_value&$expand=quartech_ProjectContact($select=fullname,emailaddress1)");

        if (!result || !result.quartech_ProjectContact) return null
        
        const portalUser = {
            contactid:  result.quartech_ProjectContact.contactid,
            fullname:  result.quartech_ProjectContact.fullname,
            emailaddress1:  result.quartech_ProjectContact.emailaddress1 
        }

        return portalUser
    }

}).call(PODS);