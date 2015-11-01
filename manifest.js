module.exports = {
    connections : [{
        port : 9000
    }],
    plugins : {
        'vision': {},
        'inert' : {},
        '../app-loader' : {
            modules : './src/application'
        }
    }
};