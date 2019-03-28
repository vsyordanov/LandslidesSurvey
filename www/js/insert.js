"use strict";

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
    photo             = "";


function initInsertion(isExpert) {

    if (!isExpert) {
        $("#insert-ls-main-base").show();
        initMainPageBase();
    } else {
        $("#insert-ls-main-expert").show();
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
    }

    initLsTypeDialog();
    initMaterialTypeDialog();
    initWaterDialog();
    initMitigationBaseDialog();
    initPhotoDialog();

}


// Main page base
function initMainPageBase() {

    $("#new-ls-base-close").click(() => {

        $("#insert-ls").hide();
        $("#map").show();

    });

    $("#new-ls-base-done").click(() => {

        console.log("Insert done");

    });

    $("#ls-type-request-base").click(() => {

        $("input[name='lsType'][value='" + lsType + "']").prop("checked", "true");

        openFullscreenDialog($("#dialog-ls-type"));

    });

    $("#material-type-request-base").click(() => {

        $("input[name='materialType'][value='" + materialType + "']").prop("checked", "true");

        openDialog($("#dialog-material-type"));

    });

    $("#water-request-base").click(() => {

        $("input[name='water'][value='" + water + "']").prop("checked", "true");

        openDialog($("#dialog-water"));

    });

    $("#mitigation-request-base").click(() => {

        $("input[name='mitigationBase'][value='" + mitigation + "']").prop("checked", "true");

        openDialog($("#dialog-mitigation-base"));

    });

    $("#photo-request-base").click(() => {

        console.log("Photo clicked");

    });

}

