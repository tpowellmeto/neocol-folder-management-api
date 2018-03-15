"use strict";

const assert = require("assert");

const ClientIdValidator = require("../../main/js/client-id-validator").ClientIdValidator;


describe("Client ID Validator", function () {

    describe("isValid", function () {

        it("should return null with '' (empty)", function () {
            assert.equal(ClientIdValidator.isValid(""), null);
        });

        it("should return null with null", function () {
            assert.equal(ClientIdValidator.isValid(null), null);
        });

        it("should return null with 'undefined'", function () {
            assert.equal(ClientIdValidator.isValid("undefined"), null);
        });

        it("should return null with 'ABC' (not valid)", function () {
            assert.equal(ClientIdValidator.isValid("ABC"), null);
        });

        it("should return null with year '1900' (before 20th century)", function () {
            assert.equal(ClientIdValidator.isValid("1900-12345"), null);
        });

        it("should return null with year '2001' (after 20th century)", function () {
            assert.equal(ClientIdValidator.isValid("2001-12345"), null);
        });

        it("should return an object with year 1999 with '12345(99)'", function () {
            const expected = {
                serial: "12345",
                year: "1999"
            };
            const actual = ClientIdValidator.isValid("12345(99)");
            assert.deepEqual(actual, expected);
        });

        it("should return an object with year 2000 with '12345(00)'", function () {
            const expected = {
                serial: "12345",
                year: "2000"
            };
            const actual = ClientIdValidator.isValid("12345(00)");
            assert.deepEqual(actual, expected);
        });

        it("return an object with '1901-12345'", function () {
            const expected = {
                serial: "12345",
                year: "1901"
            };
            const actual = ClientIdValidator.isValid("1901-12345");
            assert.deepEqual(actual, expected);
        });

    });

});