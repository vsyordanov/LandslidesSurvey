"use strict";

let isModify = false;

let lsType            = "",
    materialType      = "",
    position          = "",
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
    photo             = "",
    newPhoto          = "";

let btnCancelPhotoTop  = 0,
    btnCancelPhotoLeft = 0;


function initInsert() {

    initMainPageBase();
    initMainPageExpert();
    initPositionDialog();
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
    initPhotoDialog();

}

function openInsert() {

    if (isExpertMode) {
        $("#insert-ls-main-expert").show();
        $("#insert-ls-main-base").hide();
    } else {
        $("#insert-ls-main-expert").hide();
        $("#insert-ls-main-base").show();
    }

    $("#insert-ls").show();

}

function closeInsert() {

    $("#insert-ls-main-expert").hide();
    $("#insert-ls-main-base").hide();
    $("#insert-ls").scrollTop(0).hide();

    resetFields();

}


// Main page base
function initMainPageBase() {

    $("#new-ls-base-close").click(() => closeInsert());

    $("#new-ls-base-done").click(() => insertLandslide());

    $("#ls-type-request-base").click(() => openLsTypeDialog());

    $("#material-type-request-base").click(() => openMaterialTypeDialog());

    $("#water-request-base").click(() => openWaterDialog());

    $("#mitigation-request-base").click(() => {

        let toSelect = mitigation;

        if (mitigation === "")
            toSelect = "yes";

        $("input[name='mitigationBase'][value='" + toSelect + "']")
            .prop("checked", "true");

        openDialog($("#dialog-mitigation-base"));

    });

    $("#photo-request-base").click(() => openDialogPhoto());

}

