"use strict";

let ls = null;

let lsType            = "",
    materialType      = "",
    hillPosition      = "",
    water             = "",
    vegetation        = "",
    mitigation        = "",
    mitigationList    = [],
    mitigationListNew = [],
    monitoring        = "",
    monitoringList    = [],
    monitoringListNew = [],
    damages           = "",
    damagesList       = [],
    damagesListNew    = [],
    notes             = "",
    photo             = "";

let $photoThm = $("#photo-thm");


function initInsert() {

    initMainPage();

    initHillPositionDialog();
    initVegetationDialog();
    initMitigationExpertDialog();
    initMitigationInsertDialog();
    initMonitoringDialog();
    initMonitoringInsertDialog();
    initDamagesDialog();
    initDamagesInsertDialog();
    initNotesDialog();
    initLsTypeDialog();
    initMaterialTypeDialog();
    initWaterDialog();
    initMitigationBaseDialog();

}

function openInsert(data = null) {

    if (data) {

        ls             = data;
        lsType         = ls.lsType;
        materialType   = ls.materialType;
        hillPosition   = ls.hillPosition;
        water          = ls.water;
        vegetation     = ls.vegetation;
        mitigation     = ls.mitigation;
        mitigationList = ls.mitigationsList;
        monitoring     = ls.monitoring;
        monitoringList = ls.monitoringList;
        damages        = ls.damages;
        damagesList    = ls.damagesList;
        notes          = ls.notes;
        photo          = ls.photo;

        $("#ls-type-text").html(i18n.t("insert.lsType.enum." + lsType));

        if (materialType !== "") $("#material-type-text").html(i18n.t("insert.materialType.enum." + materialType));
        if (hillPosition !== "") $("#hill-position-text").html(i18n.t("insert.hillPosition.enum." + hillPosition));
        if (water !== "") $("#water-text").html(i18n.t("insert.water.enum." + water));
        if (vegetation !== "") $("#vegetation-text").html(i18n.t("insert.vegetation.enum." + vegetation));
        if (mitigation !== "") $("#mitigation-text").html(i18n.t("insert.mitigation.enum." + mitigation));
        if (monitoring !== "") $("#monitoring-text").html(i18n.t("insert.monitoring.enum." + monitoring));
        if (damages !== "") $("#damages-text").html(i18n.t("insert.damages.enum." + damages));
        if (notes !== "") $("#notes-text").html(i18n.t("insert.notes.editText"));

        // ToDo delete
        if (!isCordova) {
            $photoThm
                .find("img")
                .attr("src", "img/broken-img-placeholder-200.png")
                .show();

            $photoThm
                .find("i")
                .hide();

            toggleExpertView(ls.expert);
            $("#insert-ls").show();

            return;
        }

        findDirectories(
            true,
            photoDir => {

                photoDir.getFile(photo, { create: false },
                    file => {

                        $photoThm
                            .find("img")
                            .attr("src", file.nativeURL)
                            .show();

                        $photoThm
                            .find("i")
                            .hide();

                        toggleExpertView(ls.expert);
                        $("#insert-ls").show();
                        closeInfo();

                    },
                    err => {

                        photo = "";

                        $photoThm
                            .find("img")
                            .show();

                        $photoThm
                            .find("i")
                            .hide();

                        toggleExpertView(ls.expert);
                        $("#insert-ls").show();
                        closeInfo();

                        console.error("Error getting the photo", err);
                        createAlertDialog(i18n.t("dialogs.info.getLocalPhotoError"), i18n.t("dialogs.btnOk"));

                    }
                );

            },
            () => {

                photo = "";

                $photoThm
                    .find("img")
                    .show();

                $photoThm
                    .find("i")
                    .hide();

                toggleExpertView(ls.expert);
                $("#insert-ls").show();
                closeInfo();
                createAlertDialog(i18n.t("dialogs.info.getLocalPhotoError"), i18n.t("dialogs.btnOk"));
            }
        );

    } else {
        toggleExpertView(isExpertMode);
        $("#insert-ls").show();
    }

}

