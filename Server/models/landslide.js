"use strict";

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