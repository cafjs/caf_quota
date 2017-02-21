#!/usr/bin/env node
'use strict';

var parseArgs = require('minimist');
var caf_core =  require('caf_core');
var json_rpc = caf_core.caf_transport.json_rpc;
var caf_comp = caf_core.caf_components;
var async = caf_comp.async;
var myUtils = caf_comp.myUtils;
var caf_cli = caf_core.caf_cli;
var srpClient = require('caf_srp').client;
var urlParser = require('url');

var ACCOUNTS_URL = 'https://root-accounts.cafjs.com';


var usage = function() {
    console.log('Usage: client.js --url <string> --caName <string> --quotaURL <string> --quotaCaName <string> [--password <string>] [--accountsURL <string>]');
    process.exit(1);
};

var argv = parseArgs(process.argv.slice(2), {
    string : ['url', 'caName', 'quotaURL', 'quotaCaName', 'password',
              'accountsURL'],
    alias: {u : 'url', c: 'caName', p: 'password', a: 'accountsURL'},
    unknown: usage
});

if (!argv.url || !argv.caName|| !argv.quotaURL || !argv.quotaCaName) {
    usage();
}

var specAll = {
    log: function(x) {
        console.log(x);
    },
    securityClient: srpClient,
    accountsURL: argv.accountsURL || ACCOUNTS_URL,
    password: argv.password,
    from: argv.caName,
    unrestrictedToken: false
};

var parsedURL =  urlParser.parse(argv.url);
var h = json_rpc.splitName(parsedURL.hostname.split('.')[0]);
specAll.appPublisher = h[0];
specAll.appLocalName = h[1];

var specQuota = {
    log: function(x) {
        console.log(x);
    },
    securityClient: srpClient,
    accountsURL: argv.accountsURL || ACCOUNTS_URL,
    password: argv.password,
    from: argv.quotaCaName,
    unrestrictedToken: false,
    disableBackchannel: true
};

async.waterfall([
    function(cb) {
        var tf = caf_cli.TokenFactory(specAll);
        tf.newToken(null, cb);
    },
    function(tokenStr, cb) {
        var s = new caf_cli.Session(argv.quotaURL, argv.quotaCaName, specQuota);
        s.onopen = function() {
            s.newCA(tokenStr, function(err) {
                s.close(err);
            });
        };

        s.onclose = function(err) {
            cb(err);
        };
    }
], function(err) {
    if (err) {
        console.log(myUtils.errToPrettyStr(err));
        process.exit(1);
    }  else {
        console.log('OK');
    }
});
