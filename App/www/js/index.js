"use strict";

const serverUrl = "http://192.168.1.100:8080/";

let db,
    dbName    = "LandslideSurvey",
    dbVersion = 1;

let isCordova;

let isExpertMode = false;

let markers = [];

let networkState;

let mainDir    = null,
    photoDir   = null,
    photoError = false;

let toReattachPositionWatcher = false;

let $alertOverlay = $("#alert-dialog-overlay");


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

    if (isPositionWatcherAttached) {
        toReattachPositionWatcher = true;
        detachPositionWatcher();
    }

}


function onResume() {

    console.log("onResume");

    if (toReattachPositionWatcher) {
        checkGPSOn(() => attachPositionWatcher());
        toReattachPositionWatcher = false;
    }

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
    initInfo();

    if (isCordova) {

        // Find or create the main directory and the image directory
        window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, rootDir => {

            rootDir.getDirectory("LandslideSurvey", { create: true }, mDir => {

                mainDir = mDir;
                console.log("main directory get or created", mainDir);

                mDir.getDirectory("images", { create: true }, pDir => {

                    photoDir = pDir;
                    console.log("Image directory get or created", photoDir);

                }, err => console.error("Fail to get or create img directory", err))

            }, err => console.error("Fail to get or create main directory", err))

        }, err => console.error("Fail to resolve root directory", err));
    }

    $("#img-screen-close").click(() => closeImgScreen());

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


function deleteLandslide(id, photos) {

    const deletePhoto = idx => {
        photoDir.getFile(photos[idx], { create: false }, file => {
                file.remove(() => {
                    console.log("Photo removed");
                    deleteNextPhoto(idx);
                }, err => {
                    console.error("Error removing photo");
                    deleteNextPhoto(idx, true);
                })
            },
            err => {
                console.error("Error getting the photo", err);
                deleteNextPhoto(idx, true);
            }
        );
    };

    const deleteNextPhoto = (idx, err = false) => {
        if (err)
            photoError = true;

        if (idx < photos.length - 1) {
            deletePhoto(idx + 1);
        } else {
            console.log("Deleting...", photoError);
            photoError = false;
            removeMarker(id);
            closeInfo();
        }
    };

    let request       = db.transaction("landslides", "readwrite").objectStore("landslides").delete(id);
    request.onerror   = e => console.error("Deleting failed", e);
    request.onsuccess = () => {
        if (photos.length > 0) {
            if (photoDir)
                deletePhoto(0);
            else
                deleteNextPhoto(999, true);
        } else {
            removeMarker(id);
            closeInfo();
        }
    };

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


/**
 * Creates and display a new alert dialog with a message and up to two buttons.
 * It must be passed the text of the buttons (a null value means that there is no button) and a callback function to be
 * executed when the buttons are clicked (a null value means no callback).
 *
 * @param msg: the message to display.
 * @param btn1: the text of the first button.
 * @param clbBtn1: the function to call when the first button is clicked.
 * @param btn2: the text of the second button.
 * @param clbBtn2: the function to call when the second button is clicked.
 */
function createAlertDialog(msg, btn1, clbBtn1 = null, btn2 = null, clbBtn2 = null) {

    $alertOverlay.find(".dialog-text").html(msg);

    $("#alert-first-button")
        .html(btn1)
        .unbind("click")
        .click(() => {
            closeAlertDialog();
            if (clbBtn1)
                clbBtn1();
        });

    if (btn2) {

        $("#alert-second-button")
            .show()
            .html(btn2)
            .unbind("click")
            .click(() => {
                closeAlertDialog();
                if (clbBtn2)
                    clbBtn2();
            });

    }

    $alertOverlay.show();

}

function closeAlertDialog() {

    $alertOverlay
        .hide()
        .children(".dialog-text").html("");

    $("#alert-second-button").hide();

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























