"use strict";

// ToDo add "www" for Cordova
const positionMarkerIcon = L.icon({
    iconUrl    : "img/user-position-marker.png",
    iconSize   : [47, 71],
    iconAnchor : [23, 71],
    popupAnchor: [0, -72]
});

const landslideIcon = L.icon({
    iconUrl    : "img/ls-icon.png",
    iconSize   : [31, 42],
    iconAnchor : [16, 42],
    popupAnchor: [0, -43]
});

let positionMarker,
    accuracyCircle = undefined;


let map,
    baseMaps;

let osm,
    bing;

let positionWatcherId         = undefined,
    isPositionWatcherAttached = false,
    positionWatcherOpts       = {
        enableHighAccuracy: true,
        timeout           : 3000,
        maximumAge        : 0
    };

let currLatLong  = [45.464161, 9.190336],
    currAccuracy = undefined,
    currAltitude = undefined,
    defaultZoom  = 10;


function initMap() {

    map = L.map("map");

    initAppMapUI();

    map.setView(currLatLong, defaultZoom);

    map.on("dragend", () => detachPositionWatcher());

    initLayers();
    attachPositionWatcher();
    initPositionMarker();

}


function initAppMapUI() {

    $(".leaflet-control-container").hide();

    $("#map-control-settings").click(() => {

        isExpertMode = !isExpertMode;

        if (isCordova) {

            window.plugins.toast.showShortBottom(
                "Expert mode set to " + isExpertMode,
                a => console.log("Toast success: " + a),
                e => console.log("Toast error: " + e)
            )

        } else
            console.log("Expert mode set to " + isExpertMode);

    });

    $("#map-control-layers").click(() => {

        console.log("Layers button");

    });

    $("#map-control-gps").click(() => {

        console.log("GPS button");
        attachPositionWatcher();

    });

    $("#map-new-ls").click(e => {
        openInsert();
        e.stopPropagation();
    });

}


// ToDo check connection
function initLayers() {

    osm = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution : "&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors",
            errorTileUrl: "img/errorTile.png"
        }
    );

    bing = new L.tileLayer.bing(
        "AqSfYcbsnUwaN_5NvJfoNgNnsBfo1lYuRUKsiVdS5wQP3gMX6x8xuzrjZkWMcJQ1",
        {type: "AerialWithLabels"}
    );

    baseMaps = {
        "Open Street Map": osm,
        "Bing Aerial"    : bing
    };

    osm.addTo(map);

}


function attachPositionWatcher() {

    if (isPositionWatcherAttached)
        return;

    $("#map-control-gps").addClass("gps-on");

    positionWatcherId = navigator.geolocation.watchPosition(
        onPositionSuccess,
        onPositionError,
        positionWatcherOpts
    );

    isPositionWatcherAttached = true;

    console.log("Position watcher attached");

}

function detachPositionWatcher() {

    if (!isPositionWatcherAttached)
        return;

    $("#map-control-gps").removeClass("gps-on");

    navigator.geolocation.clearWatch(positionWatcherId);

    isPositionWatcherAttached = false;

}

function onPositionSuccess(pos) {

    currLatLong = [
        pos.coords.latitude,
        pos.coords.longitude
    ];

    currAccuracy = pos.coords.accuracy;
    currAltitude = pos.coords.altitude;

    console.log("Position found: " + currLatLong[0] + ", " + currLatLong[1] + " " + currAccuracy);

    map.setView(currLatLong, 17);

    positionMarker.setLatLng(currLatLong);

    if (accuracyCircle !== undefined)
        map.removeLayer(accuracyCircle);

    accuracyCircle = L.circle(currLatLong, {radius: currAccuracy / 2}).addTo(map);

}

function onPositionError(err) {
    console.log("Position error: " + err.message);
}


function initPositionMarker() {

    positionMarker = L.marker(
        currLatLong,
        {icon: positionMarkerIcon, draggable: true}
    );

    positionMarker.addTo(map);

    positionMarker.on("dragstart", () => {

        detachPositionWatcher();

        if (accuracyCircle !== undefined) {
            map.removeLayer(accuracyCircle);
            accuracyCircle = undefined;
        }

    });

    positionMarker.on("dragend", (e) => {

        currLatLong = [
            e.target.getLatLng().lat,
            e.target.getLatLng().lng
        ];

        currAccuracy = 0;
        currAltitude = -999;

        console.log("Position marker dragged to: " + currLatLong);

    });

}