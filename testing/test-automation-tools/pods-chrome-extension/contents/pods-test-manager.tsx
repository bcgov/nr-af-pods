import React, { useState } from "react";
import type { PlasmoCSConfig } from "plasmo"
import { sendToBackground } from "@plasmohq/messaging"
import { GET_GITHUB_JSON_FILE_CONTENT, TEST_AGENT_READY_FOR_TEST_STEPS } from "~constants/task-command"
import { BACKGROUND_MESSAGE_MANAGER_ID as BACKGROUND_MESSAGE_MANAGER_NAME } from "~background/background-message-ids"
import { Box, Button, Stack, Tab, Tabs, Typography } from "@mui/material"
import createCache from "@emotion/cache"
import { CacheProvider } from "@emotion/react"
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import type { TestScript } from "./pods/test-script";
import type { TestStep } from "./pods/test-step";
import type { TabTaskRequest } from "~models/tab-task-request";

const PODS_APPLICANT_PORTAL_DEV_ORIGIN = "https://af-pods-dev.powerappsportals.com"
const PODS_APPLICANT_PORTAL_TEST_ORIGIN = "https://af-pods-test.powerappsportals.com"

export const config: PlasmoCSConfig = { matches: ['https://sites.google.com/view/pods-testing*'], //https://af-pods-dev.powerappsportals.com/tests/
css: ["pods-test-manager.css"] }

function initTabTasks() : TabTaskRequest[] {
  let tabTasks = []
  
  const urlParams = new URLSearchParams(location.search);
  let testScriptUrl = 'https://github.com/leopham365/azure-serverless-demo/blob/master/pods-testing/dev/pods-test-script.json'
  if (urlParams.has('testScript')) {
    testScriptUrl = urlParams.get('testScript')
  }

  let testName = 'Automation-In-Dev'
  tabTasks.push({ id: testName, fileUrl: testScriptUrl }) 

  return tabTasks
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}
async function sleep(ms: number): Promise<void> {
  return new Promise(
      (resolve) => setTimeout(resolve, ms));
}

