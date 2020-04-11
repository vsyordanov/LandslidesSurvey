"use strict";

/**
 *  Activity to visualize the information about a landslide.
 *
 * @author Edoardo Pessina
 */
class InfoActivity {

    /** @private */ static _instance;

    /** Options to format the date */
    static get dateOpts() {
        return {
            year  : "numeric",
            month : "2-digit",
            day   : "2-digit",
            hour  : "2-digit",
            minute: "2-digit",
            second: "2-digit"
        }
    }


    /**
     * Creates and initializes the activity.
     * To implement the Singleton pattern, it should never be called directly. Use {@link InfoActivity.getInstance}
     * to get the Singleton instance of the class.
     *
     * @constructor
     */
    constructor() {

        // Cache the screen
        this._screen = $("#page--info");

        // Cache the placeholders
        this._placeholders = $("#page--info .placeholder");


        // When the user clicks on the "close" button, close the activity
        $("#info-close").click(() => this.close());

        // When the user clicks on the photo thumbnail, open the image screen
        $("#info-photo-thm").click(function () { utils.openImgScreen($(this).attr("src")) });

    }

    /**
     * Returns the current InfoActivity instance if any, otherwise creates it.
     *
     * @returns {InfoActivity} The activity instance.
     */
    static getInstance() {

        if (!InfoActivity._instance)
            InfoActivity._instance = new InfoActivity();

        return InfoActivity._instance;

    }


    /**
     * Opens the activity.
     *
     * @param {string} id - The id of the landslide.
     * @param {boolean} isLocal - True if the landslide is saved in the local database.
     */
    open(id, isLocal) {

        // Push the activity into the stack
        utils.pushStackActivity(this);

        // If the landslide is not saved locally and the app is offline
        if (!isLocal && !navigator.onLine) {

            // Close the activity
            this.close();

            // Alert the user
            utils.createAlert("", i18next.t("dialogs.infoRemoteOffline"), i18next.t("dialogs.btnOk"));

            // Return
            return;

        }

        // If the landslide is local, Alert the user
        if (isLocal) utils.createAlert("", i18next.t("dialogs.openLocalInfo"), i18next.t("dialogs.btnOk"));

        // Animate the placeholders
        this._placeholders.addClass("ph-animate");

        // Show the screen
        this._screen.show();

        // Get and display the landslide
        this.getLandslide(id, isLocal);

    }

    /** Closes the activity and resets its fields. */
    close() {

        // Pop the activity from the stack
        utils.popStackActivity();

        // Hide the screen
        this._screen.scrollTop(0).hide();

        // Hide the content behind the placeholders
        $("#page--info .ph-hidden-content").hide();

        // Stop the placeholders animation
        this._placeholders.removeClass("ph-animate").show();

        // Hide the delete button
        $("#info-delete").hide();

        // Hide the info button
        $("#info-edit").hide();

        // Show all the fields
        $(".info-block").show();

        // Delete the content of each of the fields
        $("#info-createdAt .info-content").html("");
        $("#info-updatedAt .info-content").html("");
        $("#info-coordinates .info-content").html("");
        $("#info-coordinatesAccuracy .info-content").html("");
        $("#info-altitude .info-content").html("");
        $("#info-altitudeAccuracy .info-content").html("");
        $("#info-type .info-content").html("");
        $("#info-materialType .info-content").html("");
        $("#info-hillPosition .info-content").html("");
        $("#info-water .info-content").html("");
        $("#info-vegetation .info-content").html("");
        $("#info-mitigation .info-content").html("");
        $("#info-mitigationsList .info-content").html("");
        $("#info-monitoring .info-content").html("");
        $("#info-monitoringList .info-content").html("");
        $("#info-damages .info-content").html("");
        $("#info-damagesList .info-content").html("");
        $("#info-notes .info-content").html("");

        // Show the image placeholder
        $("#info-photo-preview").attr("src", "img/no-img-placeholder-200.png");

    }

    /** Defines the behaviour of the back button for this activity */
    onBackPressed() {

        // Close the activity
        this.close();

    }


    /**
     * Retrieves and displays the information about a landslide.
     *
     * @param {string} id - The id of the landslide.
     * @param {boolean} isLocal - True if the landslide is saved in the local database.
     */
    getLandslide(id, isLocal) {

        // Get the data about the landslide
        landslide.get(id, isLocal)
            .then(data => {

                // Show and initialize the "delete" button
                $("#info-delete").show().unbind("click").click(() => {

                    // Ask for confirmation and delete the landslide
                    utils.createAlert(
                        "",
                        i18next.t("dialogs.deleteConfirmation"),
                        i18next.t("dialogs.btnCancel"),
                        null,
                        i18next.t("dialogs.btnOk"),
                        () => {

                            // Open the loader
                            utils.openLoader();

                            // Delete the landslide
                            landslide.delete(id, isLocal, data.imageUrl)
                                .then(() => {

                                    // Close the loader
                                    utils.closeLoader();

                                    // Close the activity
                                    this.close();

                                })
                                .catch(() => {

                                    // Close the loader
                                    utils.closeLoader();

                                })

                        }
                    );

                });

                // Show and initialize the "edit" button
                $("#info-edit").show().unbind("click").click(() => {

                    // Open the insert activity in "put" mode
                    InsertActivity.getInstance().openPut(data, isLocal);

                    // Scroll to top
                    this._screen.scrollTop(0);

                });

                // Show the data
                this.show(data, isLocal);

            })
            .catch(() => {

                // Close the activity
                this.close();

            });

    }


