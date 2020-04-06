"use strict";

// Built in modules for path manipulation
const fs   = require("fs"),
      path = require("path");

// Module for encrypting the token
const crypto = require("crypto");

const User                 = require("../models/user"),          // Model of the user
      mails                = require("../utils/mails"),          // Utility for sending the mail
      { validationResult } = require("express-validator/check"), // Module for retrieving the validation results
      bcrypt               = require("bcryptjs");                // Module for encrypting/decrypting the password

// Save the mail transporter
const transporter = mails.transporter();


/* Retrieve the data of a user. */
exports.getUser = (req, res, next) => {

    // Extract the id of the user
    const id = req.params.userId;

    // If the id of the user is not the one of the calling user, return
    if (id !== req.userId) {
        const error      = new Error("Not authorized.");
        error.statusCode = 401;
        throw error;
    }

    // Find the user by id
    User.findById(id)
        .then(user => {

            // If no user is found, throw a 404 error
            if (!user) {
                const error      = new Error("Could not find the user.");
                error.statusCode = 404;
                throw error;
            }

            // Send a successful response
            res.status(200).json({
                message: "User found.",
                user   : {
                    email     : user.email,
                    age       : user.age,
                    gender    : user.gender,
                    occupation: user.occupation,
                    imageUrl  : user.imageUrl
                }
            })

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

        })
};


/* Change the email of a user. */
exports.changeEmail = (req, res, next) => {

    // Extract the id form the request
    const id = req.params.userId;

    // If the id of the user is not the one of the calling user, return
    if (id !== req.userId) {
        const error      = new Error("Not authorized.");
        error.statusCode = 401;
        throw error;
    }

    // Extract the validation results
    const errors = validationResult(req);

    // If there are some validation errors, throw a 422 error
    if (!errors.isEmpty()) {

        // If the email is already in use, send error 409
        if (errors.array()[0].msg === "This email address is already registered.")
            res.status(409).json({ message: "This email address is already registered." });

        // Else, send error 422
        else
            res.status(422).json({
                message: "Registration validation failed. Entered data is incorrect.",
                errors : errors.array()
            });

    }

    // Save the new main
    const newEmail = req.body.email;

    // Temporary variables for the old mail, the found user and the token
    let oldEmail    = null,
        updatedUser = null,
        token;

    // Find the user by id
    User.findById(id)
        .then(user => {

            // If no user is found, throw a 404 error
            if (!user) {
                const error      = new Error("Could not find the user.");
                error.statusCode = 404;
                throw error;
            }

            // Save the old mail
            oldEmail = user.email;

            // Set the new mail
            user.email = newEmail;

            // Set is confirmed to false
            user.isConfirmed = false;

            // Create a new token
            token = crypto.randomBytes(32).toString("hex");

            // Save the token
            user.confirmEmailToken = token;

            // Set the expiration date of the token (24h)
            user.confirmEmailTokenExpiration = Date.now() + 86400000;

            // Update the user
            return user.save();

        })
        .then(user => {

            // Save the new version of the user
            updatedUser = user;

            // Send the confirmation email
            return transporter.sendMail({
                to     : newEmail,
                from   : mails.senderAddress,
                subject: "Welcome to DefibrillatorHunter! Confirm your email.",
                text   : `Click here to confirm your mail:\nhttp://${req.headers.host}/auth/confirmation/${user.confirmEmailToken}`,
                html   : mails.generateConfirmEmailContent(`http://${req.headers.host}/auth/confirmation/${user.confirmEmailToken}`)
            });

        })
        .then(() => {

            // Send a successful response
            res.status(200).json({ message: "Email updated.", userId: updatedUser._id })

        })
        .catch(err => {

            console.error(err);

            // If the error does not have a status code, assign 500 to it
            if (!err.statusCode) {
                err.statusCode = 500;
                err.errors     = ["Something went wrong on the server."];
            }

            // If the error has occurred before the user was updated
            if (!updatedUser) {

                // Call the next middleware
                next(err);

                // Return
                return;
            }

            console.log("User already updated. Rolling back...");

            // Find the user by id
            User.findById(updatedUser._id)
                .then(user => {

                    // If no user is found, throw an error
                    if (!user) throw new Error("Could not find user.");

                    // Set back the old mail
                    user.email = oldEmail;

                    // Set is confirmed to true
                    user.isConfirmed = true;

                    // Update the user
                    return user.save();

                })
                .then(() => {

                    // Send an error response
                    res.status(500).json({ message: "Something went wrong on the server. Rolling back..." });

                })
                .catch(err => {

                    console.log(err);

                    // If the error does not have a status code, assign 500 to it
                    if (!err.statusCode) {
                        err.statusCode = 500;
                        err.errors     = ["Something went wrong on the server."];
                    }

                    // Call the next middleware
                    next(err);

                });
        })

};


