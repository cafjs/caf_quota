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

'use strict';
var caf = require('caf_core');
var json_rpc = caf.caf_transport.json_rpc;
var app = require('../public/js/app.js');

var APPS_MAP = 'apps';
var USERS_MAP = 'users';

var relevantState = function(that) {
    var $$ = that.$.sharing.$;
    var users = {};
    Object.keys(that.state.usersWatch).forEach(function(x) {
        var value = $$.users.get(x);
        if (typeof value === 'number') {
            users[x] = value;
        }
    });
    var apps = {};
    Object.keys(that.state.appsWatch).forEach(function(x) {
        var value = $$.apps.get(x);
        if (typeof value === 'number') {
            apps[x] = value;
        }
    });
    return {usersWatch: users, appsWatch: apps};
};

exports.methods = {
    __ca_init__: function(cb) {
        var rule = this.$.security
                .newSimpleRule(['newCA', '__external_ca_touch__'],
                               json_rpc.DEFAULT_FROM_USERNAME,
                               json_rpc.DEFAULT_FROM_ID);
        this.$.security.addRule(rule);
        this.$.sharing.addWritableMap('apps', APPS_MAP);
        this.$.sharing.addWritableMap('users', USERS_MAP);
        this.state.fullName = this.__ca_getAppName__() + '#' +
            this.__ca_getName__();
        this.state.usersWatch = {};
        this.state.appsWatch = {};
        this.$.session.limitQueue(1); // 'default'
        cb(null);
    },
    __ca_pulse__: function(cb) {
        this.$.log && this.$.log.debug('calling PULSE!!!');
        this.$.react.render(app.main, [relevantState(this)]);
        cb(null);
    },
    hello: function(key, cb) {
        this.$.react.setCacheKey(key);
        this.getState(cb);
    },
    watchUser: function(user, cb) {
        this.state.usersWatch[user] = true;
        this.getState(cb);
    },
    unwatchUser: function(user, cb) {
        delete this.state.usersWatch[user];
        this.getState(cb);
    },
    watchApp: function(app, cb) {
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
                            self.$.session.notify(['new'], 'default');
                            self.watchUser(token.caOwner, function(err) {
                                cb(err);
                            });
                        } else {
                            if (self.state.appsWatch[appName] ||
                                self.state.usersWatch[token.caOwner]) {
                                self.$.session.notify(['updated'], 'default');
                            }
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
        this.$.react.coin();
        cb(null, relevantState(this));
    }
};

caf.init(module);
