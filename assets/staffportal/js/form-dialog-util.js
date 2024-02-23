var PODS = window.PODS || {};
(function () {
    this.openCancelDialog = async function (primaryControl, firstSelectedItemId, selectedEntityTypeName, canvasDialogName, canvasDialogTitle, canvasDialogWidth = 720, canvasDialogHeight = 585) {
        var pageInput = 
        {
            pageType: "custom",
            name: canvasDialogName,
            entityName: selectedEntityTypeName,
            recordId: firstSelectedItemId
        };
        var navigationOptions = 
        {
            target: 2,
            position: 1,
            width: {value: canvasDialogWidth, unit:"px"},
            height: {value: canvasDialogHeight, unit:"px"},
            title: canvasDialogTitle
        };
        Xrm.Navigation.navigateTo(pageInput, navigationOptions).then(
                function () 
            {
                // Refresh the main form when the dialog is closed
                primaryControl.data.refresh();
            }
            ).catch(
            function (error) {
                // Handle error
                console.error(`Errors occurred in the dialog. Errors Details: ${JSON.stringify(error)}`)
            }
        );
    }
}).call(PODS);