/* Change the password of a user. */
exports.changePassword = (req, res, next) => {

    // Extract the id form the request
    const id = req.params.userId;

    // If the id of the user is not the one of the calling user, return
    if (id !== req.userId) {
        const error      = new Error("Not authorized.");
        error.statusCode = 401;
        throw error;
    }

    // Extract the validation results
    const errors = validationResult(req);

    // If there are some validation errors, throw a 422 error
    if (!errors.isEmpty()) {
        const error      = new Error("Password validation failed. Entered data is incorrect.");
        error.errors     = errors.array();
        error.statusCode = 422;
        throw error;
    }

    // Save the old and the new password
    const oldPassword = req.body.oldPassword,
          newPassword = req.body.newPassword;

    // Temporary variable for storing the loaded user
    let loadedUser;

    // Find a user by id
    User.findById(id)
        .then(user => {

            // If no user is found, throw a 404 error
            if (!user) {
                const error      = new Error("Could not find the user.");
                error.statusCode = 404;
                throw error;
            }

            // Save the user
            loadedUser = user;

            // Check if the old password is right
            return bcrypt.compare(oldPassword, user.password);

        })
        .then(isEqual => {

            // IF the password is wrong, throw a 401 error
            if (!isEqual) {
                const error      = new Error("Wrong password.");
                error.statusCode = 401;
                throw error;
            }

            // Encrypt the new password
            return bcrypt.hash(newPassword, 12);

        })
        .then(hashPw => {

            // Set the new password
            loadedUser.password = hashPw;

            // Update the user
            return loadedUser.save();

        })
        .then(() => {

            // Send a successful response
            res.status(200).json({ message: "Password changed successfully." });

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

        })

};


/* Updates the information of a user. */
exports.updateProfile = (req, res, next) => {

    // Extract the id form the request
    const id = req.params.userId;

    // If the id of the user is not the one of the calling user, return
    if (id !== req.userId) {
        const error      = new Error("Not authorized.");
        error.statusCode = 401;
        throw error;
    }

    // Extract the validation results
    const errors = validationResult(req);

    // If there are some validation errors, throw a 422 error
    if (!errors.isEmpty()) {
        const error      = new Error("Data validation failed. Entered data is incorrect.");
        error.errors     = errors.array();
        error.statusCode = 422;
        throw error;
    }

    // Save the data
    const age        = req.body.age,
          gender     = req.body.gender,
          occupation = req.body.occupation;

    // Find a user by id
    User.findById(id)
        .then(user => {

            // If no user is found, throw a 404 error
            if (!user) {
                const error      = new Error("Could not find the user.");
                error.statusCode = 404;
                throw error;
            }

            // Set the new data
            user.age        = age;
            user.gender     = gender;
            user.occupation = occupation;

            // Update the user
            return user.save();

        })
        .then(result => {

            // Send a successful response
            res.status(200).json({
                message: "User updated.",
                user   : { age: result.age, gender: result.gender, occupation: result.occupation, }
            })

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

        })

};
