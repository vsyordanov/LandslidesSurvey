"use strict";

const mongoose = require("mongoose"), // Import the module for the db handling
      Schema   = mongoose.Schema;     // Save the "schema" object

// Create the object that models a single user
const userSchema = new Schema({
    email                      : { type: String, unique: true },
    password                   : String,
    age                        : String,
    gender                     : String,
    occupation                 : String,
    isConfirmed                : { type: Boolean, default: false },
    landslides                 : [{ type: Schema.Types.ObjectId, ref: "Landslide" }],
    confirmEmailToken          : String,
    confirmEmailTokenExpiration: Date,
    resetPwToken               : String,
    resetPwTokenExpiration     : Date
}, { timestamps: true });

// Return the model
module.exports = mongoose.model("User", userSchema);