"use strict";

const mongoose = require("mongoose"),
      Schema   = mongoose.Schema;

const landslideSchema = new Schema({
    user               : { type: Schema.Types.ObjectId, ref: "User" },
    markedForDeletion  : { type: Boolean, default: false },
    checked            : { type: Boolean, default: false },
    expert             : Boolean,
    coordinates        : [Number],
    coordinatesAccuracy: Number,
    altitude           : Number,
    altitudeAccuracy   : Number,
    type               : String,
    materialType       : String,
    hillPosition       : String,
    water              : String,
    vegetation         : String,
    mitigation         : String,
    mitigationList    : [Object],
    monitoring         : String,
    monitoringList     : [Object],
    damages            : String,
    damagesList        : [Object],
    notes              : String,
    imageUrl           : String
}, { timestamps: true });

module.exports = mongoose.model("Landslide", landslideSchema);