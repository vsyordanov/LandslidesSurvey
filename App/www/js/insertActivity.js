"use strict";

/**
 *  Activity to insert a new landslide into the database. It also allows the user to modify an already mapped landslide.
 *  Depending on the mode of the application (expert or simple), it will show different fields.
 *
 * @author Edoardo Pessina
 */
class InsertActivity {

    /** @private */ static _instance;

    /**
     * Creates and initializes the activity.
     * To implement the Singleton pattern, it should never be called directly. Use {@link InsertActivity.getInstance}
     * to get the Singleton instance of the class.
     *
     * @constructor
     */
    constructor() {

        // Cache the screen
        this._screen = $("#page--insert");

        // Cache the photo thumbnail
        this._$photoThm = $("#photo-thm");

        // Save the the currently opened dialog and full dialog
        this._currOpenedDialog     = null;
        this._currOpenedFullDialog = null;


        // The id of the landslide to modify. It has a value only if the activity is open in "put" mode
        this._lsId = null;

        // Flag that stated if the landslide that is been currently modified was mapped in expert mode
        this._isExpert = null;

        // Flag that stated if the landslide that is been currently modified is saved locally
        this._isLocal = null;

        // The name of the original photo of the landslide passed in "put" mode. Used to check if the photo has been modified
        this._oldPhoto = null;


        // The values of the various fields
        this._vals = {
            coordinates        : "",
            coordinatesAccuracy: "",
            altitude           : "",
            altitudeAccuracy   : "",
            presence           : "",
            type               : "",
            materialType       : "",
            hillPosition       : "",
            water              : "",
            vegetation         : "",
            mitigation         : "",
            mitigationList     : [],
            monitoring         : "",
            monitoringList     : [],
            damages            : "",
            damagesList        : [],
            notes              : "",
            photo              : ""
        };

        // Create temporary lists
        this._newMitigationList = [];
        this._newMonitoringList = [];
        this._newDamagesList    = [];

        // Initialize the user interface
        this.initUI();

    }

    /**
     * Returns the current InsertActivity instance if any, otherwise creates it.
     *
     * @returns {InsertActivity} The activity instance.
     */
    static getInstance() {

        if (!InsertActivity._instance)
            InsertActivity._instance = new InsertActivity();

        return InsertActivity._instance;

    }


    /** Opens the activity. */
    open() {

        // Push the activity into the stack
        utils.pushStackActivity(this);

        // If the app is in expert mode or the ls that is being modified was mapped in expert, show the relative fields
        if ((this._lsId && this._isExpert) || (!this._lsId && App.isExpertMode)) {

            $("#hill-position-request-wrapper").show();
            $("#vegetation-request-wrapper").show();
            $("#monitoring-request-wrapper").show();
            $("#damages-request-wrapper").show();
            $("#notes-request-wrapper").show();

        }

        // Show the screen
        this._screen.show();

        // If in "post" mode
        if (!this._lsId) {

            // Show dialog alerting about position usage
            utils.createAlert("", i18next.t("dialogs.insert.positionAlert"), i18next.t("dialogs.btnOk"));

            // Save the geolocation data
            this._vals.coordinates         = MapActivity.getInstance().currLatLng;
            this._vals.coordinatesAccuracy = MapActivity.getInstance().currLatLngAccuracy;
            this._vals.altitude            = MapActivity.getInstance().currAltitude;
            this._vals.altitudeAccuracy    = MapActivity.getInstance().currAltitudeAccuracy;

        }

    }

    /**
     * Opens the activity in "put" mode (modify a landslide)
     *
     * @param {object} ls - The data of the landslide to modify.
     * @param {boolean} isLocal - True if the landslide is saved in the local database.
     */
    openPut(ls, isLocal) {

        // Save the landslide id
        this._lsId = ls._id;

        // Save if the landslide was mapped in expert mode
        this._isExpert = ((isLocal && ls.expert === "true") || (!isLocal && ls.expert));

        // Save if the landslide is saved locally
        this._isLocal = isLocal;

        // Save the landslide data
        this._vals.type           = ls.type;
        this._vals.materialType   = ls.materialType;
        this._vals.hillPosition   = ls.hillPosition;
        this._vals.water          = ls.water;
        this._vals.vegetation     = ls.vegetation;
        this._vals.mitigation     = ls.mitigation;
        this._vals.mitigationList = ls.mitigationList;
        this._vals.monitoring     = ls.monitoring;
        this._vals.monitoringList = ls.monitoringList;
        this._vals.damages        = ls.damages;
        this._vals.damagesList    = ls.damagesList;
        this._vals.notes          = ls.notes;

        if (isLocal)
            this._vals.photo = ls.imageUrl;
        else
            this._vals.photo = `${settings.serverUrl}/${ls.imageUrl}`;

        // Save the old photo
        this._oldPhoto = this._vals.photo;

        // Set the main screen texts of the mandatory properties
        $("#ls-type-text").html(i18next.t("insert.type.enum." + this._vals.type));

        // Set the main screen texts of the optional properties
        if (this._vals.materialType !== "") $("#material-type-text").html(i18next.t("insert.materialType.enum." + this._vals.materialType));
        if (this._vals.hillPosition !== "") $("#hill-position-text").html(i18next.t("insert.hillPosition.enum." + this._vals.hillPosition));
        if (this._vals.water !== "") $("#water-text").html(i18next.t("insert.water.enum." + this._vals.water));
        if (this._vals.vegetation !== "") $("#vegetation-text").html(i18next.t("insert.vegetation.enum." + this._vals.vegetation));
        if (this._vals.mitigation !== "") $("#mitigation-text").html(i18next.t("insert.mitigation.enum." + this._vals.mitigation));
        if (this._vals.monitoring !== "") $("#monitoring-text").html(i18next.t("insert.monitoring.enum." + this._vals.monitoring));
        if (this._vals.damages !== "") $("#damages-text").html(i18next.t("insert.damages.enum." + this._vals.damages));
        if (this._vals.notes !== "") $("#notes-text").html(i18next.t("insert.notes.editText"));

        // Show the photo
        this._$photoThm.find("img").attr("src", this._vals.photo).show();

        // Hide the icon
        this._$photoThm.find("i").hide();

        // Open the activity
        this.open();

    }

