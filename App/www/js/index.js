"use strict";

const serverUrl = "http://192.168.1.100:8080/";

let backPressedCount = 0;

let db,
    dbName    = "LandslideSurvey",
    dbVersion = 1;

let isCordova;

let isExpertMode = true;

let markers = [];

let networkState;

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

    // ToDo handle properly
    if (isCordova) {

        document.addEventListener(
            "backbutton",
            () => {

                if (backPressedCount === 0) {
                    logOrToast("Press again to leave", "short");
                    backPressedCount++;
                    setInterval(() => backPressedCount = 0, 2000);
                } else
                    navigator.app.exitApp();

            },
            false
        );

    }

    networkState = navigator.connection.type;

    onResize();
    initMap();
    initLocalDb();
    initInsert();
    initInfo();

}


function initLocalDb() {

    let dbOpenRequest = window.indexedDB.open(dbName, dbVersion);

    dbOpenRequest.onerror = err => {
        console.error("Error opening the db", err);
        createAlertDialog(i18n.t("dialogs.openLocalDbError"), i18n.t("dialogs.btnOk"));
    };

    dbOpenRequest.onsuccess = () => {
        console.log("Db opened");
        db = dbOpenRequest.result;
        getLandslides();
    };

    dbOpenRequest.onupgradeneeded = () => {

        console.log("Upgrading or creating db...");

        db = dbOpenRequest.result;

        db.onerror = err => {
            console.error("Error upgrading or creating the db", err);
            createAlertDialog(i18n.t("dialogs.createLocalDbError"), i18n.t("dialogs.btnOk"));
        };

        let objectStore = db.createObjectStore("landslides", { keyPath: "_id" });

        objectStore.transaction.oncomplete = () => {
            console.log("Object store created");
            getLandslides();
        }

    }

}

function saveDb() {

    openLoader();

    findDirectories(
        false,
        mainDir => {

            mainDir.getFile("landslideSurvey.txt", { create: true }, fileEntry => {

                    fileEntry.createWriter(fileWriter => {

                            let request = db
                                .transaction("landslides", "readwrite")
                                .objectStore("landslides")
                                .getAll();

                            request.onerror = err => {
                                console.error("Error getting data", err);
                                closeLoader();
                                createAlertDialog(i18n.t("dialogs.saveDbError"), i18n.t("dialogs.btnOk"));
                            };

                            request.onsuccess = e => {

                                let data = "";

                                e.target.result.forEach(ls => data = data + JSON.stringify(ls) + "\n");

                                fileWriter.write(data);

                                fileWriter.onwriteend = () => {
                                    closeLoader();
                                    logOrToast(i18n.t("messages.saveDbComplete"), "short");
                                };

                                fileWriter.onerror = err => {
                                    console.error("Error writing the file", err);
                                    closeLoader();
                                    createAlertDialog(i18n.t("dialogs.saveDbError"), i18n.t("dialogs.btnOk"));
                                }

                            };
                        },
                        err => {
                            console.error("Error writing the file", err);
                            closeLoader();
                            createAlertDialog(i18n.t("dialogs.saveDbError"), i18n.t("dialogs.btnOk"));
                        }
                    );
                },
                err => {
                    console.error("Error creating the file", err);
                    closeLoader();
                    createAlertDialog(i18n.t("dialogs.saveDbError"), i18n.t("dialogs.btnOk"));
                }
            );
        },
        () => {
            closeLoader();
            createAlertDialog(i18n.t("dialogs.saveDbError"), i18n.t("dialogs.btnOk"));
        }
    );

}

function findDirectories(findImg, successClb, errClb = null) {

    window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, rootDir => {

        rootDir.getDirectory("LandslideSurvey", { create: true }, mainDir => {

            if (findImg) {

                mainDir.getDirectory("images", { create: true },
                    photoDir => successClb(photoDir),
                    err => {
                        console.error("Fail to get or create img directory", err);

                        if (errClb)
                            errClb();
                        else
                            createAlertDialog(i18n.t("dialogs.directoryError"), i18n.t("dialogs.btnOk"));

                    })

            } else
                successClb(mainDir);

        }, err => {
            console.error("Fail to get or create main directory", err);

            if (errClb)
                errClb();
            else
                createAlertDialog(i18n.t("dialogs.directoryError"), i18n.t("dialogs.btnOk"));
        })

    }, err => {
        console.error("Fail to resolve root directory", err);

        if (errClb)
            errClb();
        else
            createAlertDialog(i18n.t("dialogs.directoryError"), i18n.t("dialogs.btnOk"));
    });

}


