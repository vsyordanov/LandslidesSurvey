"use strict";

let locality     = "",
    lsType       = "",
    materialType = "",
    water        = "",
    mitigation   = "",
    photo        = "";


function initInsertion(isExpert) {

    if (!isExpert)
        initMainPageBase();

    initLocality();
    initLsTypeDialog();
    initMaterialTypeDialog();
    initWaterDialog();
    initMitigationBaseDialog();

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

    $("#locality-request-base").click(() => {

        console.log("Locality clicked");

    });

    $("#ls-type-request-base").click(() => {

        $("input[name='lsType'][value='" + lsType + "']").prop("checked", "true");

        switchFullscreenDialogs($("#insert-ls-main-base"), $("#dialog-ls-type"));

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


//Locality
function initLocality() {

    // ToDo

}

// Ls type
function initLsTypeDialog() {

    $("#ls-type-close").click(() => switchFullscreenDialogs($("#dialog-ls-type"), $("#insert-ls-main-base")));

    $("#ls-type-done").click(() => {

        lsType = $("input[name='lsType']:checked").val();
        $("#ls-type-text-base").html(lsType);

        switchFullscreenDialogs($("#dialog-ls-type"), $("#insert-ls-main-base"));

    });

}

// Material type
function initMaterialTypeDialog() {

    $("#material-type-cancel").click(() => closeDialog($("#dialog-material-type")));

    $("#material-type-ok").click(() => {

        materialType = $("input[name='materialType']:checked").val();
        $("#material-type-text-base").html(materialType);

        closeDialog($("#dialog-material-type"));

    });

}

// Water
function initWaterDialog() {

    $("#water-cancel").click(() => closeDialog($("#dialog-water")));

    $("#water-ok").click(() => {

        water = $("input[name='water']:checked").val();
        $("#water-text-base").html(water);

        closeDialog($("#dialog-water"));

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


///////////////////////
// UTILITY FUNCTIONS //
///////////////////////

function switchFullscreenDialogs(toHide, toShow) {
    toShow.show();
    toHide.hide();
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

function previewPhoto(photo) {

    if (photo === "")
        $("#def-photo-preview").attr("src", "img/img-placeholder-200.png");

    else
        $("#def-photo-preview").attr("src", "data:image/jpeg;base64," + photo);
}