function toggleExpertView(isExpert) {

    if (isExpert) {

        $("#hill-position-request-wrapper").show();
        $("#vegetation-request-wrapper").show();
        $("#monitoring-request-wrapper").show();
        $("#damages-request-wrapper").show();
        $("#notes-request-wrapper").show();

    } else {

        $("#hill-position-request-wrapper").hide();
        $("#vegetation-request-wrapper").hide();
        $("#monitoring-request-wrapper").hide();
        $("#damages-request-wrapper").hide();
        $("#notes-request-wrapper").hide();

    }

}

function closeInsert() {

    $("#insert-ls").scrollTop(0).hide();
    resetFields();

}


// Main page
function initMainPage() {

    $("#new-ls-close").click(() => {

        createAlertDialog(
            i18n.t("dialogs.insert.confirmClose"),
            i18n.t("dialogs.insert.btnKeepEditing"),
            null,
            i18n.t("dialogs.insert.btnDiscard"),
            () => {
                if (ls)
                    openInfo(ls._id);
                closeInsert();
            }
        );

    });

    $("#new-ls-done").click(() => {

        if (lsType === "") {
            logOrToast(i18n.t("messages.mandatoryLsType"), "long");
            return;
        }

        if (photo === "") {
            logOrToast(i18n.t("messages.mandatoryPhoto"), "long");
            return;
        }

        if (isExpertMode) {
            if (mitigation !== "yes") mitigationList = [];
            if (monitoring !== "yes") monitoringList = [];
            if (damages !== "directDamage") damagesList = [];
        }

        if (ls)
            putLandslide();
        else
            postLandslide()

    });

    $("#ls-type-request").click(() => {

        let toSelect = lsType;

        if (lsType === "")
            toSelect = "rockfall";

        $("input[name='lsType'][value='" + toSelect + "']")
            .prop("checked", "true");

        openFullscreenDialog($("#dialog-ls-type"));

    });

    $("#material-type-request").click(() => {

        let toSelect = materialType;

        if (materialType === "")
            toSelect = "rock";

        $("input[name='materialType'][value='" + toSelect + "']")
            .prop("checked", "true");

        openDialog($("#dialog-material-type"));

    });

    $("#hill-position-request").click(() => {

        let toSelect = hillPosition;

        if (hillPosition === "")
            toSelect = "atTheTop";

        $("input[name='hillPosition'][value='" + toSelect + "']")
            .prop("checked", "true");

        openDialog($("#dialog-hill-position"));

    });

    $("#water-request").click(() => {

        let toSelect = water;

        if (water === "")
            toSelect = "dry";

        $("input[name='water'][value='" + toSelect + "']")
            .prop("checked", "true");

        openDialog($("#dialog-water"));

    });

    $("#vegetation-request").click(() => {

        let toSelect = vegetation;

        if (vegetation === "")
            toSelect = "grass";


        $("input[name='vegetation'][value='" + toSelect + "']").prop("checked", "true");

        openDialog($("#dialog-vegetation"));

    });

    $("#mitigation-request").click(() => {

        let toSelect = mitigation;

        if (mitigation === "")
            toSelect = "yes";

        let insertExpert = false;
        if (ls)
            if (ls.expert)
                insertExpert = true;

        if (isExpertMode || insertExpert) {

            $("input[name='mitigationExpert'][value='" + toSelect + "']")
                .prop("checked", "true");

            if (toSelect === "yes")
                $("#mitigations-wrapper").show();
            else
                $("#mitigations-wrapper").hide();

            mitigationListNew = [];
            clearDomList("mitigation-list");
            mitigationList.forEach(item => createMitigationItem(item.type));

            openFullscreenDialog($("#dialog-mitigation-expert"));

        } else {

            $("input[name='mitigationBase'][value='" + toSelect + "']")
                .prop("checked", "true");

            openDialog($("#dialog-mitigation-base"));

        }

    });

    $("#monitoring-request").click(() => {

        let toSelect = monitoring;

        if (monitoring === "")
            toSelect = "yes";

        $("input[name='monitoring'][value='" + toSelect + "']")
            .prop("checked", "true");

        if (toSelect === "yes")
            $("#monitoring-wrapper").show();
        else
            $("#monitoring-wrapper").hide();

        monitoringListNew = [];
        clearDomList("monitoring-list");
        monitoringList.forEach(item => createMonitoringItem(item.type, item.status));

        openFullscreenDialog($("#dialog-monitoring"));

    });

    $("#damages-request").click(() => {

        let toSelect = damages;

        if (damages === "")
            toSelect = "noDamage";

        $("input[name='damages'][value='" + toSelect + "']").prop("checked", "true");

        if (toSelect === "directDamage")
            $("#damages-wrapper").show();
        else
            $("#damages-wrapper").hide();

        damagesListNew = [];
        clearDomList("damages-list");
        damagesList.forEach(item => createDamagesItem(item.type, item.specification));

        openFullscreenDialog($("#dialog-damages"));
    });

    $("#notes-request").click(() => {

        $("#notes").val(notes);

        openFullscreenDialog($("#dialog-notes"));

    });

    $photoThm.click(() => {

        if (photo === "") {
            if (!isCordova)
                $("#tmp-photo-input").click();
            else
                getPicture();
        } else
            openImgScreen(
                $photoThm.find("img").attr("src"),
                true,
                () => {
                    if (!isCordova)
                        $("#tmp-photo-input").click();
                    else
                        getPicture()
                },
                () => removePicturePreview()
            )

    });

}


