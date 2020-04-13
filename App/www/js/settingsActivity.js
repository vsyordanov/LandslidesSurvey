"use strict";

/**
 *  Activity to change the application's settings.
 *
 * @author Edoardo Pessina
 */
class SettingsActivity {

    /** @private */ static _instance;


    /**
     * Creates and initializes the activity.
     * To implement the Singleton pattern, it should never be called directly. Use {@link SettingsActivity.getInstance}
     * to get the Singleton instance of the class.
     *
     * @constructor
     */
    constructor() {

        // Cache the screen
        this._screen = $("#page--settings");

        // Name of the currently opened setting
        this._openedSetting = null;

        // Initialize the settings user interface
        this.initSettingsUi();

        // Initialize the "account" setting user interface
        this.initAccountUi();

    }

    /**
     * Returns the current SettingsActivity instance if any, otherwise creates it.
     *
     * @returns {SettingsActivity} The activity instance.
     */
    static getInstance() {

        if (!SettingsActivity._instance)
            SettingsActivity._instance = new SettingsActivity();

        return SettingsActivity._instance;

    }


    /** Opens the activity. */
    open() {

        // Push the activity into the stack
        utils.pushStackActivity(this);

        // Set the expert checkbox based on the current mode
        $("#expert-cbx").prop("checked", App.isExpertMode);

        // Show the screen
        this._screen.show();

    }

    /** Closes the activity. */
    close() {

        // Pop the activity from the stack
        utils.popStackActivity();

        // Hide the screen
        this._screen.scrollTop(0).hide();

        // et the currently opened setting to null
        this._openedSetting = null;

    }

    /** Defines the behaviour of the back button for this activity */
    onBackPressed() {

        // If a setting is open
        if (this._openedSetting) {

            // Close the setting
            this.closeSetting(this._openedSetting);

            // Return
            return;

        }

        // Close the activity
        this.close();

    }


    /** Initializes the user interface of the main screen of the activity. */
    initSettingsUi() {

        // When the user clicks on the "close" button, close the activity
        $("#settings-close").click(() => this.close());


        // Fired when the user clicks on the account setting
        $("#settings-account-wrapper").click(() => {

            // If the user is a guest
            if (app.isGuest) {

                // Alert the user
                utils.createAlert(
                    "",
                    i18next.t("dialogs.profileGuest"),
                    i18next.t("dialogs.btnNo"),
                    null,
                    i18next.t("dialogs.btnYes"),
                    () => {

                        // Log out
                        this.logout();

                        // Set is guest flag to false
                        app.isGuest = false;

                    }
                );

                // Return
                return;

            }

            // If there is no connection
            if (!navigator.onLine) {

                // Alert the user
                utils.createAlert("", i18next.t("dialogs.profileOffline"), i18next.t("dialogs.btnOk"));

                // Return
                return;

            }

            // Show the page
            $("#page--account-settings").show();

            // Set the opened setting name
            this._openedSetting = "account";

        });


        // Fired when the user clicks on the expert checkbox
        $("#expert-cbx").click(() => {

            // Change the mode
            localStorage.setItem("mode", (!App.isExpertMode).toString());

        });


        // Fired when the user clicks on the language setting
        $("#settings-language-wrapper").click(() => {

            let targetLng;

            console.log(`Current language: ${App.appLanguage}`);

            if (App.appLanguage === "en") {
                targetLng = "it"
            } else {
                targetLng = "en"
            }

            i18next.changeLanguage(targetLng, err => {

                if (err) {
                    console.error("Error changing language", err);
                    utils.logOrToast(i18next.t("messages.changeLngError"), "long");
                    return;
                }

                $("body").localize();
                localStorage.setItem("lng", targetLng);
                utils.logOrToast(i18next.t("messages.lngChanged", {lng: targetLng}), "long");

            });

        });


        // Fired when the user clicks on the help setting
        // $("#settings-help-wrapper").click(() => {
        //
        //     utils.logOrToast(i18next.t("settings.notImplemented"), "long");
        //
        // });

    }


