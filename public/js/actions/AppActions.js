var AppConstants = require('../constants/AppConstants');
var json_rpc = require('caf_transport').json_rpc;

var updateF = function(store, state) {
    var d = {
        type: AppConstants.APP_UPDATE,
        state: state
    };
    store.dispatch(d);
};

var errorF =  function(store, err) {
    var d = {
        type: AppConstants.APP_ERROR,
        error: err
    };
    store.dispatch(d);
};

var notifyF = function(store, message) {
    var getNotifData = function(msg) {
        return json_rpc.getMethodArgs(msg)[0];
    };
    var d = {
        type: AppConstants.APP_NOTIFICATION,
        state: getNotifData(message)
    };
    store.dispatch(d);
};

var wsStatusF =  function(store, isClosed) {
    var d = {
        type: AppConstants.WS_STATUS,
        isClosed: isClosed
    };
    store.dispatch(d);
};

var AppActions = {
    initServer: function(ctx, initialData) {
        updateF(ctx.store, initialData);
    },
    init: function(ctx, cb) {
        ctx.session.hello(ctx.session.getCacheKey(), function(err, data) {
            if (err) {
                errorF(ctx.store, err);
            } else {
                updateF(ctx.store, data);
            }
            cb(err, data);
        });
    },
    increment: function(ctx, inc) {
        ctx.session.increment(inc, function(err, data) {
            if (err) {
                errorF(ctx.store, err);
            } else {
                updateF(ctx.store, data);
            }
        });
    },
    message:  function(ctx, msg) {
        console.log('message:' + JSON.stringify(msg));
        notifyF(ctx.store, msg);
    },
    closing:  function(ctx, err) {
        console.log('Closing:' + JSON.stringify(err));
        wsStatusF(ctx.store, true);
    }
};


module.exports = AppActions;
