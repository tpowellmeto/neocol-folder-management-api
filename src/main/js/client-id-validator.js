"use strict";

const CLIENT_ID_TYPE_1 = new RegExp("(\\d{5,})+\\((\\d{2})\\)");    // SSSSS(YY)
const CLIENT_ID_TYPE_2 = new RegExp("(\\d{4})-(\\d{5,})+");         // YYYY-SSSSS


module.exports.ClientIdValidator = class ClientIdValidator {

    static isValid(clientId) {
        const valid = this._isValidType1(clientId) || this._isValidType2(clientId);
        if (!valid) {
            return null;
        }
        return valid;
    };

    static _isValidType1(clientId) {
        let valid = null;
        const result = CLIENT_ID_TYPE_1.exec(clientId);
        if (result && result.length === 3) {
            valid = {
                serial: result[1],
                year: result[2] === "00" ? `20${result[2]}` : `19${result[2]}`
            };
        }
        return valid;
    };

    static _isValidType2(clientId) {
        let valid = null;
        const result = CLIENT_ID_TYPE_2.exec(clientId);
        if (result && result.length === 3) {

            // confirm matched year is in 20th century
            const year = result[1];
            if (year > 1900 && year < 2001) {
                valid = {
                    serial: result[2],
                    year: year
                };
            }
        }
        return valid;
    };

};
