var ioc = require('electrolyte');

exports.register = function(server, options, next) {
    ioc.use(ioc.node('src/application'));

    var controller = ioc.create('controller');

    server.views({
        engines : {
            html : require('handlebars')
        },
        relativeTo : __dirname,
        path       : 'src/templates',
        layout     : true,
        layoutPath : __dirname + '/src/templates'
    });

    server.route([
        // Make Chart.js accessible from node_modules
        {
            method  : 'GET',
            path    : '/Chart.js',
            handler : {
                file: {
                    path : 'node_modules/chart.js/Chart.js'
                }
            }
        },
        // Actual routes
        {
            method  : 'GET',
            path    : '/',
            handler : controller.getMenu
        },
        {
            method  : 'GET',
            path    : '/daily-kdr',
            handler : controller.getDailyKdr
        },
        {
            method  : 'GET',
            path    : '/weekly-kdr',
            handler : controller.getWeeklyKdr
        },
        {
            method  : 'GET',
            path    : '/weekly-win-rate',
            handler : controller.getWeeklyWinRate
        },
        {
            method  : 'GET',
            path    : '/weekly-matches-played',
            handler : controller.getWeeklyMatchesPlayed
        },
        {
            method  : 'GET',
            path    : '/weekly-survival-rate',
            handler : controller.getWeeklySurvivalRate
        },
        {
            method  : 'GET',
            path    : '/total-2v2-win-rates',
            handler : controller.getTotalTeamWinRates
        },
        {
            method  : 'GET',
            path    : '/ffa-total-streaks',
            handler : controller.getTotalFreeForAllStreaks
        },
        {
            method  : 'GET',
            path    : '/2v2-total-streaks',
            handler : controller.getTotal2v2Streaks
        }
    ]);

    next();
};

exports.register.attributes = {
    name    : 'towerfall-analytics',
    version : '0.0.0'
};