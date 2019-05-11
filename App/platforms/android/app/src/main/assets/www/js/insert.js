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
    photos            = [];

let $photoContainer = $("#insert-ls-main .photo-container");


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

        $("#ls-type-text").html(i18n.t("insert.lsType.enum." + lsType));

        if (materialType !== "") $("#material-type-text").html(i18n.t("insert.materialType.enum." + materialType));
        if (hillPosition !== "") $("#hill-position-text").html(i18n.t("insert.hillPosition.enum." + hillPosition));
        if (water !== "") $("#water-text").html(i18n.t("insert.water.enum." + water));
        if (vegetation !== "") $("#vegetation-text").html(i18n.t("insert.vegetation.enum." + vegetation));
        if (mitigation !== "") $("#mitigation-text").html(i18n.t("insert.mitigation.enum." + mitigation));
        if (monitoring !== "") $("#monitoring-text").html(i18n.t("insert.monitoring.enum." + monitoring));
        if (damages !== "") $("#damages-text").html(i18n.t("insert.damages.enum." + damages));
        if (notes !== "") $("#notes-text").html(i18n.t("insert.notes.enum." + notes));

        if (ls.images.length > 0) {
            if (photoDir)
                getPhoto(0);
            else
                getNextPhoto(999, true);
        } else {
            toggleExpertView(ls.expert);
            $("#insert-ls").show();
        }
    } else {
        toggleExpertView(isExpertMode);
        addPhotoContainer();
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

    $("#new-ls-close").click(() => closeInsert());

    $("#new-ls-done").click(() => {

        // if (lsType === "") {
        //     logOrToast("You must provide at least the ls type");
        //     return;
        // }

        if (isExpertMode) {
            if (mitigation !== "yes") mitigationList = [];
            if (monitoring !== "yes") monitoringList = [];
            if (damages !== "directDamage") damagesList = [];
        }

        photos = [];

        if ($("#insert-ls-main .photo-thm-wrapper img").length > 0) {
            if (photoDir)
                movePhoto(0);
            else
                nextPhoto(999, true);
        } else {
            if (ls)
                putLandslide();
            else
                postLandslide();
        }

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

}

function postLandslide() {

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
        notes              : notes,
        images             : photos
    };

    let request       = db.transaction("landslides", "readwrite").objectStore("landslides").add(data);
    request.onerror   = e => console.log("An error occurred during the insert");
    request.onsuccess = () => {
        console.log("Insert done");
        showLandslide(data._id, data.coordinates);
        closeInsert();
    };

}

function putLandslide() {

    let os = db.transaction("landslides", "readwrite").objectStore("landslides");

    let getRequest       = os.get(ls._id);
    getRequest.onerror   = e => console.error("Cannot get the landslide", e);
    getRequest.onsuccess = e => {

        let data             = e.target.result;
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

        let putRequest       = os.put(data);
        putRequest.onerror   = e => console.error("Cannot edit the landslide", e);
        putRequest.onsuccess = e => {

            let request       = db.transaction("landslides", "readwrite").objectStore("landslides").get(e.target.result);
            request.onerror   = e => console.error("Retrieving ls failed", e);
            request.onsuccess = e => {
                if (e.target.result.mitigation !== "yes") $("#info-mitigationsList").hide();
                if (e.target.result.monitoring !== "yes") $("#info-monitoringList").hide();
                if (e.target.result.damages !== "directDamage") $("#info-damagesList").hide();
                showInfo(e.target.result);
                closeInsert();
            }
        }
    }

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
            logOrToast("You must select an option"); // ToDo
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
            logOrToast("You must select an option for both type and status"); // ToDo
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
            logOrToast("You must select an option"); // ToDo
            return;
        }

        if (type === "other" && $otherInput.val() === "") {
            logOrToast("You must specify a type"); // ToDo
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
function addPhoto($wrapper, isEdit) {

    // ToDo move to global
    const cameraOptions = {
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
            if (!isEdit) {
                $wrapper.html("<img src='" + fileURI + "' alt='Your photo' onclick='openImgScreen($(this))'>");
                addPhotoContainer();
            } else {
                $wrapper.children("img").attr("src", fileURI).show();
            }
        },
        err => {
            logOrToast("Error taking the picture");
            console.log(err);
        },
        cameraOptions
    );
}

function addPhotoContainer(src = null) {

    if ($("#insert-ls-main .photo-container .photo-thm-wrapper").length < 3) {

        let dim = ($(window).width() - parseInt($photoContainer.css("padding-right")) * 2) / 100 * 30;

        let $el;

        if (!src)
            $el = $("<div class='photo-thm-wrapper'>" +
                "<div class='add-photo' onclick='addPhoto($(this).parent(), false)'>" +
                "<i class='material-icons'>add_a_photo</i>" +
                "</div>" +
                "</div>");
        else
            $el = $("<div class='photo-thm-wrapper'>" +
                "<img src='" + src + "' alt='Your photo' onclick='openImgScreen($(this))'>" +
                "</div>");

        $el.height(dim);
        $photoContainer.append($el);
    }
}

function openImgScreen($img) {

    $("#img-screen-container img").attr("src", $img.attr("src"));

    $("#img-screen-delete")
        .unbind("click")
        .click(() => {
            $img.parent().remove();
            if ($("#insert-ls-main .add-photo").length === 0)
                addPhotoContainer();
            closeImgScreen();
        });

    $("#img-screen-edit")
        .unbind("click")
        .click(() => {
            closeImgScreen();
            addPhoto($img.parent(), true);
        });

    $("#img-screen").show();

}

function getPhoto(idx) {

    photoDir.getFile(ls.images[idx], { create: false }, file => {
            addPhotoContainer(file.nativeURL);
            getNextPhoto(idx);
        },
        err => {
            console.error("Error getting the photo", err);
            getNextPhoto(idx, true);
        }
    );
}

function getNextPhoto(idx, err = false) {

    if (err)
        photoError = true;

    if (idx < ls.images.length - 1) {
        getPhoto(idx + 1);
    } else {
        console.log("Insert...", photoError);
        photoError = false;
        toggleExpertView(ls.expert);
        $("#insert-ls").show();
    }
}

function movePhoto(idx) {

    let uri = $("#insert-ls-main .photo-thm-wrapper img").eq(idx).attr("src");

    window.resolveLocalFileSystemURL(uri, fileEntry => {

        fileEntry.moveTo(photoDir, fileEntry.name, file => {

            console.log("File moved!", file);
            photos.push(file.name);
            nextPhoto(idx);

        }, err => {
            console.error("Fail to move the file", err);
            nextPhoto(idx, true);
        })

    }, err => {
        console.error("Failed to resolve the file", err);
        nextPhoto(idx, true);
    })

}

function nextPhoto(idx, err = false) {

    if (err)
        photoError = true;

    if (idx < $("#insert-ls-main .photo-thm-wrapper img").length - 1) {
        movePhoto(idx + 1);
    } else {
        console.log("Posting...", photoError);
        photoError = false;
        if (ls)
            putLandslide();
        else
            postLandslide();
    }

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
    photos            = [];

    $("#ls-type-text").html(i18n.t("insert.lsType.defaultText"));
    $("#material-type-text").html(i18n.t("insert.materialType.defaultText"));
    $("#hill-position-text").html(i18n.t("insert.hillPosition.defaultText"));
    $("#water-text").html(i18n.t("insert.water.defaultText"));
    $("#vegetation-text").html(i18n.t("insert.vegetation.defaultText"));
    $("#mitigation-text").html(i18n.t("insert.mitigation.defaultText"));
    $("#monitoring-text").html(i18n.t("insert.monitoring.defaultText"));
    $("#damages-text").html(i18n.t("insert.damages.defaultText"));
    $("#notes-text").html(i18n.t("insert.notes.defaultText"));
    $photoContainer.html("");

    photoDir   = undefined;
    photoError = false;

}