"use strict";

/**
 *  Activity to show on a map the position of the user as well as the position of all the landslides he has already
 *  mapped.
 *
 * @author Edoardo Pessina
 */
class MapActivity {

    /** @private */ static _instance;

    /** @returns {number[]} Default position. */
    static get defaultLatLng() { return [45.464161, 9.190336] }

    /** @returns {number} Default zoom. */
    static get defaultZoom() { return 11 }

    /** @returns {number} Default zoom when watching the position. */
    static get watcherZoom() { return 17 }


    /**
     * Creates and initializes the activity.
     * To implement the Singleton pattern, it should never be called directly. Use {@link MapActivity.getInstance}
     * to get the Singleton instance of the class.
     *
     * @constructor
     */
    constructor() {

        // Cache the screen
        this._screen = $("#page--map");

        // Set the screen height to the occupy all the window
        this._screen.height($(window).height());


        // Create the map object
        this._map = L.map("page--map", {
            zoomSnap              : 0,       // the zoom level will not be snapped after a pinch-zoom
            zoomAnimation         : true,    // enable zoom animation
            zoomAnimationThreshold: 4,       // don't animate the zoom if the difference exceeds 4
            fadeAnimation         : true,    // enable tile fade animation
            markerZoomAnimation   : true,    // markers animate their zoom with the zoom animation
            touchZoom             : "center" // pinch-zoom will zoom to the center of the view
        });

        // Add a basemap from OpenStreetMap to the map
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { errorTileUrl: "img/errorTile.png" })
            .addTo(this._map);


        // Flag that defines if the map has to be automatically centered when a new position is found
        this._centerMap = true;

        // Flag that defines if the zoom of the map is fired automatically of by the user
        this._autoZoom = true;

        // Flag that defines if the user has clicked on a marker cluster
        this._clusterClick = false;

        // Flag that defines if the position found by the gps is the first found
        this._isFirstPositionFound = true;

        // Flag that defines if the position watcher is attached
        this.isPositionWatcherAttached = false;


        // Initialize the ui of the activity
        this.initUI();


        // Create the layer that will contain the landslide markers
        this.markersLayer = L.markerClusterGroup();

        // When the user click on a cluster, set clusterClick to true
        this.markersLayer.on("clusterclick", () => this._clusterClick = true);

        // When the animation caused by th click of the user on a cluster ends, set clusterClick to false
        this.markersLayer.on("animationend", () => this._clusterClick = false);

        // Add the layer to the map
        this._map.addLayer(this.markersLayer);


        // Initialize the position marker
        this.initPositionMarker();


        // ToDo deleted
        if (!App.isCordova) return;


        // Save the diagnostic plugin with an alias for later use
        this._d = cordova.plugins.diagnostic;

