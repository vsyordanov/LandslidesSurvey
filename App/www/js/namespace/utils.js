"use strict";

/**
 * Collection of utility functions.
 *
 * @namespace
 * @author Edoardo Pessina
 */
const utils = {

    /** @private */ _$alertOverlay: $("#alert-dialog-overlay"),

    /** Flag the states if the loader is currently opened. */
    isLoaderOpen: false,

    /** Flag the states if the alert dialog is currently opened. */
    isAlertOpen: false,

    /** Flag the states if the image screen is currently opened. */
    isImgScreenOpen: false,


    /**
     * Switches between two activities.
     *
     * @param {Object} toOpen - The activity to open.
     * @param {boolean} [close=false] - A boolean stating if the current activity has to be closed or not.
     * @param {Object} [toClose=null] - The activity to close.
     */
    switchActivity: (toOpen, close = false, toClose = null) => {

        // If the other activity should be closed, close it
        if (close) toClose.close();

        // Open the activity to open
        toOpen.open();

    },


    /**
     * Insert a new activity at the bottom of the activity stack.
     *
     * @param {object} activity - The activity to push.
     * @return {number} The current quantity of activities in the stack.
     */
    pushStackActivity: activity => app.activityStack.push(activity),

    /**
     * Removes the last activity from the activity stack.
     *
     * @return {object} The removed activity.
     */
    popStackActivity: () => app.activityStack.pop(),


    /**
     * Generates a cryptographically secure random unique identifier.
     *
     * @return {string} The unique identifier.
     */
    generateUID: () => {

        // Create utility variables
        let array = new Uint32Array(6),
            uid   = '';

        // Generate some random variables
        window.crypto.getRandomValues(array);

        // Generate the random uid
        for (let i = 0; i < array.length; i++) { uid += (i < 2 || i > 5 ? '' : '-') + array[i].toString(16).slice(-4) }

        // Return the uid
        return uid

    },


    /**
     * Checks if the authentication token is expired and in case logs out from the application.
     *
     * @return {boolean} True if the token is expired.
     */
    isTokenExpired: () => {

        return false;

        // // Retrieve the expiration date from the storage
        // const expireDate = localStorage.getItem("expireDate");
        //
        // // If the token is not expired or if the user is a guest, return true
        // if ((expireDate && new Date(expireDate) > new Date()) || app.isGuest) return false;
        //
        // // For each activity in the stack
        // for (let i = (app.activityStack.length - 1); i >= 0; i--) {
        //
        //     // Close the activity
        //     app.activityStack[i].close();
        //
        // }
        //
        // // Logout
        // LoginActivity.getInstance().logout();
        //
        // // Open the login activity
        // LoginActivity.getInstance().open();
        //
        // // Close any open loader
        // utils.closeLoader();
        //
        // // Close any open alert
        // utils.closeAlert();
        //
        // // Alert the user
        // utils.createAlert("", i18next.t("dialogs.tokenExpired"), i18next.t("dialogs.btnOk"));
        //
        // // Return true
        // return true;

    },


    /**
     * Retrieves or creates the "image" folder from the persistent and private data storage within the application's
     * sandbox.
     *
     * @return {Promise<object>} A promise containing the directory object.
     */
    getLocalDirectory: () => {

        // Return a new promise
        return new Promise((resolve, reject) => {

            // Find the root directory in the system
            window.resolveLocalFileSystemURL(
                // Persistent and private data storage within the application's sandbox
                cordova.file.dataDirectory,

                // Fired if the directory is found
                rootDir => {

                    // Get the application folder
                    rootDir.getDirectory(
                        // Name of the folder
                        "images",

                        // If the folder doesn't exist, create it
                        { create: true },

                        // If the directory is found/created, resolve the promise
                        dir => resolve(dir),

                        // If there is an error
                        err => {

                            console.error("Fail to get or create main directory", err);

                            // Reject the promise
                            reject();

                        })

                },

                // Fired if an error occurs
                err => {

                    console.error("Fail to resolve root directory", err);

                    // Reject the promise
                    reject();

                }
            );

        });

    },


    /**
     * Moves an image into the "image" folder in the private data storage within the application's sandbox.
     *
     * @param {string} imageUrl - The url of the image to move.
     * @return {Promise<string>} A promise containing the new url of the image.
     */
    moveImage: imageUrl => {

        // Return a promise
        return new Promise((resolve, reject) => {

            // Utility function to fire on error
            const onError = () => {

                // Close the loader
                utils.closeLoader();

                // Alert the user
                utils.createAlert("", i18next.t("dialogs.insert.movePictureError"), i18next.t("dialogs.btnOk"));

                // Reject the promise
                reject();

            };

            // Find the image in the system
            window.resolveLocalFileSystemURL(
                // The url of the image
                imageUrl,

                // If the image is found
                fileEntry => {

                    // Get the "image" directory in the application private data storage
                    utils.getLocalDirectory()
                        .then(dir => {

                            // Move the image in the directory
                            fileEntry.moveTo(
                                // The directory
                                dir,

                                // The original path of the image
                                fileEntry.name,

                                // If the imaged is moved successfully
                                file => {

                                    console.log("File moved!", file);

                                    // Resolve the promise
                                    resolve(file.nativeURL);

                                },

                                // If there is an error
                                err => {

                                    console.error("Fail to move the file", err);

                                    // Call the utility function
                                    onError();

                                }
                            )

                        })
                        .catch(() => {

                            // Call the utility function
                            onError();

                        });

                },

                // If there is an error
                err => {

                    console.error("Failed to resolve the file", err);

                    // Call the utility function
                    onError();

                }
            );

        });

    },


    /**
     * Deletes an image from the local memory.
     *
     * @param {string} imageUrl - The url of the image.
     * @param {boolean} showError - True if an eventual error has to be shown.
     * @return {Promise<>} An empty promise (always resolved).
     */
    deleteImage: (imageUrl, showError) => {

        // Return a new promise
        return new Promise(resolve => {

            // Utility function to fire on error
            const onError = () => {

                // If the error has to be shown, alert the user
                if (showError) utils.createAlert("", i18next.t("dialogs.deleteLocalPhotoError"), i18next.t("dialogs.btnOk"));

                // Resolve the promise
                resolve();

            };

            // Find the image in the system
            window.resolveLocalFileSystemURL(
                // The url of the image
                imageUrl,

                // If the image is found
                file => {

                    file.remove(
                        // If the image is deleted successfully
                        () => {

                            console.log("Photo removed successfully");

                            resolve();

                        },

                        // If there is an error
                        err => {

                            console.error("Error removing photo", err);

                            // Call the utility function
                            onError();

                        }
                    )

                },

                // If there is an error
                err => {

                    console.error("Error getting the photo", err);

                    // Call the utility function
                    onError();

                }
            );

        });

    },


    /**
     * Appends a file as a blob to the given formData.
     *
     * @param {FormData} formData - The form data to which the file has to be appended
     * @param {(string|null)} [fileUri] - The uri of the file to append.
     * @param {(boolean|null)} [showError=true] - True if an eventual error has to be shown.
     * @returns {Promise<FormData>} - A promise containing the formData with the file append to it.
     */
    appendFile(formData, fileUri, showError) {

        // Return a promise
        return new Promise((resolve, reject) => {

            // If no file is provided
            if (!fileUri) {

                // Resolve
                resolve(formData);

                // Return
                return;

            }

            // Find the file in the file system
            window.resolveLocalFileSystemURL(
                // Url of the file
                fileUri,

                // If the file is found
                fileEntry => {

                    // Get the file
                    fileEntry.file(file => {

                        // Create a file reader
                        let reader = new FileReader();

                        // When the reader has finished loading the file
                        reader.onloadend = e => {

                            // Create a blob to store the file
                            let blob = new Blob([new Uint8Array(e.target.result)], { type: "image/jpeg" });

                            // Append the blob to the form data
                            formData.append("image", blob);

                            // Resolve the promise
                            resolve(formData);

                        };

                        // If an error occurs
                        reader.onerror = fileReadResult => {

                            console.error(`Reader error ${fileReadResult}`);

                            // Alert the user
                            utils.createAlert("", i18next.t("dialogs.errorAppendPicture"), i18next.t("dialogs.btnOk"));

                            // Reject the promise
                            reject();

                        };

                        // Read the file
                        reader.readAsArrayBuffer(file);

                    }, err => {

                        console.error(`Error getting the fileEntry file ${err}`);

                        // If the error does not have to be shown
                        if (!showError) {

                            // Reject
                            reject();

                            // Return
                            return;

                        }

                        // Alert the user
                        utils.createAlert("", i18next.t("dialogs.errorAppendPicture"), i18next.t("dialogs.btnOk"));

                        // Reject the promise
                        reject();

                    })

                },

                // If an error occurs
                err => {

                    console.error(`Error getting the file ${err}`);

                    // If the error does not have to be shown, return
                    if (!showError) reject();

                    // Alert the user
                    utils.createAlert("", i18next.t("dialogs.errorAppendPicture"), i18next.t("dialogs.btnOk"));

                    // Reject the promise
                    reject();

                }
            );

        });

    },


    /**
     * Creates and display an alert dialog with a message and up to two buttons.
     *
     * @param {string} title - The title of the dialog.
     * @param {string} msg - The message to display.
     * @param {string} btn1 - The text of the first button.
     * @param {(function|null)} [clbBtn1] - The function to call when the first button is clicked.
     * @param {(string|null)} [btn2] - The text of the second button.
     * @param {(function|null)} [clbBtn2] - The function to call when the second button is clicked.
     */
    createAlert: (title, msg, btn1, clbBtn1 = null, btn2 = null, clbBtn2 = null) => {

        // If the title is empty, hide it
        if (title === "") utils._$alertOverlay.find(".dialog-title").hide();

        // Else, show it
        else utils._$alertOverlay.find(".dialog-title").html(title);

        // Set the dialog message
        utils._$alertOverlay.find(".dialog-text").html(msg);

        // Set the text and the behaviour of the first button
        $("#alert-first-button").html(btn1).unbind("click").click(() => {

            // Close the alert
            utils.closeAlert();

            // If a callback for the first button has been provided, call it
            if (clbBtn1) clbBtn1();

        });

        // If a text for the second button has been provided
        if (btn2) {

            // Show, set the text and the behaviour of the second button
            $("#alert-second-button").show().html(btn2).unbind("click").click(() => {

                // Close the alert
                utils.closeAlert();

                // If a callback for the second button has been provided, call it
                if (clbBtn2) clbBtn2();

            });

        }

        // Show the dialog
        utils._$alertOverlay.find(".dialog-wrapper").show();

        // Show the overlay
        utils._$alertOverlay.show();

        // Set the flag to true
        utils.isAlertOpen = true;

    },

    /** Closes the alert dialog. */
    closeAlert: () => {

        // Hide the overlay and cancel the dialog message
        utils._$alertOverlay.hide()
            .children(".dialog-text").html("");

        // Show the title and cancel its content
        utils._$alertOverlay.find(".dialog-title").show().html("");

        // Hide the second button
        $("#alert-second-button").hide();

        // Hide the dialog
        utils._$alertOverlay.find(".dialog-wrapper").hide();

        // Set the flag to false
        utils.isAlertOpen = false;

    },


    /** Opens a spinner loader. */
    openLoader: () => {

        // Show the spinner
        utils._$alertOverlay.find(".spinner-wrapper").show();

        // Show the opaque overlay
        utils._$alertOverlay.show();

        // Set the flag to true
        utils.isLoaderOpen = true;

    },

    /** Opens the spinner loader. */
    closeLoader: () => {

        // Hide the opaque overlay
        utils._$alertOverlay.hide();

        // Hide the spinner
        utils._$alertOverlay.find(".spinner-wrapper").hide();

        // Set the flag to false
        utils.isLoaderOpen = false;

    },


    /**
     * Displays a message to the user.
     *
     * @param {string} msg - The message to display.
     * @param {string} duration - How long the message should stay on the screen.
     */
    logOrToast: (msg, duration) => {

        window.plugins.toast.show(msg, duration, "bottom");

    },


    /**
     * Changes the label of a selector.
     *
     * @param {string} selectorId - The id of the selector.
     * @param {boolean} [changeColor=false] - True if the color of the label should be changed.
     */
    changeSelectorLabel: (selectorId, changeColor = false) => {

        // Save the selector and its label
        const $selector = $("#" + selectorId),
              $label    = $("[for='" + selectorId + "'").find(".label-description");

        // If there is nothing selected
        if ($selector.val() === "none") {

            // Set the label to the default one
            $label.html(i18next.t("selectors." + selectorId + "DefLabel"));

            // If changeColor is true, change the color of the label
            if (changeColor) $label.css("color", "#757575");

        }

        // If an option is selected
        else {

            // Set the label to the selected option
            $label.html($selector.find("option:selected").text());

            // If changeColor is true, change the color of the label
            if (changeColor) $label.css("color", "#000000");

        }

    },

    /**
     * Resets the label of a selector to the default one.
     *
     * @param selectorId - The id of the selector.
     */
    resetSelector: selectorId => {

        // Set the default option as selected
        $("#" + selectorId).get(0).selectedIndex = 0;

        //Change the label
        utils.changeSelectorLabel(selectorId);

    },


    /**
     * Opens a screen that displays an image.
     *
     * @param {string} scr - The url of the image.
     * @param {boolean} [editable=false] - True if the image can be deleted or modified.
     * @param {function} [clbEdit] - Function to be called when the user clicks on the "edit" button.
     * @param {function} [clbCancel] - Function to be called when the user clicks on the "cancel" button.
     */
    openImgScreen: (scr, editable = false, clbEdit, clbCancel) => {

        // Set the source of the image
        $("#img-screen-container img").attr("src", scr);

        // When the user clicks on the "close" button, close the screen
        $("#img-screen-close").click(() => utils.closeImgScreen());

        // If editable is true
        if (editable) {

            // Set the behaviour of the "edit" button and show it
            $("#img-screen-edit")
                .unbind("click")
                .click(() => {

                    // Close the image screen
                    utils.closeImgScreen();

                    // Fire the callback
                    clbEdit();

                })
                .parent()
                .show();

            // Set the behaviour of the "delete" button and show it
            $("#img-screen-delete")
                .show()
                .unbind("click")
                .click(() => {

                    // Show an alert to ask for the user's confirmation
                    utils.createAlert(
                        "",
                        i18next.t("dialogs.photoScreen.deletePictureConfirmation"),
                        i18next.t("dialogs.btnCancel"),
                        null,
                        i18next.t("dialogs.btnOk"),
                        () => {

                            // Call the callback
                            clbCancel();

                            // Close the screen
                            utils.closeImgScreen();

                        }
                    );

                })
                .parent().show();

        }

        // Show the screen
        $("#img-screen").show();

        // Set the flag to true
        utils.isImgScreenOpen = true;

    },

    /** Closes the image screen. */
    closeImgScreen: () => {

        // Hide the screen
        $("#img-screen").hide();

        // Reset the image source
        $("#img-screen-container img").attr("src", "");

        // Hide the "edit" button
        $("#img-screen-edit").parent().hide();

        // HIde the delete button
        $("#img-screen-delete").parent().hide();

        // Set the flag to false
        utils.isImgScreenOpen = false;

    },

};
