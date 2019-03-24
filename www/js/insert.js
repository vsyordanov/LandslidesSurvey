// let $mainPageBase                = $("#insert-defibrillator-main"),
//     $dialogLocation              = $("#dialog-location"),
//     $dialogFloor                 = $("#dialog-floor"),
//     $dialogTemporalAccessibility = $("#dialog-temporal-accessibility"),
//     $dialogRecovery              = $("#dialog-recovery"),
//     $dialogSignage               = $("#dialog-signage"),
//     $dialogNotes                 = $("#dialog-notes"),
//     $dialogPresence              = $("#dialog-presence"),
//     $dialogPhoto                 = $("#dialog-photo");


// let locationCategory      = "none",
//     visualReference       = "",
//     floor                 = 0,
//     temporalAccessibility = "h24",
//     recovery              = "Immediate",
//     signage               = "Great",
//     brand                 = "",
//     notes                 = "",
//     presence              = "Yes",
//     photo                 = "";


// Main page base
function initMainPageBase() {

    $("#new-ls-base-close").click(() => {

        $("#insert-ls").hide();
        $("#map").show();

    });

    $("#new-ls-base-done").click(() => {

        console.log("Insert done");

    });

    $("#locality-request").click(() => {

        console.log("Locality clicked");

    });

}




// Location category

let $locationSelect = $("#location-select");

$("#location-category-request").click(() => {

    switchFullscreenDialogs($mainPageBase, $dialogLocation);

    // When the dialog open the values of the fields must be set to the selected once, to avoid having different
    // values if the user closes the dialog having made some changes

    $locationSelect.get(0).selectedIndex = $locationSelect.find("option[value=" + locationCategory + "]").index();
    changeLocationSelectLabel();

    $("#location-reference").val(visualReference);

});

$locationSelect.change(() => changeLocationSelectLabel());

$("#location-close").click(() => switchFullscreenDialogs($dialogLocation, $mainPageBase));

$("#location-done").click(() => {

    locationCategory = $("#location-select").val();

    if (locationCategory === "none") {
        console.log("Category none"); // ToDo handle error
        return;
    }

    visualReference = $("#location-reference").val();
    $("#location-text").html(locationCategory);

    switchFullscreenDialogs($dialogLocation, $mainPageBase);

});


// Floor

let $floorCounterValue = $("#floor-counter-value");
let newFloor           = floor;

$("#floor-request").click(() => {

    $floorCounterValue.html(floor.toString());
    newFloor = floor;

    openDialog($dialogFloor);

});

$("#floor-counter-add").click(() => {

    if (newFloor === 10)
        return;

    newFloor++;
    $floorCounterValue.html(newFloor.toString());

});

$("#floor-counter-sub").click(() => {

    if (newFloor === -4)
        return;

    newFloor--;
    $floorCounterValue.html(newFloor.toString());

});

$("#floor-cancel").click(() => closeDialog($dialogFloor));

$("#floor-ok").click(() => {

    floor = newFloor;
    $("#floor-text").html(floor.toString());

    closeDialog($dialogFloor);

});


// Temporal accessibility

$("#temporal-accessibility-request").click(() => {

    $("input[name='temporalAccessibility'][value='" + temporalAccessibility + "']")
        .prop("checked", "true");

    openDialog($dialogTemporalAccessibility);

});

$("#temporal-cancel").click(() => closeDialog($dialogTemporalAccessibility));

$("#temporal-ok").click(() => {

    temporalAccessibility = $("input[name='temporalAccessibility']:checked").val();
    $("#temporal-text").html(temporalAccessibility);

    closeDialog($dialogTemporalAccessibility);

});


// Recovery

$("#recovery-request").click(() => {

    $("input[name='recovery'][value='" + recovery + "']")
        .prop("checked", "true");

    openDialog($dialogRecovery);

});

$("#recovery-cancel").click(() => closeDialog($dialogRecovery));

$("#recovery-ok").click(() => {

    recovery = $("input[name='recovery']:checked").val();
    $("#recovery-text").html(recovery);

    closeDialog($dialogRecovery);

});


// Signage

