"use strict";

const positionMarkerIcon = L.icon({
    iconUrl      : "img/user-marker.png",
    iconRetinaUrl: "img/user-marker-2x.png",
    iconSize     : [37, 37],
    iconAnchor   : [19, 19]
});

const landslideIcon = L.icon({
    iconUrl        : "img/ls-marker.png",
    iconRetinaUrl  : "img/ls-marker-2x.png",
    shadowUrl      : "img/ls-marker-shadow.png",
    shadowRetinaUrl: "img/ls-marker-shadow-2x.png",
    iconSize       : [31, 37],
    shadowSize     : [31, 19],
    iconAnchor     : [31, 37],
    shadowAnchor   : [18, 18]
});

const positionWatcherOpts = {
    enableHighAccuracy: true,
    timeout           : 3000,
    maximumAge        : 0
};

const defaultLatLong = [45.464161, 9.190336],
      defaultZoom    = 11,
      watcherZoom    = 17,
      zoomLimit      = 15;

let map,
    markersLayer,
    positionMarker,
    accuracyCircle            = undefined,
    positionWatcherId         = undefined,
    isPositionWatcherAttached = false,
    currLatLong               = defaultLatLong,
    currLatLongAccuracy       = 0,
    currAltitude              = 0,
    currAltitudeAccuracy      = -999,
    isFirstPositionFound      = true,
    centerMap                 = true,
    autoZoom                  = true,
    clusterClick              = false;

let $gps                = $("#map-control-gps"),
    $findingPositionMsg = $("#finding-position-msg");


/**
 * Initialize the map object and it's listeners.
 */
function initMap() {

    // Create the map object, setting all the animation to true
    map = L.map("map", {
        zoomSnap              : 0,
        zoomAnimation         : true,
        zoomAnimationThreshold: 4,
        fadeAnimation         : true,
        markerZoomAnimation   : true,
        touchZoom             : "center"
    });

    // Add a basemap from OpenStreetMap to the map
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution : "&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors",
        errorTileUrl: "img/errorTile.png"
    }).addTo(map);

    markersLayer = L.markerClusterGroup();

    markersLayer
        .on("clusterclick", () => clusterClick = true)
        .on("animationend", () => clusterClick = false);

    map.addLayer(markersLayer);

    initAppMapUI();

    // If the map is dragged, free it
    map.on("dragstart", () => freeMap());

    // When a zoom event starts, if it's not caused by an animation (autoZoom = false), free the map
    map.on("zoomstart", () => {
        if (!autoZoom || clusterClick)
            freeMap();
    });

    // When a map movement happens, if it's caused by an animation (autoZoom = true) and the map is not following the
    // position marker (centerMap = false), bind the map to the marker (centerMap = true) and set any further zoom as
    // made by the user(autoZoom = false).
    // This is needed because otherwise the fly animation performed when the GPS button is clicked will be interrupted
    // by onPositionSuccess
    map.on("moveend", () => {

        if (clusterClick)
            return;

        if (!centerMap && autoZoom) {
            centerMap = true;
            autoZoom  = false;
        }

    });

    // Set the map to be centered at the default position with the default zoom
    map.setView(defaultLatLong, defaultZoom);

    initPositionMarker();

    // ToDo deleted
    if (!isCordova) {
        // attachPositionWatcher();
        return;
    }

    registerGPSWatcher();
    checkLocationPermissions();

}


/**
 * Check the location permissions.
 * If they are NOT_REQUESTED, request them;
 * if they are DENIED, notify the user;
 * if the are GRANTED, checks if the GPS is on and eventually attach the position watcher.
 */
function checkLocationPermissions() {

    cordova.plugins.diagnostic.getLocationAuthorizationStatus(
        status => {

            // Permission not requested
            if (status === cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED ||
                (device.platform === "Android" &&
                    status === cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS)) { //ToDo fix

                console.log("Permission not requested");
                requestLocationPermission();

            }
            // Permission denied
            else if (status === cordova.plugins.diagnostic.permissionStatus.DENIED) {

                console.log("Permission denied", status);
                $gps.removeClass("gps-on").children("i").html("gps_off");

            }
            // Permission granted
            else if (status === cordova.plugins.diagnostic.permissionStatus.GRANTED ||
                (device.platform === "iOS" &&
                    status === cordova.plugins.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE)) {

                console.log("Permission granted");
                checkGPSOn(() => attachPositionWatcher());

            }

        },
        err => {

            console.error("Error checking the permissions", err);
            $gps.removeClass("gps-on").children("i").html("gps_off");
            createAlertDialog(i18n.t("dialogs.map.permissionsCheckError"), i18n.t("dialogs.btnOk"));

        }
    );

}


