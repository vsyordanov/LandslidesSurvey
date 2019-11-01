"use strict";

// Built in modules for path manipulation
const fs   = require("fs"),
      path = require("path");

const Landslide            = require("../models/landslide"),     // Model of the landslide
      User                 = require("../models/user"),          // Model of the user
      { validationResult } = require("express-validator/check"); // Module for retrieving the validation results


/* Retrieves all the landslides. */
exports.getLandslides = (req, res, next) => {

    // Find all the landslides
    Landslide.find({})
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


/* Retrieves all the landslides mapped by a user. */
exports.getUserLandslides = (req, res, next) => {

    // Extract the id form the request
    const id = req.params.userId;

    // If the id of the user is not the one of the calling user, throw a 401 error
    if (id !== req.userId) {
        const error      = new Error("Not authorized.");
        error.statusCode = 401;
        throw error;
    }

    // Find all the landslides of the user that are not marked for deletion
    Landslide.find({ user: id, markedForDeletion: false })
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


/* Retrieves a single landslide. */
exports.getLandslide = (req, res, next) => {

    // Extract the id form the request
    const id = req.params.landslideId;

    // Find the landslide by id
    Landslide.findById(id)
        .then(landslide => {

            // If no landslide is found, throw a 404 error
            if (!landslide) {
                const error      = new Error("Could not find landslide.");
                error.statusCode = 404;
                throw error;
            }

            // If the user who has mapped the landslide is not the calling user, throw a 401 error
            if (landslide.user.toString() !== req.userId) {
                const error      = new Error("Not authorized.");
                error.statusCode = 401;
                throw error;
            }

            // Send a success response
            res.status(200).json({ message: "Landslide found!", landslide: landslide });

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


/* Inserts a new landslides into the database. */
exports.postLandslide = (req, res, next) => {

    // Extract the validation results
    const errors = validationResult(req);

    // If there are some validation errors, throw a 422 error
    if (!errors.isEmpty()) {
        const error      = new Error("Landslide validation failed. Entered data is incorrect.");
        error.errors     = errors.array();
        error.statusCode = 422;
        throw error;
    }

    // If no image has been passed with the request, throw a 422 error
    if (!req.file) {
        const error      = new Error("Landslide validation failed. Entered data is incorrect.");
        error.errors     = [{ location: "body", msg: "You must provide a photo", param: "imageUrl", value: "" }];
        error.statusCode = 422;
        throw error;
    }

    // Create a new landslide
    const landslide = new Landslide({
        user               : req.userId,
        expert             : req.body.expert,
        coordinates        : JSON.parse(req.body.coordinates),
        coordinatesAccuracy: req.body.coordinatesAccuracy,
        altitude           : req.body.altitude,
        altitudeAccuracy   : req.body.altitudeAccuracy,
        type               : req.body.type,
        materialType       : req.body.materialType,
        hillPosition       : req.body.hillPosition,
        water              : req.body.water,
        vegetation         : req.body.vegetation,
        mitigation         : req.body.mitigation,
        mitigationList     : JSON.parse(req.body.mitigationList),
        monitoring         : req.body.monitoring,
        monitoringList     : JSON.parse(req.body.monitoringList),
        damages            : req.body.damages,
        damagesList        : JSON.parse(req.body.damagesList),
        notes              : req.body.notes,
        imageUrl           : req.file.path.replace("\\", "/")
    });

    // Save the new landslide
    landslide.save()
        .then(() => {

            // Find the user that has mapped the landslide
            return User.findById(req.userId);

        })
        .then(user => {

            // Save the landslide among the user's ones
            user.landslides.push(landslide);

            // Update the user
            return user.save();

        })
        .then(() => {

            // Send a successful response
            res.status(201).json({ message: "Landslide created", landslide: landslide });

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


/* Updates an existing landslide. */
exports.updateLandslide = (req, res, next) => {

    // Extract the id form the request
    const id = req.params.landslideId;

    // Extract the validation results
    const errors = validationResult(req);

    // If there are some validation errors, throw a 422 error
    if (!errors.isEmpty()) {
        const error      = new Error("Landslide validation failed. Entered data is incorrect.");
        error.errors     = errors.array();
        error.statusCode = 422;
        throw error;
    }

    // Find the landslide by id
    Landslide.findById(id)
        .then(landslide => {

            // If no landslide is found, throw a 404 error
            if (!landslide) {
                const error      = new Error("Could not find landslide.");
                error.statusCode = 404;
                throw error;
            }

            // If the user who has mapped the landslide is not the calling user, throw a 401 error
            if (landslide.user.toString() !== req.userId) {
                const error      = new Error("Not authorized.");
                error.statusCode = 401;
                throw error;
            }

            // Save the new values
            landslide.type           = req.body.type;
            landslide.materialType   = req.body.materialType;
            landslide.hillPosition   = req.body.hillPosition;
            landslide.water          = req.body.water;
            landslide.vegetation     = req.body.vegetation;
            landslide.mitigation     = req.body.mitigation;
            landslide.mitigationList = JSON.parse(req.body.mitigationList);
            landslide.monitoring     = req.body.monitoring;
            landslide.monitoringList = JSON.parse(req.body.monitoringList);
            landslide.damages        = req.body.damages;
            landslide.damagesList    = JSON.parse(req.body.damagesList);
            landslide.notes          = req.body.notes;

            // If a new photo is provided
            if (req.file) {

                // Delete the old one
                clearImage(landslide.imageUrl);

                // Set the new one
                landslide.imageUrl = req.file.path.replace("\\", "/");

            }

            // Update the landslide
            return landslide.save();

        })
        .then(result => {

            // Send a successful response
            res.status(200).json({ message: "Landslide updated.", landslide: result })

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


/* Deletes a landslide from the database. The entry will not be removed, it will just be marked for deletion. */
exports.deleteLandslide = (req, res, next) => {

    // Extract the id form the request
    const id = req.params.landslideId;

    // Find the landslide by id
    Landslide.findById(id)
        .then(landslide => {

            // If no landslide is found, throw a 404 error
            if (!landslide) {
                const error      = new Error("Could not find landslide.");
                error.statusCode = 404;
                throw error;
            }

            // If the user who has mapped the landslide is not the calling user, throw a 401 error
            if (landslide.user.toString() !== req.userId) {
                const error      = new Error("Not authorized.");
                error.statusCode = 401;
                throw error;
            }

            // Mark the entry for deletion
            landslide.markedForDeletion = true;

            // Update the landslide
            return landslide.save();

        })
        .then(() => {

            // Send a success response
            res.status(200).json({ message: "Landslide successfully deleted." });

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


/* Utility function for deleting an image from the local storage */
const clearImage = filePath => {

    // Compute the complete path
    filePath = path.join(__dirname, "..", filePath);

    // Remove the image
    fs.unlink(filePath, err => {console.error(err)});

};