function postLandslide() {

    openLoader();

    let data = {
        _id                : generateUID(),
        createdAt          : new Date().toISOString(),
        updatedAt          : new Date().toISOString(),
        user               : { name: "User" },
        markedForDeletion  : false,
        checked            : false,
        expert             : isExpertMode,
        coordinates        : currLatLong,
        coordinatesAccuracy: currLatLongAccuracy,
        altitude           : currAltitude,
        altitudeAccuracy   : currAltitudeAccuracy,
        lsType             : lsType,
        materialType       : materialType,
        hillPosition       : hillPosition,
        water              : water,
        vegetation         : vegetation,
        mitigation         : mitigation,
        mitigationsList    : mitigationList,
        monitoring         : monitoring,
        monitoringList     : monitoringList,
        damages            : damages,
        damagesList        : damagesList,
        notes              : notes
    };

    // ToDo delete
    if (!isCordova) {

        data.photo = photo;

        let request = db.transaction("landslides", "readwrite").objectStore("landslides").add(data);

        request.onerror = err => {
            console.log("An error occurred during the insert", err);
            closeLoader();
            createAlertDialog(i18n.t("dialogs.insert.insertError"), i18n.t("dialogs.btnOk"));
        };

        request.onsuccess = () => {
            console.log("Insert done");
            closeLoader();
            showLandslide(data._id, data.coordinates);
            closeInsert();
        };

        return;
    }

    appendPhoto(
        data,
        data => {

            let request = db.transaction("landslides", "readwrite").objectStore("landslides").add(data);

            request.onerror = err => {
                console.log("An error occurred during the insert", err);
                closeLoader();
                createAlertDialog(i18n.t("dialogs.insert.insertError"), i18n.t("dialogs.btnOk"));
            };

            request.onsuccess = () => {
                console.log("Insert done");
                closeLoader();
                showLandslide(data._id, data.coordinates);
                closeInsert();
            };

        },
        () => {
            closeLoader();
            createAlertDialog(i18n.t("dialogs.insert.movePictureError"), i18n.t("dialogs.btnOk"));
        }
    );

}


