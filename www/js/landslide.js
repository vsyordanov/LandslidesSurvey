"use strict";


/**
 * _id: String,
 * creationDate: String,
 * lastModified: String,
 * isExpert: Boolean,
 * position: [Float, Float]
 * altitude: Float,
 * accuracy: Float,
 * lsType: String,
 * materialType: String ?,
 * crestPosition: String ?,
 * water: String ?,
 * vegetation: String ?,
 * mitigation: String ?,
 * mitigationsList: [{type: String, status: String}] ?,
 * monitoring: String ?,
 * monitoringList: [String] ?,
 * damages: String ?,
 * damagesList: [{type: String, specification: String ?}] ?,
 * notes: String ?,
 * hasPhoto: Boolean
 *  _attachments: {
 *      "image": {
 *          content_type: "image\/jpeg",
 *          data: Data
 *      }
 *  }
 *
 */


class Landslide {

    constructor(id, creationDate, lastModified, isExpert, coordinates, altitude, accuracy, lsType, materialType,
                crestPosition, water, vegetation, mitigation, mitigationsList, monitoring, monitoringList, damages,
                damagesList, notes, hasPhoto) {

        this._id             = id;
        this.creationDate    = creationDate;
        this.lastModified    = lastModified;
        this.isExpert        = isExpert;
        this.coordinates     = coordinates;
        this.altitude        = altitude; // Altitude of the position in meters, relative to sea level
        this.accuracy        = accuracy;
        this.lsType          = lsType;
        this.materialType    = materialType;
        this.crestPosition   = crestPosition;
        this.water           = water;
        this.vegetation      = vegetation;
        this.mitigation      = mitigation;
        this.mitigationsList = mitigationsList;
        this.monitoring      = monitoring;
        this.monitoringList  = monitoringList;
        this.damages         = damages;
        this.damagesList     = damagesList;
        this.notes           = notes;
        this.hasPhoto        = hasPhoto;
    }


    addAttachment(photo) {

        this._attachments = {
            "image": {
                content_type: "image/jpeg",
                data        : photo
            }
        }

    }


    insert() {

        // Insert the data in the local database
        localDb.put(this, err => {

            // If an error occurs, insert the data in the remote database
            if (err) {

                showAlert("messages.localStorageError");

                pointsDB.put(this, err => {

                    if (err) {

                        showAlert("messages.generalError");
                        console.log(err);

                    } else {

                        showAlert("messages.contributionSuccess");
                        this.show();

                    }

                });

            }

            // If there is no error, as soon as the connection is available, replicate the document in the remote db
            else {

                // if (networkState === Connection.NONE || navigator.onLine === false)
                //     showAlert("messages.contributionSuccessNoInternet");
                // else
                //     showAlert("messages.contributionSuccess");

                showAlert("messages.contributionSuccess");
                this.show();

                localDb.replicate
                    .to(pointsDB, {retry: true})
                    .on("complete", () => {

                        console.log("Replication success");

                        localDb.destroy().then(() => {
                            localDb = new PouchDB(LOCAL_DB);
                        });

                    })
                    .on("error", err => console.log("Replication error: " + err));
            }

        });

    }


    show() {

        let marker = L.marker(
            this.coordinates, {
                icon     : landslideIcon,
                draggable: false
            }
        );
        marker._id = this._id;

        marker.on("click", () => this.openInfo());

        markers.push(marker);

        marker.addTo(map);

        return marker;

    }


    openInfo() {

        if (this.isExpert) {

            $("#info-position").show();
            $("#info-vegetation").show();
            $("#info-monitoring").show();
            $("#info-damages").show();
            $("#info-notes").show();

            if (this.mitigation === "yes")
                $("#info-mitigation-list").show();
            else
                $("#info-mitigation-list").hide();

            if (this.monitoring === "yes")
                $("#info-monitoring-list").show();
            else
                $("#info-monitoring-list").hide();

            if (this.damages === "directDamage")
                $("#info-damages-list").show();
            else
                $("#info-damages-list").hide();

        } else {

            $("#info-position").hide();
            $("#info-vegetation").hide();
            $("#info-mitigation-list").hide();
            $("#info-monitoring").hide();
            $("#info-monitoring-list").hide();
            $("#info-damages").hide();
            $("#info-notes").hide();
            $("#info-damages-list").hide();

        }

        this.showInfo();
        $("#ls-info").show();

    }