    /** Initializes the user interface of the screen of the account setting. */
    initAccountUi() {

        // When the user clicks on the "close" button, close the setting
        $("#account-close").click(() => this.closeSetting("account"));

        // When the user clicks on the edit profile setting
        $("#account-edit-profile").click(() => {

            // Open the loader
            utils.openLoader();

            // Get the user's data
            user.get(LoginActivity.getInstance().userId)
                .then(data => {

                    // Set the values of the fields
                    $("#edit-profile-age").val(data.age);
                    utils.changeSelectorLabel("edit-profile-age", true);

                    $("#edit-profile-gender").val(data.gender);
                    utils.changeSelectorLabel("edit-profile-gender", true);

                    $("#edit-profile-occupation").val(data.occupation);
                    utils.changeSelectorLabel("edit-profile-occupation", true);

                    // Show the page
                    $("#page--edit-profile").show();

                    // Close the loader
                    utils.closeLoader();

                });

            // Set the opened setting name
            this._openedSetting = "editProfile";

        });

        // When the user clicks on the change mail setting, show the page
        // $("#account-change-mail").click(() => {
        //
        //     // Show the screen
        //     $("#change-email").show();
        //
        //     // Set the opened setting name
        //     this._openedSetting = "changeEmail";
        //
        // });

        // When the user clicks on the change password setting, show the page
        // $("#account-change-pw").click(() => {
        //
        //     // Show the screen
        //     $("#change-pw").show();
        //
        //     // Set the opened setting name
        //     this._openedSetting = "changePassword";
        //
        // });

        // Fired when the user clicks on the logout setting
        $("#account-logout").click(() => {

            // Create a dialog to ask for user confirmation
            utils.createAlert(
                "",
                i18next.t("settings.account.logoutConfirmation"),
                i18next.t("dialogs.btnCancel"),
                null,
                i18next.t("dialogs.btnOk"),
                () => {

                    // Close the screen
                    $("#page--account-settings").scrollTop(0).hide();

                    // Logout
                    this.logout();

                }
            );

        });


        // Initialize the change email page
        // this.initChangeEmail();

        // Initialize the change password page
        // this.initChangePw();

        // Initialize the change edit profile page
        this.initEditProfile();

    }


    /** Initializes the change email page. */
    initChangeEmail() {

        // When the user click on the "close" button, close the page
        $("#change-email-close").click(() => this.closeSetting("changeEmail"));

        // When the user clicks on the "done" button, change the mail
        $("#change-email-done").click(() => {

            // Open the loader
            utils.openLoader();

            // Save the email provided by the user
            const email = $("#new-email").val();

            // If no email has been provided
            if (email === "") {

                // Close the loader
                utils.closeLoader();

                // Alert the user
                utils.logOrToast(i18next.t("messages.mandatoryEmail"), "long");

                // Return
                return;

            }

            // Change the email of the user
            user.putEmail(LoginActivity.getInstance().userId, email)
                .then(() => {

                    // Close the loader
                    utils.closeLoader();

                    // Close the menu
                    this.closeSetting("changeEmail");

                    // Close the account settings page
                    $("#page--account-settings").scrollTop(0).hide();

                    // Logout
                    this.logout();

                    // Create a confirmation email dialog
                    utils.createAlert(i18next.t("settings.account.changeEmail.successTitle"),
                        i18next.t("settings.account.changeEmail.successMessage"), i18next.t("dialogs.btnOk"));

                })

        });

    }


    /** Initializes the change password page. */
    initChangePw() {

        // When the user click on the "close" button, close the page
        $("#change-pw-close").click(() => this.closeSetting("changePassword"));

        // When the user clicks on the "done" button, change the password
        $("#change-pw-done").click(() => {

            // Open the loader
            utils.openLoader();

            // Save the values of the fields
            const oldPassword     = $("#change-pw-old-password").val(),
                  newPassword     = $("#change-pw-new-password").val(),
                  confirmPassword = $("#change-pw-confirm-password").val();

            // If no old password is provided, return
            if (oldPassword === "") {
                utils.logOrToast(i18next.t("messages.insertOldPassword"), "long");
                utils.closeLoader();
                return;
            }

            // If the password is too weak (less than 8 characters with no number), return
            if (newPassword === "" || newPassword.length < 8 || !(/\d/.test(newPassword))) {
                utils.logOrToast(i18next.t("messages.weakNewPassword"), "long");
                utils.closeLoader();
                return;
            }

            // If the old password is equal to the new password, return
            if (oldPassword === newPassword) {
                utils.logOrToast(i18next.t("messages.samePassword"), "long");
                utils.closeLoader();
                return;
            }

            // If the fields "new password" and "confirm password" do not match, return
            if (newPassword !== confirmPassword) {
                utils.logOrToast(i18next.t("messages.passwordsNotMatch"), "long");
                utils.closeLoader();
                return;
            }

            // Change the password
            user.putPassword(LoginActivity.getInstance().userId, oldPassword, newPassword, confirmPassword)
                .then(() => {

                    // Close the loader
                    utils.closeLoader();

                    // Close the page
                    this.closeSetting("changePassword");

                    // Alert the user
                    utils.logOrToast(i18next.t("messages.changePwSuccess"), "long");

                })

        });

    }


