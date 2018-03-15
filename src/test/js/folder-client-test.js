"use strict";

const assert = require("assert");
const sinon = require("sinon");

const FolderClient = require("../../main/js/folder-client").FolderClient;
const FileManagementApi = require("../../main/js/file-management-api").FileManagementAPI;


describe("Folder Client", function () {

    let folderClient;

    let getFolderStub;
    let createFolderStub;
    
    beforeEach(function () {
        folderClient = new FolderClient();

        // not the cleanest but mocha bug affets scoping https://github.com/mochajs/mocha/issues/2014
        getFolderStub = sinon.stub(FileManagementApi.prototype, "getFolderByName");
        createFolderStub = sinon.stub(FileManagementApi.prototype, "createFolder");

        getFolderStub.reset();
        createFolderStub.reset()
    });

    afterEach(function() {
        getFolderStub.restore();
        createFolderStub.restore();
    });

    describe("getFolders", function () {

        it("should reject with an error as an error is thrown", function () {

            getFolderStub.withArgs("1", "2000").rejects(new Error("e1"));

            getFolderStub.withArgs("2", "2000").rejects(new Error("e2"));

            return folderClient.getFolders("2000", "12345")
                .then((actual) => {
                    assert.fail("promise should not resolve");
                }, (err) => {
                    assert.equal(getFolderStub.callCount, 2);
                    assert.ok((err instanceof Error));
                })

        });

        it("should resolve with null as no folder exists for year '2000'", function () {

            getFolderStub.withArgs("1", "2000").resolves(null);

            getFolderStub.withArgs("2", "2000").resolves(null);

            return folderClient.getFolders("2000", "12345").then((actual) => {
                assert.equal(getFolderStub.callCount, 2);
                assert.deepEqual(actual, null);
            });

        });

        it("should resolve with null as no folder exists for serial '12345'", function () {

            getFolderStub.withArgs("1", "2000").resolves({
                id: "3",
                name: "2000"
            });

            getFolderStub.withArgs("3", "12345").resolves(null);

            getFolderStub.withArgs("2", "2000").resolves({
                id: "4",
                name: "2000"
            });

            getFolderStub.withArgs("4", "12345").resolves(null);

            return folderClient.getFolders("2000", "12345").then((actual) => {
                assert.equal(getFolderStub.callCount, 4);
                assert.deepEqual(actual, null);
            });

        });

        it("should resolve with a valid object", function () {

            getFolderStub.withArgs("1", "2000").resolves({
                id: "3",
                name: "2000"
            });

            getFolderStub.withArgs("3", "12345").resolves({
                id: "5",
                name: "12345"
            });

            getFolderStub.withArgs("2", "2000").resolves({
                id: "4",
                name: "2000"
            });

            getFolderStub.withArgs("4", "12345").resolves({
                id: "6",
                name: "12345"
            });


            const expected = [
                {
                    "id": "5",
                    "name": "12345",
                    "topLevelFolder": "Unrestricted information"
                },
                {
                    "id": "6",
                    "name": "12345",
                    "topLevelFolder": "Restricted information"
                }
            ];

            return folderClient.getFolders("2000", "12345").then((actual) => {
                assert.equal(getFolderStub.callCount, 4);
                assert.deepEqual(actual, expected);
            });

        });

    });

    describe("createFolders", function () {

        it("should reject with an error as an error is thrown", function () {

            getFolderStub.withArgs("1", "2000").rejects(new Error("e1"));

            getFolderStub.withArgs("2", "2000").rejects(new Error("e2"));

            return folderClient.createFolders("2000", "12345")
                .then((actual) => {
                    assert.fail("promise should not resolve");
                }, (err) => {
                    assert.equal(getFolderStub.callCount, 2);
                    assert.ok((err instanceof Error));
                })

        });

        it("should resolve with null as folder already exists for serial '12345' in  year '2000'", function () {

            getFolderStub.withArgs("1", "2000").resolves({
                id: "3",
                name: "2000"
            });

            getFolderStub.withArgs("3", "12345").resolves({
                id: "5",
                name: "12345"
            });

            getFolderStub.withArgs("2", "2000").resolves({
                id: "4",
                name: "2000"
            });

            getFolderStub.withArgs("4", "12345").resolves({
                id: "6",
                name: "12345"
            });

            return folderClient.createFolders("2000", "12345").then((actual) => {
                assert.equal(createFolderStub.callCount, 0);
                assert.equal(getFolderStub.callCount, 4);
                assert.equal(actual, null);
            });

        });

        it("should resolve with a valid object as no folder exists for serial '12345' in  year '2000'", function () {

            getFolderStub.withArgs("1", "2000").resolves({
                id: "3",
                name: "2000"
            });

            getFolderStub.withArgs("3", "12345").resolves(null);

            createFolderStub.withArgs(sinon.match.string, "12345").onCall(0).resolves({
                id: "5",
                name: "12345"
            });

            getFolderStub.withArgs("2", "2000").resolves({
                id: "4",
                name: "2000"
            });

            getFolderStub.withArgs("4", "12345").resolves(null);

            createFolderStub.withArgs(sinon.match.string, "12345").onCall(1).resolves({
                id: "6",
                name: "12345"
            });

            const expected = [
                {
                    "id": "5",
                    "name": "12345",
                    "topLevelFolder": "Unrestricted information"
                },
                {
                    "id": "6",
                    "name": "12345",
                    "topLevelFolder": "Restricted information"
                }
            ];

            return folderClient.createFolders("2000", "12345").then((actual) => {
                assert.equal(createFolderStub.callCount, 2);
                assert.equal(getFolderStub.callCount, 4);
                assert.deepEqual(actual, expected);
            });

        });

        it("should resolve with a valid object as no folders exist for year '2000'", function () {

            getFolderStub.withArgs("1", "2000").resolves(null);

            createFolderStub.withArgs("1", "2000").resolves({
                id: "3",
                name: "2000"
            });

            getFolderStub.withArgs("3", "12345").resolves(null);

            createFolderStub.withArgs("3", "12345").resolves({
                id: "5",
                name: "12345"
            });

            getFolderStub.withArgs("2", "2000").resolves(null);

            createFolderStub.withArgs("2", "2000").resolves({
                id: "4",
                name: "2000"
            });

            getFolderStub.withArgs("4", "12345").resolves(null);

            createFolderStub.withArgs("4", "12345").resolves({
                id: "6",
                name: "12345"
            });


            const expected = [
                {
                    "id": "5",
                    "name": "12345",
                    "topLevelFolder": "Unrestricted information"
                },
                {
                    "id": "6",
                    "name": "12345",
                    "topLevelFolder": "Restricted information"
                }
            ];

            return folderClient.createFolders("2000", "12345")
                .then((actual) => {
                    assert.equal(createFolderStub.callCount, 4);
                    assert.equal(getFolderStub.callCount, 4);
                    assert.deepEqual(actual, expected);
                });

        });

    });

});