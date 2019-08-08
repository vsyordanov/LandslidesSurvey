"use strict";

const crypto = require("crypto"); // Module for encrypting the token

const User                 = require("../models/user"),          // Model of the user
      mail                 = require("../utils/mails"),           // Utility for sending the mail
      { validationResult } = require("express-validator/check"), // Module for retrieving the validation results
      bcrypt               = require("bcryptjs"),                // Module for encrypting/decrypting the password
      jwt                  = require("jsonwebtoken");            // Module for creating and compare tokens

// Save the amil transporter
const transporter = mail.transporter();


/* Registers a user into the database. */
exports.signup = (req, res, next) => {

    // Extract the validation results
    const errors = validationResult(req);

    // If there are some validation errors
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

    // Extract the data from the request
    const email      = req.body.email,
          password   = req.body.password,
          age        = req.body.age,
          gender     = req.body.gender,
          occupation = req.body.occupation;

    // Temporary variable to store the new user
    let newUser = null;

    // Encrypt the password
    bcrypt.hash(password, 12)
        .then(hashPw => {

            // Create a token for the email confirmation
            const token = crypto.randomBytes(32).toString("hex");

            // Create a new user
            const user = new User({
                email                      : email,
                password                   : hashPw,
                age                        : age,
                gender                     : gender,
                occupation                 : occupation,
                imageUrl                   : "",
                confirmEmailToken          : token,
                confirmEmailTokenExpiration: Date.now() + 86400000      // 1 day
            });

            // Save the user into the database
            return user.save();

        })
        .then(user => {

            // Save the new user
            newUser = user;

            // Send a confirmation mail
            return transporter.sendMail({
                to     : email,
                from   : mail.senderAddress,
                subject: "Welcome to DefibrillatorHunter! Confirm your email.",
                text   : `Click here to confirm your mail:\nhttp://${req.headers.host}/auth/confirmation/${user.confirmEmailToken}`,
                html   : mail.generateConfirmEmailContent(`http://${req.headers.host}/auth/confirmation/${user.confirmEmailToken}`)
            });

        })
        .then(() => {

            // Send a success response
            res.status(201).json({ message: "User created.", userId: newUser._id });

        })
        .catch(err => {

            console.error(err);

            // If the error does not have a status code, assign 500 to it
            if (!err.statusCode) {
                err.statusCode = 500;
                err.errors     = ["Something went wrong on the server."];
            }

            // If the error occurs before the creation of the new user, call the next middleware
            if (!newUser) {
                next(err);
                return;
            }

            console.log("User already created. Rolling back...");

            // If the error occurs after the creation of the new user, delete it
            User.findByIdAndRemove(newUser._id)
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

        });

};


/* Confirms the email of the user. */
exports.confirmMail = (req, res, next) => {

    // Extract the email token from the request
    const token = req.params.token;

    // Find the user with that token
    User.findOne({ confirmEmailToken: token })
        .then(user => {

            // If no user is found, raise a 404 error
            if (!user) {
                const error      = new Error("User not found or already verified");
                error.statusCode = 404;
                throw error;
            }

            // If the token is expired, raise a 400 error
            if (!(new Date(user.confirmEmailTokenExpiration).getTime() > Date.now())) {
                const error      = new Error("Token expired");
                error.statusCode = 400;
                throw error;
            }

            // Set the user as confirmed and delete the token and its expiration date
            user.isConfirmed                 = true;
            user.confirmEmailToken           = undefined;
            user.confirmEmailTokenExpiration = undefined;

            // Save the user modifications
            return user.save();

        })
        .then(() => {

            // Render the view
            res.render("confirm-mail", { errorMessage: null })

        })
        .catch(err => {

            // If the error does not have a status code, assign 500 to it
            if (!err.statusCode) {
                err.statusCode = 500;
                err.errors     = ["Something went wrong on the server"];
            }

            // Save the error message
            const errorMessage = `Error! ${err.message}`;

            // Render the view with the error message
            res.render("confirm-mail", { errorMessage: errorMessage });

        });

};