    /**
     * Shows the data.
     *
     * @param {object} data - The data to show.
     * @param {boolean} isLocal - True if the landslide is saved in the local database.
     */
    show(data, isLocal) {

        // Show all the fields
        $(".info-block").show();

        // If the landslide has been mapped in simple mode, hide the expert fields
        if (!data.expert || (isLocal && data.expert !== "true")) {

            $("#info-hillPosition").hide();
            $("#info-vegetation").hide();
            $("#info-mitigationList").hide();
            $("#info-monitoring").hide();
            $("#info-monitoringList").hide();
            $("#info-damages").hide();
            $("#info-damagesList").hide();
            $("#info-notes").hide();

        }

        // Else, hide the lists accordingly to the value of the respective field
        else {

            if (data.mitigation !== "yes") $("#info-mitigationList").hide();
            if (data.monitoring !== "yes") $("#info-monitoringList").hide();
            if (data.damages !== "directDamage") $("#info-damagesList").hide();

        }

        // For each key in the object
        for (let key in data) {

            // If the object has a property associated with the key
            if (data.hasOwnProperty(key)) {

                // Set the content of the field associated with the key
                $("#info-" + key + " .info-content").html(() => {

                    // Save the value of the key
                    const val = data[key];

                    // If the val is empty, set the content to "-"
                    if (val === "") return "-";

                    // Set the value form based on the key
                    switch (key) {

                        case "_id":
                            return val;

                        // Display the date formatted accordingly to the current language
                        case "createdAt":
                        case "updatedAt":
                            return new Date(val).toLocaleDateString(i18next.language, InfoActivity.dateOpts);

                        // Display the coordinates
                        case "coordinates":
                            if (data.preciseCoordinates &&
                                data.preciseCoordinates[0] !== undefined &&
                                data.preciseCoordinates[1] !== undefined)
                                return data.preciseCoordinates[0] + ", " + data.preciseCoordinates[1];
                            else
                                return val[0] + ", " + val[1];

                        // Display the accuracy
                        case "coordinatesAccuracy":
                        case "altitudeAccuracy":
                            if (val === 0 || val === null) return i18next.t("info.unknown");
                            return val + " " + i18next.t("info.accuracyUnit");

                        // Display the altitude
                        case "altitude":
                            if (val === -999) return i18next.t("info.unknown");
                            return val + " " + i18next.t("info.altitudeUnit");

                        // Display the mitigation list
                        case "mitigationList":
                            if (val.length === 0) return "-";

                            let mitigationContent = "<ul class='info-list'>";

                            for (let i = 0; i < val.length; i++) {
                                mitigationContent += `<li>${i18next.t("insert.mitigation.enum." + val[i].type)}</li>`;
                            }

                            mitigationContent = mitigationContent + "</ul>";

                            return mitigationContent;

                        // Display the monitoring list
                        case "monitoringList":
                            if (val.length === 0) return "-";

                            let monitoringContent = "<ul class='info-list'>";

                            for (let i = 0; i < val.length; i++) {
                                monitoringContent +=
                                    `<li>
                                        ${i18next.t("insert.monitoring.enum." + val[i].type)} (${i18next.t("insert.monitoring.enum." + val[i].status)})
                                    </li>`;
                            }

                            monitoringContent = monitoringContent + "</ul>";

                            return monitoringContent;

                        // Display the damages list
                        case "damagesList":
                            if (val.length === 0) return "-";

                            let damagesContent = "<ul class='info-list'>";

                            for (let i = 0; i < val.length; i++) {

                                damagesContent = damagesContent + "<li>";

                                if (val[i].type === "other")
                                    damagesContent = damagesContent + val[i].specification;
                                else
                                    damagesContent = damagesContent + i18next.t("insert.damages.enum." + val[i].type);

                                damagesContent = damagesContent + "</li>";

                            }

                            damagesContent = damagesContent + "</ul>";

                            return damagesContent;

                        // Display the notes
                        case "notes":
                            return val;

                        default:
                            return i18next.t("insert." + key + ".enum." + val);

                    }

                });

            }

        }

        // Save the photo url
        let photoSrc;

        // ToDo fix
        if (isLocal) photoSrc = data.imageUrl;

        // Else, set the remote url
        else photoSrc = `${settings.serverUrl}/${data.imageUrl}`;

        // Show the photo
        $("#info-photo-thm").attr("src", photoSrc);

        // Hide the placeholders
        this._placeholders.hide().removeClass("ph-animate");

        // Show the content hidden by the placeholders
        $("#page--info .ph-hidden-content").show();

    }

}
