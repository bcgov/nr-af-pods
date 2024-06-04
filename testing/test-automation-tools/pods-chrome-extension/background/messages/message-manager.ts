import { type PlasmoMessaging } from "@plasmohq/messaging"
import { GET_GITHUB_JSON_FILE_CONTENT, OPEN_NEW_TAB, TEST_RESULT } from "~constants/task-command"
import type { GithubFile } from "~contents/pods/github-file"
import type { TabTaskRequest } from "~models/tab-task-request"
import type { TabTaskResponse } from "~models/tab-task-response"

console.log('init background')

let tabWorkerAndRequesters = new Map<string, number>

async function openNewTab(tabUrl: string): Promise<void> {
    console.log(`Opening a new tab: url = ${JSON.stringify(tabUrl)}`)

    chrome.tabs.create({url: tabUrl, active: false }, tab =>{
        setTimeout(function(){
            chrome.tabs.remove(tab.id);
        }, 600000) // 10 mins
    });
}

async function getJson(jsonFileUrl): Promise<string> {
    console.log(`getting JSON from URL: ${jsonFileUrl}`)
    
    const response = await fetch(jsonFileUrl)
    
    const jsonContent = await response.json()
    console.log(`JSON Content: ${JSON.stringify(jsonContent)}`)
    
    return JSON.stringify(jsonContent)
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    console.log(`Request received: ${JSON.stringify(req)}`)

    if (req.body?.id === OPEN_NEW_TAB) {
        const requesterTabId = req.sender?.tab?.id
        
        const tabUrl: string = req.body.tabUrl

        tabWorkerAndRequesters.set(tabUrl, requesterTabId)

        openNewTab(tabUrl)

        res.send({ message: '{ status : "OK" }'})
        
        return
    }

    if (req.body?.id === GET_GITHUB_JSON_FILE_CONTENT) {
        const requesterTabId = req.sender?.tab?.id
        
        const tabTask: TabTaskRequest = req.body.tabTask
        const json = await getJson(tabTask.fileUrl)

        console.log(`Test Script JSON: ${json}`)

        res.send({ jsonContent: json})

        return
    }
    
    // SKIPPED 👇
    if (req.body?.id === GET_GITHUB_JSON_FILE_CONTENT) {
        let mockTestScript= `{
            "name": "Claim - NEFBA P2 - Test Script",
            "testSteps" : [
                {   "action" : "open-new-tab", "url": "https://af-pods-dev.powerappsportals.com/my-claims" }
                , {   "action" : "find-list-item",
                        "techNotes" : "labels the fields element below indicate the headers of the list/table",
                        "fields" : [ 
                            { "label" : "Program", "value" : "New Entrant Farm Business Accelerator Phase 2", "visible" : true}, 
                            { "label" : "Claim Status", "value" : "Draft", "visible" : true}, 
                            { "label" : "Actions", "type" : "action menu", "value" : "Edit / Submit Claim", "action" : "Click the link"} 
                        ],
                        "description" : "My Claims list should display a DRAFT NEFBA P2 Claim with a link to EDIT it." }
                , { "action" : "Expect", "field" : { "label": "I / We confirm the above information is correct", "visible" : true, "required" : true } }
                , { "action" : "Select", "field" : { "label": "I / We confirm the above information is correct", "value": "No"} }
                , { "action" : "Expect", "field" : { "label": "Please provide further detail", "visible" : true, "required" : true } }
                , { "action" : "Select", "field" : { "label": "I / We confirm the above information is correct", "value": "Yes"} }
                , { "action" : "Click on the Next button.", "description" : "Go to the Project Results step by clicking Next button." }
                , { "action" : "Select", "field" : { "label": "Did you adopt any technologies, equipment, practices, or processes as a result of this project?", "value": "Yes"} }
                , { "action" : "Expect", "field" : { "label": "How many?", "visible" : true, "required" : true } }
                , { "action" : "Select", "field" : { "label": "Did you adopt any technologies, equipment, practices, or processes as a result of this project?", "value": "No"} }
                , { "action" : "Expect", "field" : { "label": "How many?", "visible" : false, "required" : false } }
                , { "action" : "Select", "field" : { "label": "Did you adopt any technologies, processes or equipment that are environmentally beneficial as a result of this project?", "value": "No"} }
                , { "action" : "Expect", "field" : { "label": "How many?", "displayOrder" : 2, "visible" : false, "required" : false } }
                , { "action" : "Select", "field" : { "label": "Did you adopt any technologies, processes or equipment that are environmentally beneficial as a result of this project?", "value": "Yes"} }
                , { "action" : "Expect", "field" : { "label": "How many?", "displayOrder" : 2, "visible" : true, "required" : true } }
                , { "action" : "Enter", "field" : { "label": "How many?", "displayOrder" : 2, "value": 6} }
                , { "action" : "Click on the Next button.", "description" : "Go to the Claim Information step by clicking Next button." }
                , { "action" : "Expect", "field" : { "label": "Your requested amount in this claim ($CAD)", "visible" : true, "required" : true } }
                , { "action" : "Enter", "field" : { "label": "Your requested amount in this claim ($CAD)", "value": 999.50} }
                , { "action" : "Click on the Next button.", "description" : "Go to the Documents step by clicking Next button." }
                , { "action" : "Enable the Next button.", "description" : "Enable Next button. Skip the docs upload and NEFBA satisfaction survey test." }
                , { "action" : "Click on the Next button.", "description" : "Go to the Declaration and Consent step by clicking Next button." }
                , { "action" : "Expect", "field" : { "label": "I / We agree to the above statement.", "visible" : true, "required" : true } }
                , { "action" : "Enter", "field" : { "label": "I / We agree to the above statement.", "value" : "checked" } }
                , { "action" : "Click on the Submit button.", "description" : "Submit the Claim." }
            ]
        }`

        // let mockTestScript_for_claim-test-script-abpp-s= `{ 
        //     "name": "Claim - KTTP S2 - Test Script",
        //     "testSteps" : [
        //         { "action" : "open-new-tab", "url": "https://af-pods-test.powerappsportals.com/claim/?id=7caf5d0e-d3d5-ee11-904c-6045bdf9def5" }
        //         , { "action" : "Test Case: Applicant Information step" }
        //         , { "action" : "Expect", "field" : { "label": "Legal Business or Organization Name", "visible" : true } }
        //         , { "action" : "Expect", "field" : { "label": "Business Address", "visible" : true } }
        //         , { "action" : "Expect", "field" : { "label": "Tel", "visible" : true } }
        //         , { "action" : "Expect", "field" : { "label": "Email", "visible" : true } }
        //         , { "action" : "Expect", "field" : { "label": "I / We confirm the above information is correct", "visible" : true, "required" : true } }
        //         , { "action" : "Select", "field" : { "label": "I / We confirm the above information is correct", "value": "Yes"} }
        //         , { "action" : "Expect", "field" : { "label": "File number (from authorization letter)", "visible" : true } }
        //         , { "action" : "Click on the Next button." }
        //         , { "action" : "Test Case: Project Results" }
        //         , { "action" : "Expect", "field" : { "label": "How many people participated in the training funded by this project, including the applicant?", "visible" : true, "required" : true } }
        //         , { "action" : "Enter", "field" : { "label": "How many people participated in the training funded by this project, including the applicant?", "value": "10"} }
        //         , { "action" : "Enter", "field" : { "label": "Project End Date", "value": "10/12/2026"} }
        //         , { "action" : "Expect", "field" : { "label": "Select the category that most closely describes the training funded by this project:", "visible" : true, "required" : true } }
        //         , { "action" : "Select", "field" : { "label": "Select the category that most closely describes the training funded by this project:", "value": "Skill training events (upskilling/reskilling) that support skills development​"} }
        //         , { "action" : "Expect", "field" : { "label": "If applicable, please provide the estimated number of participants who were producers/processors:", "visible" : true } }
        //         , { "action" : "Enter", "field" : { "label": "If applicable, please provide the estimated number of participants who were producers/processors:", "value": "5"} }
        //         , { "action" : "Click on the Next button." }
        //         , { "action" : "Test Case: Claim Information" }
        //         , { "action" : "Expect", "field" : { "label": "Your requested amount in this claim ($CAD)", "visible" : true, "required" : true } }
        //         , { "action" : "Enter", "field" : { "label": "Your requested amount in this claim ($CAD)", "value": "10"} }
        //         , { "action" : "Click on the Next button." }
        //         , { "action" : "Test Case: Documents" }
        //         , { "action" : "Test Case: Documents" }
        //         , { "action" : "Expect", "field" : { "label": "Activity Report", "visible" : true, "required" : true } }
        //         , { "action" : "Enter", "field" : { "label": "Activity Report", "value": "mocked-file.test"} }
        //         , { "action" : "Enable the Next button." }
        //         , { "action" : "Wait for 2 seconds." }
        //         , { "action" : "Click on the Next button." }
        //         , { "action" : "Click on the Previous button." }
        //         , { "action" : "Click on the Previous button." }
        //         , { "action" : "Click on the Previous button." }
        //         , { "action" : "Click on the Previous button." }
        //     ]
        // }`

        // let mockTestScript= `{
        //     "name": "Claim - KTTP S2 - Test Script",
        //     "testSteps" : [
        //         { "action" : "open-new-tab", "url": "https://af-pods-test.powerappsportals.com/claim/?7caf5d0e-d3d5-ee11-904c-6045bdf9def5" }
        //         , { "action" : "Test Case: Applicant Information step" }
        //         , { "action" : "Expect", "field" : { "label": "Legal Business or Organization Name", "visible" : true } }
        //         , { "action" : "Expect", "field" : { "label": "Business Address", "visible" : true } }
        //         , { "action" : "Expect", "field" : { "label": "Tel", "visible" : true } }
        //         , { "action" : "Expect", "field" : { "label": "Email", "visible" : true } }
        //         , { "action" : "Expect", "field" : { "label": "I / We confirm the above information is correct", "visible" : true, "required" : true } }
        //         , { "action" : "Select", "field" : { "label": "I / We confirm the above information is correct", "value": "Yes"} }
        //         , { "action" : "Expect", "field" : { "label": "File number (from authorization letter)", "visible" : true } }
        //         , { "action" : "Click on the Next button." }
        //         , { "action" : "Test Case: Project Results" }
        //         , { "action" : "Expect", "field" : { "label": "How many people participated in the training funded by this project, including the applicant?", "visible" : true, "required" : true } }
        //         , { "action" : "Enter", "field" : { "label": "How many people participated in the training funded by this project, including the applicant?", "value": "10"} }
        //         , { "action" : "Enter", "field" : { "label": "Project End Date", "value": "10/12/2026"} }
        //         , { "action" : "Expect", "field" : { "label": "Select the category that most closely describes the training funded by this project:", "visible" : true, "required" : true } }
        //         , { "action" : "Select", "field" : { "label": "Select the category that most closely describes the training funded by this project:", "value": "Skill training events (upskilling/reskilling) that support skills development​"} }
        //         , { "action" : "Expect", "field" : { "label": "If applicable, please provide the estimated number of participants who were producers/processors:", "visible" : true } }
        //         , { "action" : "Enter", "field" : { "label": "If applicable, please provide the estimated number of participants who were producers/processors:", "value": "5"} }
        //         , { "action" : "Click on the Next button." }
        //         , { "action" : "Test Case: Claim Information" }
        //         , { "action" : "Expect", "field" : { "label": "Your requested amount in this claim ($CAD)", "visible" : true, "required" : true } }
        //         , { "action" : "Enter", "field" : { "label": "Your requested amount in this claim ($CAD)", "value": "10"} }
        //         , { "action" : "Click on the Next button." }
        //         , { "action" : "Test Case: Documents" }
        //     ]
        // }`

        res.send({ jsonContent: mockTestScript})

        return
    }

    if (req.body?.id === TEST_RESULT) {
        res.send({ message: '{ status : "OK" }'})
        
        let response: TabTaskResponse = { fileUrl: req.sender?.url, jsonResult: req.body.items }

        const requesterTabId = tabWorkerAndRequesters.get(req.sender?.url)

        if (requesterTabId) {
            chrome.tabs.sendMessage(requesterTabId, JSON.stringify(response))
        }

        return
    }
}
 
export default handler