    /** Closes the activity and resets the fields. */
    close() {

        // Pop the activity from the stack
        utils.popStackActivity();

        // Set the id, the expert flag and and the old photo to null
        this._lsId     = null;
        this._isExpert = null;
        this._oldPhoto = null;
        this._isLocal  = null;

        // Hide the screen
        this._screen.scrollTop(0).hide();

        // Rest the currently opened dialogs
        this._currOpenedDialog     = null;
        this._currOpenedFullDialog = null;

        // Set all values to ""
        Object.keys(this._vals).forEach(v => this._vals[v] = "");

        // Set the lists to []
        this._vals.mitigationList = [];
        this._vals.monitoringList = [];
        this._vals.damagesList    = [];

        // Hide the fields of the expert mode
        $("#hill-position-request-wrapper").hide();
        $("#vegetation-request-wrapper").hide();
        $("#monitoring-request-wrapper").hide();
        $("#damages-request-wrapper").hide();
        $("#notes-request-wrapper").hide();

        // Reset all the main screen texts
        $("#ls-type-text").html(i18next.t("insert.type.defaultText"));
        $("#material-type-text").html(i18next.t("insert.materialType.defaultText"));
        $("#hill-position-text").html(i18next.t("insert.hillPosition.defaultText"));
        $("#water-text").html(i18next.t("insert.water.defaultText"));
        $("#vegetation-text").html(i18next.t("insert.vegetation.defaultText"));
        $("#mitigation-text").html(i18next.t("insert.mitigation.defaultText"));
        $("#monitoring-text").html(i18next.t("insert.monitoring.defaultText"));
        $("#damages-text").html(i18next.t("insert.damages.defaultText"));
        $("#notes-text").html(i18next.t("insert.notes.defaultText"));

        // Hide the photo
        this._$photoThm.find("img").attr("src", "img/img-placeholder-200.png").hide();

        // Show the icon
        this._$photoThm.find("i").show();

    }

    /** Defines the behaviour of the back button for this activity */
    onBackPressed() {

        // If a dialog is currently opened
        if (this._currOpenedDialog) {

            // Close the dialog
            this.closeDialog(this._currOpenedDialog);

            // Return
            return;

        }

        // If a full dialog is currently opened
        if (this._currOpenedFullDialog) {

            // Close the full dialog
            this.closeFullscreenDialog(this._currOpenedFullDialog);

            // Return
            return;

        }


        // Ask for confirmation and then close the activity
        utils.createAlert(
            "",
            i18next.t("dialogs.insert.confirmClose"),
            i18next.t("dialogs.insert.btnKeepEditing"),
            null,
            i18next.t("dialogs.insert.btnDiscard"),
            () => { this.close() }
        );

    }


