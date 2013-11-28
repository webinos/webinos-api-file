/*******************************************************************************
 * Code contributed to the webinos project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Copyright 2012 Felix-Johannes Jendrusch, Fraunhofer FOKUS
 ******************************************************************************/

module.exports = Module;

var path = require("path");

var DropboxFileSystem = require("./fs/dropbox.js");
var LocalFileSystem = require("./fs/local.js");
var Service = require("./service.js");
var VirtualFileSystem = require("./fs/virtual.js");

function Module(rpc, params, config) {
    this.rpc = rpc;
    this.params = params;
    this.config = config;
    this.internalRegistry = {};
}

Module.prototype.init = function (register, unregister) {
    var self = this;
    self.register = register;
    self.unregister = unregister;
}

Module.prototype.updateServiceParams = function (serviceId, params) {
    var self = this,
        id;

    if (serviceId && self.internalRegistry[serviceId]) {
        self.unregister({"id":serviceId, "api": self.internalRegistry[serviceId].api} );
        delete self.internalRegistry[serviceId];
    }

    if (params) {
        if (params.local) {
            LocalFileSystem.init(self.config.http.port, self.config.http.hostname);
            var localFSService = new Service(self.rpc, new VirtualFileSystem(new LocalFileSystem(params.local.share.name, params.local.share.path)));
            id = self.register(localFSService);
            self.internalRegistry[id] = localFSService;
        }

        if (params.dropbox) {
            DropboxFileSystem.init(params.dropbox.access_token);
            var dropboxFSService = new Service(self.rpc, new VirtualFileSystem(new DropboxFileSystem(params.local.share.name, params.local.share.path)));
            id = self.register(dropboxFSService);
            self.internalRegistry[id] = dropboxFSService;
        }
    }

    return id;
}

Module.prototype.httpHandler = LocalFileSystem.httpHandler;