"use strict";

/**
 * _id: String,
 * createdAt: String,
 * UpdatedAt: String,
 * user: {Object},
 * markedForDeletion: Boolean,
 * checked: Boolean,
 * expert: Boolean
 * coordinates: [Float, Float],
 * coordinatesAccuracy: Float,
 * altitude: Float,
 * altitudeAccuracy: Float,
 * lsType: String,
 * materialType: String,
 * hillPosition: String,
 * water: String,
 * vegetation: String,
 * mitigation: String,
 * mitigationsList: [{type: String}],
 * monitoring: String,
 * monitoringList: [{type: String, status: String}],
 * damages: String,
 * damagesList: [{type: String, specification: String ?}],
 * notes: String
 * imageUrl: String
 *
 */

const mongoose = require("mongoose"),
      Schema   = mongoose.Schema;

const landslideSchema = new Schema({
    user               : Object,
    markedForDeletion  : { type: Boolean, default: false },
    checked            : { type: Boolean, default: false },
    expert             : Boolean,
    coordinates        : [Number],
    coordinatesAccuracy: Number,
    altitude           : Number,
    altitudeAccuracy   : Number,
    lsType             : String,
    materialType       : String,
    hillPosition       : String,
    water              : String,
    vegetation         : String,
    mitigation         : String,
    mitigationsList    : [Object],
    monitoring         : String,
    monitoringList     : [Object],
    damages            : String,
    damagesList        : [Object],
    notes              : String,
    image              : String
}, { timestamps: true });

module.exports = mongoose.model("Landslide", landslideSchema);