"use strict";

// Built in modules for path manipulation
const fs   = require("fs"),
      path = require("path");

const Landslide            = require("../models/landslide"),     // Model of the landslide
      User                 = require("../models/user"),          // Model of the user
      { validationResult } = require("express-validator/check"); // Module for retrieving the validation results


/* Retrieves all the landslides mapped by the calling user. */
exports.getLandslides = (req, res, next) => {

    // Find all the landslides of the user that are not marked for deletion
    Landslide.find({ user: req.userId, markedForDeletion: false })
        .then(landslides => {

            // Send a success response
            res.status(200).json({ message: "Fetched data successfully", landslides: landslides })

        })
        .catch(err => {

            console.error(err);

            // If the error does not have a status code, assign 500 to it
            if (!err.statusCode) {
                err.statusCode = 500;
                err.errors     = ["Something went wrong on the server."];
            }

            // Call the next middleware
            next(err);

        });

};