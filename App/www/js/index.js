"use strict";

// const serverUrl = "http://localhost:8080/";
const serverUrl = "http://192.168.1.100:8080/";

let db,
    dbName    = "LandslideSurvey",
    dbVersion = 1;

let isCordova;

let isExpertMode = false;

let markers = [];

let networkState;


function onLoad() {

    isCordova = window.cordova;

    if (isCordova)
        document.addEventListener("deviceready", initialize, false);
    else
        initialize();

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

    networkState = navigator.connection.type;

    onResize();
    initMap();
    initLocalDb();
    initInsert();
    openInsert();
    initInfo();

    $("#img-screen-close").click(() => closeImgScreen);

    // Create the folder

}


function initLocalDb() {

    let dbOpenRequest = window.indexedDB.open(dbName, dbVersion);

    dbOpenRequest.onerror = e => console.error("Error opening the db", e);

    dbOpenRequest.onsuccess = () => {
        console.log("Db opened");
        db = dbOpenRequest.result;
        getLandslides();
    };

    dbOpenRequest.onupgradeneeded = () => {

        console.log("Db upgrade needed");

        db = dbOpenRequest.result;

        db.onerror = () => console.error("Error upgrading the db with code: " + db.errorCode);

        let objectStore = db.createObjectStore("landslides", { keyPath: "_id" });

        objectStore.transaction.oncomplete = e => {
            console.log("Object store created");
            getLandslides();
        }

    }

}


function getLandslides() {

    let request       = db.transaction("landslides", "readwrite").objectStore("landslides").getAll();
    request.onerror   = e => console.error("Error getting data", e);
    request.onsuccess = e => e.target.result.forEach(ls => showLandslide(ls._id, ls.coordinates));

}


function showLandslide(id, coordinates) {

    let marker = L.marker(
        coordinates, {
            icon     : landslideIcon,
            draggable: false
        }
    );

    marker._id = id;

    marker.on("click", () => openInfo(id));

    markers.push(marker);
    marker.addTo(map);

}


function deleteLandslide(id) {

    let request       = db.transaction("landslides", "readwrite").objectStore("landslides").delete(id);
    request.onerror   = e => console.error("Deleting failed", e);
    request.onsuccess = () => {
        removeMarker(id);
        closeInfo();
    }
}

function removeMarker(id) {

    let new_markers = [];

    markers.forEach(marker => {

        if (marker._id === id)
            map.removeLayer(marker);
        else
            new_markers.push(marker);

    });

    markers = new_markers;
}


function saveDb() {

    window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, directoryEntry => {

            directoryEntry.getDirectory("LandslideSurvey", { create: true }, directory => {

                    directory.getFile("landslideSurvey.txt", { create: true }, fileEntry => {

                            fileEntry.createWriter(fileWriter => {

                                    let request = db
                                        .transaction("landslides", "readwrite")
                                        .objectStore("landslides").getAll();

                                    request.onerror   = e => console.error("Error getting data", e);
                                    request.onsuccess = e => {

                                        let data = "";
                                        e.target.result.forEach(ls => data = data + JSON.stringify(ls) + "\n");

                                        fileWriter.write(data);
                                        fileWriter.onwriteend = () => logOrToast("Writing done!");
                                        fileWriter.onerror    = err => console.error("Error writing the file", err);
                                    };
                                },
                                err => console.error("Error writing the file", err)
                            );
                        },
                        err => console.error("Error creating the file", err)
                    );
                },
                err => console.error("Error creating direcotry", err)
            );
        },
        err => console.error("Error getting directory", err)
    );

}


function closeImgScreen() {
    $("#img-screen-container img").attr("src", "");
    $("#img-screen").hide();
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

function logOrToast(msg) {

    if (!isCordova)
        console.log(msg);
    else
        window.plugins.toast.showShortBottom(msg);
}


// Uses the cryptographically secure random number generator
function generateUID() {

    let array = new Uint32Array(6);
    let uid   = '';

    window.crypto.getRandomValues(array);

    for (let i = 0; i < array.length; i++) {
        uid += (i < 2 || i > 5 ? '' : '-') + array[i].toString(16).slice(-4)
    }

    return uid
}