function putLandslide() {

    openLoader();

    let getRequest = db.transaction("landslides", "readwrite").objectStore("landslides").get(ls._id);

    getRequest.onerror = err => {
        closeLoader();
        createAlertDialog(i18n.t("dialogs.insert.movePictureError"), i18n.t("dialogs.btnOk"));
        closeInsert();
        closeInfo();
        console.error("Cannot get the landslide", err);
    };

    getRequest.onsuccess = e => {

        let data = e.target.result;

        data.updatedAt       = new Date().toISOString();
        data.lsType          = lsType;
        data.materialType    = materialType;
        data.hillPosition    = hillPosition;
        data.water           = water;
        data.vegetation      = vegetation;
        data.mitigation      = mitigation;
        data.mitigationsList = mitigationList;
        data.monitoring      = monitoring;
        data.monitoringList  = monitoringList;
        data.damages         = damages;
        data.damagesList     = damagesList;
        data.notes           = notes;

        // ToDo delete
        if (!isCordova) {
            put(data);
            return;
        }

        if (photo === data.photo) {
            put(data);
            return;
        }

        let oldImage = data.photo;

        appendPhoto(
            data,
            data => {

                put(data);

                deleteImage(
                    oldImage,
                    () => console.log("Old photo deleted") ,
                    () => createAlertDialog(i18n.t("dialogs.deleteOldPictureError"), i18n.t("dialogs.btnOk"))
                );

            },
            () => {
                closeLoader();
                createAlertDialog(i18n.t("dialogs.insert.moveNewPictureError"), i18n.t("dialogs.btnOk"));
            }
        );


    };

    const put = data => {

        let putRequest = db.transaction("landslides", "readwrite").objectStore("landslides").put(data);

        putRequest.onerror = err => {
            closeLoader();
            createAlertDialog(i18n.t("dialogs.insert.putLocalError"), i18n.t("dialogs.btnOk"));
            console.error("Cannot edit the landslide", err);
        };

        putRequest.onsuccess = e => {
            closeLoader();
            closeInsert();
            openInfo(e.target.result);
        }

    }

}


function appendPhoto(data, clbSuccess, clbError) {

    window.resolveLocalFileSystemURL(photo,
        fileEntry => {

            findDirectories(
                true,
                photoDir => {

                    fileEntry.moveTo(photoDir, fileEntry.name,
                        file => {

                            console.log("File moved!", file);
                            data.photo = fileEntry.name;
                            clbSuccess(data);

                        },
                        err => {
                            console.error("Fail to move the file", err);
                            clbError();
                        }
                    )
                }
            );

        },
        err => {
            console.error("Failed to resolve the file", err);
            clbError();
        }
    )

}


// Ls type
function initLsTypeDialog() {

    $("#ls-type-close").click(() => closeFullscreenDialog($("#dialog-ls-type")));

    $("#ls-type-done").click(() => {

        lsType = $("input[name='lsType']:checked").val();
        $("#ls-type-text").html(i18n.t("insert.lsType.enum." + lsType));

        closeFullscreenDialog($("#dialog-ls-type"));

    });

}


// Material type
function initMaterialTypeDialog() {

    $("#material-type-cancel").click(() => closeDialog($("#dialog-material-type")));

    $("#material-type-ok").click(() => {

        materialType = $("input[name='materialType']:checked").val();
        $("#material-type-text").html(i18n.t("insert.materialType.enum." + materialType));

        closeDialog($("#dialog-material-type"));

    });

}


// Position
function initHillPositionDialog() {

    $("#hill-position-cancel").click(() => closeDialog($("#dialog-hill-position")));

    $("#hill-position-ok").click(() => {

        hillPosition = $("input[name='hillPosition']:checked").val();
        $("#hill-position-text").html(i18n.t("insert.hillPosition.enum." + hillPosition));

        closeDialog($("#dialog-hill-position"));

    });

}


// Water
function initWaterDialog() {

    $("#water-cancel").click(() => closeDialog($("#dialog-water")));

    $("#water-ok").click(() => {

        water = $("input[name='water']:checked").val();
        $("#water-text").html(i18n.t("insert.water.enum." + water));

        closeDialog($("#dialog-water"));

    });

}


// Vegetation
function initVegetationDialog() {

    $("#vegetation-cancel").click(() => closeDialog($("#dialog-vegetation")));

    $("#vegetation-ok").click(() => {

        vegetation = $("input[name='vegetation']:checked").val();
        $("#vegetation-text").html(i18n.t("insert.vegetation.enum." + vegetation));

        closeDialog($("#dialog-vegetation"));

    });

}


