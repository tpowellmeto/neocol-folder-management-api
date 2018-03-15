"use strict";

const errors = require("restify-errors");
const Router = require("restify-router").Router;

const ClientIdValidator = require("./client-id-validator").ClientIdValidator;
const FolderClient = require("./folder-client").FolderClient;
const folderClient = new FolderClient();


module.exports.FolderRouter = class FolderRouter {

    constructor() {

        this.router = new Router();

        this.router.get("/:clientId", this._validateClientId, this._getFolders);
        this.router.post("/", this._createFolders);
    }

    _createFolders(req, res, next) {
        const clientId = req.body.clientId;
        const valid = ClientIdValidator.isValid(clientId);
        if (!valid) {
            return next(new errors.BadRequestError(`Invalid client id '${clientId}'`));
        }
        return folderClient.createFolders(valid.year, valid.serial)
            .then((r) => {
                if (!r) {
                    return next(new errors.BadRequestError(`client id '${clientId}' already exists`));
                }
                const response = {
                    folders: r
                };
                res.set("Location", `/${clientId}`);
                res.send(201, response);
                return next();
            })
            .catch((err) => {
                console.error(err);
                return next(new errors.InternalServerError(err.message));
            });
    }

    _getFolders(req, res, next) {
        return folderClient.getFolders(res.locals.clientId.year, res.locals.clientId.serial)
            .then((r) => {
                if (!r) {
                    return next(new errors.NotFoundError(`No folders found for client id '${req.params.clientId}'`));
                }
                const response = {
                    folders: r
                };
                res.send(response);
                return next();
            })
            .catch((err) => {
                console.error(err);
                return next(new errors.InternalServerError(err.message));
            });
    }

    _validateClientId(req, res, next) {
        const clientId = req.params.clientId;
        const valid = ClientIdValidator.isValid(clientId);
        if (!valid) {
            const message = `Invalid client id '${clientId}'`;
            console.log(message);
            return next(new errors.BadRequestError(message));
        }
        res.locals = {
            clientId: valid
        };
        return next();
    }

};
