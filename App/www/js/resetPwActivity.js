"use strict";

/**
 *  Activity to reset the user's password. The user will receive an email to the specified account containing the
 *  instructions to reset his password.
 *
 * @author Edoardo Pessina
 */
class ResetPasswordActivity {

    /** @private */ static _instance;

    /**
     * Creates and initializes the activity.
     * To implement the Singleton pattern, it should never be called directly. Use {@link ResetPasswordActivity.getInstance}
     * to get the Singleton instance of the class.
     *
     * @constructor
     */
    constructor() {

        // Cache the screen
        this.screen = $("#page--reset-pw");

        // When the user clicks on the "close" button, close the page
        $("#btn--reset-pw-close").click(() => this.close());

        // When the user clicks on the "done" button, reset the password
        $("#btn--reset-pw-done").click(() => this.resetPassword());

    }

    /**
     * Returns the current ResetPasswordActivity instance if any, otherwise creates it.
     *
     * @returns {ResetPasswordActivity} The activity instance.
     */
    static getInstance() {

        if (!ResetPasswordActivity._instance)
            ResetPasswordActivity._instance = new ResetPasswordActivity();

        return ResetPasswordActivity._instance;

    }


    /** Opens the activity. */
    open() {

        // Push the activity into the stack
        utils.pushStackActivity(this);

        // Show the screen
        this.screen.show();

    }

    /** Closes the activity and resets its fields. */
    close() {

        // Pop the activity from the stack
        utils.popStackActivity();

        // Hide the screen
        this.screen.scrollTop(0).hide();

        // Reset the field
        $("#field--reset-pw-email").val("");

    }

    /** Defines the behaviour of the back button for this activity */
    onBackPressed() { this.close() }


    /** Sends an email to the user with the instructions to reset his password. */
    resetPassword() {

        // Open the loader
        utils.openLoader();

        // Save the value of the fields
        const email = $("#field--reset-pw-email").val();

        // If no email has been provided, flash an error message
        if (email === "") {
            utils.closeLoader();
            utils.logOrToast(i18next.t("messages.mandatoryEmail"), "long");
            return;
        }

        // Send a request to the server
        fetch(
            `${settings.serverUrl}/auth/reset-password`,
            {
                method : "POST",
                headers: { "Content-Type": "application/json" },
                body   : JSON.stringify({ email: email })
            }
        )
            .then(res => {

                // If the server responds with something over than 201 (resource created), throw an error
                if (res.status !== 201) {
                    const err = new Error();
                    err.code  = res.status;
                    throw err;
                }

                // Close the activity and the loader
                this.close();
                utils.closeLoader();

                // Show a success dialog
                utils.createAlert(
                    i18next.t("auth.login.resetPassword.successTitle"),
                    i18next.t("auth.login.resetPassword.successMessage"),
                    i18next.t("dialogs.btnOk")
                );

            })
            .catch(err => {

                console.error(err);

                // Close the loader
                utils.closeLoader();

                // Alert the user of the error
                switch (err.code) {

                    // User not found
                    case 404:
                        utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.resetPw404"), i18next.t("dialogs.btnOk"));
                        break;

                    // Wrong input data
                    case 422:
                        utils.logOrToast(i18next.t("messages.mandatoryEmail"), "long");
                        break;

                    // Generic server error
                    default:
                        utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.resetPw500"), i18next.t("dialogs.btnOk"));
                        break;

                }

            });

    }

}