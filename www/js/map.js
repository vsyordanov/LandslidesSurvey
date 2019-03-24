"use strict";

let map,
    controlLayers,
    baseMaps,
    overlayMaps = {};

let osm,
    bing;

let currLatLong = [45.601155, 8.924647],
    defaultZoom = 12;


function initMap() {

    map = L.map("map");

    if (isApp)
        initAppMapUI();

    map.setView(currLatLong, defaultZoom);

    initLayers();
}


function initAppMapUI() {

    $(".leaflet-control-container").hide();

}


function initLayers() {

    // Add basemaps ToDo connection check
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
    controlLayers = L.control.layers(baseMaps, overlayMaps).addTo(map);
}