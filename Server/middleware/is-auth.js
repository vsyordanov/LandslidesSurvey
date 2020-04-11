"use strict";

// Modules for manipulating the web tokens
const jwt = require("jsonwebtoken");


/* Checks if the caller is authorized to perform the request. */
module.exports = (req, res, next) => {

    // Extract the authorization header form the request
    const authHeader = req.get("Authorization");

    // If no authorization header is provided, throw a 401 error
    if (!authHeader) {
        const error      = new Error("Not authenticated.");
        error.statusCode = 401;
        throw error;
    }

    // Extract the token
    const token = authHeader.split(" ")[1];

    // Temporary variable to store the decoded token
    let decodedToken;

    // Try to decode the token
    try {
        decodedToken = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    } catch (err) {
        err.statusCode = 500;
        throw err;
    }

    // If the token is not correct, throw a 401 error
    if (!decodedToken) {
        const error      = new Error("Not authenticated.");
        error.statusCode = 401;
        throw error;
    }

    // Save the id of the calling user in the request
    req.userId  = decodedToken.userId;
    req.isAdmin = decodedToken.isAdmin;

    // Move to the next middleware
    next();

};
