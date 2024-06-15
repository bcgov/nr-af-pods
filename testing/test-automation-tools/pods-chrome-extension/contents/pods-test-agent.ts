import type { PlasmoCSConfig } from "plasmo"
import { TEST_AGENT_READY_FOR_TEST_STEPS } from "~constants/task-command"
import type { TestStep } from "./pods/test-step"
import type { HtmlTableWrapper } from "./pods/html-table-wrapper"

export const config: PlasmoCSConfig = { matches: ["https://af-pods-dev.powerappsportals.com/*", "https://af-pods-test.powerappsportals.com/*"] }

window.addEventListener("load", () => {
  if (window.opener) {
    console.log(`Sending READY_FOR_EXEC_TEST_STEPS to the PODS Test Manager browser tab (window opener) using postMessage...`)
    window.opener.postMessage(TEST_AGENT_READY_FOR_TEST_STEPS, "*")
  }
})

window.addEventListener("message", (event) => {
    console.log(`messages received by PODS Test Agent: event.data = ${event.data} | event.origin = ${event.origin}`)

    const isTestStepsData = event.data.indexOf('"action"') > -1
    if (!isTestStepsData) return

    let testStepsToBeExec : TestStep[] = JSON.parse(event.data)
    if(testStepsToBeExec && testStepsToBeExec?.length > 0) {
      execTestSteps(testStepsToBeExec)
    }
  },
  false,
);

async function triggerChangeEvent(htmlElem : HTMLElement): Promise<void> {
  let clickEvent = new Event("change", {
    bubbles: true,
    cancelable: true
  });
  htmlElem.dispatchEvent(clickEvent)
}

var questionLabelsMap: Map<string, HTMLLabelElement> = null
async function getQuestionLabelsMap(): Promise<Map<string, HTMLLabelElement>> {
  if (questionLabelsMap) return questionLabelsMap

  const fieldsLabels = document.getElementsByTagName("label") as HTMLCollectionOf<HTMLLabelElement>
  questionLabelsMap = new Map<string, HTMLLabelElement>()

  for(let i = 0; i < fieldsLabels.length; i++) {
    const question = fieldsLabels[i]
    var questionFound = questionLabelsMap[question.textContent] 
    if (!questionFound) {
      questionLabelsMap[question.textContent] = question
    }
    else {
      let questionDisplayOrder = 1
      while (questionFound) {
        questionDisplayOrder++
        let questionText = `${question.textContent}_DisplayOrder${questionDisplayOrder}`
        questionFound = questionLabelsMap[questionText]

        if (!questionFound) {
          questionLabelsMap[questionText] = question
        }
      }
    }
  }
  return questionLabelsMap
}

var htmlTableWrappers: HtmlTableWrapper[] = null
async function getHtmlTables(): Promise<HtmlTableWrapper[]> {

  if (htmlTableWrappers) return htmlTableWrappers

  htmlTableWrappers = []
  const htmlTables = document.getElementsByTagName("table") as HTMLCollectionOf<HTMLTableElement>
  
  if(htmlTables) {
    for(let i = 0; i < htmlTables.length; i++) {
      let tableWrapper : HtmlTableWrapper = {
        htmlTable : htmlTables[i],
        headerCells: []
      }
      const headerRow = htmlTables[i].rows[0]
      for(let j = 0; j < headerRow.childNodes.length; j++) {
        const headerCell = headerRow.childNodes[j]
        const headerColName = headerCell.textContent.replace('. sort descending', '').replace('. sort ascending', '').trim()
        tableWrapper.headerCells.push( { name: headerColName, index: j} )
      }

      htmlTableWrappers.push(tableWrapper)
    }
  }

  return htmlTableWrappers
}

