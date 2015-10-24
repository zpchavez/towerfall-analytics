module.exports = {
    connections : [{
        port : 9000
    }],
    plugins : {
        'vision': {},
        '../app-loader' : {
            modules : './src/application'
        }
    }
};