// Mitigation base
function initMitigationBaseDialog() {

    $("#mitigation-base-cancel").click(() => closeDialog($("#dialog-mitigation-base")));

    $("#mitigation-base-ok").click(() => {

        mitigation = $("input[name='mitigationBase']:checked").val();
        $("#mitigation-text").html(i18n.t("insert.mitigation.enum." + mitigation));

        closeDialog($("#dialog-mitigation-base"));

    });

}

// Mitigation expert
function initMitigationExpertDialog() {

    $("input[name='mitigationExpert']").change(() => {

        let checked = $("input[name='mitigationExpert']:checked").val();

        if (checked === "yes")
            $("#mitigations-wrapper").show();
        else
            $("#mitigations-wrapper").hide();

    });

    $("#mitigation-add").click(() => openDialog($("#dialog-mitigation-expert-new")));

    $("#mitigation-expert-close").click(() => closeFullscreenDialog($("#dialog-mitigation-expert")));

    $("#mitigation-expert-done").click(() => {

        mitigation     = $("input[name='mitigationExpert']:checked").val();
        mitigationList = cleanArray(mitigationListNew);
        $("#mitigation-text").html(i18n.t("insert.mitigation.editText"));

        closeFullscreenDialog($("#dialog-mitigation-expert"))

    });

}

function initMitigationInsertDialog() {

    $("#mitigation-type-select").change(() => changeSelectorLabel("mitigation-type-select"));

    $("#mitigation-expert-new-cancel").click(() => {

        closeDialog($("#dialog-mitigation-expert-new"));
        resetSelector("mitigation-type-select");

    });

    $("#mitigation-expert-new-ok").click(() => {

        let type = $("#mitigation-type-select").val();

        if (type === "none") {
            logOrToast(i18n.t("messages.mandatoryOption"), "long");
            return;
        }

        createMitigationItem(type);

        closeDialog($("#dialog-mitigation-expert-new"));
        resetSelector("mitigation-type-select");

    });

}


// Monitoring
function initMonitoringDialog() {

    $("input[name='monitoring']").change(() => {

        let checked = $("input[name='monitoring']:checked").val();

        if (checked === "yes")
            $("#monitoring-wrapper").show();
        else
            $("#monitoring-wrapper").hide();

    });

    $("#monitoring-add").click(() => openDialog($("#dialog-monitoring-new")));

    $("#monitoring-close").click(() => closeFullscreenDialog($("#dialog-monitoring")));

    $("#monitoring-done").click(() => {

        monitoring     = $("input[name='monitoring']:checked").val();
        monitoringList = cleanArray(monitoringListNew);
        $("#monitoring-text").html(i18n.t("insert.monitoring.editText"));

        closeFullscreenDialog($("#dialog-monitoring"))

    });

}

function initMonitoringInsertDialog() {

    $("#monitoring-type-select").change(() => changeSelectorLabel("monitoring-type-select"));

    $("#monitoring-status-select").change(() => changeSelectorLabel("monitoring-status-select"));

    $("#monitoring-new-cancel").click(() => {

        closeDialog($("#dialog-monitoring-new"));
        resetSelector("monitoring-type-select");
        resetSelector("monitoring-status-select");

    });

    $("#monitoring-new-ok").click(() => {

        let type   = $("#monitoring-type-select").val(),
            status = $("#monitoring-status-select").val();

        if (type === "none" || status === "none") {
            logOrToast(i18n.t("messages.mandatoryMonitoringFields"), "long");
            return;
        }

        createMonitoringItem(type, status);

        closeDialog($("#dialog-monitoring-new"));
        resetSelector("monitoring-type-select");
        resetSelector("monitoring-status-select");

    });

}


// Damages
function initDamagesDialog() {

    $("input[name='damages']").change(() => {

        let checked = $("input[name='damages']:checked").val();

        if (checked === "directDamage")
            $("#damages-wrapper").show();
        else
            $("#damages-wrapper").hide();

    });

    $("#damages-add").click(() => openDialog($("#dialog-damages-new")));

    $("#damages-close").click(() => closeFullscreenDialog($("#dialog-damages")));

    $("#damages-done").click(() => {

        damages     = $("input[name='damages']:checked").val();
        damagesList = cleanArray(damagesListNew);
        $("#damages-text").html(i18n.t("insert.damages.editText"));

        closeFullscreenDialog($("#dialog-damages"))

    });

}