$("#signage-request").click(() => {

    $("input[name='signage'][value='" + signage + "']")
        .prop("checked", "true");

    openDialog($dialogSignage);

});

$("#signage-cancel").click(() => closeDialog($dialogSignage));

$("#signage-ok").click(() => {

    signage = $("input[name='signage']:checked").val();
    $("#signage-text").html(signage);

    closeDialog($dialogSignage);

});


// Notes

$("#notes-request").click(() => {

    switchFullscreenDialogs($mainPageBase, $dialogNotes);

    $("#brand").val(brand);
    $("#notes").val(notes);

});

$("#notes-close").click(() => switchFullscreenDialogs($dialogNotes, $mainPageBase));

$("#notes-done").click(() => {

    brand = $("#brand").val();
    notes = $("#notes").val();

    $("#notes-text").html("Edit your additional notes");

    switchFullscreenDialogs($dialogNotes, $mainPageBase);

});


// Presence

$("#presence-request").click(() => {

    $("input[name='presence'][value='" + presence + "']")
        .prop("checked", "true");

    openDialog($dialogPresence);

});

$("#presence-cancel").click(() => closeDialog($dialogPresence));

$("#presence-ok").click(() => {

    presence = $("input[name='presence']:checked").val();
    $("#presence-text").html(presence);

    closeDialog($dialogPresence);

});


// Photo

let $btnCancelPhoto = $("#photo-cancel-btn");

let newPhoto      = "";
let btnCancelTop  = 0,
    btnCancelLeft = 0;

$("#photo-request").click(() => {

    newPhoto = "";
    previewPhoto(photo);

    if (photo !== "")
        $btnCancelPhoto.css("left", btnCancelLeft).css("top", btnCancelTop).show();

    switchFullscreenDialogs($mainPageBase, $dialogPhoto);

});

// ToDO delete
$("#tmp-photo-input").change(() => {

    let file   = $("#tmp-photo-input")[0].files[0];
    let reader = new FileReader();

    if (file)
        reader.readAsDataURL(file);

    reader.onload = function (event) {

        let type    = file.type;
        let dataURL = event.target.result;

        getPictureSuccess(dataURL.substr(dataURL.indexOf(",") + 1));
    }
});

$("#btn-camera").click(() => {
    getPicture(Camera.PictureSourceType.CAMERA);
});

$("#btn-gallery").click(() => {
    getPicture(Camera.PictureSourceType.SAVEDPHOTOALBUM);
});

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
            parseInt($photoPreviewWrapper.css("margin-top")) +
            parseInt($photoPreviewWrapper.css("height")) / 2 -
            imgHeight / 2 -
            parseInt($btnCancelPhoto.css("height")) / 2;


        let left = $(document).width() / 2 +
            imgWidth / 2 -
            parseInt($btnCancelPhoto.css("height")) / 2;

        $btnCancelPhoto.css("left", left).css("top", top).show();
    };

}

function getPictureFail(error) {
    console.log("Picture error: " + error)
}

$btnCancelPhoto.click(() => {

    newPhoto = "";

    $("#photo-cancel-btn").hide();
    previewPhoto(newPhoto);

});

$("#photo-close").click(() => {

    newPhoto = "";
    switchFullscreenDialogs($dialogPhoto, $mainPageBase)

});

$("#photo-done").click(() => {

    photo         = newPhoto;
    newPhoto      = "";
    btnCancelTop  = parseInt($btnCancelPhoto.css("top"));
    btnCancelLeft = parseInt($btnCancelPhoto.css("left"));

    if (photo === "")
        $("#photo-text").html("Add a photo");
    else
        $("#photo-text").html("Edit your photo");

    switchFullscreenDialogs($dialogPhoto, $mainPageBase);

});


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

// function changeLocationSelectLabel() {
//
//     let label = $("[for='location-select']").find(".label-description");
//
//     if ($locationSelect.val() === "none")
//         label.html("Select a category");
//     else
//         label.html($locationSelect.find("option:selected").text());
// }

function previewPhoto(photo) {

    if (photo === "")
        $("#def-photo-preview").attr("src", "img/img-placeholder-200.png");

    else
        $("#def-photo-preview").attr("src", "data:image/jpeg;base64," + photo);
}