    /** Initialize the user interface. */
    initUI() {

        // If the user clicks the "close" button, ask for confirmation and then close the activity
        $("#new-ls-close").click(() => {

            utils.createAlert(
                "",
                i18next.t("dialogs.insert.confirmClose"),
                i18next.t("dialogs.insert.btnKeepEditing"),
                null,
                i18next.t("dialogs.insert.btnDiscard"),
                () => { this.close() }
            );

        });

        // When the user clicks on the "done" button, check the fields and add/update the landslide
        $("#new-ls-done").click(() => {

            // If the user hasn't specified the type, return
            if (this._vals.type === "") {
                utils.logOrToast(i18next.t("messages.mandatoryLsType"), "long");
                return;
            }

            // If the user hasn't inserted a photo, return
            if (this._vals.photo === "") {
                utils.logOrToast(i18next.t("messages.mandatoryPhoto"), "long");
                return;
            }

            // If the app is in expert mode, correct some fields
            if (App.isExpertMode) {
                if (this._vals.mitigation !== "yes") this._vals.mitigationList = [];
                if (this._vals.monitoring !== "yes") this._vals.monitoringList = [];
                if (this._vals.damages !== "directDamage") this._vals.damagesList = [];
            }

            // If the activity is in "post" mode, post
            if (!this._lsId) {

                // IF the user is a guest
                if (app.isGuest) {

                    // Ask the user for confirmation and post locally
                    utils.createAlert(
                        "",
                        i18next.t("dialogs.postGuest"),
                        i18next.t("dialogs.btnNo"),
                        null,
                        i18next.t("dialogs.btnYes"),
                        () => this.postLocal()
                    );

                    // Return
                    return;

                }

                // If there is no connection
                if (!navigator.onLine) {

                    // Ask the user for confirmation and post locally
                    utils.createAlert(
                        "",
                        i18next.t("dialogs.postOffline"),
                        i18next.t("dialogs.btnNo"),
                        null,
                        i18next.t("dialogs.btnYes"),
                        () => this.postLocal()
                    );

                    // Return
                    return;

                }

                // Post on the server
                this.postRemote();

            }

            // Else, put
            else {

                // If the application is online, put on the server
                if (!this._isLocal) this.putRemote();

                // Else, put in the local database
                else this.putLocal();

            }

        });


        // Fired when the user clicks on the "type" request
        $("#ls-type-request").click(() => {

            // Initialize the value to select in the selector
            let toSelect = this._vals.type;

            // If the user hasn't already specified the type, select "rockfall"
            if (this._vals.type === "") toSelect = "rockfall";

            // Change the selected option of the selector
            $("input[name='type'][value='" + toSelect + "']").prop("checked", "true");

            // Open the dialog
            this.openFullscreenDialog($("#dialog-ls-type"));

        });

        // Fired when the user clicks on "cancel"
        $("#ls-type-close").click(() => this.closeFullscreenDialog($("#dialog-ls-type")));

        // Fired when the user clicks on "ok"
        $("#ls-type-done").click(() => {

            // Save the value
            this._vals.type = $("input[name='type']:checked").val();

            // Set the text of the main page
            $("#ls-type-text").html(i18next.t("insert.type.enum." + this._vals.type));

            // Close the dialog
            this.closeFullscreenDialog($("#dialog-ls-type"));

        });


        // Fired when the user clicks on the "material type" request
        $("#material-type-request").click(() => {

            // Initialize the value to select in the selector
            let toSelect = this._vals.materialType;

            // If the user hasn't already specified the material type, select "rock"
            if (this._vals.materialType === "") toSelect = "rock";

            // Set the value of the selector
            $("input[name='materialType'][value='" + toSelect + "']").prop("checked", "true");

            // Open the dialog
            this.openDialog($("#dialog-material-type"));

        });

        // Fired when the user clicks on "cancel"
        $("#material-type-cancel").click(() => this.closeDialog($("#dialog-material-type")));

        // Fired when the user clicks on "ok"
        $("#material-type-ok").click(() => {

            // Save the value of the selector
            this._vals.materialType = $("input[name='materialType']:checked").val();

            // Set the text of the main page
            $("#material-type-text").html(i18next.t("insert.materialType.enum." + this._vals.materialType));

            // Close the dialog
            this.closeDialog($("#dialog-material-type"));

        });


        // Fired when the user clicks on the "hill position" request
        $("#hill-position-request").click(() => {

            // Initialize the value to select in the selector
            let toSelect = this._vals.hillPosition;

            // If the user hasn't already specified the hill position, select "atTheTop"
            if (this._vals.hillPosition === "") toSelect = "atTheTop";

            // Set the value of the selector
            $("input[name='hillPosition'][value='" + toSelect + "']").prop("checked", "true");

            // Open the dialog
            this.openDialog($("#dialog-hill-position"));

        });

        // Fired when the user clicks on "cancel"
        $("#hill-position-cancel").click(() => this.closeDialog($("#dialog-hill-position")));

        // Fired when the user clicks on "ok"
        $("#hill-position-ok").click(() => {

            // Save the value of the selector
            this._vals.hillPosition = $("input[name='hillPosition']:checked").val();

            // Set the text of the main page
            $("#hill-position-text").html(i18next.t("insert.hillPosition.enum." + this._vals.hillPosition));

            // Close the dialog
            this.closeDialog($("#dialog-hill-position"));

        });


        // Fired when the user clicks on the "water presence" request
        $("#water-request").click(() => {

            // Initialize the value to select in the selector
            let toSelect = this._vals.water;

            // If the user hasn't already specified the water, select "dry"
            if (this._vals.water === "") toSelect = "dry";

            // Set the value of the selector
            $("input[name='water'][value='" + toSelect + "']").prop("checked", "true");

            // Open the dialog
            this.openDialog($("#dialog-water"));

        });

        // Fired when the user clicks on "cancel"
        $("#water-cancel").click(() => this.closeDialog($("#dialog-water")));

        // Fired when the user clicks on "ok"
        $("#water-ok").click(() => {

            // Save the value of the selector
            this._vals.water = $("input[name='water']:checked").val();

            // Set the text of the main page
            $("#water-text").html(i18next.t("insert.water.enum." + this._vals.water));

            // Close the dialog
            this.closeDialog($("#dialog-water"));

        });


        // Fired when the user clicks on the "vegetation presence" request
        $("#vegetation-request").click(() => {

            // Initialize the value to select in the selector
            let toSelect = this._vals.vegetation;

            // If the user hasn't already specified the vegetation, select "grass"
            if (this._vals.vegetation === "") toSelect = "grass";

            // Set the value of the selector
            $("input[name='vegetation'][value='" + toSelect + "']").prop("checked", "true");

            // Open the dialog
            this.openDialog($("#dialog-vegetation"));

        });

        // Fired when the user clicks on "cancel"
        $("#vegetation-cancel").click(() => this.closeDialog($("#dialog-vegetation")));

        // Fired when the user clicks on "ok"
        $("#vegetation-ok").click(() => {

            // Save the value of the selector
            this._vals.vegetation = $("input[name='vegetation']:checked").val();

            // Set the text of the main page
            $("#vegetation-text").html(i18next.t("insert.vegetation.enum." + this._vals.vegetation));

            // Close the dialog
            this.closeDialog($("#dialog-vegetation"));

        });


        // Fired when the user clicks on the "mitigations" request
        $("#mitigation-request").click(() => {

            // Initialize the value to select in the selector
            let toSelect = this._vals.mitigation;

            // If the user hasn't already specified the mitigations, select "yes"
            if (this._vals.mitigation === "") toSelect = "yes";

            // If the app is on expert mode or the ls that is being modified was mapped in expert
            if ((this._lsId && this._isExpert) || (!this._lsId && App.isExpertMode)) {

                // Select the value
                $("input[name='mitigationExpert'][value='" + toSelect + "']").prop("checked", "true");

                // If the user has selected the option "yes", show the option to specify the mitigation list
                if (toSelect === "yes") $("#mitigations-wrapper").show();

                // Else, hide it
                else $("#mitigations-wrapper").hide();

                // Empty the temporary list
                this._newMitigationList = [];

                // Clear the dom list
                this.clearDomList("mitigation-list");

                // Display each item in the mitigation list
                this._vals.mitigationList.forEach(item => this.createMitigationItem(item.type));

                // Open the dialog
                this.openFullscreenDialog($("#dialog-mitigation-expert"));

            }

            // Else
            else {

                // Select the value
                $("input[name='mitigationBase'][value='" + toSelect + "']").prop("checked", "true");

                // Open the dialog
                this.openDialog($("#dialog-mitigation-base"));

            }

        });

        // Fired when the user clicks on "cancel" on the dialog opened in simple mode
        $("#mitigation-base-cancel").click(() => this.closeDialog($("#dialog-mitigation-base")));

        // Fired when the user clicks on "ok" on the dialog opened in simple mode
        $("#mitigation-base-ok").click(() => {

            // Save the value of the selector
            this._vals.mitigation = $("input[name='mitigationBase']:checked").val();

            // Set the text of the main page
            $("#mitigation-text").html(i18next.t("insert.mitigation.enum." + this._vals.mitigation));

            // Close the dialog
            this.closeDialog($("#dialog-mitigation-base"));

        });

        // Fired when the user clicks on "close" on the dialog opened in expert mode
        $("#mitigation-expert-close").click(() => this.closeFullscreenDialog($("#dialog-mitigation-expert")));

        // Fired when the user clicks on "done" on the dialog opened in expert mode
        $("#mitigation-expert-done").click(() => {

            // Save the value
            this._vals.mitigation = $("input[name='mitigationExpert']:checked").val();

            // Save in the list all the elements of the temporary list that are not empty
            this._vals.mitigationList = this._newMitigationList.filter(e => e !== "");

            // Set the text on the main page
            $("#mitigation-text").html(i18next.t("insert.mitigation.editText"));

            // Close the dialog
            this.closeFullscreenDialog($("#dialog-mitigation-expert"))

        });

        // Fired when the selected option is changed in expert mode
        $("input[name='mitigationExpert']").change(() => {

            // Save the selected value
            let checked = $("input[name='mitigationExpert']:checked").val();

            // If the selected value is "yes", show the option to add new mitigations
            if (checked === "yes") $("#mitigations-wrapper").show();

            // Else, hide it
            else $("#mitigations-wrapper").hide();

        });

        // Fired when the user clicks on "add" on the dialog opened in expert mode
        $("#mitigation-add").click(() => this.openDialog($("#dialog-mitigation-expert-new")));

        // When the selected option is changed, update the label
        $("#mitigation-type-select").change(() => utils.changeSelectorLabel("mitigation-type-select"));

        // Fired when the user clicks on "cancel" on the dialog to insert a new mitigation
        $("#mitigation-expert-new-cancel").click(() => {

            // Close the dialog
            this.closeDialog($("#dialog-mitigation-expert-new"));

            // Reset the label
            utils.resetSelector("mitigation-type-select");

        });

        // Fired when the user clicks on "ok" on the dialog to insert a new mitigation
        $("#mitigation-expert-new-ok").click(() => {

            // Save the type
            let type = $("#mitigation-type-select").val();

            // If the type is none, alert the user and return
            if (type === "none") {
                utils.logOrToast(i18next.t("messages.mandatoryOption"), "long");
                return;
            }

            // Create a new mitigation item
            this.createMitigationItem(type);

            // Close the dialog
            this.closeDialog($("#dialog-mitigation-expert-new"));

            // Reset the label
            utils.resetSelector("mitigation-type-select");

        });


        // Fired when the user clicks on the "monitoring" request
        $("#monitoring-request").click(() => {

            // Initialize the value to select in the selector
            let toSelect = this._vals.monitoring;

            // If the user hasn't already specified the monitoring, select "yes"
            if (this._vals.monitoring === "") toSelect = "yes";

            // Select the value
            $("input[name='monitoring'][value='" + toSelect + "']").prop("checked", "true");

            // If the user has selected the option "yes", show the option to specify the mitigation list
            if (toSelect === "yes") $("#monitoring-wrapper").show();

            // Else, hide it
            else $("#monitoring-wrapper").hide();

            // Empty the temporary list
            this._newMonitoringList = [];

            // Clear the dom list
            this.clearDomList("monitoring-list");

            // Display each item in the mitigation list
            this._vals.monitoringList.forEach(item => this.createMonitoringItem(item.type, item.status));

            // Open the dialog
            this.openFullscreenDialog($("#dialog-monitoring"));

        });

        // Fired when the user clicks on "close" on the dialog
        $("#monitoring-close").click(() => this.closeFullscreenDialog($("#dialog-monitoring")));

        // Fired when the user clicks on "done" on the dialog
        $("#monitoring-done").click(() => {

            // Save the value
            this._vals.monitoring = $("input[name='monitoring']:checked").val();

            // Save in the list all the elements of the temporary list that are not empty
            this._vals.monitoringList = this._newMonitoringList.filter(e => e !== "");

            // Set the text on the main page
            $("#monitoring-text").html(i18next.t("insert.monitoring.editText"));

            // Close the dialog
            this.closeFullscreenDialog($("#dialog-monitoring"))

        });

        // Fired when the selected option is changed
        $("input[name='monitoring']").change(() => {

            // Save the selected value
            let checked = $("input[name='monitoring']:checked").val();

            // If the selected value is "yes", show the option to add a new monitoring object
            if (checked === "yes") $("#monitoring-wrapper").show();

            // Else, hide it
            else $("#monitoring-wrapper").hide();

        });

        // Fired when the user clicks on "add" on the dialog opened in expert mode
        $("#monitoring-add").click(() => this.openDialog($("#dialog-monitoring-new")));

        // When the selected option is changed, update the label
        $("#monitoring-type-select").change(() => utils.changeSelectorLabel("monitoring-type-select"));

        // When the selected option is changed, update the label
        $("#monitoring-status-select").change(() => utils.changeSelectorLabel("monitoring-status-select"));

        // Fired when the user clicks on "cancel" on the dialog to insert a new monitoring object
        $("#monitoring-new-cancel").click(() => {

            // Close the dialog
            this.closeDialog($("#dialog-monitoring-new"));

            // Reset the label
            utils.resetSelector("monitoring-type-select");
            utils.resetSelector("monitoring-status-select");

        });

        // Fired when the user clicks on "ok" on the dialog to insert a new monitoring object
        $("#monitoring-new-ok").click(() => {

            // Save the values
            let type   = $("#monitoring-type-select").val(),
                status = $("#monitoring-status-select").val();

            // If the type or the status is none, alert the user and return
            if (type === "none" || status === "none") {
                utils.logOrToast(i18next.t("messages.mandatoryMonitoringFields"), "long");
                return;
            }

            // Create a new monitoring item
            this.createMonitoringItem(type, status);

            // Close the dialog
            this.closeDialog($("#dialog-monitoring-new"));

            // Reset the label
            utils.resetSelector("monitoring-type-select");
            utils.resetSelector("monitoring-status-select");

        });


        // Fired when the user clicks on the "damage" request
        $("#damages-request").click(() => {

            // Initialize the value to select in the selector
            let toSelect = this._vals.damages;

            // If the user hasn't already specified the damages, select "noDamage"
            if (this._vals.damages === "") toSelect = "noDamage";

            // Select the value
            $("input[name='damages'][value='" + toSelect + "']").prop("checked", "true");

            // If the user has selected the option "directDamage", show the option to specify the damages list
            if (toSelect === "directDamage") $("#damages-wrapper").show();

            // Else, hide it
            else $("#damages-wrapper").hide();

            // Empty the temporary list
            this._newDamagesList = [];

            // Clear the dom list
            this.clearDomList("damages-list");

            // Display each item in the mitigation list
            this._vals.damagesList.forEach(item => this.createDamagesItem(item.type, item.specification));

            // Open the dialog
            this.openFullscreenDialog($("#dialog-damages"));

        });

        // Fired when the user clicks on "close" on the dialog
        $("#damages-close").click(() => this.closeFullscreenDialog($("#dialog-damages")));

        // Fired when the user clicks on "done" on the dialog
        $("#damages-done").click(() => {

            // Save the value
            this._vals.damages = $("input[name='damages']:checked").val();

            // Save in the list all the elements of the temporary list that are not empty
            this._vals.damagesList = this._newDamagesList.filter(e => e !== "");

            // Set the text on the main page
            $("#damages-text").html(i18next.t("insert.damages.editText"));

            // Close the dialog
            this.closeFullscreenDialog($("#dialog-damages"))

        });

        // Fired when the selected option is changed
        $("input[name='damages']").change(() => {

            // Save the selected value
            let checked = $("input[name='damages']:checked").val();

            // If the selected value is "directDamage", show the option to add a new damaged object
            if (checked === "directDamage") $("#damages-wrapper").show();

            // Else, hide it
            else $("#damages-wrapper").hide();

        });

        // Fired when the user clicks on "add" on the dialog opened in expert mode
        $("#damages-add").click(() => this.openDialog($("#dialog-damages-new")));

        // When the selected option is changed
        $("#damages-type-select").change(() => {

            // Update the label
            utils.changeSelectorLabel("damages-type-select");

            // If the type selected is "other", show the input to specify the type
            if ($("#damages-type-select").val() === "other") $("#damage-other-input-wrapper").show();

            // Else, hide it
            else $("#damage-other-input-wrapper").hide();

        });

        // Fired when the user clicks on "cancel" on the dialog to insert a new damage
        $("#damages-new-cancel").click(() => {

            // Close the dialog
            this.closeDialog($("#dialog-damages-new"));

            // Reset the label
            utils.resetSelector("damages-type-select");

            // Reset the text input and hide it
            $("#damage-other-input").val("");
            $("#damage-other-input-wrapper").hide();

        });

        // Fired when the user clicks on "ok" on the dialog to insert a new damage
        $("#damages-new-ok").click(() => {

            // Save the values
            let type        = $("#damages-type-select").val(),
                $otherInput = $("#damage-other-input");

            // If the type  is none, alert the user and return
            if (type === "none") {
                utils.logOrToast(i18next.t("messages.mandatoryOption"), "long");
                return;
            }

            // If the type is "other" and no specification is provided, alert the user and return
            if (type === "other" && $otherInput.val() === "") {
                utils.logOrToast(i18next.t("messages.mandatoryDamageOther"), "long");
                return;
            }

            // Set the specification
            let specification = "";

            // If the type is "other", save the value of the input
            if (type === "other") specification = $otherInput.val().toString();

            // Create a new monitoring item
            this.createDamagesItem(type, specification);

            // Close the dialog
            this.closeDialog($("#dialog-damages-new"));

            // Reset the label
            utils.resetSelector("damages-type-select");

            // Reset the text input and hide it
            $otherInput.val("");
            $("#damage-other-input-wrapper").hide();

        });


        // Fired when the user clicks on the "notes" request
        $("#notes-request").click(() => {

            // Set the value of the text field
            $("#notes").val(this._vals.notes);

            // Open the dialog
            this.openFullscreenDialog($("#dialog-notes"));

        });

        // Fired when the user clicks on "close"
        $("#notes-close").click(() => this.closeFullscreenDialog($("#dialog-notes")));

        // Fired when the user clicks on "done"
        $("#notes-done").click(() => {

            // Save the value
            this._vals.notes = $("#notes").val();

            // Set the text of the main page
            $("#notes-text").html(i18next.t("insert.notes.editText"));

            // Close the dialog
            this.closeFullscreenDialog($("#dialog-notes"));

        });


        // Fired when the user clicks on the photo thumbnail
        this._$photoThm.click(() => {

            // If no photo has been taken, get a picture
            if (this._vals.photo === "") this.getPicture();

            // Else open the image screen to show the photo
            else
                utils.openImgScreen(
                    this._$photoThm.find("img").attr("src"),
                    true,
                    () => this.getPicture(),
                    () => {

                        // Delete the saved photo
                        this._vals.photo = "";

                        // Set the placeholder
                        this._$photoThm.find("img").attr("src", "img/img-placeholder-200.png").hide();

                        // Show the icon
                        this._$photoThm.find("i").show();

                    }
                )

        });

    }


