"use strict";

const restify = require("restify");

const FolderRouter = require("./folder-router").FolderRouter;


module.exports.FolderManager = class FolderManager {

    static run(conf) {

        let server = restify.createServer({
            name: conf.get("NAME")
        });

        server.use(restify.plugins.bodyParser({mapParams: true}));

        const folderRouter = new FolderRouter();
        folderRouter.router.applyRoutes(server, "/folders");

        server.listen(conf.get("PORT"), () => {
            console.log(`${server.name} listening at ${server.url}`);
        });

        return server;
    }

};