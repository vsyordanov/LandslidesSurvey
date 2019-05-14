"use strict";

const dateOptions = {
    year  : "numeric",
    month : "2-digit",
    day   : "2-digit",
    hour  : "2-digit",
    minute: "2-digit",
    second: "2-digit"
};

let lsData,
    $placeholders = $("#ls-info .placeholder");


function initInfo() {

    $("#info-close").click(() => closeInfo());

    $("#info-photo-thm").click(function () {
        openImgScreen($(this).attr("src"));
    });

}


function openInfo(id) {

    $placeholders.addClass("ph-animate");

    $("#ls-info").show();

    let request = db.transaction("landslides", "readwrite").objectStore("landslides").get(id);

    request.onerror = err => {
        console.error("Retrieving ls failed", err);
        closeInfo();
        createAlertDialog(i18n.t("dialogs.info.getLocalLsError"), i18n.t("dialogs.btnOk"));
    };

    request.onsuccess = e => {

        lsData = e.target.result;

        $("#info-delete")
            .show()
            .unbind("click")
            .click(() => {
                createAlertDialog(
                    i18n.t("dialogs.deleteConfirmation"),
                    i18n.t("dialogs.btnCancel"),
                    null,
                    i18n.t("dialogs.btnOk"),
                    () => deleteLandslide(lsData._id, lsData.photo)
                );
            });

        $("#info-edit")
            .show()
            .unbind("click")
            .click(() => {
                openInsert(lsData);
            });

        if (!lsData.expert) {
            $("#info-hillPosition").hide();
            $("#info-vegetation").hide();
            $("#info-mitigationsList").hide();
            $("#info-monitoring").hide();
            $("#info-monitoringList").hide();
            $("#info-damages").hide();
            $("#info-damagesList").hide();
            $("#info-notes").hide();
        } else {
            if (lsData.mitigation !== "yes") $("#info-mitigationsList").hide();
            if (lsData.monitoring !== "yes") $("#info-monitoringList").hide();
            if (lsData.damages !== "directDamage") $("#info-damagesList").hide();
        }

        showInfo();

    }
}

function closeInfo() {

    $("#ls-info").scrollTop(0).hide();

    $("#ls-info .ph-hidden-content").hide();
    $placeholders.removeClass("ph-animate").show();

    $("#info-delete").hide();
    $("#info-edit").hide();

    $(".info-block").show();

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
    $("#info-photo-preview").attr("src", "img/broken-img-placeholder-200.png");

    lsData = undefined;

}


function showInfo() {

    for (let key in lsData) {

        if (lsData.hasOwnProperty(key))

            $("#info-" + key + " .info-content").html(() => {

                let val = lsData[key];

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
                        if (val === 0 || val === null)
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

    // ToDo delete
    if (!isCordova) {
        $placeholders.hide().removeClass("ph-animate");
        $("#ls-info .ph-hidden-content").show();
        return;
    }

    showPhoto();

}


function showPhoto() {

    findDirectories(
        true,
        photoDir => {

            photoDir.getFile(lsData.photo, { create: false },
                file => {

                    $("#info-photo-thm").attr("src", file.nativeURL);
                    $placeholders.hide().removeClass("ph-animate");
                    $("#ls-info .ph-hidden-content").show();

                },
                err => {

                    $placeholders.hide().removeClass("ph-animate");
                    $("#ls-info .ph-hidden-content").show();

                    console.error("Error getting the photo", err);
                    createAlertDialog(i18n.t("dialogs.info.getLocalPhotoError"), i18n.t("dialogs.btnOk"));

                }
            );

        },
        () => {
            createAlertDialog(i18n.t("dialogs.info.getLocalPhotoError"), i18n.t("dialogs.btnOk"));
            $placeholders.hide().removeClass("ph-animate");
            $("#ls-info .ph-hidden-content").show();
        }
    );

}