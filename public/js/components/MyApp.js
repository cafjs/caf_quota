var React = require('react');
var rB = require('react-bootstrap');
var AppActions = require('../actions/AppActions');
var OrderedList = require('./OrderedList');
var AppStatus = require('./AppStatus');
var NewError = require('./NewError');

var cE = React.createElement;

var MyApp = {
    getInitialState: function() {
        return this.props.ctx.store.getState();
    },
    componentDidMount: function() {
        if (!this.unsubscribe) {
            this.unsubscribe = this.props.ctx.store
                .subscribe(this._onChange.bind(this));
            this._onChange();
        }
    },
    componentWillUnmount: function() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
    },
    _onChange : function() {
        if (this.unsubscribe) {
            this.setState(this.props.ctx.store.getState());
        }
    },
    doWatchUser : function(ev) {
        if (typeof this.state.username === 'string') {
            AppActions.watchUser(this.props.ctx, this.state.username);
        } else {
            AppActions.setError(this.props.ctx,
                                new Error('Cannot deploy, missing inputs'));
        }
    },
    doUnwatchUser : function(ev) {
        if (typeof this.state.username === 'string') {
            AppActions.unwatchUser(this.props.ctx, this.state.username);
        } else {
            AppActions.setError(this.props.ctx,
                                new Error('Cannot deploy, missing inputs'));
        }
    },
    doWatchApp : function(ev) {
        if (typeof this.state.appName === 'string') {
            AppActions.watchApp(this.props.ctx, this.state.appName);
        } else {
            AppActions.setError(this.props.ctx,
                                new Error('Cannot deploy, missing inputs'));
        }
    },
    doUnwatchApp : function(ev) {
        if (typeof this.state.appName === 'string') {
            AppActions.unwatchApp(this.props.ctx, this.state.appName);
        } else {
            AppActions.setError(this.props.ctx,
                                new Error('Cannot deploy, missing inputs'));
        }
    },
    handleAppNameChange : function() {
        AppActions.setLocalState(this.props.ctx, {
            appName: this.refs.appName.getValue()
        });
    },
    handleUsernameChange : function() {
        AppActions.setLocalState(this.props.ctx, {
            username: this.refs.username.getValue()
        });
    },
    render: function() {
        return cE('div', {className: 'container-fluid'},
                  cE(NewError, {
                      ctx: this.props.ctx,
                      error: this.state.error
                  }),
                  cE(rB.Panel, {
                      header: cE(rB.Grid, {fluid: true},
                                 cE(rB.Row, null,
                                    cE(rB.Col, {sm:1, xs:1},
                                       cE(AppStatus, {
                                           isClosed:
                                           this.state.isClosed
                                       })),
                                    cE(rB.Col, {
                                        sm: 5,
                                        xs:10,
                                        className: 'text-right'
                                    }, 'Quota'),
                                    cE(rB.Col, {
                                        sm: 5,
                                        xs:11,
                                        className: 'text-right'
                                    }, this.state.fullName)
                                   )
                                )
                  }, cE(rB.Panel, {header: 'User'},
                        cE(rB.Grid, {fluid: true},
                           cE(rB.Row, null,
                              cE(rB.Col, { xs:12, sm:6},
                                 cE(rB.Input, {
                                     type: 'text',
                                     value: this.state.username,
                                       ref: 'username',
                                     placeholder: 'foo',
                                     onChange: this.handleUsernameChange
                                 })
                                ),
                              cE(rB.Col, { xs: 3, sm:2},
                                 cE(rB.Button, {
                                     onClick: this.doWatchUser,
                                     bsStyle: 'primary'
                                 }, 'Watch')
                                ),
                              cE(rB.Col, { xs: 3, sm:2},
                                 cE(rB.Button, {
                                     onClick: this.doUnwatchUser,
                                     bsStyle: 'danger'
                                 }, 'Unwatch')
                                )
                             )
                          )
                       ),
                     cE(rB.Panel, {header: 'App'},
                        cE(rB.Grid, {fluid: true},
                           cE(rB.Row, null,
                              cE(rB.Col, { xs:12, sm:6},
                                 cE(rB.Input, {
                                     type: 'text',
                                     value: this.state.appName,
                                     ref: 'appName',
                                     placeholder: 'foo-helloworld',
                                     onChange: this.handleAppNameChange
                                 })
                                ),
                           cE(rB.Col, { xs: 3, sm:2},
                              cE(rB.Button, {
                                  onClick: this.doWatchApp,
                                  bsStyle: 'primary'
                              }, 'Watch')
                             ),
                           cE(rB.Col, { xs: 3, sm:2},
                              cE(rB.Button, {
                                  onClick: this.doUnwatchApp,
                                  bsStyle: 'danger'
                              }, 'Unwatch')
                             )
                          )
                          )
                       ),
                     cE(rB.Panel, {header: 'Watched Users'},
                        cE(OrderedList, {entries: this.state.usersWatch})
                       ),
                     cE(rB.Panel, {header: 'Watched Apps'},
                        cE(OrderedList, {entries: this.state.appsWatch})
                       )
                    )
                 );
    }
};

module.exports = React.createClass(MyApp);
