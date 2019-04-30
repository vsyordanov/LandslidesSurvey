"use strict";

const path = require("path");

const express    = require("express"),
      bodyParser = require("body-parser"),
      mongoose   = require("mongoose"),
      multer     = require("multer"),
      uuidv4     = require("uuid/v4");

const settings            = require("./settings"),
      landslideRoutes = require("./routes/landslide");

const app = express();


// Multer config
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "images"),
    filename   : (req, file, cb) => cb(null, uuidv4())
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg")
        cb(null, true);
    else
        cb(null, false);
};


// Parse for application/json
app.use(bodyParser.json());

// Use multer to upload images
app.use(
    multer({
        storage   : fileStorage,
        fileFilter: fileFilter
    }).single("image")
);

// Serve statically the images form the "images" folder
app.use("/images", express.static(path.join(__dirname, "images")));

// Set headers for CORS
app.use((req, res, next) => {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    next();

});

app.use("/", (req, res) => res.send("LandslideSurvey server"));

app.use("/landslide", landslideRoutes);

// Error handling middleware
app.use((error, req, res, next) => {

    const status  = error.statusCode || 500,
          message = error.message,
          errors  = error.errors || [];

    res.status(status).json({ message: message, errors: errors });

});


mongoose.connect(settings.mongoURL, { useNewUrlParser: true })
    .then(result => {
        let port = process.env.PORT;

        if (port == null || port == "")
            port = 8081;

        app.listen(port);
    })
    .catch(err => console.log(err));