var React     = require('react');
var LineChart = require('react-chartjs').Line;

module.exports = React.createClass({

    propTypes : {
        data : React.PropTypes.object.isRequired
    },

    render : function()
    {
        return (
            <div>
                <h1>Line Chart</h1>
                <LineChart data={this.props.data} width='500' height='500'/>
            </div>
        );
    }
});