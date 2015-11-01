'use strict';

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
            handler : controller.get
        }
    ]);

    next();
};

exports.register.attributes = {
    name    : 'griddle',
    version : '0.0.0'
};