/**
 * Request the location permission. For iOS, the authorization mode is set to ALWAYS.
 * If they are GRANTED, checks if the GPS is on and eventually attach the position watcher;
 * if they are DENIED, notify the user.
 */
function requestLocationPermission() {

    cordova.plugins.diagnostic.requestLocationAuthorization(
        status => {

            // Permission granted
            if (status === cordova.plugins.diagnostic.permissionStatus.GRANTED ||
                (device.platform === "iOS" &&
                    status === cordova.plugins.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE)) {

                console.log("Permission granted");
                checkGPSOn(() => attachPositionWatcher());

            }
            // Permission denied
            else {

                console.log("Permission denied");
                $gps.removeClass("gps-on").children("i").html("gps_off");

            }
        },
        err => {

            console.error("Error requesting the location authorization", err);
            $gps.removeClass("gps-on").children("i").html("gps_off");
            createAlertDialog(i18n.t("dialogs.map.permissionsRequestError"), i18n.t("dialogs.btnOk"));

        },
        cordova.plugins.diagnostic.locationAuthorizationMode.ALWAYS);

}


/**
 * Register a watcher that listens for the GPS status modifications.
 * If the location is tuned on, attach the position watcher and set the flags to move both the marker
 * (isFirstPositionFound = true) and the map (centerMap = true) with an automatic zoom (autoZoom = true);
 * if the location is turned off, detach the position watcher.
 */
function registerGPSWatcher() {

    cordova.plugins.diagnostic.registerLocationStateChangeHandler(state => {

        // Location on
        if ((device.platform === "Android" && state !== cordova.plugins.diagnostic.locationMode.LOCATION_OFF) ||
            (device.platform === "iOS") && (state === cordova.plugins.diagnostic.permissionStatus.GRANTED
                || state === cordova.plugins.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE)) {

            console.log("Location turned on");

            $gps.children("i").html("gps_fixed");

            isFirstPositionFound = true;
            centerMap            = true;
            autoZoom             = true;
            attachPositionWatcher();

        }
        // Location off
        else {

            console.log("Location turned off");
            $gps.removeClass("gps-on").children("i").html("gps_off");
            detachPositionWatcher();
            createAlertDialog(i18n.t("dialogs.map.gpsOff"), i18n.t("dialogs.btnOk"));

        }

    });

}


/**
 * Initialize the map buttons listeners.
 */
function initAppMapUI() {

    // Hide the default Leaflet controls
    $(".leaflet-control-container").hide();

    $("#map-control-settings").click(() => {
        // logOrToast("Feature blocked", "short");
        isExpertMode = !isExpertMode;
        logOrToast("Expert mode set to " + isExpertMode, "short");
    });

    $("#map-control-sync").click(() => {

        createAlertDialog(
            i18n.t("dialogs.confirmDbSave"),
            i18n.t("dialogs.btnNo"),
            null,
            i18n.t("dialogs.btnYes"),
            () => saveDb()
        );

    });

    $gps.click(() => handleGPSButton());

    $("#map-new-ls").click(() => openInsert());

}

/**
 * Respond to the click of the GPS button.
 * First, check the permissions. If they are denied, ask for them if possible. If thy are granted, check if the GPS is
 * on and in that case center the map and eventually the maker on the user's position.
 */
function handleGPSButton() {

    // ToDo delete
    if (!isCordova) {
        if ($gps.hasClass("gps-on"))
            return;

        if ($gps.children("i").html() === "gps_off") {
            logOrToast("Turn on the gps");
            return;
        }

        autoZoom = true;

        if (isFirstPositionFound) {
            centerMap = true;
            attachPositionWatcher();
            return;
        }

        if (map.getZoom() < zoomLimit)
            map.flyTo(currLatLong, watcherZoom);
        else
            map.flyTo(currLatLong);

        attachPositionWatcher();
        return;
    }

    // If the position watcher is already active and running don't do anything
    if ($gps.hasClass("gps-on")) {
        console.log("Watcher already on");
        return;
    }

    // Check the location permission
    cordova.plugins.diagnostic.getLocationAuthorizationStatus(
        status => {

            // Permission denied but can be requested again
            if (device.platform === "Android" && status === cordova.plugins.diagnostic.permissionStatus.DENIED) {

                console.log("Permission denied but can be requested");
                requestLocationPermission();

            }
            // Permission denied and cannot be requested again
            else if ((device.platform === "Android" &&
                status === cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS) ||
                (device.platform === "iOS" && status === cordova.plugins.diagnostic.permissionStatus.DENIED)) {

                console.log("Cannot request the permission again.");
                $gps.removeClass("gps-on").children("i").html("gps_off");
                createAlertDialog(i18n.t("dialogs.map.cannotRequestPermissions"), i18n.t("dialogs.btnOk"));

            }
            // Permissions granted
            else {

                console.log("Permission granted");

                // Check if the GPS is on
                checkGPSOn(() => {

                    autoZoom = true;

                    if (isFirstPositionFound) {
                        centerMap = true;
                        attachPositionWatcher();
                        return;
                    }

                    if (map.getZoom() < zoomLimit)
                        map.flyTo(currLatLong, watcherZoom);
                    else
                        map.flyTo(currLatLong);

                    attachPositionWatcher();

                });

            }

        },
        err => {

            console.error("Error checking the permissions", err);
            $gps.removeClass("gps-on").children("i").html("gps_off");
            createAlertDialog(i18n.t("dialogs.map.permissionsCheckError"), i18n.t("dialogs.btnOk"));

        }
    );

}


