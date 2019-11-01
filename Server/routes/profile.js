"use strict";

const express  = require("express"),                 // Express module
      { body } = require("express-validator/check"); // Module for validating the data

// Model of the user
const User = require("../models/user");

const profileController = require("../controllers/profile"), // Controller module
      isAuth            = require("../middleware/is-auth");  // Authorization checking middleware


// Possible age values
const validAge = ["none", "less15", "16-20", "21-25", "26-30", "31-35", "36-40", "41-45", "46-50", "51-55", "56-60",
    "61-65", "66-70", "more70"];

// Possible gender values
const validGender = ["none", "male", "female", "other"];

// Possible occupation values
const validOccupation = ["none", "student", "employee", "freelancer", "unemployed", "retiree"];


// Validation for the data sent with a change email request
const changeEmailValidation = [
    body("email")
        .isEmail().withMessage("Please enter a valid email.")
        .normalizeEmail()
        .custom(val => {
            return User.findOne({ email: val }).then(userDoc => {
                if (userDoc) return Promise.reject("This email address is already registered.")
            })
        })
];

// Validation for the data sent with a change password request
const changePwValidation = [
    body("oldPassword")
        .trim()
        .custom((val, { req }) => {
            if (val === req.body.newPassword)
                throw new Error("Old password equal to new password.");
            return true;
        }),
    body("newPassword")
        .trim()
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long and must contain at least one number")
        .custom(val => {
            if (!(/\d/.test(val)))
                throw new Error("Password must be at least 8 characters long and must contain at least one number");
            return true;
        }),
    body("confirmPassword")
        .trim()
        .custom((val, { req }) => {
            if (val !== req.body.newPassword)
                throw new Error("Passwords don't match.");
            return true;
        })
];

// Validation for the data sent with an update profile request
const updateProfileValidation = [
    body("age")
        .isIn(validAge).withMessage("Invalid age value."),
    body("gender")
        .isIn(validGender).withMessage("Invalid gender value."),
    body("occupation")
        .isIn(validOccupation).withMessage("Invalid occupation value.")
];


// Create a router
const router = express.Router();


// GET /profile/:userId
router.get("/:userId", isAuth, profileController.getUser);

// PUT /profile/:userId/change-email
router.put("/:userId/change-email", isAuth, changeEmailValidation, profileController.changeEmail);

// PUT /profile/:userId/change-password
router.put("/:userId/change-password", isAuth, changePwValidation, profileController.changePassword);

// PUT /profile/:userId/update-profile
router.put("/:userId/update-profile", isAuth, updateProfileValidation, profileController.updateProfile);


// Export the routes
module.exports = router;