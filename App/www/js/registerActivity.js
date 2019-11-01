"use strict";

/**
 *  Activity to register to the application
 *
 * @author Edoardo Pessina
 */
class RegisterActivity {

    /** @private */ static _instance;

    /**
     * Creates and initializes the activity.
     * To implement the Singleton pattern, it should never be called directly. Use {@link RegisterActivity.getInstance}
     * to get the Singleton instance of the class.
     *
     * @constructor
     */
    constructor() {

        // Cache the pages
        this.disclaimer = $("#page--register-disclaimer");
        this.screen     = $("#page--register");

        // Flag that states if the disclaimer is currently opend
        this._isDisclaimerOpen = false;


        // If the user accepts the disclaimer, open the registration page
        $("#btn--register-disclaimer-accept").click(() => {

            // Show the registration screen
            this.screen.show();

            // Hide the disclaimer
            this.disclaimer.scrollTop(0).hide();

            // Set the flag to false
            this._isDisclaimerOpen = false;

        });

        // If the user does not accept the disclaimer, switch back to login activity
        $("#link--register-disclaimer-back").click(() => utils.switchActivity(LoginActivity.getInstance(), true, this));

        // Perform the registration
        $("#btn--register-done").click(() => this.register());

        // Bring back to login page
        $("#link--login").click(() => utils.switchActivity(LoginActivity.getInstance(), true, this));


        // Listen for the changes of the selectors and update their label accordingly
        $("#register-age").change(() => utils.changeSelectorLabel("register-age", true));
        $("#register-gender").change(() => utils.changeSelectorLabel("register-gender", true));
        $("#register-occupation").change(() => utils.changeSelectorLabel("register-occupation", true));

    }

    /**
     * Returns the current RegisterActivity instance if any, otherwise creates it.
     *
     * @returns {RegisterActivity} The activity instance.
     */
    static getInstance() {

        if (!RegisterActivity._instance)
            RegisterActivity._instance = new RegisterActivity();

        return RegisterActivity._instance;

    }


    /** Opens the activity. */
    open() {

        // Push the activity into the stack
        utils.pushStackActivity(this);

        // Show the disclaimer
        this.disclaimer.show();

        // Set the flag to true
        this._isDisclaimerOpen = true;

    }

    /** Closes the activity and resets its fields. */
    close() {

        // Pop the activity from the stack
        utils.popStackActivity();

        // Hide the disclaimer
        this.disclaimer.scrollTop(0).hide();

        // Hide the screen
        this.screen.scrollTop(0).hide();

        // Reset the fields
        $("#field--register-email").val("");
        $("#field--register-password").val("");
        $("#field--register-confirm-password").val("");

        // Reset the selectors
        utils.resetSelector("register-age");
        utils.resetSelector("register-gender");
        utils.resetSelector("register-occupation");

        // Set the flag to false
        this._isDisclaimerOpen = false;

    }

    /** Defines the behaviour of the back button for this activity */
    onBackPressed() {

        // If the form page is open
        if (!this._isDisclaimerOpen) {

            // Show the disclaimer
            this.disclaimer.show();

            // Show the registration screen
            this.screen.scrollTop(0).hide();

            // Set the flag to true
            this._isDisclaimerOpen = true;

            // Return
            return;

        }

        // Switch to the login activity
        utils.switchActivity(LoginActivity.getInstance(), true, this);

    }


    /** Register in the application. */
    register() {

        // Open the loader
        utils.openLoader();

        // Save the value of the fields
        const email           = $("#field--register-email").val(),
              password        = $("#field--register-password").val(),
              confirmPassword = $("#field--register-confirm-password").val(),
              age             = $("#register-age").val(),
              gender          = $("#register-gender").val(),
              occupation      = $("#register-occupation").val();

        // If no email has been provided, flash an error message
        if (email === "") {
            utils.closeLoader();
            utils.logOrToast(i18next.t("messages.mandatoryEmail"), "long");
            return;
        }

        // If no email has been provided or if the password is not strong enough, flash an error message
        if (password === "" || password.length < 8 || !(/\d/.test(password.toString()))) {
            utils.closeLoader();
            utils.logOrToast(i18next.t("messages.weakPassword"), "long");
            return;
        }

        // If the values in the "password" and "confirm password" fields do not match, flash an error message
        if (password !== confirmPassword) {
            utils.closeLoader();
            utils.logOrToast(i18next.t("messages.passwordsNotMatch"), "long");
            return;
        }

        fetch(
            `${settings.serverUrl}/auth/signup`,
            {
                method : "PUT",
                headers: { "Content-Type": "application/json" },
                body   : JSON.stringify({
                    email          : email,
                    password       : password,
                    confirmPassword: confirmPassword,
                    age            : age,
                    gender         : gender,
                    occupation     : occupation
                })
            }
        )
            .then(res => {

                // If the server responds with something over than 200 (success), throw an error
                if (res.status !== 201) {
                    const err = new Error();
                    err.code  = res.status;
                    throw err;
                }

                // Close the loader
                utils.closeLoader();

                // Open the login page
                utils.switchActivity(LoginActivity.getInstance(), true, this);

                // Display a dialog about the confirmation email
                utils.createAlert(i18next.t("auth.register.successTitle"), i18next.t("auth.register.successMessage"), i18next.t("dialogs.btnOk"));

            })
            .catch(err => {

                console.error(err);

                // Close the loader
                utils.closeLoader();

                // Alert the user of the error
                switch (err.code) {

                    // Email already in use
                    case 409:
                        utils.logOrToast(i18next.t("messages.register409"), "long");
                        break;

                    // Wrong input data
                    case 422:
                        utils.logOrToast(i18next.t("messages.register422"), "long");
                        break;

                    // Generic server error
                    default:
                        utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.register500"), i18next.t("dialogs.btnOk"));
                        break;

                }

            });

    }

}