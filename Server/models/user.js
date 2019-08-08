"use strict";

const mongoose = require("mongoose"),
      Schema   = mongoose.Schema;

const userSchema = new Schema({
    email                      : {
        type  : String,
        unique: true
    },
    password                   : String,
    age                        : String,
    gender                     : String,
    occupation                 : String,
    isConfirmed                : {
        type   : Boolean,
        default: false
    },
    landslides             : [{
        type: Schema.Types.ObjectId,
        ref : "Landslide"
    }],
    imageUrl                   : String,
    confirmEmailToken          : String,
    confirmEmailTokenExpiration: Date,
    resetPwToken               : String,
    resetPwTokenExpiration     : Date
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);