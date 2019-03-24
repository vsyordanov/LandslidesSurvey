"use strict";

let isMobile,
    isApp;


function onLoad() {
    // document.addEventListener("deviceready", initialize, false);
    initialize();
}


function initialize() {
    ln.init();
}


function onResize() {
    $("#map").height($(window).height());
}


function init() {

    isMobile = true;
    isApp    = true;

    onResize();
    initMap();
}