async function execTestSteps(testSteps : TestStep[]): Promise<void> {
  console.log(` Executing Test Steps...: ${JSON.stringify(testSteps)}`)
  
  let questionLabelsMap = await getQuestionLabelsMap()

  let currentTestStepGroup = ''

  console.log(`Agent executing test steps. Test steps: ${JSON.stringify(testSteps)}`)

  let skipTheLoop = false
  let navigating = false

  for (let testStep of testSteps) {
    if (skipTheLoop) {
      testStep.results = `CANCELLED due to the last FAILED step ___ Action: ${ testStep.action }; ${testStep.description ? testStep.description : '' }`
      testStep.failed = true
    }
    else {
      const action = testStep.action.toLowerCase().trim()
      let questionLabel = 'noLabel'
      if (testStep.field)
        questionLabel = testStep.field.displayOrder ? `${testStep.field.label}_DisplayOrder${testStep.field.displayOrder}` : testStep.field.label

      testStep.results = ''

      switch (action) {
        case 'find-list-item':
          const tables = await getHtmlTables()
          if (!tables || tables.length == 0) {
            testStep.results += `'${testStep.description}' step failed. No any lists/tables found on the page.`
            
            skipTheLoop = true
            break
          }

          const targetTable = tables[0]
          
          let foundItem = false
          for(let i = 1; i < targetTable.htmlTable.rows.length; i++) {
            let foundExpectedFieldsCount = 0
            for(let stepFieldIndex = 0; stepFieldIndex < testStep.fields.length; stepFieldIndex++) {
              const expectedItemField = testStep.fields[stepFieldIndex]
              const foundHeaderCell = targetTable.headerCells.find((element) => element.name == expectedItemField.label)
              if(!foundHeaderCell) {
                testStep.results += `'${testStep.description}' step failed. Expected ${expectedItemField.label} label not found in the header columns.`
                
                skipTheLoop = true
                break
              }

              if (expectedItemField.visible) {
                let foundCellValue = targetTable.htmlTable.rows[i].childNodes[foundHeaderCell.index].textContent
                if (foundCellValue == expectedItemField.value) {
                  foundExpectedFieldsCount++ // found expected field
                }
              }
              else {
                foundExpectedFieldsCount++ // found expected field
              }
              
              if (foundExpectedFieldsCount == testStep.fields.length) { // found all the expected fields
                foundItem = true
                if (expectedItemField.action?.toLocaleLowerCase() == 'click the link') {
                  let tblCell = targetTable.htmlTable.rows[i].childNodes[foundHeaderCell.index] as HTMLTableCellElement
                  tblCell.querySelector('a')?.click()
                }
                navigating = true
                break
              }
            }
          }
          if (!foundItem) {
            testStep.results += `'${testStep.description}' step failed. Expected item not found in the list.`
          }
          break
        case 'expect':

          //Checks the expected properties of the button
          if (testStep.button) {
            questionLabel = testStep.button.label
            console.log(`buttonLabel: ${questionLabel}`)

            const buttonExpectedToBeDisabled = testStep.button.disabled
            
            //Get all buttons
            const buttons = document.getElementsByTagName("input") as HTMLCollectionOf<HTMLInputElement>;
            
            for(let i = 0; i < buttons.length; i++) {
              const btnElem = buttons[i]

              //Checks for the first occurrence of the desired label (displayOrder is not relevant in this version)
              if (btnElem.value.toLowerCase() === questionLabel.toLowerCase()) { 
                const foundButtonDisabled = btnElem.disabled

                //After found, compares the expected value with the actual value and includes an error message, exiting the search
                if (foundButtonDisabled !== buttonExpectedToBeDisabled) {
                  testStep.results += `'${questionLabel}' button: Expected to be ${buttonExpectedToBeDisabled ? 'DISABLED' : 'ENABLED'}, but it is actually ${foundButtonDisabled ? 'DISABLED' : 'ENABLED'} `
                }                

                //Stop iterating through the button list
                break
              }
            }
            
            //Exit the Expect action block as it is not aiming for a field
            break
          }

          const foundQuestion = questionLabelsMap[questionLabel]


          if (!foundQuestion){
            testStep.results += `'${questionLabel}' field: Label Not Found.`
          }
          else {

            const foundQuestionRequired = foundQuestion.parentNode?.classList?.contains('required')
            const fieldExpectedToBeRequired = testStep.field.required === true

            if (foundQuestionRequired !== fieldExpectedToBeRequired) {
              testStep.results += `'${questionLabel}' field: Expected to be ${fieldExpectedToBeRequired ? 'REQUIRED' : 'OPTIONAL'}, but actually is ${foundQuestionRequired ? 'REQUIRED' : 'OPTIONAL'} `
            }

            const foundQuestionVisible = window.getComputedStyle(foundQuestion.parentNode.parentNode.parentNode).display !== 'none'

            if (foundQuestionVisible !== testStep.field.visible) {
              testStep.results += `'${questionLabel}' field: Expected to be ${testStep.field.visible ? 'VISIBLE' : 'HIDDEN'}, but actually is ${foundQuestionVisible ? 'VISIBLE' : 'HIDDEN'} `
            }
          }
          break
        case 'enter':
          const foundQuestionLabel: HTMLLabelElement = questionLabelsMap[questionLabel]
          if (!foundQuestionLabel){
            testStep.results += `Failed entering value in to the '${questionLabel}' field as the label Not Found.`
            break
          }
          
          const fieldId = foundQuestionLabel.id.replace('_label', '')
          let fieldInputCtr = document.getElementById(fieldId) as HTMLInputElement;
          
          let dataType = fieldInputCtr.getAttribute('data-type')
          if (!dataType) dataType = fieldInputCtr.getAttribute('type')

          switch (dataType) 
          {
            case 'date':
              const dateValue = (new Date(testStep.field.value)).toISOString().replace('.000Z', '.0000000Z')
              fieldInputCtr.value = dateValue

              const datePickerDescInput = document.getElementById(`${fieldId}_datepicker_description`) as HTMLInputElement;
              datePickerDescInput.value = testStep.field.value
              break
            case 'checkbox':
              debugger
              const fieldValue = testStep.field.value.toLocaleLowerCase()
              fieldInputCtr.checked = fieldValue === 'checked' ? true : false
              break
            default: // normal input control
              fieldInputCtr.value = testStep.field.value
              break
          }        
          triggerChangeEvent(fieldInputCtr)
          break
        case 'select':
          const selectFieldLabel: HTMLLabelElement = questionLabelsMap[questionLabel]
          if (!selectFieldLabel){
            testStep.results += `Failed entering value in to the '${questionLabel}' field as the label Not Found.`
            break
          }
          
          const selectFieldId = selectFieldLabel.id.replace('_label', '')
          const selectElem = document.getElementById(selectFieldId) as HTMLSelectElement;

          let foundOptionByText = false
          if (selectElem.options) { // Option Set control
            for (let option of selectElem.options) {
              if (option.text.toLocaleLowerCase() === testStep.field.value.toLocaleLowerCase()) {
                selectElem.value = option.value
                foundOptionByText = true
                break
              }
            }
          }

          if (!foundOptionByText) {
            testStep.results += `Failed selecting ${testStep.field.value} value for the '${questionLabel}' drop-down field as the specified value not found.`
          }
          else {
            triggerChangeEvent(selectElem)
          }
          break
        default:
          const isClickAction = action.startsWith("click")
          if (isClickAction) {
            const regexpButtonName = /the (?<elementname>\w+) button/gm;
            const matches = [...action.matchAll(regexpButtonName)].map((m) => [m[1]]);
            console.log(matches)
            if (matches.length === 0) return

            const buttonLabel = matches[0][0]
            console.log(`buttonLabel: ${buttonLabel}`)
            
            const buttons = document.getElementsByTagName("input") as HTMLCollectionOf<HTMLInputElement>;
            
            for(let i = 0; i < buttons.length; i++) {
              const btnElem = buttons[i]

              if (btnElem.value.toLowerCase() === buttonLabel) { 
                btnElem.click()
                navigating = true
              }
            }
            break
          }
          
          const isTestCase = action.startsWith("test step group")
          if(isTestCase) {
            currentTestStepGroup = testStep.action
            break  
          }

          const isEnable = action.startsWith("enable")
          if (isEnable) {
            const regexpButtonName = /the (?<elementname>\w+) button/gm;
            const matches = [...action.matchAll(regexpButtonName)].map((m) => [m[1]]);
            console.log(matches)
            if (matches.length === 0) return

            const buttonLabel = matches[0][0]
            console.log(`buttonLabel: ${buttonLabel}`)
            
            const buttons = document.getElementsByTagName("input") as HTMLCollectionOf<HTMLInputElement>;
            
            for(let i = 0; i < buttons.length; i++) {
              const btnElem = buttons[i]

              if (btnElem.value.toLowerCase() === buttonLabel) { 
                btnElem.disabled = false
              }
            }
            break
          }
          
          const isWaitStatement = action.startsWith("wait")
          if(isWaitStatement) {
            const regexpWaitFor = /for (?<elementname>\w+) seconds/gm;
            const matches = [...action.matchAll(regexpWaitFor)].map((m) => [m[1]]);
            if (matches.length === 0) return

            const numberOfSeconds = matches[0][0]
            await sleep(+numberOfSeconds)
            break
          }
      }

      if (testStep.results !== '') {
        testStep.results = `⛔ STEP ${ testStep.id } ${testStep.results} - ${currentTestStepGroup}`
        testStep.failed = true
      }
      else {
        testStep.results = `✅ STEP ${ testStep.id }: ${ testStep.action } ${ testStep.description ? testStep.description : testStep.field ? `${JSON.stringify(testStep.field)}` : `${JSON.stringify(testStep.button)}` }`
        testStep.failed = false
      }
    }
    testStep.executed = true

    window.opener.postMessage(JSON.stringify(testStep), "*")
    
    if (navigating)
      break
  }

  async function sleep(ms: number): Promise<void> {
    return new Promise(
        (resolve) => setTimeout(resolve, ms));
  }

}