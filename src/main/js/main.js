"use strict";

const nconf = require("nconf");
const path = require("path");

const FolderManager = require("./folder-manager").FolderManager;

const CONFIG_FILE = path.resolve(__dirname, "../resources/config.json");
nconf.argv().env().file({file: CONFIG_FILE});

FolderManager.run(nconf);