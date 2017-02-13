/*!
Copyright 2013 Hewlett-Packard Development Company, L.P.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

"use strict";
var caf = require('caf_core');
var json_rpc = caf.caf_transport.json_rpc;

var APPS_MAP = 'apps';
var USERS_MAP = 'users';


exports.methods = {
    __ca_init__: function(cb) {
        var rule = this.$.security.newSimpleRule('newCA',
                                                 json_rpc.DEFAULT_FROM_USERNAME,
                                                 json_rpc.DEFAULT_FROM_ID);
        this.$.security.addRule(rule);
        this.$.sharing.addWritableMap('apps', APPS_MAP);
        this.$.sharing.addWritableMap('users', USERS_MAP);
        this.state.fullName = this.__ca_getAppName__() + '#' +
            this.__ca_getName__();
        this.state.usersWatch = {};
        this.state.appsWatch = {};
        cb(null);
    },
    hello: function(key, cb) {
        this.$.react.setCacheKey(key);
        this.getState(cb);
    },
    watchUser: function(user, cb) {
        var $$ = this.$.sharing.$;
        this.state.usersWatch[user] = true;
        this.getState(cb);
    },
    unwatchUser: function(user, cb) {
        delete this.state.usersWatch[user];
        this.getState(cb);
    },
    watchApp: function(app, cb) {
        var $$ = this.$.sharing.$;
        this.state.appsWatch[app] = true;
        this.getState(cb);
    },
    unwatchApp: function(app, cb) {
        delete this.state.appsWatch[app];
        this.getState(cb);
    },
    newCA: function(tokenStr, cb) {
        var self =this;
        var $$ = this.$.sharing.$;
        var token = this.$.security.verifyToken(tokenStr);
        if (token) {
            var appName = json_rpc.joinName(token.appPublisher,
                                            token.appLocalName);
            var caName = json_rpc.joinName(token.caOwner, token.caLocalName);
            var name = json_rpc.joinName(appName, caName);
            this.$.bloom.has(name, function(err, present) {
                if (err) {
                    cb(err);
                } else {
                    if (present) {
                        // ignore
                        self.$.log &&
                            self.$.log.warn('Ignoring token ' + name);
                        cb(null);
                    } else {
                        self.$.bloom.add(name);
                        $$.apps.set(appName, ($$.apps.get(appName) || 0) + 1);
                        var n = ($$.users.get(token.caOwner) || 0) + 1;
                        $$.users.set(token.caOwner, n);
                        if (n > self.$.props.maxCAsPerUser) {
                            self.watchUser(token.caOwner, function(err) {
                                cb(err);
                            });
                        } else {
                            cb(null);
                        }
                    }
                }
            });
        } else {
            cb(new Error('Invalid token'));
        }
    },
    getState: function(cb) {
        var $$ = this.$.sharing.$;
        var users = {};
        Object.keys(this.state.usersWatch).forEach(function(x) {
            users[x] = $$.users.get(x);
        });
        var apps = {};
        Object.keys(this.state.appsWatch).forEach(function(x) {
            apps[x] = $$.apps.get(x);
        });
        cb(null, {usersWatch: users, appsWatch: apps});
    }
};

caf.init(module);
