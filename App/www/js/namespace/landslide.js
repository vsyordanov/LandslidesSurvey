"use strict";

/**
 * Collection of functions for the manipulation of the landslides.
 *
 * @namespace
 * @author Edoardo Pessina
 */
const landslide = {

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
     * Displays a landslide as a marker on the map.
     *
     * @param {string} id - The id of the landslide.
     * @param {number[]} coordinates - The coordinates of the landslide.
     */
    show: (id, coordinates) => {

        // Create a new marker
        const marker = L.marker(coordinates, {
            icon     : landslide.icon, // The icon of the marker
            draggable: false           // The marker cannot be moved
        });

        // Set the id of the marker
        marker._id = id;

        // When the user clicks on the marker, open the landslide's info
        marker.on("click", () => InfoActivity.getInstance().open(id));

        // Add the marker to the array
        landslide.markers.push(marker);

        // Add the marker to the layer of the map
        MapActivity.getInstance().markersLayer.addLayer(marker);

    },

    /** Retrieves and displays all the landslides of the currently logged user on the map. */
    showAll: () => {

        // Remove all the markers from the map
        landslide.markers.forEach(m => MapActivity.getInstance().markersLayer.removeLayer(m));

        // Empty the markers array
        landslide.markers = [];

        // Fetch from the server all the defibrillators of the logged user
        fetch(
            `${settings.serverUrl}/landslide/get-all`,
            { headers: { Authorization: `Bearer ${LoginActivity.getInstance().token}` } }
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
                data.landslides.forEach(d => landslide.show(d._id, d.coordinates));

            })
            .catch(err => {

                console.error(err);

                // Alert the user of the error

                // Unauthorized
                if (err.code === 401)
                    utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.getLandslides401"), i18next.t("dialogs.btnOk"));

                // Generic server error
                else
                    utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.getLandslides500"), i18next.t("dialogs.btnOk"));

            });

    },


    /**
     * Retrieves from the server the information about a landslide.
     *
     * @param {string} id - The id of the defibrillator.
     * @returns {Promise<object>} A promise containing the data about the landslide.
     */
    get: id => {

        // Return a promise
        return new Promise((resolve, reject) => {

            // Send a request to the server to retrieve the data
            fetch(
                `${settings.serverUrl}/landslide/${id}`,
                { headers: { Authorization: `Bearer ${LoginActivity.getInstance().token}` } }
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
                    resolve(data.landslide);

                })
                .catch(err => {

                    console.error(err);

                    // Close the loader
                    utils.closeLoader();

                    // Alert the user of the error
                    switch (err.code) {

                        // Unauthorized
                        case 401:
                            utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.getLandslide401"), i18next.t("dialogs.btnOk"));
                            break;

                        // Not found
                        case 404:
                            utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.getLandslide404"), i18next.t("dialogs.btnOk"));
                            break;

                        // Generic server error
                        default:
                            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.getLandslide500"), i18next.t("dialogs.btnOk"));
                            break;

                    }

                    // Reject the promise
                    reject();

                });

        });

    },


    /**
     * Sends a request to the server to insert a new landslide into the database.
     *
     * @param {FormData} formData - A FormData object containing the data about the landslide.
     * @returns {Promise<object>} A promise containing the id and the coordinates of the landslide.
     */
    post: formData => {

        // Return a new promise
        return new Promise((resolve, reject) => {

            // Send a request to the server to insert a new defibrillator
            fetch(
                `${settings.serverUrl}/landslide/post`,
                {
                    method : "POST",
                    headers: { Authorization: `Bearer ${LoginActivity.getInstance().token}` },
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
                    resolve({ id: data.landslide._id, coords: data.landslide.coordinates });

                })
                .catch(err => {

                    console.error(err);

                    // Close the loader
                    utils.closeLoader();

                    // Alert the user of the error
                    switch (err.code) {

                        // Unauthorized
                        case 401:
                            utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.postLandslide401"), i18next.t("dialogs.btnOk"));
                            break;

                        // Wrong data
                        case 422:
                            utils.logOrToast(i18next.t("messages.postLandslide422"), "long");
                            break;

                        // Generic server error
                        default:
                            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.postLandslide500"), i18next.t("dialogs.btnOk"));
                            break;

                    }

                    // Reject the promise
                    reject();

                });

        });

    },


    /**
     * Sends a request to the server to update a landslide already present into the database.
     *
     * @param {string} id - The id of the landslide to update
     * @param {FormData} formData - A FormData object containing the data about the landslide.
     * @returns {Promise<object>} A promise containing the id of the landslide.
     */
    put: (id, formData) => {

        // Return a new promise
        return new Promise((resolve, reject) => {

            // Send a request to the server to insert a new landslide
            fetch(
                `${settings.serverUrl}/landslide/${id}`,
                {
                    method : "PUT",
                    headers: { Authorization: `Bearer ${LoginActivity.getInstance().token}` },
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
                    resolve({ id: data.landslide._id });

                })
                .catch(err => {

                    console.error(err);

                    // Close the loader
                    utils.closeLoader();

                    // Alert the user of the error
                    switch (err.code) {

                        // Unauthorized
                        case 401:
                            utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.putLandslide401"), i18next.t("dialogs.btnOk"));
                            break;

                        // Not found
                        case 404:
                            utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.putLandslide404"), i18next.t("dialogs.btnOk"));
                            break;

                        // Wrong data
                        case 422:
                            utils.logOrToast(i18next.t("messages.putLandslide422"), "long");
                            break;

                        // Generic server error
                        default:
                            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.putLandslide500"), i18next.t("dialogs.btnOk"));
                            break;

                    }

                    // Reject the promise
                    reject();

                });

        });

    },


    /**
     * Deletes a landslide from the database and removes it from the map.
     *
     * @param {string} id - The id of the landslide.
     * @returns {Promise<>} An empty promise.
     */
    delete: id => {

        // Return a promise
        return new Promise((resolve, reject) => {

            // Send a request to the server to delete the landslide
            fetch(
                `${settings.serverUrl}/landslide/${id}`,
                {
                    method : "DELETE",
                    headers: { Authorization: `Bearer ${LoginActivity.getInstance().token}` }
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
                    landslide.markers.forEach(m => {

                        // If it's the one to delete, remove the correspondent marker from the map
                        if (m._id === id) MapActivity.getInstance().markersLayer.removeLayer(m);

                        // Else, push the marker in the temporary array
                        else newMarkers.push(m)

                    });

                    // Save the temporary array as the new marker array
                    landslide.markers = newMarkers;

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
                            utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.deleteLandslide401"), i18next.t("dialogs.btnOk"));
                            break;

                        // Not found
                        case 404:
                            utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.deleteLandslide404"), i18next.t("dialogs.btnOk"));
                            break;

                        // Generic server error
                        default:
                            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.deleteLandslide500"), i18next.t("dialogs.btnOk"));
                            break;

                    }

                    // Reject the promise
                    reject();

                });

        });

    },

};