    /** Take a picture with the phone camera. */
    getPicture() {

        // Options for the photo
        const opt = {
            quality           : 30,                              // Output quality is 30% of the original photo
            destinationType   : Camera.DestinationType.FILE_URI, // Output as a file uri
            sourceType        : Camera.PictureSourceType.CAMERA, // Take only from the camera (not from the gallery)
            encodingType      : Camera.EncodingType.JPEG,        // Encode the output as jpeg
            mediaType         : Camera.MediaType.PICTURE,        // The output is a picture
            allowEdit         : false,                           // Prevent editing
            correctOrientation: true                             // Automatically correct the orientation of the picture
        };

        // Get the picture
        navigator.camera.getPicture(
            // Fired if the picture is taken successfully
            fileURI => {

                // Save the uri of the photo
                this._vals.photo = fileURI;

                // Show the image on the thumbnail
                this._$photoThm.find("img").attr("src", this._vals.photo).show();

                // Hide the placeholder
                this._$photoThm.find("i").hide();

            },

            // Fired if there is an error
            err => {
                console.log(`Error taking picture ${err}`);

                // Alert the user
                utils.createAlert("", i18next.t("dialogs.insert.pictureError"), i18next.t("dialogs.btnOk"));

            },

            // Camera options
            opt
        );

    }