function PlasmoOverlay() {
  console.log('PlasmoOverlay...')

  let tasks = initTabTasks()

  const [tabTasks, setTabTasks] = useState<TabTaskRequest[]>(tasks)

  const [testSteps, setTestSteps] = useState<TestStep[]>([])

  var testAgentBrowserTab = null
  let podsTestScript: TestScript = null
  
  async function executeTestScripts(tabTasks: TabTaskRequest[]): Promise<void> {
    console.info(`executeTestScripts...`)
    
    if (!podsTestScript) {
      window.addEventListener(
        "message",
        async (event) => {
          const isPodsDevOrTest = event.origin === PODS_APPLICANT_PORTAL_DEV_ORIGIN
                                || event.origin === PODS_APPLICANT_PORTAL_TEST_ORIGIN
          
          if (!isPodsDevOrTest) return
  
          console.log(`PODS Test Manager received: ${event.data}`)
  
          if(event.data === TEST_AGENT_READY_FOR_TEST_STEPS) {
            const testStepsToBeExec = podsTestScript.testSteps.filter((step) => !step.executed);
            console.log(`testStepsToBeExec to be sent to the AGENT ${JSON.stringify(testStepsToBeExec)}`)
  
            if (testStepsToBeExec) {
              await sleep(2000)
              testAgentBrowserTab.postMessage(JSON.stringify(testStepsToBeExec), "*") }
            
            return
          }
  
          const testStepExecuted = event.data.indexOf('"executed":true') > -1
          if(testStepExecuted) {
            const executedTestStep : TestStep = JSON.parse(event.data)
            const foundTestStep = podsTestScript.testSteps.find((step) => step.id === executedTestStep.id)
            
            foundTestStep.executed = executedTestStep.executed
            foundTestStep.failed = executedTestStep.failed
            foundTestStep.results = executedTestStep.results
          }
  
          const testStepsToBeExec = podsTestScript.testSteps.find((step) => !step.executed);
          if (!testStepsToBeExec) {
            console.log(`TEST REPORTS: ${JSON.stringify(podsTestScript.testSteps)}`)
            
            let failedSteps = podsTestScript.testSteps.filter((step) => step.failed)
            let passedSteps = podsTestScript.testSteps.filter((step) => step.executed && !step.failed)
            
            let testReport = podsTestScript.testSteps[0]
            
            if (testReport.id !== 0) {
              testReport = { id: 0, 
                results : `✍️✍️✍️ TEST REPORT - ${podsTestScript.name} :`
                , action: '', failed: failedSteps.length > 0, executed: true, field: null, url: '', description: '', fields: null }
                
              podsTestScript.testSteps.unshift(testReport)
            }
debugger
            testReport.results = ` ⛔ ${failedSteps.length} Failed steps | ✅ ${passedSteps.length} Passed steps | Total number of steps: ${podsTestScript.testSteps.length - 1}.`

            setTestSteps(podsTestScript.testSteps)
          }
        },
        false,
      );
    }
  
    for (let task of tabTasks) {
      const downloadJsonTabTaskReq: TabTaskRequest = { 
          id: task.id, 
          fileUrl: task.fileUrl
      }
  
      const resp = await sendToBackground({
        name: BACKGROUND_MESSAGE_MANAGER_NAME,
        body: {
          id : GET_GITHUB_JSON_FILE_CONTENT,
          tabTask: downloadJsonTabTaskReq
        }
      })
      
      console.log(`jsonContent = ${resp.jsonContent}`)
  
      podsTestScript = JSON.parse(resp.jsonContent)
  
      console.log(`Executing tests for the ${podsTestScript.name} test suite`)
      podsTestScript.testSteps.forEach(function(testStep, index){
        testStep.id = index + 1
      });
  
      const openNewTabStep = podsTestScript.testSteps.find((step) => step.action.toLowerCase() === 'open-new-tab');
  
      if (openNewTabStep) {
        testAgentBrowserTab = window.open(openNewTabStep.url, '_blank')
  
        openNewTabStep.executed = true
        openNewTabStep.failed = false
        openNewTabStep.results = `✅ STEP ${ openNewTabStep.id }: ${ openNewTabStep.action } ${openNewTabStep.url}`
      }
    }
  }

  const tabTasksGridColumns: GridColDef[] = [
    { field: 'id', editable: true, headerName: 'Test Name', width: 300 },
    { field: 'fileUrl', editable: true, headerName: '(JSON) File URL', width: 1400,
      renderCell: (cellValues) => (
        <div style={{ lineHeight: "normal", display: "flex", flexDirection: "column", height: 40 }}>
          {cellValues.row.fileUrl}
        </div>
      ) }
  ];

  const issuesGridColumns: GridColDef[] = [
    { field: 'results', editable: true, headerName: 'TEST SCRIPT REPORT ', width: 1400,
    renderCell: (cellValues) => (
      <div style={{ lineHeight: "normal", display: "flex", flexDirection: "column", height: 40 }}>
        {cellValues.row.results ? cellValues.row.results : `⌛ To Be Executed ___ Action: ${ cellValues.row.action }; Description: ${cellValues.row.description ? cellValues.row.description : '' }`}
      </div>
    ) }
  ];

  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <CacheProvider value={styleCache}>
      <Stack minWidth="100%" minHeight={700} bgcolor={"white"} padding={2}>
        <Box sx={{ width: '100%' }}>
          <Button variant="contained" 
            onClick={() => {
              executeTestScripts(tabTasks);
            }}>
              Run Tests
          </Button>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            textColor="secondary"
            indicatorColor="secondary"
            aria-label="secondary tabs example"
          >
            <Tab value={0} label="Failed Steps" />
            <Tab value={1} label="Tests" />
          </Tabs>
          <CustomTabPanel value={tabValue} index={0}>
            <DataGrid
              rows={testSteps} 
              columns={issuesGridColumns} 
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 100 },
                },
              }}
              // checkboxSelection
            />
          </CustomTabPanel>
          <CustomTabPanel value={tabValue} index={1}>
            <DataGrid
              rows={tabTasks} 
              columns={tabTasksGridColumns} 
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              // checkboxSelection
            />
          </CustomTabPanel>
        </Box>
      </Stack>
    </CacheProvider>
  )
}

window.addEventListener("load", () => {
  document.title = "PODS Test Automation"
})

const styleElement = document.createElement("style")

const styleCache = createCache({
  key: "plasmo-mui-cache",
  prepend: true,
  container: styleElement,
});

export const getStyle = () => styleElement;

export default PlasmoOverlay

