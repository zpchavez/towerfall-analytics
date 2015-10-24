var Quiche = require('quiche');

var colorToHex = {
    pink   : 'FFC0CB',
    orange : 'FFA500',
    yellow : 'FFFF00',
    purple : '800080',
    cyan   : '00FFFF',
    red    : 'FF0000',
    green  : '008000',
    blue   : '0000FF',
    white  : 'F8F8FF'
};

exports = module.exports = function(dataGetter) {
    return {
        get : function (request, reply) {
            dataGetter.getFfaKdrLineGraphData(function (rows) {
                var chart = new Quiche('line');

                chart.setTitle('KDR over time');
                chart.setWidth(600);
                chart.setHeight(500);

                var data  = {};
                var dates = [];

                var lastDate = null;
                rows.forEach(function (row) {
                    if (! data[row.color]) {
                        data[row.color] = [];
                    }

                    data[row.color].push(row.kdr);
                    if (lastDate && lastDate.getTime() !== row.date.getTime()) {
                        var date = new Date(row.date);
                        dates.push((date.getMonth() + 1) + '/' + date.getDate());
                    }
                    lastDate = row.date;
                });

                for (var color in data) {
                    chart.addData(data[color], color, colorToHex[color]);
                }

                chart.addAxisLabels('x', dates);
                chart.setTransparentBackground();

                reply.view('main', {chart : chart.getUrl(true)});
            });
        }
    };
};

exports['@singleton'] = true;
exports['@require'] = ['data-getter'];