/**
 * Check if the GPS is turned on.
 *
 * @param onCallback: function to be executed if the GPS is on.
 */
function checkGPSOn(onCallback) {

    cordova.plugins.diagnostic.isLocationEnabled(enabled => {

            // The GPS is on
            if (enabled) {

                console.log("GPS on");
                $gps.children("i").html("gps_fixed");
                onCallback();

            }
            // The GPS is off
            else {

                console.log("GPS off");
                $gps.removeClass("gps-on").children("i").html("gps_off");
                createAlertDialog(i18n.t("dialogs.map.gpsOff"), i18n.t("dialogs.btnOk"));

            }

        }, err => {

            console.error("Cannot determine if the location is enabled", err);
            $gps.removeClass("gps-on").children("i").html("gps_off");
            createAlertDialog(i18n.t("dialogs.map.gpsCheckError"), i18n.t("dialogs.btnOk"));

        }
    );

}

/**
 * Attach a position watcher.
 */
function attachPositionWatcher() {

    $gps.addClass("gps-on");

    if (isPositionWatcherAttached)
        return;

    $findingPositionMsg.show();

    positionWatcherId = navigator.geolocation.watchPosition(
        onPositionSuccess,
        err => console.error("Error finding the position", err),
        positionWatcherOpts
    );

    isPositionWatcherAttached = true;

    console.log("Position watcher attached");

}

/**
 * Detach a position watcher.
 */
function detachPositionWatcher() {

    if (!isPositionWatcherAttached)
        return;

    $gps.removeClass("gps-on");

    navigator.geolocation.clearWatch(positionWatcherId);

    isPositionWatcherAttached = false;

    console.log("Position watcher detached");

}

/**
 * Free the map from being automatically centered when a new position is found.
 */
function freeMap() {
    centerMap = false;
    $gps.removeClass("gps-on");
}

/**
 * Callback to be fired when a new position is found.
 *
 * @param pos: the position found.
 */
function onPositionSuccess(pos) {

    currLatLong          = [pos.coords.latitude, pos.coords.longitude];
    currLatLongAccuracy  = pos.coords.accuracy;
    currAltitude         = pos.coords.altitude;
    currAltitudeAccuracy = pos.coords.altitudeAccuracy;

    console.log("Position found");

    $findingPositionMsg.hide();

    if (isFirstPositionFound) {

        map.setView(currLatLong, watcherZoom);
        isFirstPositionFound = false;
        autoZoom             = false;

    } else if (centerMap)
        map.panTo(currLatLong);

    positionMarker.setLatLng(currLatLong);

    if (accuracyCircle !== undefined)
        map.removeLayer(accuracyCircle);

    accuracyCircle = L.circle(currLatLong, {
        radius : currLatLongAccuracy / 2,
        color  : "orange",
        opacity: .5
    }).addTo(map);

}


/**
 * Initialize the marker the shows the user's position.
 */
function initPositionMarker() {

    positionMarker = L.marker(defaultLatLong, {
        icon        : positionMarkerIcon,
        draggable   : true,
        zIndexOffset: 1000
    })
        .addTo(map)
        .on("dragstart",
            () => {
                isFirstPositionFound = true;
                detachPositionWatcher();

                if (accuracyCircle !== undefined) {
                    map.removeLayer(accuracyCircle);
                    accuracyCircle = undefined;
                }
            })
        .on("dragend",
            e => {
                currLatLong          = [e.target.getLatLng().lat, e.target.getLatLng().lng];
                currLatLongAccuracy  = 0;
                currAltitude         = -999;
                currAltitudeAccuracy = 0;

                console.log("Position marker dragged to: " + currLatLong);
            });
}