// Main page expert
function initMainPageExpert() {

    $("#new-ls-expert-close").click(() => {

        $("#insert-ls").hide();
        $("#map").show();

    });

    $("#new-ls-expert-done").click(() => {

        console.log("Insert done");

    });

    $("#ls-type-request-expert").click(() => {

        $("input[name='lsType'][value='" + lsType + "']").prop("checked", "true");

        openFullscreenDialog($("#dialog-ls-type"));

    });

    $("#material-type-request-expert").click(() => {

        $("input[name='materialType'][value='" + materialType + "']").prop("checked", "true");

        openDialog($("#dialog-material-type"));

    });

    $("#position-request-expert").click(() => {

        $("input[name='position'][value='" + position + "']").prop("checked", "true");

        openDialog($("#dialog-position"));

    });

    $("#water-request-expert").click(() => {

        $("input[name='water'][value='" + water + "']").prop("checked", "true");

        openDialog($("#dialog-water"));

    });

    $("#vegetation-request-expert").click(() => {

        $("input[name='vegetation'][value='" + vegetation + "']").prop("checked", "true");

        openDialog($("#dialog-vegetation"));

    });

    $("#mitigation-request-expert").click(() => {

        $("input[name='mitigationExpert'][value='" + mitigation + "']").prop("checked", "true");

        if (mitigation === "" || mitigation === "Yes")
            $("#mitigations-wrapper").show();
        else
            $("#mitigations-wrapper").hide();

        mitigationListNew = [];
        clearDomList("mitigation-list");
        mitigationList.forEach(item => createMitigationItem(item.type, item.status));

        openFullscreenDialog($("#dialog-mitigation-expert"));
    });

    $("#monitoring-request-expert").click(() => {

        $("input[name='monitoring'][value='" + monitoring + "']").prop("checked", "true");

        if (monitoring === "" || monitoring === "Yes")
            $("#monitoring-wrapper").show();
        else
            $("#monitoring-wrapper").hide();

        monitoringListNew = [];
        clearDomList("monitoring-list");
        monitoringList.forEach(item => createMonitoringItem(item.type));

        openFullscreenDialog($("#dialog-monitoring"));
    });

    $("#damages-request-expert").click(() => {

        $("input[name='damages'][value='" + damages + "']").prop("checked", "true");

        if (damages === "Direct damage")
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

    $("#photo-request-expert").click(() => {

        console.log("Photo clicked");

    });

}


// Ls type
function initLsTypeDialog() {

    $("#ls-type-close").click(() => closeFullscreenDialog($("#dialog-ls-type")));

    $("#ls-type-done").click(() => {

        lsType = $("input[name='lsType']:checked").val();

        if (!isExpertMode)
            $("#ls-type-text-base").html(lsType);
        else
            $("#ls-type-text-expert").html(lsType);

        closeFullscreenDialog($("#dialog-ls-type"));

    });

}


// Material type
function initMaterialTypeDialog() {

    $("#material-type-cancel").click(() => closeDialog($("#dialog-material-type")));

    $("#material-type-ok").click(() => {

        materialType = $("input[name='materialType']:checked").val();

        if (!isExpertMode)
            $("#material-type-text-base").html(materialType);
        else
            $("#material-type-text-expert").html(materialType);

        closeDialog($("#dialog-material-type"));

    });

}


// Position
function initPositionDialog() {

    $("#position-cancel").click(() => closeDialog($("#dialog-position")));

    $("#position-ok").click(() => {

        position = $("input[name='position']:checked").val();
        $("#position-text-expert").html(position);

        closeDialog($("#dialog-position"));

    });

}


// Water
function initWaterDialog() {

    $("#water-cancel").click(() => closeDialog($("#dialog-water")));

    $("#water-ok").click(() => {

        water = $("input[name='water']:checked").val();

        if (!isExpertMode)
            $("#water-text-base").html(water);
        else
            $("#water-text-expert").html(water);

        closeDialog($("#dialog-water"));

    });

}


// Vegetation
function initVegetationDialog() {

    $("#vegetation-cancel").click(() => closeDialog($("#dialog-vegetation")));

    $("#vegetation-ok").click(() => {

        vegetation = $("input[name='vegetation']:checked").val();

        $("#vegetation-text-expert").html(vegetation);

        closeDialog($("#dialog-vegetation"));

    });

}


// Mitigation base
function initMitigationBaseDialog() {

    $("#mitigation-base-cancel").click(() => closeDialog($("#dialog-mitigation-base")));

    $("#mitigation-base-ok").click(() => {

        mitigation = $("input[name='mitigationBase']:checked").val();
        $("#mitigation-text-base").html(mitigation);

        closeDialog($("#dialog-mitigation-base"));

    });

}

// Mitigation expert
function initMitigationExpertDialog() {

    $("input[name='mitigationExpert']").change(() => {

        let checked = $("input[name='mitigationExpert']:checked").val();

        if (checked === "Yes")
            $("#mitigations-wrapper").show();
        else
            $("#mitigations-wrapper").hide();

    });

    $("#mitigation-add").click(() => openDialog($("#dialog-mitigation-expert-new")));

    $("#mitigation-expert-close").click(() => closeFullscreenDialog($("#dialog-mitigation-expert")));

    $("#mitigation-expert-done").click(() => {

        mitigation     = $("input[name='mitigationExpert']:checked").val();
        mitigationList = cleanArray(mitigationListNew);

        $("#mitigation-text-expert").html("Edit the mitigation works");

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

        if (checked === "Yes")
            $("#monitoring-wrapper").show();
        else
            $("#monitoring-wrapper").hide();

    });

    $("#monitoring-add").click(() => openDialog($("#dialog-monitoring-new")));

    $("#monitoring-close").click(() => closeFullscreenDialog($("#dialog-monitoring")));

    $("#monitoring-done").click(() => {

        monitoring     = $("input[name='monitoring']:checked").val();
        monitoringList = cleanArray(monitoringListNew);

        $("#monitoring-text-expert").html("Edit the monitoring works");

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

        if (checked === "Direct damage")
            $("#damages-wrapper").show();
        else
            $("#damages-wrapper").hide();

    });

    $("#damages-add").click(() => openDialog($("#dialog-damages-new")));

    $("#damages-close").click(() => closeFullscreenDialog($("#dialog-damages")));

    $("#damages-done").click(() => {

        damages     = $("input[name='damages']:checked").val();
        damagesList = cleanArray(damagesListNew);

        $("#damages-text-expert").html("Edit the damages");

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
            console.log("You must specify"); // ToDo
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

        $("#notes-text-expert").html("Edit your additional notes");

        closeFullscreenDialog($("#dialog-notes"))

    });

}


// Photo
function initPhotoDialog() {

    // ToDo

}


///////////////////////
// UTILITY FUNCTIONS //
///////////////////////

function openFullscreenDialog(dialog) {
    dialog.show();
}

function closeFullscreenDialog(dialog) {
    dialog.hide();
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


function changeSelectorLabel(selectorId) {  //mitigation-status-select

    let id        = "#" + selectorId,
        $selector = $(id),
        label     = $("[for='" + selectorId + "'").find(".label-description");

    if ($selector.val() === "none")
        label.html("Select an option"); // ToDo change using i18n
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
        "<span class='list-item-entry-title'>Tipologia:</span> " + type +
        "</p>" +
        "<p class='list-item-text-p'>" +
        "<span class='list-item-entry-title'>Stato:</span> " + status +
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

    monitoringListNew.push({
        type: type
    });

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

    if (photo === "")
        $("#def-photo-preview").attr("src", "img/img-placeholder-200.png");

    else
        $("#def-photo-preview").attr("src", "data:image/jpeg;base64," + photo);
}