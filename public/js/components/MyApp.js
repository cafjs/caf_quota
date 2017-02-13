var React = require('react');
var rB = require('react-bootstrap');
var AppActions = require('../actions/AppActions');
var ListNotif = require('./ListNotif');
var AppStatus = require('./AppStatus');

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
    doIncrement : function() {
        var inc = parseInt(document.getElementById('inc').value);
        AppActions.increment(this.props.ctx, inc);
    },
    render: function() {
        return cE('div', {className: 'container-fluid'},
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
                                    }, 'Counter Example'),
                                    cE(rB.Col, {
                                        sm: 5,
                                        xs:11,
                                        className: 'text-right'
                                    }, this.state.fullName)
                                   )
                                )
                  },
                     cE(rB.Panel, {header: 'Update Counter'},
                        cE(rB.Grid, {fluid: true},
                           cE(rB.Row, null,
                              cE(rB.Col, { xs:6, sm:3},
                                 'Current'
                                ),
                              cE(rB.Col, { xs:6, sm:3},
                                    cE(rB.Badge, null, this.state.counter)
                                ),
                              cE('div', {className:'clearfix visible-xs'}),
                              cE(rB.Col, { xs:6, sm: 3},
                                 cE(rB.Input, {type: 'text', id: 'inc',
                                               defaultValue: '1'})
                                ),
                              cE(rB.Col, { xs:6, sm:3},
                                 cE(rB.Button, {onClick: this.doIncrement,
                                                bsStyle: 'primary'},
                                    'Increment')
                                )
                             )
                          )
                       ),
                     cE(rB.Panel, {header: 'Last Notifications'},
                        cE(ListNotif, {notif :this.state.notif})
                       )
                    )
                 );
    }
};

module.exports = React.createClass(MyApp);