/* Re-sends the confirmation email. */
exports.resendConfirmationEmail = (req, res, next) => {

    // Extract the email from the request
    const email = req.body.email;

    // Extract the validation errors
    const errors = validationResult(req);

    // If there are some validation errors throw a 422 error
    if (!errors.isEmpty()) {
        const error      = new Error("Data validation failed. Entered data is incorrect.");
        error.errors     = errors.array();
        error.statusCode = 422;
        throw error;
    }

    // Temporary variable to store the token
    let token;

    // Find the user by email
    User.findOne({ email: email })
        .then(user => {

            // If no user is found, raise a 404 error
            if (!user) {
                const error      = new Error("User not found.");
                error.statusCode = 404;
                throw error;
            }

            // If the user is already confirmed, throw a 409 error
            if (user.isConfirmed) {
                const error      = new Error("User already verified.");
                error.statusCode = 409;
                throw error;
            }

            // Create an encrypted token
            token = crypto.randomBytes(32).toString("hex");

            // Save the token and set its expiration date to 24h
            user.confirmEmailToken           = token;
            user.confirmEmailTokenExpiration = Date.now() + 86400000;

            // Update the user
            return user.save();

        })
        .then(() => {

            // Send the email
            return transporter.sendMail({
                to     : email,
                from   : mail.senderAddress,
                subject: "Welcome to DefibrillatorHunter! Confirm your email.",
                text   : `Click here to confirm your mail:\nhttp://${req.headers.host}/auth/confirmation/${token}`,
                html   : mail.generateConfirmEmailContent(`http://${req.headers.host}/auth/confirmation/${token}`)
            });

        })
        .then(() => {

            // Send a successful response
            res.status(201).json({ message: "Email sent." });

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


/* Logs a user in. */
exports.login = (req, res, next) => {

    // Extract the data from the request
    const email    = req.body.email,
          password = req.body.password;

    // Temporary variable to store the new user
    let loadedUser;

    // Find the user by email
    User.findOne({ email: email })
        .then(user => {

            // If no user is found, raise a 404 error
            if (!user) {
                const error      = new Error("Invalid credentials.");
                error.statusCode = 401;
                throw error;
            }

            // Save the user
            loadedUser = user;

            // Compare the passwords
            return bcrypt.compare(password, user.password);

        })
        .then(isEqual => {

            // If the passwords do not match, throw a 401 error
            if (!isEqual) {
                const error      = new Error("Invalid credentials.");
                error.statusCode = 401;
                throw error;
            }

            // If the mail of the user is not confirmed, throw a 460 error
            if (!loadedUser.isConfirmed) {
                const error      = new Error("Mail not verified.");
                error.statusCode = 460;
                throw error
            }

            // Create a random token
            const token = jwt.sign(
                {
                    userId: loadedUser._id.toString(),
                    email : loadedUser.email
                },
                process.env.JWT_PRIVATE_KEY, { expiresIn: "1d" }
            );

            // Send a success response
            res.status(200).json({ token: token, userId: loadedUser._id.toString() });

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


/* Reset the user's password. */
exports.resetPw = (req, res, next) => {

    // Extract the mail from the request
    const email = req.body.email;

    // Extract the validation errors
    const errors = validationResult(req);

    // If there are some validation errors throw a 422 error
    if (!errors.isEmpty()) {
        const error      = new Error("Data validation failed. Entered data is incorrect.");
        error.errors     = errors.array();
        error.statusCode = 422;
        throw error;
    }

    // Temporary variable to store the token
    let token;

    // Find the user by email
    User.findOne({ email: email })
        .then(user => {

            // If no user is found, raise a 404 error
            if (!user) {
                const error      = new Error("User not found.");
                error.statusCode = 404;
                throw error;
            }

            // Create an encrypted token
            token = crypto.randomBytes(32).toString("hex");

            // Save the token and its expiration date (1h)
            user.resetPwToken           = token;
            user.resetPwTokenExpiration = Date.now() + 3600000;

            // Update the user
            return user.save();

        })
        .then(() => {

            // Send a mail to the user
            return transporter.sendMail({
                to     : email,
                from   : mail.senderAddress,
                subject: "Password reset",
                text   : `Click here to reset your password:\nhttp://${req.headers.host}/auth/new-password/${token}`,
                html   : mail.generateResetPwContent(`http://${req.headers.host}/auth/new-password/${token}`)
            });

        })
        .then(() => {

            // Send a success response
            res.status(201).json({ message: "Email sent." })

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


/* Render the view to set a new password. */
exports.getNewPassword = (req, res, next) => {

    // Extract the token from the request
    const token = req.params.token;

    // Find the user by the token
    User.findOne({ resetPwToken: token })
        .then(user => {

            // If no user is found, raise a 404 error
            if (!user) {
                const error      = new Error("User not found");
                error.statusCode = 404;
                throw error;
            }

            // If the token is expired, throw a 400 error
            if (!(new Date(user.resetPwTokenExpiration).getTime() > Date.now())) {
                const error      = new Error("Token expired");
                error.statusCode = 400;
                throw error;
            }

            // Render the view
            res.render("new-password", { token: token, email: user.email, errorMessage: null });

        })
        .catch(err => {

            // If the error does not have a status code, assign 500 to it
            if (!err.statusCode) {
                err.statusCode = 500;
                err.errors     = ["Something went wrong on the server"];
            }

            // Save the error message
            const errorMessage = `Error! ${err.message}`;

            // Render the view with the error message
            res.render("new-password", { errorMessage: errorMessage });

        });

};


/* Set a new password. */
exports.postNewPassword = (req, res, next) => {

    // Extract the validation errors
    const errors = validationResult(req);

    // If there are some validation errors throw a 422 error
    if (!errors.isEmpty()) {
        const error      = new Error("Password validation failed. Entered data is incorrect.");
        error.errors     = errors.array();
        error.statusCode = 422;
        throw error;
    }

    // Extract the values from the request
    const password = req.body.password,
          email    = req.body.email,
          token    = req.body.token;

    // Temporary variable to store the user
    let loadedUser;

    // Find the user by token and email
    User.findOne({ resetPwToken: token, email: email })
        .then(user => {

            // If no user is found, raise a 404 error
            if (!user) {
                const error      = new Error("Could not find the user.");
                error.statusCode = 404;
                throw error;
            }

            // If the token is expired, raise a 400 error
            if (!(new Date(user.resetPwTokenExpiration).getTime() > Date.now())) {
                const error      = new Error("Token expired");
                error.statusCode = 400;
                throw error;
            }

            // Save the user
            loadedUser = user;

            // Encrypt the password
            return bcrypt.hash(password, 12);

        })
        .then(hashPw => {

            // Save the password and delete the token and its expiration date
            loadedUser.password               = hashPw;
            loadedUser.resetPwToken           = undefined;
            loadedUser.resetPwTokenExpiration = undefined;

            // Update the user
            return loadedUser.save();

        })
        .then(() => {

            // Send a successful response
            res.status(201).json({ message: "Password reset successful." });

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