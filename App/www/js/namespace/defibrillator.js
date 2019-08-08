"use strict";

/**
 * Collection of functions for the manipulation of the defibrillators.
 *
 * @namespace
 * @author Edoardo Pessina
 */
const defibrillator = {

    /** The icon of a defibrillator marker. */
    icon: L.icon({
        iconUrl        : "img/ls-marker.png",            // The url of the icon
        iconRetinaUrl  : "img/ls-marker-2x.png",         // The url of the icon for retina displays
        shadowUrl      : "img/ls-marker-shadow.png",     // The url of the shadow
        shadowRetinaUrl: "img/ls-marker-shadow-2x.png",  // The url of the shadow for retina display
        iconSize       : [31, 37],                       // The size of the icon
        shadowSize     : [31, 19],                       // The size of the shadow
        iconAnchor     : [31, 37],                       // The position of the "tip" of the icon
        shadowAnchor   : [18, 18]                        // The position of the shadow anchor
    }),

    /** The array containing all the markers currently on the map. */
    markers: [],


    /**
     * Displays a defibrillator as a marker on the map.
     *
     * @param {string} id - The id of the defibrillator.
     * @param {number[]} coordinates - The coordinates of the defibrillator.
     */
    show: (id, coordinates) => {

        // Create a new marker
        const marker = L.marker(coordinates, {
            icon     : defibrillator.icon, // The icon of the marker
            draggable: false               // The marker cannot be moved
        });

        // Set the id of the marker
        marker._id = id;

        // When the user clicks on the marker, open the defibrillator's info
        marker.on("click", () => InfoActivity.getInstance().open(id));

        // Add the marker to the array
        defibrillator.markers.push(marker);

        // Add the marker to the layer of the map
        MapActivity.getInstance().markersLayer.addLayer(marker);

    },

    /** Retrieves and Displays all the defibrillators of the currently logged user on the map */
    showAll: () => {

        // Remove all the markers from the map
        defibrillator.markers.forEach(m => MapActivity.getInstance().markersLayer.removeLayer(m));

        // Empty the markers array
        defibrillator.markers = [];

        // Fetch from the server all the defibrillators of the logged user
        fetch(
            `${settings.serverUrl}/defibrillator/get-all`,
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

                // Show each of the retrieved defibrillators
                data.defibrillators.forEach(d => defibrillator.show(d._id, d.coordinates));

            })
            .catch(err => {

                console.error(err);

                // Alert the user of the error
                switch (err.code) {

                    // Unauthorized
                    case 401:
                        utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.getDefibrillators401"), i18next.t("dialogs.btnOk"));
                        break;

                    // Forbidden (api key not recognized)
                    case 403:
                        utils.createAlert(i18next.t("dialogs.title403"), i18next.t("dialogs.message403"), i18next.t("dialogs.btnOk"));
                        break;

                    // Generic server error
                    default:
                        utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.login500"), i18next.t("dialogs.btnOk"));
                        break;

                }

            });

    },


    /**
     * Retrieves from the server the information about a defibrillator.
     *
     * @param {string} id - The id of the defibrillator.
     * @returns {Promise<object>} A promise containing the data about the defibrillator.
     */
    get: id => {

        // Return a promise
        return new Promise((resolve, reject) => {

            // Send a request to the server to retrieve the data
            fetch(
                `${settings.serverUrl}/defibrillator/${id}`,
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
                    resolve(data.defibrillator);

                })
                .catch(err => {

                    console.error(err);

                    // closeInfo();

                    // Alert the user of the error
                    switch (err.code) {

                        // Unauthorized
                        case 401:
                            utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.getDefibrillator401"), i18next.t("dialogs.btnOk"));
                            break;

                        // Forbidden (api key not recognized)
                        case 403:
                            utils.createAlert(i18next.t("dialogs.title403"), i18next.t("dialogs.message403"), i18next.t("dialogs.btnOk"));
                            break;

                        // Not found
                        case 404:
                            utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.getDefibrillator404"), i18next.t("dialogs.btnOk"));
                            break;

                        // Generic server error
                        default:
                            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.login500"), i18next.t("dialogs.btnOk"));
                            break;

                    }

                    // Reject the promise
                    reject();

                });

        });

    },


    /**
     * Sends a request to the server to insert a new defibrillator into the database.
     *
     * @param {FormData} formData - A FormData object containing the data about the defibrillator.
     * @returns {Promise<object>} A promise containing the id and the coordinates of the defibrillator.
     */
    post: formData => {

        // Return a new promise
        return new Promise((resolve, reject) => {

            // Send a request to the server to insert a new defibrillator
            fetch(
                `${settings.serverUrl}/defibrillator/post?if=def`,
                {
                    method : "POST",
                    headers: {
                        "App-Key"    : settings.APIKey,
                        Authorization: `Bearer ${LoginActivity.getInstance().token}`
                    },
                    body   : formData
                }
            )
                .then(res => {

                    // If the server responds with something over than 201 (insert success), throw an error
                    if (res.status !== 201) {
                        const err = new Error();
                        err.code  = res.status;
                        throw err;
                    }

                    // Parse the json response
                    return res.json();

                })
                .then(data => {

                    // Resolve the promise
                    resolve({ id: data.defibrillator._id, coords: data.defibrillator.coordinates });

                })
                .catch(err => {

                    console.error(err);

                    // Alert the user of the error
                    switch (err.code) {

                        // Unauthorized
                        case 401:
                            utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.postDefibrillator401"), i18next.t("dialogs.btnOk"));
                            break;

                        // Forbidden (api key not recognized)
                        case 403:
                            utils.createAlert(i18next.t("dialogs.title403"), i18next.t("dialogs.message403"), i18next.t("dialogs.btnOk"));
                            break;

                        // Wrong data
                        case 422:
                            utils.logOrToast(i18next.t("messages.postDefibrillator422"), "long");
                            break;

                        // Generic server error
                        default:
                            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.login500"), i18next.t("dialogs.btnOk"));
                            break;

                    }

                    // Reject the promise
                    reject();

                });

        });

    },


    /**
     * Sends a request to the server to update a defibrillator already present into the database.
     *
     * @param {string} id - The id of the defibrillator to update
     * @param {FormData} formData - A FormData object containing the data about the defibrillator.
     * @returns {Promise<object>} A promise containing the id of the defibrillator.
     */
    put: (id, formData) => {

        // Return a new promise
        return new Promise((resolve, reject) => {

            // Send a request to the server to insert a new defibrillator
            fetch(
                `${settings.serverUrl}defibrillator/${id}?if=def`,
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
                    resolve({ id: data.defibrillator._id });

                })
                .catch(err => {

                    console.error(err);

                    // Alert the user of the error
                    switch (err.code) {

                        // Unauthorized
                        case 401:
                            utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.putDefibrillator401"), i18next.t("dialogs.btnOk"));
                            break;

                        // Forbidden (api key not recognized)
                        case 403:
                            utils.createAlert(i18next.t("dialogs.title403"), i18next.t("dialogs.message403"), i18next.t("dialogs.btnOk"));
                            break;

                        // Not found
                        case 404:
                            utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.putDefibrillator404"), i18next.t("dialogs.btnOk"));
                            break;

                        // Wrong data
                        case 422:
                            utils.logOrToast(i18next.t("messages.putDefibrillator404"), "long");
                            break;

                        // Generic server error
                        default:
                            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.login500"), i18next.t("dialogs.btnOk"));
                            break;

                    }

                    // Reject the promise
                    reject();

                });

        });

    },


    /**
     * Deletes a defibrillator from the database and removes it from the map.
     *
     * @param {string} id - The id of the defibrillator.
     * @returns {Promise<>} An empty promise.
     */
    delete: id => {

        // Return a promise
        return new Promise((resolve, reject) => {

            // Send a request to the server to delete the defibrillator
            fetch(
                `${settings.serverUrl}defibrillator/${id}`,
                {
                    method : "DELETE",
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

                    // Create a temporary array
                    let newMarkers = [];

                    // For each defibrillator
                    defibrillator.markers.forEach(m => {

                        // If it's the one to delete, remove the correspondent marker from the map
                        if (m._id === id) MapActivity.getInstance().markersLayer.removeLayer(m);

                        // Else, push the marker in the temporary array
                        else newMarkers.push(m)

                    });

                    // Save the temporary array as the new marker array
                    defibrillator.markers = newMarkers;

                    // Resolve the promise
                    resolve();

                })
                .catch(err => {

                    console.error(err);

                    // Alert the user of the error
                    switch (err.code) {

                        // Unauthorized
                        case 401:
                            utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.deleteDefibrillator401"), i18next.t("dialogs.btnOk"));
                            break;

                        // Forbidden (api key not recognized)
                        case 403:
                            utils.createAlert(i18next.t("dialogs.title403"), i18next.t("dialogs.message403"), i18next.t("dialogs.btnOk"));
                            break;

                        // Not found
                        case 404:
                            utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.deleteDefibrillator404"), i18next.t("dialogs.btnOk"));
                            break;

                        // Generic server error
                        default:
                            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.login500"), i18next.t("dialogs.btnOk"));
                            break;

                    }

                    // Reject the promise
                    reject();

                });

        });

    },

};