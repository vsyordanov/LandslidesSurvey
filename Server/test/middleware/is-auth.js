"use strict";

const expect = require("chai").expect, // Import expect from chai
      sinon  = require("sinon");       // Import sinon for stubs

const isAuth = require("../../middleware/is-auth"), // Import the auth middleware
      jwt    = require("jsonwebtoken");             // Import the jwt module


describe("is-auth middleware", function () {

    it("should throw a 401 error if no authorization header is present", function () {

        // Custom request without an authorization header
        const req = { get: function (headerName) { return null } };

        // Expectations
        expect(isAuth.bind(this, req, {}, () => {}))
            .to.throw("Not authenticated.")
            .with.property("statusCode", 401);

    });

    it("should throw a 500 error if the authorization header is only one string", function () {

        // Custom request with an authorization header composed by only one string
        const req = { get: function (headerName) { return "test" } };

        // Expectations
        expect(isAuth.bind(this, req, {}, () => {}))
            .to.throw()
            .with.property("statusCode", 500);

    });

    it("should throw a 500 error if the token cannot be verified", function () {

        // Custom request with a wrong token
        const req = { get: function (headerName) { return "Bearer wrong-token" } };

        // Expectations
        expect(isAuth.bind(this, req, {}, () => {}))
            .to.throw()
            .with.property("statusCode", 500);

    });

    it("should throw a 401 error if the token is not valid", function () {

        // Custom request with an invalid token
        const req = { get: function (headerName) { return "Bearer invalid-token" } };

        // Create a stub for the verify method of jwt
        sinon.stub(jwt, "verify");

        // Make the stub return undefined
        jwt.verify.returns(undefined);

        // Expectations
        expect(isAuth.bind(this, req, {}, () => {}))
            .to.throw()
            .with.property("statusCode", 401);

        // Restore the normal behaviour of the method
        jwt.verify.restore();

    });

    it("should yield a userId after decoding the token", function () {

        // Custom request with an valid token
        const req = { get: function (headerName) { return "Bearer valid-token" } };

        // Create a stub for the verify method of jwt
        sinon.stub(jwt, "verify");

        // Make the stub return a valid user id
        jwt.verify.returns({ userId: "id" });

        // Call the middleware
        isAuth(req, {}, () => {});

        // Expectations
        expect(req).to.have.property("userId");
        expect(req).to.have.property("userId", "id");
        expect(jwt.verify.called).to.be.true;

        // Restore the normal behaviour of the method
        jwt.verify.restore();

    });

});