// Main page expert
function initMainPageExpert() {

    $("#new-ls-expert-close").click(() => closeInsert());

    $("#new-ls-expert-done").click(() => insertLandslide());

    $("#ls-type-request-expert").click(() => openLsTypeDialog());

    $("#material-type-request-expert").click(() => openMaterialTypeDialog());

    $("#position-request-expert").click(() => {

        let toSelect = position;

        if (position === "")
            toSelect = "crest";

        $("input[name='position'][value='" + toSelect + "']")
            .prop("checked", "true");

        openDialog($("#dialog-position"));

    });

    $("#water-request-expert").click(() => openWaterDialog());

    $("#vegetation-request-expert").click(() => {

        let toSelect = vegetation;

        if (vegetation === "")
            toSelect = "grass";


        $("input[name='vegetation'][value='" + toSelect + "']").prop("checked", "true");

        openDialog($("#dialog-vegetation"));

    });

    $("#mitigation-request-expert").click(() => {

        let toSelect = mitigation;

        if (mitigation === "")
            toSelect = "yes";

        $("input[name='mitigationExpert'][value='" + toSelect + "']")
            .prop("checked", "true");

        if (toSelect === "yes")
            $("#mitigations-wrapper").show();
        else
            $("#mitigations-wrapper").hide();

        mitigationListNew = [];
        clearDomList("mitigation-list");
        mitigationList.forEach(item => createMitigationItem(item.type, item.status));

        openFullscreenDialog($("#dialog-mitigation-expert"));

    });

    $("#monitoring-request-expert").click(() => {

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
        monitoringList.forEach(item => createMonitoringItem(item.type));

        openFullscreenDialog($("#dialog-monitoring"));

    });

    $("#damages-request-expert").click(() => {

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

    $("#notes-request-expert").click(() => {

        $("#notes").val(notes);

        openFullscreenDialog($("#dialog-notes"));

    });

    $("#photo-request-expert").click(() => openDialogPhoto());

}

// Create the landslide object
function insertLandslide() {

    if (lsType === "") {
        console.log("You must provide at least the ls type");
        return;
    }

    if (isExpertMode) {

        if (mitigation !== "yes")
            mitigationList = [];

        if (monitoring !== "yes")
            monitoringList = [];

        if (damages !== "directDamage")
            damagesList = [];

    }

    let currDate = new Date().toISOString();

    let hasPhoto = photo !== "";

    let landslide = new Landslide(
        Landslide.generateUID(),
        currDate,
        currDate,
        isExpertMode,
        currLatLong,
        currAccuracy,
        currAltitude,
        lsType,
        materialType,
        position,
        water,
        vegetation,
        mitigation,
        mitigationList,
        monitoring,
        monitoringList,
        damages,
        damagesList,
        notes,
        hasPhoto
    );

    landslide.addAttachment(photo);
    landslide.insert();

    closeInsert();

}


// Ls type
function initLsTypeDialog() {

    $("#ls-type-close").click(() => closeFullscreenDialog($("#dialog-ls-type")));

    $("#ls-type-done").click(() => {

        lsType = $("input[name='lsType']:checked").val();

        if (!isExpertMode)
            $("#ls-type-text-base").html(i18n.t("insert.lsType.enum." + lsType));
        else
            $("#ls-type-text-expert").html(i18n.t("insert.lsType.enum." + lsType));

        closeFullscreenDialog($("#dialog-ls-type"));

    });

}

function openLsTypeDialog() {

    let toSelect = lsType;

    if (lsType === "")
        toSelect = "rockfall";

    $("input[name='lsType'][value='" + toSelect + "']")
        .prop("checked", "true");

    openFullscreenDialog($("#dialog-ls-type"));

}


// Material type
function initMaterialTypeDialog() {

    $("#material-type-cancel").click(() => closeDialog($("#dialog-material-type")));

    $("#material-type-ok").click(() => {

        materialType = $("input[name='materialType']:checked").val();

        if (!isExpertMode)
            $("#material-type-text-base").html(i18n.t("insert.material.enum." + materialType));
        else
            $("#material-type-text-expert").html(i18n.t("insert.material.enum." + materialType));

        closeDialog($("#dialog-material-type"));

    });

}

function openMaterialTypeDialog() {

    let toSelect = materialType;

    if (materialType === "")
        toSelect = "rock";

    $("input[name='materialType'][value='" + toSelect + "']")
        .prop("checked", "true");

    openDialog($("#dialog-material-type"));

}


// Position
function initPositionDialog() {

    $("#position-cancel").click(() => closeDialog($("#dialog-position")));

    $("#position-ok").click(() => {

        position = $("input[name='position']:checked").val();

        $("#position-text-expert").html(i18n.t("insert.position.enum." + position));

        closeDialog($("#dialog-position"));

    });

}


// Water
function initWaterDialog() {

    $("#water-cancel").click(() => closeDialog($("#dialog-water")));

    $("#water-ok").click(() => {

        water = $("input[name='water']:checked").val();

        if (!isExpertMode)
            $("#water-text-base").html(i18n.t("insert.water.enum." + water));
        else
            $("#water-text-expert").html(i18n.t("insert.water.enum." + water));

        closeDialog($("#dialog-water"));

    });

}

function openWaterDialog() {

    let toSelect = water;

    if (water === "")
        toSelect = "dry";

    $("input[name='water'][value='" + toSelect + "']")
        .prop("checked", "true");

    openDialog($("#dialog-water"));

}


// Vegetation
function initVegetationDialog() {

    $("#vegetation-cancel").click(() => closeDialog($("#dialog-vegetation")));

    $("#vegetation-ok").click(() => {

        vegetation = $("input[name='vegetation']:checked").val();

        $("#vegetation-text-expert").html(i18n.t("insert.vegetation.enum." + vegetation));

        closeDialog($("#dialog-vegetation"));

    });

}


// Mitigation base
function initMitigationBaseDialog() {

    $("#mitigation-base-cancel").click(() => closeDialog($("#dialog-mitigation-base")));

    $("#mitigation-base-ok").click(() => {

        mitigation = $("input[name='mitigationBase']:checked").val();

        $("#mitigation-text-base").html(i18n.t("insert.mitigation.enum." + mitigation));

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

        $("#mitigation-text-expert").html(i18n.t("insert.mitigation.editText"));

        closeFullscreenDialog($("#dialog-mitigation-expert"))

    });

}

function initMitigationInsertDialog() {

    $("#mitigation-type-select").change(() => changeSelectorLabel("mitigation-type-select"));

    $("#mitigation-status-select").change(() => changeSelectorLabel("mitigation-status-select"));

    $("#mitigation-expert-new-cancel").click(() => {

        closeDialog($("#dialog-mitigation-expert-new"));
        resetSelector("mitigation-type-select");
        resetSelector("mitigation-status-select");

    });

    $("#mitigation-expert-new-ok").click(() => {

        let type   = $("#mitigation-type-select").val(),
            status = $("#mitigation-status-select").val();

        if (type === "none" || status === "none") {
            console.log("You must select an option"); // ToDo
            return;
        }

        createMitigationItem(type, status);

        closeDialog($("#dialog-mitigation-expert-new"));
        resetSelector("mitigation-type-select");
        resetSelector("mitigation-status-select");

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

        $("#monitoring-text-expert").html(i18n.t("insert.monitoring.editText"));

        closeFullscreenDialog($("#dialog-monitoring"))

    });

}

function initMonitoringInsertDialog() {

    $("#monitoring-type-select").change(() => changeSelectorLabel("monitoring-type-select"));

    $("#monitoring-new-cancel").click(() => {

        closeDialog($("#dialog-monitoring-new"));
        resetSelector("monitoring-type-select");

    });

    $("#monitoring-new-ok").click(() => {

        let type = $("#monitoring-type-select").val();

        if (type === "none") {
            console.log("You must select an option"); // ToDo
            return;
        }

        createMonitoringItem(type);

        closeDialog($("#dialog-monitoring-new"));
        resetSelector("monitoring-type-select");

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

        $("#damages-text-expert").html(i18n.t("insert.damages.editText"));

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
            console.log("You must select an option"); // ToDo
            return;
        }

        if (type === "other" && $otherInput.val() === "") {
            console.log("You must specify a type"); // ToDo
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

        $("#notes-text-expert").html(i18n.t("insert.notes.editText"));

        closeFullscreenDialog($("#dialog-notes"))

    });

}


// Photo
function initPhotoDialog() {

    // ToDO delete
    $("#tmp-photo-input").change(() => {

        console.log("Change");

        let file   = $("#tmp-photo-input")[0].files[0];
        let reader = new FileReader();

        if (file)
            reader.readAsDataURL(file);

        reader.onload = function (event) {

            let dataURL = event.target.result;

            getPictureSuccess(dataURL.substr(dataURL.indexOf(",") + 1));
        }
    });


    $("#btn-camera").click(() => getPicture(Camera.PictureSourceType.CAMERA));

    $("#btn-gallery").click(() => getPicture(Camera.PictureSourceType.SAVEDPHOTOALBUM));


    function getPicture(srcType) {

        let options = {
            quality           : 50,
            destinationType   : Camera.DestinationType.DATA_URL,
            sourceType        : srcType,
            encodingType      : Camera.EncodingType.JPEG,
            mediaType         : Camera.MediaType.PICTURE,
            allowEdit         : false,
            correctOrientation: true
        };

        navigator.camera.getPicture(getPictureSuccess, getPictureFail, options);
    }

    function getPictureSuccess(data) {

        let $btnCancelPhoto = $("#photo-cancel-btn");

        console.log("Picture success");

        newPhoto = data;

        let img    = new Image();
        img.src    = "data:image/jpeg;base64," + data;
        img.onload = () => {

            let imgWidth  = img.width,
                imgHeight = img.height,
                ratio     = imgWidth / imgHeight;

            if (ratio >= 1) {
                if (imgWidth > 200) {
                    imgWidth  = 200;
                    imgHeight = imgWidth / ratio;
                }
            } else {
                if (imgHeight > 200) {
                    imgHeight = 200;
                    imgWidth  = imgHeight * ratio;
                }
            }

            let $photoPreviewWrapper = $("#photo-preview-wrapper");

            previewPhoto(data);

            let top = parseInt($(".top-bar").first().css("height")) +
                parseInt($("#photo-dialog-container").css("margin-top")) +
                parseInt($photoPreviewWrapper.css("height")) / 2 -
                imgHeight / 2 -
                parseInt($btnCancelPhoto.css("height"));

            let left = $(document).width() / 2 +
                imgWidth / 2 -
                parseInt($btnCancelPhoto.css("height")) / 2;

            $btnCancelPhoto.css("left", left).css("top", top).show();
        };

    }

    function getPictureFail(error) {
        console.log("Picture error: " + error)
    }


    $("#photo-cancel-btn").click(() => {

        newPhoto = "";

        $("#photo-cancel-btn").hide();
        previewPhoto(newPhoto);

        $("#tmp-photo-input").val(""); // ToDo delete

    });


    $("#photo-close").click(() => {

        newPhoto = "";
        closeFullscreenDialog($("#dialog-photo"));

    });

    $("#photo-done").click(() => {

        let $btnCancelPhoto = $("#photo-cancel-btn");

        photo              = newPhoto;
        newPhoto           = "";
        btnCancelPhotoTop  = parseInt($btnCancelPhoto.css("top"));
        btnCancelPhotoLeft = parseInt($btnCancelPhoto.css("left"));

        if (photo === "")
            $("#photo-text").html(i18n.t("insert.photo.name"));
        else
            $("#photo-text").html(i18n.t("insert.photo.editText"));

        closeFullscreenDialog($("#dialog-photo"));

    });

}

function openDialogPhoto() {

    newPhoto = "";
    previewPhoto(photo);

    if (photo !== "")
        $("#photo-cancel-btn")
            .css("left", btnCancelPhotoLeft)
            .css("top", btnCancelPhotoTop)
            .show();
    else
        $("#photo-cancel-btn").hide();

    openFullscreenDialog($("#dialog-photo"));

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


function createMitigationItem(type, status) {

    let btnId = "mitigation-" + mitigationListNew.length;

    $("#mitigation-list").append(
        "<section class='list-item'>" +
        "<div class='list-item-text'>" +
        "<p class='list-item-text-p'>" +
        "<span class='list-item-entry-title' data-i18n='insert.mitigation.type'>Type:</span> " + type +
        "</p>" +
        "<p class='list-item-text-p'>" +
        "<span class='list-item-entry-title' data-i18n='insert.mitigation.status'>Status:</span> " + status +
        "</p>" +
        "</div>" +
        "<div id='" + btnId + "' class='details-list-item-delete'>" +
        "<i class='material-icons'>cancel</i>" +
        "</div>" +
        "</section>"
    );

    $("#" + btnId).click(() => deleteListItem(mitigationListNew, "mitigation-list", btnId));

    mitigationListNew.push({
        type  : type,
        status: status
    });

}

function createMonitoringItem(type) {

    let btnId = "monitoring-" + monitoringListNew.length;

    $("#monitoring-list").append(
        "<section class='list-item no-padding'>" +
        "<div class='list-item-text padding-start'>" +
        "<p class='list-item-text-p'>" + type +
        "</p>" +
        "</div>" +
        "<div id='" + btnId + "' class='details-list-item-delete'>" +
        "<i class='material-icons'>cancel</i>" +
        "</div>" +
        "</section>"
    );

    $("#" + btnId).click(() => deleteListItem(monitoringListNew, "monitoring-list", btnId));

    monitoringListNew.push(type);

}

function createDamagesItem(type, specification) {

    let btnId = "damages-" + damagesListNew.length;

    let info = type;
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


function previewPhoto(photo) {

    if (photo === "") {
        $("#ls-photo-preview").attr("src", "img/img-placeholder-200.png");
    } else {
        if (isModify)
            $("#ls-photo-preview").attr("src", photo);
        else
            $("#ls-photo-preview").attr("src", "data:image/jpeg;base64," + photo);
    }

}


function resetFields() {

    lsType            = "";
    materialType      = "";
    position          = "";
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

    $("#ls-type-text-base").html(i18n.t("insert.lsType.defaultText"));
    $("#ls-type-text-expert").html(i18n.t("insert.lsType.defaultText"));
    $("#material-type-text-base").html(i18n.t("insert.material.defaultText"));
    $("#material-type-text-expert").html(i18n.t("insert.material.defaultText"));
    $("#position-text-expert").html(i18n.t("insert.position.defaultText"));
    $("#water-text-base").html(i18n.t("insert.water.defaultText"));
    $("#water-text-expert").html(i18n.t("insert.water.defaultText"));
    $("#vegetation-text-expert").html(i18n.t("insert.vegetation.defaultText"));
    $("#mitigation-text-base").html(i18n.t("insert.mitigation.defaultText"));
    $("#mitigation-text-expert").html(i18n.t("insert.mitigation.defaultText"));
    $("#monitoring-text-expert").html(i18n.t("insert.monitoring.defaultText"));
    $("#damages-text-expert").html(i18n.t("insert.damages.defaultText"));
    $("#notes-text-expert").html(i18n.t("insert.notes.defaultText"));
    $("#photo-text-base").html(i18n.t("insert.photo.name"));
    $("#photo-text-expert").html(i18n.t("insert.photo.name"));

}