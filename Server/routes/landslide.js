"use strict";

const express  = require("express"),                 // Express module
      { body } = require("express-validator/check"); // Module for validating the data

const landslideController = require("../controllers/landslide"), // Controller module
      isAuth              = require("../middleware/is-auth");    // Authorization checking middleware

// Create a router
const router = express.Router();


// GET /defibrillator/get-all
router.get("/get-all", isAuth, landslideController.getLandslides);


module.exports = router;