        // Register the position watcher
        this.registerGPSWatcher();

    }

    /**
     * States if an instance of the class exists.
     *
     * @returns {boolean} True if an instance of the class exists
     */
    static hasInstance() { return !!MapActivity._instance }

    /**
     * Returns the current MapActivity instance if any, otherwise creates it.
     *
     * @returns {MapActivity} The activity instance.
     */
    static getInstance() {

        if (!MapActivity._instance)
            MapActivity._instance = new MapActivity();

        return MapActivity._instance;

    }


    /** Opens the activity and shows the user's landslides. */
    open() {

        // Push the activity into the stack
        utils.pushStackActivity(this);

        // Show the screen
        this._screen.show();

        // Set the initial view
        this._map.setView(MapActivity.defaultLatLng, MapActivity.defaultZoom);

        // Set the initial position of the the marker
        this.positionMarker.setLatLng(MapActivity.defaultLatLng);

        // ToDo delete
        if (App.isCordova)
        // Check the location permissions
            this.checkLocationPermissions();

        // Show all the landslides mapped by the user
        landslide.showAll();

    }

    /** Closes the activity and detaches the position watcher */
    close() {

        // Pop the activity from the stack
        utils.popStackActivity();

        // Hide the screen
        this._screen.hide();

        // Remove all the markers from the map
        this.markersLayer.clearLayers();

        // Empty the markers arrays
        landslide.remoteMarkers = [];
        landslide.localMarkers  = [];

        // Hide the sync notification
        $("#sync-notification").hide();

        // Detach the position watcher
        this.detachPositionWatcher();

    }

    /** Defines the behaviour of the back button for this activity */
    onBackPressed() {

        // If it's the first time the user clicks on the button
        if (app._backPressedCount === 0) {

            // Alert the user
            utils.logOrToast(i18next.t("messages.backButton"), "short");

            // Increment the count
            app._backPressedCount++;

            // Set an interval after which the count is reset to 0
            setInterval(() => app._backPressedCount = 0, 2000);

        }

        // Else, close the app
        else navigator.app.exitApp();

    }


    /** Initializes the map ui. */
    initUI() {

        // Hide the default controls of leaflet
        $(".leaflet-control-container").hide();

        // Set the button for the settings
        $("#map-control-settings").click(() => SettingsActivity.getInstance().open());

        // Set the button for the synchronization
        $("#map-control-sync").click(() => {

            // If the session is expired, return
            if (utils.isTokenExpired()) return;

            // If the user is a guest
            if (app.isGuest) {

                // Alert the user
                utils.createAlert("", i18next.t("dialogs.syncGuest"), i18next.t("dialogs.btnOk"));

                // Return
                return;

            }

            // If there is no internet connection
            if (!navigator.onLine) {

                // Alert the user
                utils.createAlert("", i18next.t("dialogs.syncOffline"), i18next.t("dialogs.btnOk"));

                // Return
                return;

            }

            // If there are no landslides in the local database
            if (landslide.localMarkers.length === 0) {

                // Alert the user
                utils.logOrToast(i18next.t("messages.localDbEmpty"), "long");

                // Return
                return;

            }

            // Ask for confirmation and sync the databases
            utils.createAlert(
                "",
                i18next.t("dialogs.syncConfirmation", { number: landslide.localMarkers.length }),
                i18next.t("dialogs.btnNo"),
                null,
                i18next.t("dialogs.btnYes"),
                async () => {

                    // Open the loader
                    utils.openLoader();

                    // Sync the data
                    let res = await landslide.sync();

                    // Show all the landslides
                    landslide.showAll();

                    // Close the loader
                    utils.closeLoader();

                    // Alert the user about the results of the syncing
                    utils.createAlert(
                        "",
                        `<p style="margin-bottom: 8px">${res.successes}/${res.total} ${i18next.t("dialogs.syncSuccesses")}</p>
                         <p style="margin-bottom: 8px">${res.insertErrors}/${res.total} ${i18next.t("dialogs.syncInsertErr")}</p>
                         <p>${res.deleteErrors}/${res.total} ${i18next.t("dialogs.syncDeleteErr")}</p>`,
                        i18next.t("dialogs.btnOk")
                    );

                }
            );

        });

        // Cache the gps button
        this._$gps = $("#map-control-gps");

        // Set the gps button click behaviour
        this._$gps.click(() => this.handleGPSButton());

        // Set the button for the data inserting
        $("#map-new-ls").click(() => InsertActivity.getInstance().open());


        // If the map is dragged, free it
        this._map.on("dragstart", () => this.freeMap());

        // When a zoom event starts, if it's not caused by an animation, free the map
        this._map.on("zoomstart", () => { if (!this._autoZoom || this._clusterClick) this.freeMap() });

        // Fired when a map movement ends
        this._map.on("moveend", () => {

            // If the movement is caused by the click on a cluster, return
            if (this._clusterClick) return;

            // If the movement is caused by an animation (autoZoom = true) and the map is not following the position
            // marker (centerMap = false), bind the map to the marker (centerMap = true) and set any further zoom as
            // made by the user(autoZoom = false).
            // This is needed because otherwise the fly animation performed when the GPS button is clicked will be
            // interrupted by "onPositionSuccess".
            if (!this._centerMap && this._autoZoom) {
                this._centerMap = true;
                this._autoZoom  = false;
            }

        });

    }


    /** Initializes the marker the shows the user's position.*/
    initPositionMarker() {

        // Set the options for the icon
        const positionMarkerIcon = L.icon({
            iconUrl      : "img/user-marker.png",    // url of the icon
            iconRetinaUrl: "img/user-marker-2x.png", // url of the icon to use for retina displays
            iconSize     : [37, 37],                 // size of the icon
            iconAnchor   : [19, 19]                  // coordinates of the "tip" of the icon
        });

        // Create the position marker and place it at the default position
        this.positionMarker = L.marker(MapActivity.defaultLatLng, {
            icon        : positionMarkerIcon, // the icon
            draggable   : true,               // the marker can be moved around
            zIndexOffset: 1000                // the marker will be always on top of any other marker
        });


        // Initialize the current position equal to the default position
        this.currLatLng = MapActivity.defaultLatLng;

        // Initialize the current accuracy to 0
        this.currLatLngAccuracy = 0;

        // Initialize the current altitude to -999
        this.currAltitude = -999;

        // Initialize the current altitude accuracy to 0
        this.currAltitudeAccuracy = 0;

        // Initialize the circle shown in the map to indicate the accuracy of the postion
        this._accuracyCircle = undefined;


        // Fires when the drag starts
        this.positionMarker.on("dragstart", () => {

            // Set the next position found as the first
            this._isFirstPositionFound = true;

            // Detach the position watcher
            this.detachPositionWatcher();

            // If there already an accuracy circle
            if (this._accuracyCircle !== undefined) {

                // Remove the accuracy circle from the map
                this._map.removeLayer(this._accuracyCircle);

                // Set the accuracy circle to "undefined"
                this._accuracyCircle = undefined;

            }

        });

        // Fires when the drag ends
        this.positionMarker.on("dragend", e => {

            // Save the position of the marker
            this.currLatLng = [e.target.getLatLng().lat, e.target.getLatLng().lng];

            // Set the accuracy to 0
            this.currLatLngAccuracy = 0;

            // Set the altitude to -999
            this.currAltitude = -999;

            // Set the altitude accuracy to 0
            this.currAltitudeAccuracy = 0;

            console.log(`Position marker dragged to ${this.currLatLng}`);

        });


        // Add the marker to the map
        this.positionMarker.addTo(this._map);

    }


    /** Frees the map from being automatically centered when a new position is found. */
    freeMap() {

        // Set the flag to false
        this._centerMap = false;

        // Remove the blue color form the gps icon
        this._$gps.removeClass("gps-on");

    }


    /** Register a watcher that listens for the GPS status modifications. */
    registerGPSWatcher() {

        // Register the watcher
        this._d.registerLocationStateChangeHandler(state => {

            // Location on
            if ((device.platform === "Android" && state !== this._d.locationMode.LOCATION_OFF) ||
                (device.platform === "iOS" && (state === this._d.permissionStatus.GRANTED || state === this._d.permissionStatus.GRANTED_WHEN_IN_USE))) {

                console.log("GPS turned on");

                // Change the gps icon
                this._$gps.children("i").html("gps_fixed");

                // Set the next position as the first position found
                this._isFirstPositionFound = true;

                // Set the flag to keep moving the map with the position
                this._centerMap = true;

                // Set any subsequent zoom as auto
                this._autoZoom = true;

                // Attach the position watcher
                this.attachPositionWatcher();

            }
            // Location off
            else {

                console.log("GPS turned off");

                // Change the color and the icon of the gps button
                this._$gps.removeClass("gps-on").children("i").html("gps_off");

                // Detach the position watcher
                this.detachPositionWatcher();

                // Alert the user
                utils.createAlert(i18next.t("dialogs.map.gpsOff"), i18next.t("dialogs.btnOk"));

            }

        });

    }


    /** Checks the location permissions and eventually asks for them. */
    checkLocationPermissions() {

        // Get the authorization status
        this._d.getLocationAuthorizationStatus(status => {

                console.log(status);

                // Permission not requested
                if (status === this._d.permissionStatus.NOT_REQUESTED ||
                    (device.platform === "Android" && status === this._d.permissionStatus.DENIED_ALWAYS)) {
                    console.log("Permission not requested");

                    // Request the location permission
                    this.requestLocationPermission();
                }

                // Permission denied
                else if (status === this._d.permissionStatus.DENIED) {
                    console.log("Permission denied");

                    // Change color and icon of the gps button
                    this._$gps.removeClass("gps-on").children("i").html("gps_off");
                }

                // Permission granted
                else if (status === this._d.permissionStatus.GRANTED ||
                    (device.platform === "iOS" && status === this._d.permissionStatus.GRANTED_WHEN_IN_USE)) {
                    console.log("Permission granted");

                    // Check if the gps of the phone is on and then attach the position watcher
                    this.checkGPSOn(() => this.attachPositionWatcher());
                }
            }, err => {

                console.error(`Error checking the permissions: ${err}`);

                // Change color and icon of the gps button
                this._$gps.removeClass("gps-on").children("i").html("gps_off");

                // Alert the user
                utils.createAlert("", i18next.t("dialogs.map.permissionsCheckError"), i18next.t("dialogs.btnOk"));

            }
        );

    }

    /** Requests the location permission */
    requestLocationPermission() {

        this._d.requestLocationAuthorization(
            status => {

                // Permission granted
                if (status === this._d.permissionStatus.GRANTED ||
                    (device.platform === "iOS" && status === this._d.permissionStatus.GRANTED_WHEN_IN_USE)) {

                    console.log("Permission granted");

                    // Check if the gps of the phone is on and then attach the position watcher
                    this.checkGPSOn(() => this.attachPositionWatcher());
                }
                // Permission denied
                else {

                    console.log("Permission denied");

                    // Change color and icon of the gps button
                    this._$gps.removeClass("gps-on").children("i").html("gps_off");
                }
            },
            err => {

                console.error("Error requesting the location authorization", err);

                // Change color and icon of the gps button
                this._$gps.removeClass("gps-on").children("i").html("gps_off");

                // Alert the user
                utils.createAlert(i18next.t("dialogs.map.permissionsRequestError"), i18next.t("dialogs.btnOk"));

            },
            // For iOS the authorization mode is set to ALWAYS
            this._d.locationAuthorizationMode.ALWAYS
        );

    }


    /**
     * Checks if the GPS is turned on.
     *
     * @param {function} callback - Function to be executed if the GPS is on.
     */
    checkGPSOn(callback) {

        // Check if the location is enabled
        this._d.isLocationEnabled(enabled => {

                // The GPS is on
                if (enabled) {
                    console.log("GPS on");

                    // Change the icon of the gps button
                    this._$gps.children("i").html("gps_fixed");

                    // Call the callback function
                    callback();
                }
                // The GPS is off
                else {
                    console.log("GPS off");

                    // Change the icon and the color of the gps button
                    this._$gps.removeClass("gps-on").children("i").html("gps_off");

                    // Alert the user
                    utils.createAlert(i18next.t("dialogs.map.gpsOff"), i18next.t("dialogs.btnOk"));
                }
            },
            err => {

                console.error("Cannot determine if the location is enabled", err);

                // Change the icon and the color of the gps button
                this._$gps.removeClass("gps-on").children("i").html("gps_off");

                // Alert the user
                utils.createAlert(i18next.t("dialogs.map.gpsCheckError"), i18next.t("dialogs.btnOk"));
            }
        );

    }


    /** Responds to the click of the GPS button. */
    handleGPSButton() {

        // ToDo delete
        if (!App.isCordova) return;

        // If the position watcher is already active, return
        if (this._$gps.hasClass("gps-on")) {
            console.log("Watcher already on");
            return;
        }

        // Check the location permission
        this._d.getLocationAuthorizationStatus(
            status => {

                // Permission denied but can be requested again
                if (device.platform === "Android" && status === this._d.permissionStatus.DENIED) {

                    console.log("Permission denied but can be requested");

                    // Request the permission
                    this.requestLocationPermission();
                }
                // Permission denied and cannot be requested again
                else if ((device.platform === "Android" && status === this._d.permissionStatus.DENIED_ALWAYS) ||
                    (device.platform === "iOS" && status === this._d.permissionStatus.DENIED)) {

                    console.log("Cannot request the permission again.");

                    // Change the icon and the color of the gps button
                    this._$gps.removeClass("gps-on").children("i").html("gps_off");

                    // Alert the user
                    utils.createAlert(i18next.t("dialogs.map.cannotRequestPermissions"), i18next.t("dialogs.btnOk"));

                }
                // Permissions granted
                else {

                    console.log("Permission granted");

                    // Check if the GPS is on
                    this.checkGPSOn(() => {

                        // The next zoom will be automatic
                        this._autoZoom = true;

                        // If is the first time a position is found
                        if (this._isFirstPositionFound) {

                            // Make the map follow the position
                            this._centerMap = true;

                            // Attach the position watcher
                            this.attachPositionWatcher();

                            return;
                        }

                        // If the zoom level is less than 15, move the view and the zoom
                        if (this._map.getZoom() < 15) this._map.flyTo(this.currLatLng, MapActivity.watcherZoom);

                        // If the zoom level is higher than 15, move only the view
                        else this._map.flyTo(this.currLatLng);

                        // Attach the position watcher
                        this.attachPositionWatcher();

                    });

                }

            },
            err => {

                console.error(`Error checking the permissions ${err}`);

                // Change the icon and the color of the gps button
                this._$gps.removeClass("gps-on").children("i").html("gps_off");

                // Alert the user
                utils.createAlert(i18next.t("dialogs.map.permissionsCheckError"), i18next.t("dialogs.btnOk"));

            }
        );

    }


    /** Attach the position watcher. */
    attachPositionWatcher() {

        // Change the color of the gps button
        this._$gps.addClass("gps-on");

        // If the position watcher is already attached, return
        if (this.isPositionWatcherAttached) return;

        // Show a message informing the user that is position is being find
        $("#finding-position-msg").show();

        // Initialize the position watcher
        this._positionWatcherId = navigator.geolocation.watchPosition(
            this.onPositionSuccess.bind(this),
            err => console.error(`Error finding the position ${err}`),
            {
                enableHighAccuracy: true, // Enable high accuracy
                timeout           : 3000, // Maximum time that can pass until a successCallback is invoked
                maximumAge        : 0     // Do not accept cached positions
            }
        );

        // Set the flag to true
        this.isPositionWatcherAttached = true;

        console.log("Position watcher attached");

    }

    /** Detach the position watcher. */
    detachPositionWatcher() {

        // If no position watcher is
        if (!this.isPositionWatcherAttached) return;

        // Change the color of the gps icon
        this._$gps.removeClass("gps-on");

        // Clear the current position watcher
        navigator.geolocation.clearWatch(this._positionWatcherId);

        // Set the flag to false
        this.isPositionWatcherAttached = false;

        console.log("Position watcher detached");

    }

    /**
     * Callback to be fired when a new position is found.
     *
     * @param {number[]} pos - Fhe position found.
     */
    onPositionSuccess(pos) {

        // Save the position and the accuracy
        this.currLatLng         = [pos.coords.latitude, pos.coords.longitude];
        this.currLatLngAccuracy = pos.coords.accuracy;

        // Set the altitude and its accuracy. If the values are null, set them to -999 and 0 instead
        this.currAltitude         = pos.coords.altitude || -999;
        this.currAltitudeAccuracy = pos.coords.altitude || 0;

        console.log("Position found");

        // Hide the message
        $("#finding-position-msg").hide();

        // If is the first position found
        if (this._isFirstPositionFound) {

            // Center the map on the position
            this._map.setView(this.currLatLng, MapActivity.watcherZoom);

            // Set the flag to false
            this._isFirstPositionFound = false;

            // Any subsequent zoom is not automatic
            this._autoZoom = false;

        }
        // If is not the first position found and the map has to follow the position
        else if (this._centerMap) {

            // Pan the map to the position found
            this._map.panTo(this.currLatLng);

        }

        // Set the position of the marker
        this.positionMarker.setLatLng(this.currLatLng);

        // If there is an accuracy circle on the map, remove it
        if (this._accuracyCircle !== undefined) this._map.removeLayer(this._accuracyCircle);

        // Create a new accuracy circle
        this._accuracyCircle = L.circle(this.currLatLng, {
            radius : this.currLatLngAccuracy / 2,
            color  : "green",
            opacity: .5
        }).addTo(this._map);

    }

}