    /** Insert a new landslide in the local database. */
    postLocal() {

        // Open the loader
        utils.openLoader();

        // Save all the data
        const data = {
            _id                : utils.generateUID(),
            createdAt          : new Date().toISOString(),
            updatedAt          : new Date().toISOString(),
            expert             : App.isExpertMode.toString(),
            coordinates        : this._vals.coordinates,
            coordinatesAccuracy: this._vals.coordinatesAccuracy,
            altitude           : this._vals.altitude,
            altitudeAccuracy   : this._vals.altitudeAccuracy,
            type               : this._vals.type,
            materialType       : this._vals.materialType,
            hillPosition       : this._vals.hillPosition,
            water              : this._vals.water,
            vegetation         : this._vals.vegetation,
            mitigation         : this._vals.mitigation,
            mitigationList     : this._vals.mitigationList,
            monitoring         : this._vals.monitoring,
            monitoringList     : this._vals.monitoringList,
            damages            : this._vals.damages,
            damagesList        : this._vals.damagesList,
            notes              : this._vals.notes,
            imageUrl           : this._vals.photo
        };

        // Move the image
        utils.moveImage(data.imageUrl)
            .then(url => {

                // Save the new url
                data.imageUrl = url;

                // Post the landslide
                return landslide.postLocal(data)

            })
            .then(data => {

                // Close the loader
                utils.closeLoader();

                // Show the new landslide
                landslide.show(data.id, data.coords, data.preciseCoordinates, true);

                // Show the sync notification
                $("#sync-notification").show();

                // Close the activity
                this.close();

            });

    }

