var knex = require('towerfall-stats').dbKnex;

exports = module.exports = function() {
    return {
        getKdrLineGraphData : function(callback)
        {
            knex.select(
                'color',
                knex.raw('SUM(kills) / SUM(deaths) AS kdr'),
                knex.raw('DATE(datetime) AS date')
            )
            .from('matches')
            .innerJoin('player_match_stats', 'matches.id', 'player_match_stats.match_id')
            .groupBy(knex.raw('DATE(datetime)'))
            .groupBy('color')
            .orderBy('datetime')
            .then(callback);
        }
    };
};

exports['@singleton'] = true;
