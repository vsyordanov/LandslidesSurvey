"use strict";

const dateOptions = {
    year  : "numeric",
    month : "2-digit",
    day   : "2-digit",
    hour  : "2-digit",
    minute: "2-digit",
    second: "2-digit"
};

let $placeholders       = $("#ls-info .placeholder"),
    $infoPhotoContainer = $("#ls-info .photo-container");

let infoData   = undefined,
    infoPhotos = undefined;


function initInfo() {
    $("#info-close").click(() => closeInfo());
}


function openInfo(id) {

    $placeholders.addClass("ph-animate");

    $("#ls-info").show();

    let request = db.transaction("landslides", "readwrite").objectStore("landslides").get(id);

    request.onerror = e => {
        logOrToast("Retrieving ls failed", e);
        closeInfo();
    };

    request.onsuccess = e => {

        infoData = e.target.result;

        $("#info-delete")
            .show()
            .unbind("click")
            .click(() => deleteLandslide(infoData._id, infoPhotos));

        $("#info-edit")
            .show()
            .unbind("click")
            .click(() => {
                $("#ls-info").scrollTop(0);
                openInsert(infoData);
            });

        if (!infoData.expert) {
            $("#info-hillPosition").hide();
            $("#info-vegetation").hide();
            $("#info-mitigationsList").hide();
            $("#info-monitoring").hide();
            $("#info-monitoringList").hide();
            $("#info-damages").hide();
            $("#info-damagesList").hide();
            $("#info-notes").hide();
        } else {
            if (infoData.mitigation !== "yes") $("#info-mitigationsList").hide();
            if (infoData.monitoring !== "yes") $("#info-monitoringList").hide();
            if (infoData.damages !== "directDamage") $("#info-damagesList").hide();
        }

        infoPhotos = infoData.images;

        if (infoPhotos.length > 0) {
            if (photoDir)
                showPhoto(0);
            else {
                console.error("Dir not found", photoDir);
                showNextPhoto(999, true);
            }
        } else
            loadComplete();
    }
}

function closeInfo() {

    $("#ls-info").scrollTop(0).hide();

    $(".info-block").show();

    $("#ls-info .ph-hidden-content").hide();
    $placeholders.removeClass("ph-animate").show();

    $("#info-delete").hide();
    $("#info-edit").hide();

    $("#info-createdAt .info-content").html("");
    $("#info-updatedAt .info-content").html("");
    $("#info-coordinates .info-content").html("");
    $("#info-coordinatesAccuracy .info-content").html("");
    $("#info-altitude .info-content").html("");
    $("#info-altitudeAccuracy .info-content").html("");
    $("#info-lsType .info-content").html("");
    $("#info-materialType .info-content").html("");
    $("#info-hillPosition .info-content").html("");
    $("#info-water .info-content").html("");
    $("#info-vegetation .info-content").html("");
    $("#info-mitigation .info-content").html("");
    $("#info-mitigationsList .info-content").html("");
    $("#info-monitoring .info-content").html("");
    $("#info-monitoringList .info-content").html("");
    $("#info-damages .info-content").html("");
    $("#info-damagesList .info-content").html("");
    $("#info-notes .info-content").html("");
    $("#info-photo").html(" <div class='info-photo-ph placeholder'></div>");

    infoData   = undefined;
    infoPhotos = undefined;
    photoError = false;

}


function loadComplete() {
    console.log("Load complete");
    showInfo(infoData);
    $placeholders.hide().removeClass("ph-animate");
    $("#ls-info .ph-hidden-content").show();
}

function showInfo(info) {

    for (let key in info) {

        if (info.hasOwnProperty(key))

            $("#info-" + key + " .info-content").html(() => {

                let val = info[key];

                if (val === "")
                    return "-";

                switch (key) {

                    case "createdAt":
                    case "updatedAt":
                        return new Date(val).toLocaleDateString(ln.language, dateOptions);

                    case "coordinates":
                        return val[0] + ", " + val[1];

                    case "coordinatesAccuracy":
                    case "altitudeAccuracy":
                        if (val === 0)
                            return i18n.t("info.unknown");
                        return val + " " + i18n.t("info.accuracyUnit");

                    case "altitude":
                        if (val === -999)
                            return i18n.t("info.unknown");
                        return val + " " + i18n.t("info.altitudeUnit");

                    case "mitigationsList":
                        if (val.length === 0)
                            return "-";

                        let mitigationContent = "<ul class='info-list'>";
                        for (let i = 0; i < val.length; i++) {
                            mitigationContent = mitigationContent +
                                "<li>" +
                                i18n.t("insert.mitigation.enum." + val[i].type) +
                                "</li>";
                        }
                        mitigationContent = mitigationContent + "</ul>";
                        return mitigationContent;

                    case "monitoringList":
                        if (val.length === 0)
                            return "-";

                        let monitoringContent = "<ul class='info-list'>";
                        for (let i = 0; i < val.length; i++) {
                            monitoringContent = monitoringContent +
                                "<li>" +
                                i18n.t("insert.monitoring.enum." + val[i].type) +
                                " (" + i18n.t("insert.monitoring.enum." + val[i].status) + ")" +
                                "</li>";
                        }
                        monitoringContent = monitoringContent + "</ul>";
                        return monitoringContent;

                    case "damagesList":

                        if (val.length === 0)
                            return "-";

                        let damagesContent = "<ul class='info-list'>";
                        for (let i = 0; i < val.length; i++) {
                            damagesContent = damagesContent + "<li>";

                            if (val[i].type === "other")
                                damagesContent = damagesContent + val[i].specification;
                            else
                                damagesContent = damagesContent + i18n.t("insert.damages.enum." + val[i].type);

                            damagesContent = damagesContent + "</li>";
                        }
                        damagesContent = damagesContent + "</ul>";
                        return damagesContent;

                    case "notes":
                        return val;

                    default:
                        return i18n.t("insert." + key + ".enum." + val);
                }

            });
    }

}


function showPhoto(idx) {

    photoDir.getFile(infoPhotos[idx], { create: false }, file => {

            let dim = ($(window).width() - parseInt($infoPhotoContainer.css("padding-right")) * 2) / 100 * 30;

            let $el = $("<div class='photo-thm-wrapper ph-hidden-content'>" +
                "<img src='" + file.nativeURL + "' alt='Your photo' onclick='openInfoImgScreen($(this))'>" +
                "</div>")
                .height(dim);

            $infoPhotoContainer.append($el);

            showNextPhoto(idx);

        },
        err => {
            console.error("Error getting the photo", err);
            showNextPhoto(idx, true);
        }
    );

}

function showNextPhoto(idx, err = false) {

    if (err)
        photoError = true;

    if (idx < infoPhotos.length - 1) {
        showPhoto(idx + 1);
    } else {
        console.log("Showing...", photoError);
        photoError = false;
        loadComplete();
    }

}

function openInfoImgScreen($img) {

    $("#img-screen-delete").hide();
    $("#img-screen-edit").hide();

    $("#img-screen-container img").attr("src", $img.attr("src"));

    $("#img-screen").show();

}


