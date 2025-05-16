{
  "tags": ["ClaimForm", "StaffPortal", "TFCCRF"],
  "version": "1.0.2",
  "name": "TREE FRUIT CLIMATE CHANGE RESPONSE FUND",
  "abbreviation": "TFCCRF",
  "tabs": [
    {
      "name": "claimreviewtab",
      "sections": [
        {
          "name": "claimprocessingsection",
		  "visible": false,
		  "fields": [
            {
                "name": "quartech_reimbursementclaimreceived",
                "visible": false
            },
            {
              "name": "quartech_eventreportreceived",
              "visible": false
            },
            {
              "name": "quartech_itemizedexpenselistreceived",
              "visible": false
            },
            {
              "name": "quartech_allinvoicesreceiptsphotosreviewed",
              "visible": false
            },
            {
              "name": "quartech_reimbursementverified",
              "visible": false
            },
            {
              "name": "quartech_paymentrequestsenttoprogramstaff",
              "visible": false
            }
          ]
        },
        {
          "name": "claimreviewsection",
          "fields": [
            {
                "name": "quartech_approvedreimbursementamount",
                "visible": false
            },
            {
              "name": "quartech_amountsenttocsnrforpayment",
              "label": "Amount Paid"
            }
          ]
        },        
        {
          "name": "claimpaymentsection",
          "fields": [
            {
              "name": "quartech_datecsnrsentchequepayment",
              "label": "Payment Date"
            },
            {
                "name": "quartech_eftcompletedon",
                "visible": true
            },
            {
                "name": "quartech_chequeissuedon",
                "visible": true
            },
            {
                "name": "quartech_fundinglettersenton",
                "visible": true
            },
            {
                "name": "quartech_paymenttemplatesenttocsnr",
                "visible": false
            },
            {
                "name": "quartech_eaapprovalrequestsent",
                "visible": false
            },
            {
                "name": "quartech_paymentapprovedbyea",
                "visible": false
            },
            {
                "name": "quartech_datecsnrsentchequepayment",
                "visible": false
            },
            {
                "name": "quartech_paymentdeposited",
                "visible": false
            }			
          ]
        }
      ]
    }
  ]
}