function initDamagesInsertDialog() {

    $("#damages-type-select").change(() => {

        changeSelectorLabel("damages-type-select");

        if ($("#damages-type-select").val() === "other")
            $("#damage-other-input-wrapper").show();
        else
            $("#damage-other-input-wrapper").hide();

    });

    $("#damages-new-cancel").click(() => {

        closeDialog($("#dialog-damages-new"));
        resetSelector("damages-type-select");
        $("#damage-other-input").val("");
        $("#damage-other-input-wrapper").hide();

    });

    $("#damages-new-ok").click(() => {

        let type        = $("#damages-type-select").val(),
            $otherInput = $("#damage-other-input");

        if (type === "none") {
            logOrToast(i18n.t("messages.mandatoryOption"), "long");
            return;
        }

        if (type === "other" && $otherInput.val() === "") {
            logOrToast(i18n.t("messages.mandatoryDamageOther"), "long");
            return;
        }

        createDamagesItem(type, $otherInput.val());

        closeDialog($("#dialog-damages-new"));
        resetSelector("damages-type-select");
        $otherInput.val("");
        $("#damage-other-input-wrapper").hide();

    });

}


// Notes
function initNotesDialog() {

    $("#notes-close").click(() => closeFullscreenDialog($("#dialog-notes")));

    $("#notes-done").click(() => {

        notes = $("#notes").val();
        $("#notes-text").html(i18n.t("insert.notes.editText"));

        closeFullscreenDialog($("#dialog-notes"))

    });

}


// Photo

// ToDO delete
$("#tmp-photo-input").change(() => {

    photo = $("#tmp-photo-input")[0].files[0];

    let reader = new FileReader();

    reader.onloadend = e => {

        $photoThm
            .find("img")
            .attr("src", e.target.result)
            .show();

        $photoThm
            .find("i")
            .hide();

    };

    reader.readAsDataURL(photo);

});


function getPicture() {

    let options = {
        quality           : 50,
        destinationType   : Camera.DestinationType.FILE_URI,
        sourceType        : Camera.PictureSourceType.CAMERA,
        encodingType      : Camera.EncodingType.JPEG,
        mediaType         : Camera.MediaType.PICTURE,
        allowEdit         : false,
        correctOrientation: true
    };

    navigator.camera.getPicture(
        fileURI => {

            photo = fileURI;

            $photoThm
                .find("img")
                .attr("src", photo)
                .show();

            $photoThm
                .find("i")
                .hide();

        },
        err => {

            console.log("Error taking picture", err);
            createAlertDialog(i18n.t("dialogs.insert.pictureError"), i18n.t("dialogs.btnOk"));

        },
        options
    );

}

function removePicturePreview() {

    photo = "";

    $photoThm
        .find("img")
        .attr("src", "img/img-placeholder-200.png")
        .hide();

    $photoThm
        .find("i")
        .show();

}


///////////////////////
// UTILITY FUNCTIONS //
///////////////////////

function openFullscreenDialog(dialog) {
    dialog.show();
}

function closeFullscreenDialog(dialog) {
    dialog.scrollTop(0).hide();
}


function openDialog(toOpen) {
    $("#opaque-overlay").show();
    $("#insert-ls").css("overflow-y", "hidden");
    toOpen.show();
}

function closeDialog(toClose) {
    toClose.hide();
    $("#opaque-overlay").hide();
    $("#insert-ls").css("overflow-y", "scroll");
}


function changeSelectorLabel(selectorId) {

    let id        = "#" + selectorId,
        $selector = $(id),
        label     = $("[for='" + selectorId + "'").find(".label-description");

    if ($selector.val() === "none")
        label.html(i18n.t("insert.defaultSelectorLabel"));
    else
        label.html($selector.find("option:selected").text());

}

function resetSelector(selectorId) {

    let id = "#" + selectorId;

    $(id).get(0).selectedIndex = 0;
    changeSelectorLabel(selectorId);
}


function clearDomList(listId) {
    $("#" + listId).html("");
}