    /** Insert a new landslide in the remote database. */
    postRemote() {

        // Open the loader
        utils.openLoader();

        // Create the formData object
        const formData = new FormData();

        // Append to the formData all the data
        formData.append("expert", App.isExpertMode.toString());
        formData.append("coordinates", JSON.stringify(this._vals.coordinates));
        formData.append("coordinatesAccuracy", this._vals.coordinatesAccuracy);
        formData.append("altitude", this._vals.altitude);
        formData.append("altitudeAccuracy", this._vals.altitudeAccuracy);
        formData.append("type", this._vals.type);
        formData.append("materialType", this._vals.materialType);
        formData.append("hillPosition", this._vals.hillPosition);
        formData.append("water", this._vals.water);
        formData.append("vegetation", this._vals.vegetation);
        formData.append("mitigation", this._vals.mitigation);
        formData.append("mitigationList", JSON.stringify(this._vals.mitigationList));
        formData.append("monitoring", this._vals.monitoring);
        formData.append("monitoringList", JSON.stringify(this._vals.monitoringList));
        formData.append("damages", this._vals.damages);
        formData.append("damagesList", JSON.stringify(this._vals.damagesList));
        formData.append("notes", this._vals.notes);

        // Append the image
        utils.appendFile(formData, this._vals.photo)
            .then(formData => {

                // Post the landslide
                return landslide.post(formData);

            })
            .then((data) => {

                // Close the loader
                utils.closeLoader();

                // Show the new landslide
                landslide.show(data.id, data.coords, data.preciseCoordinates, false);

                // Close the activity
                this.close();

            });

    }


