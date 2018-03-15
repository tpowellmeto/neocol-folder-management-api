"use strict";

const FileManagementAPI = require("./file-management-api").FileManagementAPI;


const UNRESTRICTED_INFORMATION = {id: "1", name: "Unrestricted information"};
const RESTRICTED_INFORMATION = {id: "2", name: "Restricted information"};


module.exports.FolderClient = class FolderClient {

    constructor() {
        this.api = new FileManagementAPI();
    }

    createFolders(year, serial) {
        let unrestricted = this._createFolder(UNRESTRICTED_INFORMATION, year, serial);
        let restricted = this._createFolder(RESTRICTED_INFORMATION, year, serial);

        return Promise.all([unrestricted, restricted])
            .catch((err) => {
                if(err instanceof  Error) {
                    console.error(err);
                    return Promise.reject(err);
                }
                console.log(err);
                return Promise.resolve(null);
            });
    }

    getFolders(year, serial) {
        let unrestricted = this._getFolder(UNRESTRICTED_INFORMATION, year, serial);
        let restricted = this._getFolder(RESTRICTED_INFORMATION, year, serial);

        return Promise.all([unrestricted, restricted])
            .catch((err) => {
                if (err instanceof Error) {
                    console.error(err);
                    return Promise.reject(err);
                }
                console.log(err);
                return Promise.resolve(null);
            });
    }

    _createFolder(type, year, serial) {
        // get the year folder from top level
       return this.api.getFolderByName(type.id, year)
            .then((r) => {
                if (!r) {
                    // no folder for year so create new
                    console.log(`creating folder for year '${year}' in type '${type.name}'`);
                    return this.api.createFolder(type.id, year);
                }
                // year folder found
                return Promise.resolve(r);
            })
            .then((r) => {
                // get the folder for serial in year
                return Promise.all([r.id, this.api.getFolderByName(r.id, serial)]);
            })
            .then((r) => {
                const yearId = r[0];
                const hasFolderWithSerial = r[1];
                if (hasFolderWithSerial) {
                    // assumed logic here - if the clients serial exists in the year folder then don't create another.
                    return Promise.reject(`${type.name} has an existing folder in year '${year}' with name '${serial}'`);
                }
                // no folder for serial so create new
                console.log(`creating folder with name '${serial}' in year '${year}' with type '${type.name}'`);
                return this.api.createFolder(yearId, serial);
            })
            .then((r) => {
                // append top level folder name for response
                r.topLevelFolder = type.name;
                return r;
            });
    }

    _getFolder(type, year, serial) {
        // get the year folder from top level
        return this.api.getFolderByName(type.id, year)
            .then((r) => {
                if (!r) {
                    // no folder found for year
                    return Promise.reject(`${type.name} had no folder for year '${year}'`);
                }
                // year found so find serial in year
                return this.api.getFolderByName(r.id, serial)
            })
            .then((r) => {
                if (!r) {
                    // no folder for serial
                    return Promise.reject(`${type.name} for year '${year}' had no folder with name '${serial}'`);
                }
                // serial found in year so append top level name for response
                r.topLevelFolder = type.name;
                return r;
            });
    }

};
