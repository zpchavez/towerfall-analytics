var ioc = require('electrolyte');

exports.register = function(server, options, next) {
    ioc.use(ioc.node('src/application'));

    var controller = ioc.create('controller');

    server.views({
        engines : {
            html : require('handlebars')
        },
        relativeTo : __dirname,
        path       : 'templates',
        layout     : true,
        layoutPath : __dirname + '/templates'
    });

    server.route([
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