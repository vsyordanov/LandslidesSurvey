"use strict";

let isMobile,
    isApp;

let isExpertMode;


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

    isExpertMode = false;

    onResize();
    initMap();

    initInsertion(isExpertMode);

}