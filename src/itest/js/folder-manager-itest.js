"use strict";

const assert = require("assert");
const sinon = require("sinon");
const nconf = require("nconf");
const getPort = require("get-port");
const fetch = require("node-fetch");

const FolderManager = require("../../main/js/folder-manager").FolderManager;
const FileManagementAPI = require("../../main/js/file-management-api").FileManagementAPI;


describe("FolderManager", function () {

    let server;
    let port;

    let getFolderStub;
    let createFolderStub;

    before(function () {

        getFolderStub = sinon.stub(FileManagementAPI.prototype, 'getFolderByName');
        createFolderStub = sinon.stub(FileManagementAPI.prototype, 'createFolder');

        return getPort().then((p) => {
            port = p;
            nconf.overrides({
                "PORT": p,
                "NAME": "itest server"
            });
            server = FolderManager.run(nconf);
        });

    });

    beforeEach(function () {
        getFolderStub.reset();
        createFolderStub.reset();
    });

    after(function () {
        server.close();
        getFolderStub.restore();
        createFolderStub.restore();
    });

    describe("GET", function () {

        it("should return a 400 as called with invalid client id", function () {

            const clientId = "ABC";

            const expectedStatus = 400;
            const expectedBody = {
                code: "BadRequest",
                message: "Invalid client id 'ABC'"
            };

            return fetch(`http://localhost:${port}/folders/${clientId}`)
                .then(res => {
                    assert.equal(res.status, expectedStatus);
                    return res.json();
                })
                .then(json => {
                    assert.deepEqual(json, expectedBody);
                });

        });

        it("should return a 404 as no folder found", function () {

            const clientId = "12345(67)";

            getFolderStub.withArgs("1", "1967").resolves(null);
            getFolderStub.withArgs("2", "1967").resolves(null);

            const expectedStatus = 404;
            const expectedBody = {
                code: "NotFound",
                message: "No folders found for client id '12345(67)'"
            };

            return fetch(`http://localhost:${port}/folders/${clientId}`)
                .then(res => {
                    assert.equal(getFolderStub.callCount, 2);
                    assert.equal(res.status, expectedStatus);
                    return res.json();
                })
                .then(json => {
                    assert.deepEqual(json, expectedBody);
                });

        });

        it("should return a 500 as an error occurs", function () {

            const clientId = "12345(67)";

            getFolderStub.withArgs("1", "1967").rejects(new Error("e1"));
            getFolderStub.withArgs("2", "1967").rejects(new Error("e2"));

            const expectedStatus = 500;
            const expectedBody = {
                code: "InternalServer",
                message: "e1"
            };

            return fetch(`http://localhost:${port}/folders/${clientId}`)
                .then(res => {
                    assert.equal(getFolderStub.callCount, 2);
                    assert.equal(res.status, expectedStatus);
                    return res.json();
                })
                .then(json => {
                    assert.deepEqual(json, expectedBody);
                });

        });

        it("should return a 200 as called with a valid 'YYYY-SSSSS' client id", function () {

            const clientId = "1967-12345";

            getFolderStub.withArgs("1", "1967").resolves({
                "id": "3",
                "name": "1967"
            });
            getFolderStub.withArgs("2", "1967").resolves({
                "id": "4",
                "name": "1967"
            });
            getFolderStub.withArgs("3", "12345").resolves({
                "id": "5",
                "name": "12345"
            });
            getFolderStub.withArgs("4", "12345").resolves({
                "id": "6",
                "name": "12345"
            });

            const expectedStatus = 200;
            const expectedBody = {
                folders: [
                    {
                        id: "5",
                        name: "12345",
                        topLevelFolder: "Unrestricted information"
                    },
                    {
                        id: "6",
                        name: "12345",
                        topLevelFolder: "Restricted information"
                    }
                ]
            };


            return fetch(`http://localhost:${port}/folders/${clientId}`)
                .then(res => {
                    assert.equal(getFolderStub.callCount, 4);
                    assert.equal(res.status, expectedStatus);
                    return res.json();
                })
                .then(json => {
                    assert.deepEqual(json, expectedBody);
                });

        });

        it("should return a 200 as called with a valid 'SSSSS(YY)' client id", function () {

            const clientId = "12345(67)";

            getFolderStub.withArgs("1", "1967").resolves({
                "id": "3",
                "name": "1967"
            });
            getFolderStub.withArgs("2", "1967").resolves({
                "id": "4",
                "name": "1967"
            });
            getFolderStub.withArgs("3", "12345").resolves({
                "id": "5",
                "name": "12345"
            });
            getFolderStub.withArgs("4", "12345").resolves({
                "id": "6",
                "name": "12345"
            });

            const expectedStatus = 200;
            const expectedBody = {
                folders: [
                    {
                        id: '5',
                        name: '12345',
                        topLevelFolder: 'Unrestricted information'
                    },
                    {
                        id: '6',
                        name: '12345',
                        topLevelFolder: 'Restricted information'
                    }
                ]
            };


            return fetch(`http://localhost:${port}/folders/${clientId}`)
                .then(res => {
                    assert.equal(getFolderStub.callCount, 4);
                    assert.equal(res.status, expectedStatus);
                    return res.json();
                })
                .then(json => {
                    assert.deepEqual(json, expectedBody);
                });

        });

    });

    describe("POST", function () {

        it("should return a 400 as sent an invalid client id", function () {

            const clientId = "ABC";

            const body = {
                clientId: clientId
            };

            const expectedStatus = 400;
            const expectedBody = {code: "BadRequest", message: "Invalid client id 'ABC'"};


            return fetch(`http://localhost:${port}/folders/`, {
                method: "POST",
                body: JSON.stringify(body),
                headers: {"Content-Type": "application/json"},
            })
                .then(res => {
                    assert.equal(res.status, expectedStatus);
                    return res.json();
                })
                .then(json => {
                    assert.deepEqual(json, expectedBody);
                });

        });

        it("should return a 400 as folder already exists", function () {

            const clientId = "12345(67)";
            const body = {
                clientId: clientId
            };

            getFolderStub.withArgs("1", "1967").resolves({
                id: "3",
                name: "1967"
            });
            getFolderStub.withArgs("2", "1967").resolves({
                id: "4",
                name: "1967"
            });
            getFolderStub.withArgs("3", "12345").resolves({
                id: "5",
                name: "12345"
            });
            getFolderStub.withArgs("4", "12345").resolves({
                id: "6",
                name: "12345"
            });

            const expectedStatus = 400;
            const expectedBody = {
                code: "BadRequest",
                message: "client id '12345(67)' already exists"
            };

            return fetch(`http://localhost:${port}/folders/`, {
                method: "POST",
                body: JSON.stringify(body),
                headers: {"Content-Type": "application/json"},
            })
                .then(res => {
                    assert.equal(getFolderStub.callCount, 4);
                    assert.equal(res.status, expectedStatus);
                    return res.json();
                })
                .then(json => {
                    assert.deepEqual(json, expectedBody);
                });

        });

        it("should return a 500 as an error occurs", function () {

            const clientId = "12345(67)";
            const body = {
                clientId: clientId
            };

            getFolderStub.withArgs("1", "1967").rejects(new Error("e1"));
            getFolderStub.withArgs("2", "1967").rejects(new Error("e2"));

            const expectedStatus = 500;
            const expectedBody = {
                code: 'InternalServer',
                message: 'e1'
            };

            return fetch(`http://localhost:${port}/folders/`, {
                method: "POST",
                body: JSON.stringify(body),
                headers: {"Content-Type": "application/json"},
            })
                .then(res => {
                    assert.equal(getFolderStub.callCount, 2);
                    assert.equal(res.status, expectedStatus);
                    return res.json();
                })
                .then(json => {
                    assert.deepEqual(json, expectedBody);
                });

        });

        it("should return a 201 as sent a valid new 'YYYY-SSSSS' client id and no folders exist", function () {

            const clientId = "1967-12345";
            const body = {
                clientId: clientId
            };

            getFolderStub.withArgs("1", "1967").resolves(null);
            createFolderStub.withArgs("1", "1967").resolves({
                "id": "3",
                "name": "1967"
            });
            getFolderStub.withArgs("3", "12345").resolves(null);
            createFolderStub.withArgs("3", "12345").resolves({
                "id": "5",
                "name": "12345"
            });

            getFolderStub.withArgs("2", "1967").resolves(null);
            createFolderStub.withArgs("2", "1967").resolves({
                "id": "4",
                "name": "1967"
            });

            getFolderStub.withArgs("4", "1967").resolves(null);
            createFolderStub.withArgs("4", "12345").resolves({
                "id": "6",
                "name": "12345"
            });

            const expectedStatus = 201;
            const expectedBody = {
                folders: [
                    {
                        id: "5",
                        name: "12345",
                        topLevelFolder: "Unrestricted information"
                    },
                    {
                        id: "6",
                        name: "12345",
                        topLevelFolder: "Restricted information"
                    }
                ]
            };


            return fetch(`http://localhost:${port}/folders/`, {
                    method: "POST",
                    body: JSON.stringify(body),
                    headers: {"Content-Type": "application/json"},
                })
                .then(res => {
                    assert.equal(getFolderStub.callCount, 4);
                    assert.equal(createFolderStub.callCount, 4);
                    assert.equal(res.status, expectedStatus);
                    return res.json();
                })
                .then(json => {
                    assert.deepEqual(json, expectedBody);
                });

        });

        it("should return a 201 as sent a valid new 'SSSSS(YY)' client id and no folders exist", function () {

            const clientId = "12345(67)";
            const body = {
                clientId: clientId
            };

            getFolderStub.withArgs("1", "1967").resolves(null);
            createFolderStub.withArgs("1", "1967").resolves({
                "id": "3",
                "name": "1967"
            });
            getFolderStub.withArgs("3", "12345").resolves(null);
            createFolderStub.withArgs("3", "12345").resolves({
                "id": "5",
                "name": "12345"
            });

            getFolderStub.withArgs("2", "1967").resolves(null);
            createFolderStub.withArgs("2", "1967").resolves({
                "id": "4",
                "name": "1967"
            });

            getFolderStub.withArgs("4", "1967").resolves(null);
            createFolderStub.withArgs("4", "12345").resolves({
                "id": "6",
                "name": "12345"
            });

            const expectedStatus = 201;
            const expectedBody = {
                folders: [
                    {
                        id: "5",
                        name: "12345",
                        topLevelFolder: "Unrestricted information"
                    },
                    {
                        id: "6",
                        name: "12345",
                        topLevelFolder: "Restricted information"
                    }
                ]
            };


            return fetch(`http://localhost:${port}/folders/`, {
                method: "POST",
                body: JSON.stringify(body),
                headers: {"Content-Type": "application/json"},
            })
                .then(res => {
                    assert.equal(getFolderStub.callCount, 4);
                    assert.equal(createFolderStub.callCount, 4);
                    assert.equal(res.status, expectedStatus);
                    return res.json();
                })
                .then(json => {
                    assert.deepEqual(json, expectedBody);
                });

        });

        it("should return a 201 as sent a valid new 'SSSSS(YY)' client id and year folders exist", function () {

            const clientId = "12345(67)";
            const body = {
                clientId: clientId
            };

            getFolderStub.withArgs("1", "1967").resolves({
                "id": "3",
                "name": "1967"
            });
            getFolderStub.withArgs("3", "12345").resolves(null);
            createFolderStub.withArgs("3", "12345").resolves({
                "id": "5",
                "name": "12345"
            });

            getFolderStub.withArgs("2", "1967").resolves({
                "id": "4",
                "name": "1967"
            });
            getFolderStub.withArgs("4", "1967").resolves(null);
            createFolderStub.withArgs("4", "12345").resolves({
                "id": "6",
                "name": "12345"
            });

            const expectedStatus = 201;
            const expectedBody = {
                folders: [
                    {
                        id: "5",
                        name: "12345",
                        topLevelFolder: "Unrestricted information"
                    },
                    {
                        id: "6",
                        name: "12345",
                        topLevelFolder: "Restricted information"
                    }
                ]
            };


            return fetch(`http://localhost:${port}/folders/`, {
                method: "POST",
                body: JSON.stringify(body),
                headers: {"Content-Type": "application/json"},
            })
                .then(res => {
                    assert.equal(getFolderStub.callCount, 4);
                    assert.equal(createFolderStub.callCount, 2);
                    assert.equal(res.status, expectedStatus);
                    return res.json();
                })
                .then(json => {
                    assert.deepEqual(json, expectedBody);
                });

        });

    });

});
