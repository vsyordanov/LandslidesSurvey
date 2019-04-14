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

    constructor(id, creationDate, lastModified, isExpert, position, altitude, accuracy, lsType, materialType,
                crestPosition, water, vegetation, mitigation, mitigationsList, monitoring, monitoringList, damages,
                damagesList, notes, hasPhoto) {

        this._id             = id;
        this.creationDate    = creationDate;
        this.lastModified    = lastModified;
        this.isExpert        = isExpert;
        this.position        = position;
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
            this.position, {
                icon     : landslideIcon,
                draggable: false
            }
        );
        marker._id = this._id;

        marker.on("click", () => {

            console.log(this);

            // this.showInfo();
            // $("#defibrillator-info").show();

        });

        markers.push(marker);

        marker.addTo(map);

        return marker;

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