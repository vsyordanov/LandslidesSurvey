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

        // Set the expert checkbox based on the current mode
        $("#expert-cbx").prop("checked", App.isExpertMode);

        // Show the screen
        this._screen.show();

    }

    /** Closes the activity. */
    close() { this._screen.scrollTop(0).hide() }


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

            $("#page--account-settings").show();

        });


        // Fired when the user clicks on the expert checkbox
        $("#expert-cbx").click(() => {

            // Change the mode
            localStorage.setItem("mode", (!App.isExpertMode).toString());

        });


        // Fired when the user clicks on the language setting
        $("#settings-language-wrapper").click(() => {

            utils.logOrToast(i18next.t("settings.notImplemented"), "long");

        });


        // Fired when the user clicks on the help setting
        $("#settings-help-wrapper").click(() => {

            utils.logOrToast(i18next.t("settings.notImplemented"), "long");

        });

    }


    /** Initializes the user interface of the screen of the account setting. */
    initAccountUi() {

        // Save the screen
        let screen = $("#page--account-settings");

        // When the user clicks on the "close" button, close the screen
        $("#account-close").click(() => screen.scrollTop(0).hide());


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

        });

        // When the user clicks on the change mail setting, show the page
        $("#account-change-mail").click(() => $("#change-email").show());

        // When the user clicks on the change password setting, show the page
        $("#account-change-pw").click(() => {$("#change-pw").show()});

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
                    screen.scrollTop(0).hide();

                    // Logout
                    this.logout();

                }
            );

        });


        // Initialize the change email page
        this.initChangeEmail();

        // Initialize the change password page
        this.initChangePw();

        // Initialize the change edit profile page
        this.initEditProfile();

    }


    /** Initializes the change email page. */
    initChangeEmail() {

        // Utility function to close the menu
        const close = () => {

            // Hide the screen
            $("#change-email").scrollTop(0).hide();

            // Reset the field
            $("#new-email").val("");

        };

        // When the user click on the "close" button, close the page
        $("#change-email-close").click(() => close());

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
                    close();

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

        // Utility function to close the page
        const close = () => {

            // Hide the screen
            $("#change-pw").scrollTop(0).hide();

            // Reset the fields
            $("#change-pw-old-password").val("");
            $("#change-pw-new-password").val("");
            $("#change-pw-confirm-password").val("");

        };

        // When the user click on the "close" button, close the page
        $("#change-pw-close").click(() => close());

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
                    close();

                    // Alert the user
                    utils.logOrToast(i18next.t("messages.changePwSuccess"), "long");

                })

        });

    }


    /** Initializes the edit profile page. */
    initEditProfile() {

        // Utility function to close the page
        const close = () => {

            // Hide the screen
            $("#page--edit-profile").scrollTop(0).hide();

            // Reset the fields
            $("#edit-profile-age").val("");
            utils.changeSelectorLabel("edit-profile-age", true);

            $("#edit-profile-gender").val("");
            utils.changeSelectorLabel("edit-profile-gender", true);

            $("#edit-profile-occupation").val("");
            utils.changeSelectorLabel("edit-profile-occupation", true);

        };

        // When the user clicks on th "close" button, switch to the profile activity
        $("#edit-profile-close").click(() => close());

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
                    close();

                    // Alert the user
                    utils.logOrToast(i18next.t("messages.editProfileSuccess"), "long");

                });

        });

        // Change the label of the selectors when their value changes
        $("#edit-profile-age").change(() => utils.changeSelectorLabel("edit-profile-age", true));
        $("#edit-profile-gender").change(() => utils.changeSelectorLabel("edit-profile-gender", true));
        $("#edit-profile-occupation").change(() => utils.changeSelectorLabel("edit-profile-occupation", true));

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