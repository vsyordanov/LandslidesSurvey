"use strict";

const LOCAL_DB = "dh_local_db";

let isCordova,
    isMobile,
    isApp;

let isExpertMode = true; // ToDo change

let markers = [];

let networkState,
    localDb,
    pointsDB;


function onLoad() {

    isCordova = window.cordova;

    if (isCordova) {
        console.log("Cordova running");
        document.addEventListener("deviceready", initialize, false);
    } else {
        console.log("Cordova not running");
        initialize();
    }

}


function initialize() {

    document.addEventListener("pause", onPause, false);
    document.addEventListener("resume", onResume, false);

    ln.init();

}


function onPause() {

    console.log("onPause");
    // detachPositionWatcher();

}


function onResume() {

    console.log("onResume");
    // attachPositionWatcher();

}


function onResize() {
    $("#map").height($(window).height());
}


function init() {

    isMobile     = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    isApp        = document.URL.indexOf("http://") === -1 && document.URL.indexOf("https://") === -1;
    networkState = navigator.connection.type;

    onResize();
    initMap();
    initDb();
    getLandslides();
    initInsert();
}


//ToDo handle connection errors
function initDb() {

    localDb = new PouchDB(LOCAL_DB);

    if (isApp)
        pointsDB = new PouchDB(HOSTED_POINTS_DB);
    else
        pointsDB = new PouchDB(REMOTE_POINTS_DB);
}


// ToDO change for Cordova
function getLandslides() {

    // if (networkState === Connection.NONE || navigator.onLine === false) {
    //     showAlert("messages.noInternet");
    //     return;
    // }

    pointsDB.allDocs({include_docs: true}, function (err, doc) {

        if (err) {

            showAlert("messages.generalError");
            console.log(err);

        } else {

            doc.rows.forEach(function (row) {

                let landslide = new Landslide(
                    row.doc._id,
                    row.doc.creationDate,
                    row.doc.lastModified,
                    row.doc.isExpert,
                    row.doc.position,
                    row.doc.altitude,
                    row.doc.accuracy,
                    row.doc.lsType,
                    row.doc.materialType,
                    row.doc.crestPosition,
                    row.doc.water,
                    row.doc.vegetation,
                    row.doc.mitigation,
                    row.doc.mitigationsList,
                    row.doc.monitoring,
                    row.doc.monitoringList,
                    row.doc.damages,
                    row.doc.damagesList,
                    row.doc.notes,
                    row.doc.hasPhoto
                );

                landslide.show();
            });
        }
    })

}


function showAlert(msg) {

    if (isCordova) {

        navigator.notification.alert(
            i18n.t(msg),
            null,
            "Landslides",
            i18n.t("messages.ok")
        );

    } else {
        alert(i18n.t(msg));
    }

}