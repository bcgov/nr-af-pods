This is the PODS Test Automation chrome extension tool.

# Getting Started
* Pull the source code from the PODS GitHub repo <https://github.com/bcgov/nr-af-pods>
* Install System Requirements for Plasmo <https://docs.plasmo.com/framework>
  * Node.js 16.14.x or later.
  * Install pnpm by running __npm install -g pnpm__
* Install node_modules including Plasmo framework that are required for the PODS extension.
  * Open a cmd terminal in your VS
  * Switch to the pods-chrome-extension folder
  * Run the npm install command
    * This will download all the required node_modules specified in the package.json
* Build and Add PODS chrome extension
  * Run the __pnpm build__ command.
     * chrome-mv3-prod folder will be generated in the build folder.
* Run the __pnpm dev__ command.
   * Chrome-mv3-dev folder will be generated in the build folder.
  * Add the PODS Testing chrome extension.
   * Open Chrome extensions using chrome://extensions/
     * Enable Developer mode
     * Load unpacked to load the PODS chrome extension by pointing it to the  Chrome-mv3-dev folder.
 * Run pnpm dev for developing the extension so that your changes to the code will be reflected in real-time.
 * Open https://sites.google.com/view/pods-testing?testScript=https://raw.githubusercontent.com/bcgov/nr-af-pods/dev/testing/test-scripts/dev/claim/blank-test-script.json 
   * You can change the testScript parameter above.