    /** Initializes the edit profile page. */
    initEditProfile() {

        // When the user clicks on th "close" button, switch to the profile activity
        $("#edit-profile-close").click(() => this.closeSetting("editProfile"));

        // When the user clicks on the "done" button, edit the profile
        $("#edit-profile-done").click(() => {

            // Open the loader
            utils.openLoader();

            // Save the values of the fields
            const age        = $("#edit-profile-age").val(),
                  gender     = $("#edit-profile-gender").val(),
                  occupation = $("#edit-profile-occupation").val();

            // Send a request to edit the profile
            user.putProfile(
                LoginActivity.getInstance().userId,
                JSON.stringify({ age: age, gender: gender, occupation: occupation })
            )
                .then(data => {

                    // Update the displayed data
                    $("#edit-profile-age").val(data.age);
                    utils.changeSelectorLabel("edit-profile-age", true);

                    $("#edit-profile-gender").val(data.gender);
                    utils.changeSelectorLabel("edit-profile-gender", true);

                    $("#edit-profile-occupation").val(data.occupation);
                    utils.changeSelectorLabel("edit-profile-occupation", true);

                    // Close the loader
                    utils.closeLoader();

                    // Close the page
                    this.closeSetting("editProfile");

                    // Alert the user
                    utils.logOrToast(i18next.t("messages.editProfileSuccess"), "long");

                });

        });

        // Change the label of the selectors when their value changes
        $("#edit-profile-age").change(() => utils.changeSelectorLabel("edit-profile-age", true));
        $("#edit-profile-gender").change(() => utils.changeSelectorLabel("edit-profile-gender", true));
        $("#edit-profile-occupation").change(() => utils.changeSelectorLabel("edit-profile-occupation", true));

    }


    /**
     * Closes a setting.
     *
     * @param {string} name - The name of the setting to close.
     */
    closeSetting(name) {

        // Switch on the name
        switch (name) {

            case "account":

                // Hide the screen
                $("#page--account-settings").scrollTop(0).hide();

                // Set the opened setting to null
                this._openedSetting = null;

                break;

            case "editProfile":

                // Hide the screen
                $("#page--edit-profile").scrollTop(0).hide();

                // Reset the fields
                $("#edit-profile-age").val("");
                utils.changeSelectorLabel("edit-profile-age", true);

                $("#edit-profile-gender").val("");
                utils.changeSelectorLabel("edit-profile-gender", true);

                $("#edit-profile-occupation").val("");
                utils.changeSelectorLabel("edit-profile-occupation", true);

                // Set the opened setting to "account"
                this._openedSetting = "account";

                break;

            case "changeEmail":

                // Hide the screen
                $("#change-email").scrollTop(0).hide();

                // Reset the field
                $("#new-email").val("");

                // Set the opened setting to "account"
                this._openedSetting = "account";

                break;

            case "changePassword":

                // Hide the screen
                $("#change-pw").scrollTop(0).hide();

                // Reset the fields
                $("#change-pw-old-password").val("");
                $("#change-pw-new-password").val("");
                $("#change-pw-confirm-password").val("");

                // Set the opened setting to "account"
                this._openedSetting = "account";

                break;

        }


    }


    /** Closes the activities and logs out form the application. */
    logout() {

        // Close the activity
        this.close();

        // Close the map activity
        MapActivity.getInstance().close();

        // Logout
        LoginActivity.getInstance().logout();

        // Open the login activity
        LoginActivity.getInstance().open();

    }

}
