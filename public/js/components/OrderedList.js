var React = require('react');
var rB = require('react-bootstrap');
var cE = React.createElement;

var OrderedList = {
    render: function() {
        var self = this;
        var keys = Object.keys(this.props.entries||{});
        var sortedKeys = keys.sort(function(a, b) {
            var valA = self.props.entries[a];
            var valB = self.props.entries[b];
            // Decreasing order
            return ((valA < valB) ? 1 : ((valA > valB) ? -1 : 0));
        });
        return cE(rB.ListGroup, null,
                  sortedKeys.map(function(x, i) {
                      return  cE(rB.ListGroupItem, {key:i}, x, ': ',
                                 self.props.entries[x]);
                  })
                 );
    }
};


module.exports = React.createClass(OrderedList);
