"use strict";

const mongoose = require("mongoose"), // Import the module for the db handling
      Schema   = mongoose.Schema;     // Save the "schema" object

// Create the object that models a single landslide
const landslideSchema = new Schema({
    user               : { type: Schema.Types.ObjectId, ref: "User" },
    markedForDeletion  : { type: Boolean, default: false },
    checked            : { type: Boolean, default: false },
    expert             : Boolean,
    coordinates        : [Number],
    preciseCoordinates : [Number],
    coordinatesAccuracy: Number,
    altitude           : Number,
    altitudeAccuracy   : Number,
    type               : String,
    materialType       : String,
    hillPosition       : String,
    water              : String,
    vegetation         : String,
    mitigation         : String,
    mitigationList     : [Object],
    monitoring         : String,
    monitoringList     : [Object],
    damages            : String,
    damagesList        : [Object],
    notes              : String,
    imageUrl           : String
}, { timestamps: true });

// Export the model
module.exports = mongoose.model("Landslide", landslideSchema);
