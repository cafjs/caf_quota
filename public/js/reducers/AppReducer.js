var AppConstants = require('../constants/AppConstants');
var objectAssign = require('object-assign');

var AppReducer = function(state, action) {
    if (typeof state === 'undefined') {
        return  {counter: -1, notif :[], isClosed: false};
    } else {
        switch(action.type) {
        case AppConstants.APP_UPDATE:
        case AppConstants.APP_NOTIFICATION:
            return objectAssign({}, state, action.state);
        case AppConstants.APP_ERROR:
            return objectAssign({}, state, {error: action.error});
        case AppConstants.WS_STATUS:
            return objectAssign({}, state, {isClosed: action.isClosed});
        default:
            return state;
        }
    };
};

module.exports = AppReducer;
