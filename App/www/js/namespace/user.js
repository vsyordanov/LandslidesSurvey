"use strict";

/**
 * Collection of functions for the manipulation of the users data.
 *
 * @namespace
 * @author Edoardo Pessina
 */
const user = {


    /**
     * Retrieves the information about a user.
     *
     * @param {string} id - The id of the user.
     * @returns {Promise<object>} A promise containing the data of the user.
     */
    get(id) {

        // Return a promise
        return new Promise((resolve, reject) => {

            // Send a request to the server to retrieve the data
            fetch(
                `${settings.serverUrl}/profile/${id}`,
                {
                    headers: {
                        "App-Key"    : settings.APIKey,
                        Authorization: `Bearer ${LoginActivity.getInstance().token}`
                    }
                }
            )
                .then(res => {

                    // If the server responds with something over than 200 (success), throw an error
                    if (res.status !== 200) {
                        const err = new Error();
                        err.code  = res.status;
                        throw err;
                    }

                    // Parse the json response
                    return res.json();

                })
                .then(data => {

                    // Resolve the promise
                    resolve(data.user);

                })
                .catch(err => {

                    console.error(err);

                    // Close the loader
                    utils.closeLoader();

                    // Alert the user of the error
                    switch (err.code) {

                        // Unauthorized
                        case 401:
                            utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.getUser401"), i18next.t("dialogs.btnOk"));
                            break;

                        // Forbidden (api key not recognized)
                        case 403:
                            utils.createAlert(i18next.t("dialogs.title403"), i18next.t("dialogs.message403"), i18next.t("dialogs.btnOk"));
                            break;

                        // Not found
                        case 404:
                            utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.getUser404"), i18next.t("dialogs.btnOk"));
                            break;

                        // Generic server error
                        default:
                            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.getUser500"), i18next.t("dialogs.btnOk"));
                            break;

                    }

                    // Reject the promise
                    reject();

                });

        });

    },


    /**
     * Uploads a new profile picture for a target user. If the form data contains no file, it will instead delete the
     * current picture.
     *
     * @param {string} id - The id of the user.
     * @param {FormData} formData - The form data containing the new picture.
     * @returns {Promise<object>} A promise containing the name of the new picture.
     */
    putProfilePicture(id, formData) {

        // Return a promise
        return new Promise((resolve, reject) => {

            // Send a request to the server to upload the new image
            fetch(
                `${settings.serverUrl}/profile/${id}/update-picture?if=prof`,
                {
                    method : "PUT",
                    headers: {
                        "App-Key"    : settings.APIKey,
                        Authorization: `Bearer ${LoginActivity.getInstance().token}`
                    },
                    body   : formData
                }
            )
                .then(res => {

                    // If the server responds with something over than 200 (success), throw an error
                    if (res.status !== 200) {
                        const err = new Error();
                        err.code  = res.status;
                        throw err;
                    }

                    // Parse the json response
                    return res.json();

                })
                .then(data => {

                    // Resolve the promise
                    resolve(data.imageUrl);

                })
                .catch(err => {

                    console.error(err);

                    // Close the loader
                    utils.closeLoader();

                    // Alert the user of the error
                    switch (err.code) {

                        // Unauthorized
                        case 401:
                            utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.putProfileImage401"), i18next.t("dialogs.btnOk"));
                            break;

                        // Forbidden (api key not recognized)
                        case 403:
                            utils.createAlert(i18next.t("dialogs.title403"), i18next.t("dialogs.message403"), i18next.t("dialogs.btnOk"));
                            break;

                        // Not found
                        case 404:
                            utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.putProfileImage404"), i18next.t("dialogs.btnOk"));
                            break;

                        // Generic server error
                        default:
                            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.putProfileImage500"), i18next.t("dialogs.btnOk"));
                            break;

                    }

                    // Reject the promise
                    reject();

                });

        });

    },


    /**
     * Changes the email of a user.
     *
     * @param {string} id - The id of the user.
     * @param {string} newEmail - The new mail.
     * @returns {Promise<>} - An empty promise.
     */
    putEmail(id, newEmail) {

        // Return a promise
        return new Promise((resolve, reject) => {

            // Send a request to the server to change the mail
            fetch(
                `${settings.serverUrl}/profile/${id}/change-email`,
                {
                    method : "PUT",
                    headers: {
                        "App-Key"    : settings.APIKey,
                        Authorization: `Bearer ${LoginActivity.getInstance().token}`,
                        "Content-Type": "application/json"
                    },
                    body   : JSON.stringify({ email: newEmail })
                }
            )
                .then(res => {

                    // If the server responds with something over than 200 (success), throw an error
                    if (res.status !== 200) {
                        const err = new Error();
                        err.code  = res.status;
                        throw err;
                    }

                    // Resolve the promise
                    resolve();

                })
                .catch(err => {

                    console.error(err);

                    // Close the loader
                    utils.closeLoader();

                    // Alert the user of the error
                    switch (err.code) {

                        // Unauthorized
                        case 401:
                            utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.changeEmail401"), i18next.t("dialogs.btnOk"));
                            break;

                        // Forbidden (api key not recognized)
                        case 403:
                            utils.createAlert(i18next.t("dialogs.title403"), i18next.t("dialogs.message403"), i18next.t("dialogs.btnOk"));
                            break;

                        // Email already in use
                        case 409:
                            utils.logOrToast(i18next.t("messages.register409"), "long");
                            break;

                        // Not found
                        case 404:
                            utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.changeEmail404"), i18next.t("dialogs.btnOk"));
                            break;

                        // Generic server error
                        default:
                            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.changeEmail500"), i18next.t("dialogs.btnOk"));
                            break;

                    }

                    // Reject the promise
                    reject();

                });

        });

    },


    /**
     * Change the password of the user.
     *
     * @param {string} id - The id of the user.
     * @param {string} oldPw - The old password.
     * @param {string} newPw - The new password.
     * @param {string} confirmPw - The repeated new password.
     * @returns {Promise<>} - An empty promise.
     */
    putPassword(id, oldPw, newPw, confirmPw) {

        // Return a promise
        return new Promise((resolve, reject) => {

            // Send a request to the server to change the password
            fetch(
                `${settings.serverUrl}/profile/${id}/change-password`,
                {
                    method : "PUT",
                    headers: {
                        "App-Key"    : settings.APIKey,
                        Authorization: `Bearer ${LoginActivity.getInstance().token}`,
                        "Content-Type": "application/json"
                    },
                    body   : JSON.stringify({
                        oldPassword    : oldPw,
                        newPassword    : newPw,
                        confirmPassword: confirmPw
                    })
                }
            )
                .then(res => {

                    // If the server responds with something over than 200 (success), throw an error
                    if (res.status !== 200) {
                        const err = new Error();
                        err.code  = res.status;
                        throw err;
                    }

                    // Resolve the promise
                    resolve();

                })
                .catch(err => {

                    console.error(err);

                    // Close the loader
                    utils.closeLoader();

                    // Alert the user of the error
                    switch (err.code) {

                        // Unauthorized
                        case 401:
                            utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.changePw401"), i18next.t("dialogs.btnOk"));
                            break;

                        // Forbidden (api key not recognized)
                        case 403:
                            utils.createAlert(i18next.t("dialogs.title403"), i18next.t("dialogs.message403"), i18next.t("dialogs.btnOk"));
                            break;

                        // Not found
                        case 404:
                            utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.changePw404"), i18next.t("dialogs.btnOk"));
                            break;

                        // Wrong data
                        case 422:
                            utils.logOrToast(i18next.t("messages.changePw422"), "long");
                            break;

                        // Generic server error
                        default:
                            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.changePw500"), i18next.t("dialogs.btnOk"));
                            break;

                    }

                    // Reject the promise
                    reject();

                });

        });

    },


    /**
     * Updates the user's profile information.
     *
     * @param {string} id - The id of the user.
     * @param {string} json - A JSON string containing the new values to set.
     * @returns {Promise<object>} A promise containing the new data.
     */
    putProfile(id, json) {

        // Return a promise
        return new Promise((resolve, reject) => {

            // Send a request to the server to change the password
            fetch(
                `${settings.serverUrl}/profile/${id}/update-profile`,
                {
                    method : "PUT",
                    headers: {
                        "App-Key"    : settings.APIKey,
                        Authorization: `Bearer ${LoginActivity.getInstance().token}`,
                        "Content-Type": "application/json"
                    },
                    body   : json
                }
            )
                .then(res => {

                    // If the server responds with something over than 200 (success), throw an error
                    if (res.status !== 200) {
                        const err = new Error();
                        err.code  = res.status;
                        throw err;
                    }

                    // Parse the json response
                    return res.json();

                })
                .then(data => {

                    // Resolve the promise
                    resolve(data.user);

                })
                .catch(err => {

                    console.error(err);

                    // Close the loader
                    utils.closeLoader();

                    // Alert the user of the error
                    switch (err.code) {

                        // Unauthorized
                        case 401:
                            utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.editProfile401"), i18next.t("dialogs.btnOk"));
                            break;

                        // Forbidden (api key not recognized)
                        case 403:
                            utils.createAlert(i18next.t("dialogs.title403"), i18next.t("dialogs.message403"), i18next.t("dialogs.btnOk"));
                            break;

                        // Not found
                        case 404:
                            utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.editProfile404"), i18next.t("dialogs.btnOk"));
                            break;

                        // Wrong data
                        case 422:
                            utils.logOrToast(i18next.t("messages.editProfile422"), "long");
                            break;

                        // Generic server error
                        default:
                            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.editProfile500"), i18next.t("dialogs.btnOk"));
                            break;

                    }

                    // Reject the promise
                    reject();

                });

        });

    },

};