    /** Modifies a landslide already in the local database. */
    putLocal() {

        // Open the loader
        utils.openLoader();

        // Save all the data
        const data = {
            updatedAt     : new Date().toISOString(),
            type          : this._vals.type,
            materialType  : this._vals.materialType,
            hillPosition  : this._vals.hillPosition,
            water         : this._vals.water,
            vegetation    : this._vals.vegetation,
            mitigation    : this._vals.mitigation,
            mitigationList: this._vals.mitigationList,
            monitoring    : this._vals.monitoring,
            monitoringList: this._vals.monitoringList,
            damages       : this._vals.damages,
            damagesList   : this._vals.damagesList,
            notes         : this._vals.notes
        };


        // Utility function to put the landslide and eventually remove the old photo
        const put = removeOld => {

            // Put the landslide locally
            landslide.putLocal(this._lsId, data)
                .then(() => {

                    // If removeOld is true, delete the old image
                    if (removeOld) utils.deleteImage(this._oldPhoto, false);

                    // Close the loader
                    utils.closeLoader();

                    // Open the info activity with the new landslide
                    InfoActivity.getInstance().getLandslide(data.id, true);

                    // Close the activity
                    InsertActivity.getInstance().close();

                });


        };

        // If the photo hasn't been changed, just put the landslide
        if (this._vals.photo === this._oldPhoto) put(false);

        // Else
        else {

            // Move the new image
            utils.moveImage(this._vals.photo)
                .then(url => {

                    // Save the new url
                    data.imageUrl = url;

                    // Put the landslide and remove the old image
                    put(true);

                });

        }

    }

    /** Modifies a landslide already in the remote database. */
    putRemote() {

        // Open the loader
        utils.openLoader();

        // Create the formData object
        const formData = new FormData();

        // Append to the formData all the data
        formData.append("type", this._vals.type);
        formData.append("materialType", this._vals.materialType);
        formData.append("hillPosition", this._vals.hillPosition);
        formData.append("water", this._vals.water);
        formData.append("vegetation", this._vals.vegetation);
        formData.append("mitigation", this._vals.mitigation);
        formData.append("mitigationList", JSON.stringify(this._vals.mitigationList));
        formData.append("monitoring", this._vals.monitoring);
        formData.append("monitoringList", JSON.stringify(this._vals.monitoringList));
        formData.append("damages", this._vals.damages);
        formData.append("damagesList", JSON.stringify(this._vals.damagesList));
        formData.append("notes", this._vals.notes);

        // Create a temporary variable
        let file = null;

        // If the photo has been changed, save it in the temporary variable
        if (this._vals.photo !== this._oldPhoto) file = this._vals.photo;

        // Append the image
        utils.appendFile(formData, file)
            .then(formData => {

                // Put the landslide
                return landslide.put(InsertActivity.getInstance()._lsId, formData);

            })
            .then((data) => {

                // Show the info about the landslide
                InfoActivity.getInstance().getLandslide(data.id, false);

                // Close the loader
                utils.closeLoader();

                // Close the activity
                InsertActivity.getInstance().close();

            });

    }


    /***********************************************************************
     * Utility methods
     ***********************************************************************/

