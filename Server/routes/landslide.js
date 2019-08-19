"use strict";

const express  = require("express"),                 // Express module
      { body } = require("express-validator/check"); // Module for validating the data

const landslideController = require("../controllers/landslide"), // Controller module
      isAuth              = require("../middleware/is-auth");    // Authorization checking middleware


// Validation for the data sent with a post request
const postValidation = [
    body("coordinates")
        .not().isEmpty().withMessage("You must specify the coordinates of the landslide"),
    body("type")
        .not().isEmpty().withMessage("You must specify if the type of the landslide."),
    body("notes")
        .trim()
        .escape()
];

// Validation for the data sent with a put request
const putValidation = [
    body("type")
        .not().isEmpty().withMessage("You must specify if the type of the landslide."),
    body("notes")
        .trim()
        .escape()
];


// Create a router
const router = express.Router();


// GET /landslide/get-all
router.get("/get-all", landslideController.getLandslides);

// GET /landslide/user/:userId
router.get("/user/:userId", isAuth, landslideController.getUserLandslides);

// GET /landslide/:landslideId
router.get("/:landslideId", isAuth, landslideController.getLandslide);

// POST /landslide/post
router.post("/post", isAuth, postValidation, landslideController.postLandslide);

// PUT /landslide/:landslideId
router.put("/:landslideId", isAuth, putValidation, landslideController.updateLandslide);

// DELETE /landslide/:landslideId
router.delete("/:landslideId", isAuth, landslideController.deleteLandslide);



module.exports = router;