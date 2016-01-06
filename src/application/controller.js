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

var MIN_STREAK = 3;

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

makeStreakBarGraph = function(rows, reply, title) {
    var previousWinner = null;
    var streakCount    = 0;
    var streaks        = {};

    var winners = [];
    rows.forEach(function (row) {
        if (winners.indexOf(row.winner) === -1) {
            winners.push(row.winner);
        }
    });

    rows.forEach(function (row, index) {
        if (previousWinner !== row.winner || (index + 1) === rows.length) {
            if (streakCount >= MIN_STREAK) {
                if (typeof streaks[streakCount] === 'undefined') {
                    streaks[streakCount] = {};
                    winners.forEach(function (winner) {
                        streaks[streakCount][winner] = 0;
                    });
                }
                streaks[streakCount][previousWinner] += 1;
            }
            streakCount = 1;
        } else {
            streakCount += 1;
        }
        previousWinner = row.winner;
    });

    var longestStreak = 0;
    Object.keys(streaks).forEach(function (index) {
        if (index > longestStreak) {
            longestStreak = index;
        }
    });

    var labels = [];
    var winnerData = {};
    winners.forEach(function (winner) {
        winnerData[winner] = [];
    });

    var incrementData = function (winner) {
        winnerData[winner].push(streaks[streakCount][winner]);
    };
    for (streakCount = MIN_STREAK; streakCount <= longestStreak; streakCount += 1) {
        if (typeof streaks[streakCount] === 'undefined') {
            continue;
        }

        labels.push(streakCount);
        Object.keys(winnerData).forEach(incrementData);
    }

    var datasets = [];
    Object.keys(winnerData).forEach(function (winner) {
        var dataset = getDatasetColors(winner);
        dataset.data = winnerData[winner];
        datasets.push(dataset);
    });

    var data = {
        labels   : labels,
        datasets : datasets
    };

    var options = {
         barStrokeWidth     : Math.round(400 / (winners.length * Object.keys(streaks).length)),
         scaleGridLineColor : '#000000'
    };

    reply.view('bar', {
        title   :title ,
        data    : JSON.stringify(data),
        options : JSON.stringify(options)
    });
};

var getDatasetColors = function (colorOrTeam) {
    var colors = colorOrTeam.split(',');

    return {
        strokeColor    : colorToHex[colors[0]],
        fillColor      : colors.length > 1 ? colorToHex[colors[1]] : colorToHex[colors[0]]
    };
};

exports = module.exports = function(dataGetter) {
    return {
        getMenu : function (request, reply) {
            reply.view('menu', null, { layout : 'menu-layout'});
        },

        getTotalTeamWinRates : function (request, reply) {
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
                     barStrokeWidth     : Math.round(400 / datasets.length),
                     scaleGridLineColor : '#000000',
                     barDatasetSpacing  : 10
                };

                reply.view('bar', {
                    title   : 'Total 2v2 Win Rates',
                    data    : JSON.stringify(data),
                    options : JSON.stringify(options)
                });
            });
        },

        getDailyKdr : function (request, reply) {
            dataGetter.getDailyKdrData(function (rows) {
                makeLineGraph(rows, reply, 'KDR Over Time');
            });
        },

        getWeeklyKdr : function (request, reply) {
            dataGetter.getWeeklyKdrData(function (rows) {
                makeLineGraph(rows, reply, 'Weekly KDR Over Time');
            });
        },

        getWeeklyWinRate : function (request, reply) {
            dataGetter.getWeeklyWinRateData(function (rows) {
                makeLineGraph(rows, reply, 'Weekly Win Rate');
            });
        },

        getWeeklyMatchesPlayed : function (request, reply) {
            dataGetter.getWeeklyMatchesPlayedData(function (rows) {
                makeLineGraph(rows, reply, 'Weekly Matches Played');
            });
        },

        getWeeklySurvivalRate : function (request, reply) {
            dataGetter.getWeeklySurvivalRateData(function (rows) {
                makeLineGraph(rows, reply, 'Weekly Survival Rate (Free For All)');
            });
        },

        getTotal2v2Streaks : function (request, reply) {
            dataGetter.get2v2MatchData(function (rows) {
                makeStreakBarGraph(rows, reply, 'Total Winning Streaks (2v2)');
            });
        },

        getTotalFreeForAllStreaks : function (request, reply) {
            dataGetter.getFreeForAllMatchData(function (rows) {
                makeStreakBarGraph(rows, reply, 'Total Winning Streaks (Free For All)');
            });
        }
    };
};

exports['@singleton'] = true;
exports['@require'] = ['data-getter'];
