var colorToHex = {
    pink   : '#FFC0CB',
    orange : '#FFA500',
    yellow : '#FFFF00',
    purple : '#800080',
    cyan   : '#00FFFF',
    red    : '#FF0000',
    green  : '#008000',
    blue   : '#0000FF',
    white  : '#F8F8FF'
};

exports = module.exports = function(dataGetter) {
    return {
        get : function (request, reply) {
            dataGetter.getKdrLineGraphData(function (rows) {
                var datasets  = {};
                var dates = [];

                var lastDate = null;
                rows.forEach(function (row) {
                    if (! datasets[row.color]) {
                        datasets[row.color] = {
                            label : row.color,
                            strokeColor : colorToHex[row.color],
                            pointColor  : colorToHex[row.color],
                            data        : []
                        };
                    }

                    datasets[row.color].data.push(row.kdr);

                    // If a new date, push it to dates
                    if (lastDate && lastDate.getTime() !== row.date.getTime()) {
                        var date = new Date(row.date);
                        dates.push((date.getMonth() + 1) + '/' + date.getDate());
                    }
                    lastDate = row.date;
                });

                // Convert dataset from object to array
                var datasetArray = [];

                for (var color in datasets) {
                    datasetArray.push(datasets[color]);
                }

                var data = {
                    labels   : dates,
                    datasets : datasetArray
                };

                var options = {
                    datasetFill : false
                };

                reply.view('main', {data : JSON.stringify(data), options : JSON.stringify(options)});
            });
        }
    };
};

exports['@singleton'] = true;
exports['@require'] = ['data-getter'];