    /**
     * Opens a full-screen dialog.
     *
     * @param {object} dialog - The dialog to open
     */
    openFullscreenDialog(dialog) {

        // Show the dialog
        dialog.show();

        // Set the currently opened full dialog to the dialog
        this._currOpenedFullDialog = dialog;

    }

    /**
     * Closes a full-screen dialog.
     *
     * @param {object} dialog - the dialog to close.
     */
    closeFullscreenDialog(dialog) {

        // Hide the dialog
        dialog.scrollTop(0).hide();

        // Set the currently opened full dialog to null
        this._currOpenedFullDialog = null;

    }


    /**
     * Opens a dialog.
     *
     * @param {object} toOpen - The dialog to open
     */
    openDialog(toOpen) {

        // Show an opaque overlay
        $("#opaque-overlay").show();

        // Hide the y-overflow of the main page
        $("#page--insert").css("overflow-y", "hidden");

        // Show the dialog
        toOpen.show();

        // Set the currently opened dialog to the dialog
        this._currOpenedDialog = toOpen;

    }

    /**
     * Closes a dialog.
     *
     * @param {object} toClose - The dialog to close.
     */
    closeDialog(toClose) {

        // Hide the dialog
        toClose.hide();

        // Hide the opaque overlay
        $("#opaque-overlay").hide();

        // Set the y-overflow of the main page to "scroll"
        $("#page--insert").css("overflow-y", "scroll");

        // Set the currently opened dialog to null
        this._currOpenedDialog = null;

    }


    /**
     * Clears a list in the DOM.
     *
     * @param {string} listId - The id of the list
     */
    clearDomList(listId) { $("#" + listId).html("") }

    /**
     * Deletes an item from a list and the correspondent DOM entry.
     *
     * @param {object[]} list - The list.
     * @param {string} listId - The id of the DOM element.
     * @param {string} idx - The index of the element to delete (in the form "name_of_the_list-number").
     */
    deleteListItem(list, listId, idx) {

        // Remove the DOM element
        $(`#${idx}`).parent().remove();

        // Extract the number from the index
        idx = idx.substring(idx.indexOf("-") + 1);

        // Remove the item from the list
        list[idx] = "";

    }


    /**
     * Create a new entry in the mitigation list.
     *
     * @param {string} type - The type of the mitigation measure.
     */
    createMitigationItem(type) {

        // Set the id of the button
        let btnId = "mitigation-" + this._newMitigationList.length;

        // Append the new element to the list
        $("#mitigation-list").append(`

            <section class='list-item no-padding'>
            
                <div class='list-item-text'>
                    <p class='list-item-text-p'>${i18next.t("insert.mitigation.enum." + type)}</p>
                </div>
                
                <div id='${btnId}' class='details-list-item-delete'>
                    <i class='material-icons'>cancel</i>
                </div>
                
            </section>
            
        `);

        // Set the behaviour of the button
        $(`#${btnId}`).click(() => this.deleteListItem(this._newMitigationList, "mitigation-list", btnId));

        // Push the item in the temporary list
        this._newMitigationList.push({ type: type });

    }

    /**
     * Create a new entry in the monitoring list.
     *
     * @param {string} type - The type of the monitoring work.
     * @param {string} status - The status of the monitoring work.
     */
    createMonitoringItem(type, status) {

        // Set the id of the button
        let btnId = "monitoring-" + this._newMonitoringList.length;

        // Append the new element to the list
        $("#monitoring-list").append(`

            <section class='list-item'>
            
                <div class='list-item-text padding-start'>
                
                    <p class='list-item-text-p'>
                    
                        <span class='list-item-entry-title' data-i18n='insert.monitoring.type'>Type: </span>
                        ${i18next.t("insert.monitoring.enum." + type)}
                        
                    </p>
                    
                    <p class='list-item-text-p'>
                    
                        <span class='list-item-entry-title' data-i18n='insert.monitoring.status'>Status: </span>
                        ${i18next.t("insert.monitoring.enum." + status)}
                        
                    </p>
            
                </div>
                
                <div id='${btnId}' class='details-list-item-delete'><i class='material-icons'>cancel</i></div>
                
            </section>
            
        `);

        // Set the behaviour of the button
        $(`#${btnId}`).click(() => this.deleteListItem(this._newMonitoringList, "monitoring-list", btnId));

        // Push the item in the temporary list
        this._newMonitoringList.push({ type: type, status: status });

    }

    /**
     * Create a new entry in the damages list.
     *
     * @param {string} type - The type of the mitigation measure.
     * @param {string} specification - The specification for type "other".
     */
    createDamagesItem(type, specification) {

        // Set the id of the button
        let btnId = "damage-" + this._newDamagesList.length;

        // Get the text to display
        let info = i18next.t("insert.damages.enum." + type);

        // If there is a specification, set it as text to display
        if (specification !== "") info = specification;

        // Append the new element to the list
        $("#damages-list").append(`

            <section class='list-item no-padding'>
            
                <div class='list-item-text padding-start'>
                    <p class='list-item-text-p'>${info}</p>
                </div>
                
                <div id='${btnId}' class='details-list-item-delete'><i class='material-icons'>cancel</i></div>
                
            </section>
            
        `);

        // Set the behaviour of the button
        $(`#${btnId}`).click(() => this.deleteListItem(this._newDamagesList, "damages-list", btnId));

        // Push the item in the temporary list
        this._newDamagesList.push({ type: type, specification: specification });

    }

}
