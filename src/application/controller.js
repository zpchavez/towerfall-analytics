var colorToHex = {
    pink   : '#FFC0CB',
    orange : '#FFA500',
    yellow : '#FFFF00',
    purple : '#800080',
    cyan   : '#00FFFF',
    red    : '#FF0000',
    green  : '#008000',
    blue   : '#0000FF',
    white  : '#FFFFFF'
};

exports = module.exports = function(dataGetter) {
    return {
        get : function (request, reply) {
            dataGetter.getKdrLineGraphData(function (rows) {
                var kdrs        = {};
                var dates       = [];

                rows.forEach(function (row) {
                    var date = new Date(row.date);
                    var dateLabel = ((date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear());

                    if (! kdrs[dateLabel]) {
                        kdrs[dateLabel] = {};
                    }

                    kdrs[dateLabel][row.color] = row.kdr;
                });

                var labels      = [];
                var dataByColor = {};
                Object.keys(kdrs).forEach(function (date) {
                    labels.push(date.replace(/\/\d{4}$/, '')); // Remove year to keep label short

                    Object.keys(colorToHex).forEach(function (color) {
                        if (! dataByColor[color]) {
                            dataByColor[color] = [];
                        }

                        dataByColor[color].push(kdrs[date][color] || null);
                    });
                });

                var datasets = [];

                Object.keys(dataByColor).forEach(function (color) {
                    datasets.push({
                        label       : color,
                        strokeColor : colorToHex[color],
                        pointColor  : colorToHex[color],
                        data        : dataByColor[color]
                    });
                });

                var data = {
                    labels   : labels,
                    datasets : datasets
                };

                var options = {
                    datasetFill : false
                };

                reply.view('line', {
                    title   : 'KDR Over Time',
                    data    : JSON.stringify(data),
                    options : JSON.stringify(options)
                });
            });
        }
    };
};

exports['@singleton'] = true;
exports['@require'] = ['data-getter'];