function deleteListItem(list, listId, idx) {

    $("#" + idx).parent().remove();

    idx       = idx.substring(idx.indexOf("-") + 1);
    list[idx] = "";

}


function cleanArray(array) {

    array = array.filter(i => i !== "");
    return array;

}


function createMitigationItem(type) {

    let btnId = "mitigation-" + mitigationListNew.length;

    $("#mitigation-list").append(
        "<section class='list-item no-padding'>" +
        "<div class='list-item-text'>" +
        "<p class='list-item-text-p'>" +
        i18n.t("insert.mitigation.enum." + type) +
        "</div>" +
        "<div id='" + btnId + "' class='details-list-item-delete'>" +
        "<i class='material-icons'>cancel</i>" +
        "</div>" +
        "</section>"
    );

    $("#" + btnId).click(() => deleteListItem(mitigationListNew, "mitigation-list", btnId));

    mitigationListNew.push({
        type: type
    });

}

function createMonitoringItem(type, status) {

    let btnId = "monitoring-" + monitoringListNew.length;

    $("#monitoring-list").append(
        "<section class='list-item'>" +
        "<div class='list-item-text padding-start'>" +
        "<p class='list-item-text-p'>" +
        "<span class='list-item-entry-title' data-i18n='insert.monitoring.type'>Type:</span> " +
        i18n.t("insert.monitoring.enum." + type) +
        "</p>" +
        "<p class='list-item-text-p'>" +
        "<span class='list-item-entry-title' data-i18n='insert.monitoring.status'>Status:</span> " +
        i18n.t("insert.monitoring.enum." + status) +
        "</p>" +
        "</div>" +
        "<div id='" + btnId + "' class='details-list-item-delete'>" +
        "<i class='material-icons'>cancel</i>" +
        "</div>" +
        "</section>"
    );

    $("#" + btnId).click(() => deleteListItem(monitoringListNew, "monitoring-list", btnId));

    monitoringListNew.push({
        type  : type,
        status: status
    });

}

function createDamagesItem(type, specification) {

    let btnId = "damages-" + damagesListNew.length;

    let info = i18n.t("insert.damages.enum." + type);
    if (specification !== "")
        info = specification;

    $("#damages-list").append(
        "<section class='list-item no-padding'>" +
        "<div class='list-item-text padding-start'>" +
        "<p class='list-item-text-p'>" + info +
        "</p>" +
        "</div>" +
        "<div id='" + btnId + "' class='details-list-item-delete'>" +
        "<i class='material-icons'>cancel</i>" +
        "</div>" +
        "</section>"
    );

    $("#" + btnId).click(() => deleteListItem(damagesListNew, "damages-list", btnId));

    damagesListNew.push({
        type         : type,
        specification: specification
    });

}


function resetFields() {

    ls                = null;
    lsType            = "";
    materialType      = "";
    hillPosition      = "";
    water             = "";
    vegetation        = "";
    mitigation        = "";
    mitigationList    = [];
    mitigationListNew = [];
    monitoring        = "";
    monitoringList    = [];
    monitoringListNew = [];
    damages           = "";
    damagesList       = [];
    damagesListNew    = [];
    notes             = "";
    photo             = "";

    $("#ls-type-text").html(i18n.t("insert.lsType.defaultText"));
    $("#material-type-text").html(i18n.t("insert.materialType.defaultText"));
    $("#hill-position-text").html(i18n.t("insert.hillPosition.defaultText"));
    $("#water-text").html(i18n.t("insert.water.defaultText"));
    $("#vegetation-text").html(i18n.t("insert.vegetation.defaultText"));
    $("#mitigation-text").html(i18n.t("insert.mitigation.defaultText"));
    $("#monitoring-text").html(i18n.t("insert.monitoring.defaultText"));
    $("#damages-text").html(i18n.t("insert.damages.defaultText"));
    $("#notes-text").html(i18n.t("insert.notes.defaultText"));

    $photoThm
        .find("img")
        .attr("src", "img/img-placeholder-200.png")
        .hide();

    $photoThm
        .find("i")
        .show();

}