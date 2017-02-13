var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;

var ListNotif = {
    render: function() {
        var reverse = this.props.notif.slice(0).reverse();
        return cE(rB.ListGroup, null,
                  reverse.map(function(x, i) {
                      return  cE(rB.ListGroupItem, {key:i},
                                 'counter: ', cE(rB.Badge, null,x));
                  })
                 );
    }
};


module.exports = React.createClass(ListNotif);
