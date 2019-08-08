"use strict";

// Import the built in modules
const path = require("path"),
      fs   = require("fs");

// Import the third-party modules
const express    = require("express"),
      bodyParser = require("body-parser"),
      mongoose   = require("mongoose"),
      multer     = require("multer"),
      uuidv4     = require("uuid/v4"),
      helmet     = require("helmet"),
      morgan     = require("morgan");

// Import the routes
const authRoutes      = require("./routes/auth"),
      landslideRoutes = require("./routes/landslide");

// Initialize express
const app = express();


// Use helmet to set secure response headers
app.use(helmet());


// Configure the logs location
const accessLogStream = fs.createWriteStream(path.join(__dirname, "logs/server.log"), { flags: "a" });

// Use morgan for request logging
// app.use(morgan("combined", { stream: accessLogStream }));


// Use BodyParser to parse for application/json
app.use(bodyParser.json());


// Define the static file storage
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "images"), // Save the images in folder "images"
    filename   : (req, file, cb) => cb(null, uuidv4())  // Save each new image with a random name
});

// Define a file filter to only save images (.png, .jpg or .jpeg)
const fileFilter = (req, file, cb) => {

    if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg")
        cb(null, true);

    else
        cb(null, false);

};

// Configure multer to save images
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single("image"));

// Serve statically the images form the "images" folder
app.use("/images", express.static(path.join(__dirname, "images")));


// Set ejs as template engine
app.set("view engine", "ejs");

// Set the location of the views
app.set("views", "views");

// Serve statically the files form the "public" folder
app.use(express.static(path.join(__dirname, "public")));


// Set headers for CORS
app.use((req, res, next) => {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    next();

});


// Use the routes
app.use("/auth", authRoutes);
app.use("/landslide", landslideRoutes);


// Define a middleware to handle errors
app.use((error, req, res, next) => {

    const status  = error.statusCode || 500,
          message = error.message,
          errors  = error.errors || [];

    res.status(status).json({ message: message, errors: errors });

});


// Connect to the database and start the server
mongoose
    .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useCreateIndex: true })
    .then(() => app.listen(process.env.PORT || 8080))
    .catch(err => console.error(err));