    showInfo() {

        $("#info-edit").unbind("click").click(() => console.log("Edit"));

        $("#info-id .info-content").html(this._id);

        $("#info-creation-date .info-content").html(this.creationDate);

        $("#info-last-modified .info-content").html(this.lastModified);

        $("#info-coordinates .info-content").html(Landslide.generateInfo("coordinates", this.coordinates));

        $("#info-altitude .info-content").html(this.altitude);

        $("#info-accuracy .info-content").html(this.accuracy);

        $("#info-ls-type .info-content").html(Landslide.generateInfo("lsType", this.lsType));

        $("#info-material .info-content").html(Landslide.generateInfo("material", this.materialType));

        $("#info-position .info-content").html(Landslide.generateInfo("position", this.crestPosition));

        $("#info-water .info-content").html(Landslide.generateInfo("water", this.water));

        $("#info-vegetation .info-content").html(Landslide.generateInfo("vegetation", this.vegetation));

        $("#info-mitigation .info-content").html(Landslide.generateInfo("mitigation", this.mitigation));

        $("#info-mitigation-list .info-content")
            .html(Landslide.generateInfo("mitigationList", this.mitigationsList));

        $("#info-monitoring .info-content").html(Landslide.generateInfo("monitoring", this.monitoring));

        $("#info-monitoring-list .info-content")
            .html(Landslide.generateInfo("monitoringList", this.monitoringList));

        $("#info-damages .info-content").html(Landslide.generateInfo("damages", this.damages));

        $("#info-damages-list .info-content")
            .html(Landslide.generateInfo("damagesList", this.damagesList));

        $("#info-notes .info-content").html(Landslide.generateInfo("notes", this.notes));

        if (!this.hasPhoto) {
            $("#info-photo-preview").attr("src", "img/no-img-placeholder-200.png");
        } else {
            let photoSrc = REMOTE_POINTS_DB + "/" + this._id + "/image";

            if (isApp)
                photoSrc = HOSTED_POINTS_DB + "/" + this._id + "/image";

            $("#info-photo-preview").attr("src", photoSrc);
        }

        $("#info-btn-cancel").click(() => this.cancel());

    }


    edit() {

    }


    cancel() {

    }


    static generateInfo(category, val) {

        if (val === "" || val === [])
            return "-";

        if (category === "coordinates")
            return val[0] + ", " + val[1];

        if (category === "mitigationList") {

            if (val.length === 0)
                return "-";

            let content = "<ul class='info-list'>";

            for (let i = 0; i < val.length; i++) {
                content = content +
                    "<li>" +
                    i18n.t("insert.mitigation.enum." + val[i].type) +
                    " (" + i18n.t("insert.mitigation.enum." + val[i].status) + ")" +
                    "</li>";
            }

            content = content + "</ul>";

            return content;
        }

        if (category === "monitoringList") {

            if (val.length === 0)
                return "-";

            let content = "<ul class='info-list'>";

            for (let i = 0; i < val.length; i++) {
                content = content +
                    "<li>" +
                    i18n.t("insert.monitoring.enum." + val[i]) +
                    "</li>";
            }

            content = content + "</ul>";

            return content;
        }

        if (category === "damagesList") {

            if (val.length === 0)
                return "-";

            let content = "<ul class='info-list'>";

            for (let i = 0; i < val.length; i++) {
                content = content + "<li>";

                if (val[i].type === "other")
                    content = content + val[i].specification;
                else
                    content = content + i18n.t("insert.mitigation.enum." + val[i].type);

                content = content + "</li>";
            }

            content = content + "</ul>";

            return content;
        }

        if (category === "notes")
            return val;

        return i18n.t("insert." + category + ".enum." + val);

    }


    // Uses the cryptographically secure random number generator
    static generateUID() {

        let array = new Uint32Array(6);
        let uid   = '';

        window.crypto.getRandomValues(array);

        for (let i = 0; i < array.length; i++) {
            uid += (i < 2 || i > 5 ? '' : '-') + array[i].toString(16).slice(-4)
        }

        return uid
    }

}