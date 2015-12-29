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

var makeLineGraph = function (rows, reply, title) {
    var points = {};
    var dates  = [];

    rows.forEach(function (row) {
        var date = new Date(row.date);
        var dateLabel = ((date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear());

        if (! points[dateLabel]) {
            points[dateLabel] = {};
        }

        points[dateLabel][row.color] = row.point;
    });

    var labels      = [];
    var dataByColor = {};
    Object.keys(points).forEach(function (date) {
        labels.push(date.replace(/\/\d{4}$/, '')); // Remove year to keep label short

        Object.keys(colorToHex).forEach(function (color) {
            if (! dataByColor[color]) {
                dataByColor[color] = [];
            }

            dataByColor[color].push(points[date][color] || null);
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
        datasetFill        : false,
        scaleGridLineColor : '#000000'
    };

    reply.view('line', {
        title   : title,
        data    : JSON.stringify(data),
        options : JSON.stringify(options)
    });
};

exports = module.exports = function(dataGetter) {
    return {
        getMenu : function (request, reply) {
            reply.view('menu', null, { layout : 'menu-layout'});
        },

        getTeamWinRates : function (request, reply) {
            dataGetter.getTeamWinRateData(function (results) {
                var datasets = [];

                results.forEach(function (result) {
                    var team = result.team;

                    datasets.push({
                        label       : team,
                        strokeColor : colorToHex[team.substring(0, team.indexOf('/'))],
                        fillColor   : colorToHex[team.substring(team.indexOf('/') + 1)],
                        data        : [result.rate]
                    });
                });

                var data = {
                    labels   : ['Win Rate'],
                    datasets : datasets
                };

                var options = {
                     barStrokeWidth     : 20,
                     scaleGridLineColor : '#000000',
                     barDatasetSpacing  : 10
                };

                reply.view('bar', {
                    title   : '2v2 Win Rates',
                    data    : JSON.stringify(data),
                    options : JSON.stringify(options)
                });
            });
        },

        getKdrOverTime : function (request, reply) {
            dataGetter.getKdrLineGraphData(function (rows) {
                makeLineGraph(rows, reply, 'KDR Over Time');
            });
        },

        getWeeklyKdrOverTime : function (request, reply) {
            dataGetter.getWeeklyKdrLineGraphData(function (rows) {
                makeLineGraph(rows, reply, 'Weekly KDR Over Time');
            });
        },

        getWeeklyMatchesPlayed : function (request, reply) {
            dataGetter.getWeeklyMatchesPlayedData(function (rows) {
                makeLineGraph(rows, reply, 'Weekly Matches Played');
            });
        }
    };
};

exports['@singleton'] = true;
exports['@require'] = ['data-getter'];
