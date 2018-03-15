"use strict";

/**
 * Stubbed implementation of the file management system api.
 * Assume each of the methods returns a Promise.
 *
 * @type {exports.FileManagementAPI}
 */
module.exports.FileManagementAPI = class FileManagementAPI {

    getFolderById(id) {
        return Promise.resolve(null);
    }

    getFolderByName(parentFolderId, name) {
        return Promise.resolve(null);
    }

    createFolder(parentFolderId, name) {
        return Promise.resolve(null);
    }

};