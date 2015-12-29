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
            path    : '/kdr-over-time',
            handler : controller.getKdrOverTime
        },
        {
            method  : 'GET',
            path    : '/weekly-kdr-over-time',
            handler : controller.getWeeklyKdrOverTime
        },
        {
            method  : 'GET',
            path    : '/weekly-matches-played',
            handler : controller.getWeeklyMatchesPlayed
        },
        {
            method  : 'GET',
            path    : '/2v2-win-rates',
            handler : controller.getTeamWinRates
        }
    ]);

    next();
};

exports.register.attributes = {
    name    : 'towerfall-analytics',
    version : '0.0.0'
};