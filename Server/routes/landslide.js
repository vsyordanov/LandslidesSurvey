"use strict";

const express  = require("express"),
      { body } = require("express-validator/check");

const landslideController = require("../controllers/landslide");

const router = express.Router();

module.exports = router;