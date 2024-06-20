This is the PODS Test Automation Chrome extension tool.

# Getting Started
* Pull the source code from the PODS GitHub repo <https://github.com/bcgov/nr-af-pods>
* Install System Requirements for Plasmo <https://docs.plasmo.com/framework>
  * Node.js 16.14.x or later.
  * Install pnpm by running `npm install -g pnpm`
* Install node_modules including the Plasmo framework that is required for the PODS extension.
  * Open a cmd terminal in your VS
  * Switch to the pods-chrome-extension folder
  * Run the `npm install` command
    * This will download all the required node_modules specified in the package.json
* Build and Add PODS chrome extension
  * Run the `pnpm build` command.
     * The chrome-mv3-prod folder will be generated in the build folder.
* Run the `pnpm dev` command.
   * The chrome-mv3-dev folder will be generated in the build folder.
  * Add the PODS Testing Chrome extension.
   * Open Chrome extensions using `chrome://extensions/`
     * Enable Developer mode
     * Load unpacked to load the PODS Chrome extension by pointing it to the chrome-mv3-dev folder.
 * Run `pnpm dev` for developing the extension so that your changes to the code will be reflected in real-time.
 * Open https://sites.google.com/view/pods-testing?testScript=https://raw.githubusercontent.com/bcgov/nr-af-pods/dev/testing/test-scripts/dev/claim/blank-test-script.json 
   * You can change the `testScript` parameter above.

# Test Scripts
To execute the tests, you first need to write a test script including all the actions the test agent will perform. 

## Available Actions
The actions below can be used with the related parameters to test the desired web page.

### Open new tab
Opens the URL to be tested by the Test Agent in a new tab.

Parameters:
* action: open-new-tab
* url: string

### Find list item
Finds an item in a table structure. You can still perform other actions on that item by cascading the structure.

Parameters:
* 

### Expect
Validates if the specified HTML element has the expected properties.

#### Expect a field
Used to validate an input field.

Parameters:
* action: Expect
* field:
  * label: string, the expected label of the input field.
  * displayOrder: integer, the order the desired field is presented on the page, considering all the fields with the same label.
  * visible: boolean, true/false, validate if the field is visible on the page at that time.
  * required: boolean, true/false, validate if the field is required on the form.
  * value: string, the text value expected to be found on the input field. This validation allows data type conversion when compared to avoid formatting issues in the front end.

#### Expect a button
Used to validate the properties of a button.

Parameters:
* action: Expect
* button:
  * label: string, the expected label of the button.
  * disabled: boolean, true/false, validate if the button is disabled due to the form's conditions at that time.

### Select
Select the desired option of a dropdown list.

Parameters:
* action: Select
* field:
  * label: string, the label of the dropdown list.
  * value: string, the text value of the option to be selected.

### Enter
Enter the value provided into an input field or checkbox.

Parameters:
* action: Enter
* field:
  * label: string, the expected label of the input field.
  * displayOrder: integer, the order the desired field is presented on the page, considering all the fields with the same label.
  * value: 
    * For input fields: string, the text value to be set on the input field.
    * For checkboxes: string, checked/unchecked

### Button actions
These actions can trigger events or change the properties of a button.

#### Click
Triggers the Click event of a button.

Parameters:
* action: 'Click on the `label` button', where `label` is the visible label of the target button.
* description: string, text description to be presented on the Test Manager's results.

#### Enable
Override the `Disabled` status of a button, forcing it to be enabled.

Parameters:
* action: 'Enable the `label` button', where `label` is the visible label of the target button.
* description: string, text description to be presented on the Test Manager's results.

### Wait

### Test step group

## JSON Format