function getLandslides() {

    let request = db.transaction("landslides", "readwrite").objectStore("landslides").getAll();

    request.onerror = err => {
        createAlertDialog(i18n.t("dialogs.getLocalLsError"), i18n.t("dialogs.btnOk"));
        console.error("Error getting data", err);
    };

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
    markersLayer.addLayer(marker);

}

function deleteLandslide(id, photo) {

    let request = db.transaction("landslides", "readwrite").objectStore("landslides").delete(id);

    request.onerror = err => {
        console.error("Deleting failed", err);
        createAlertDialog(i18n.t("dialogs.deleteLocalLsError"), i18n.t("dialogs.btnOk"));
    };

    request.onsuccess = () => {

        if (!isCordova) {
            removeMarker(id);
            closeInfo();
            return;
        }

        deleteImage(
            photo,
            () => {
                removeMarker(id);
                closeInfo();
            },
            () => {
                createAlertDialog(i18n.t("dialogs.deleteLocalPhotoError"), i18n.t("dialogs.btnOk"));
                removeMarker(id);
                closeInfo();
            }
        );

    };

}

function deleteImage(photo, clbSuccess, clbError) {

    findDirectories(
        true,
        photoDir => {

            photoDir.getFile(photo, { create: false },
                file => {

                    file.remove(
                        () => {
                            console.log("Photo removed");
                            clbSuccess();
                        },
                        err => {
                            console.error("Error removing photo", err);
                            clbError();
                        }
                    )

                },
                err => {
                    console.error("Error getting the photo", err);
                    clbError();
                }
            );

        },
        () => {
            clbError();
        }
    );

}

function removeMarker(id) {

    let new_markers = [];

    markers.forEach(marker => {

        if (marker._id === id)
            markersLayer.removeLayer(marker);
        else
            new_markers.push(marker);

    });

    markers = new_markers;
}


function openImgScreen(scr, editable = false, clbEdit, clbCancel) {

    $("#img-screen-container img").attr("src", scr);

    $("#img-screen-close").click(() => closeImgScreen());

    if (editable) {

        $("#img-screen-edit")
            .unbind("click")
            .click(() => {
                closeImgScreen();
                clbEdit();
            })
            .parent().show();

        $("#img-screen-delete")
            .show()
            .unbind("click")
            .click(() => {

                createAlertDialog(
                    i18n.t("dialogs.photoScreen.deletePictureConfirmation"),
                    i18n.t("dialogs.btnCancel"),
                    null,
                    i18n.t("dialogs.btnOk"),
                    () => {
                        clbCancel();
                        closeImgScreen();
                    }
                );

            })
            .parent().show();

    }

    $("#img-screen").show();

}

function closeImgScreen() {

    $("#img-screen").hide();

    $("#img-screen-container img").attr("src", "");

    $("#img-screen-edit").parent().hide();

    $("#img-screen-delete").parent().hide();

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

    $alertOverlay.find(".dialog-wrapper").show();
    $alertOverlay.show();

}

function closeAlertDialog() {

    $alertOverlay
        .hide()
        .children(".dialog-text").html("");

    $("#alert-second-button").hide();

    $alertOverlay.find(".dialog-wrapper").hide();

}


function openLoader() {

    $alertOverlay.find(".spinner-wrapper").show();

    $alertOverlay.show();

}

function closeLoader() {

    $alertOverlay.hide();

    $alertOverlay.find(".spinner-wrapper").hide();

}


function logOrToast(msg, duration) {

    // ToDo delete
    if (!isCordova) {
        console.log(msg);
        return;
    }

    window.plugins.toast.show(msg, duration, "bottom");
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