var knex   = require('towerfall-stats').dbKnex;
var sortby = require('lodash.sortby');

exports = module.exports = function() {
    return {
        getFreeForAllMatchData : function(callback)
        {
            knex.select()
                .from('matches')
                .innerJoin('player_match_stats', 'matches.id', 'player_match_stats.match_id')
                .where({won : 1})
                .orderBy('datetime')
                .groupBy('match_id')
                .havingRaw('SUM(won) = 1')
                .then(callback);
        },

        getKdrLineGraphData : function(callback)
        {
            knex.select(
                'color',
                knex.raw('SUM(kills) / SUM(deaths) AS point'),
                knex.raw('DATE(datetime) AS date')
            )
            .from('matches')
            .innerJoin('player_match_stats', 'matches.id', 'player_match_stats.match_id')
            .groupBy(knex.raw('DATE(datetime)'))
            .groupBy('color')
            .orderBy('datetime')
            .then(callback);
        },

        getWeeklyKdrLineGraphData : function(callback)
        {
            knex.select(
                'color',
                knex.raw('SUM(kills) / SUM(deaths) AS point'),
                knex.raw("STR_TO_DATE(CONCAT(YEAR(datetime),WEEK(datetime),' Monday'), '%X%V %W') AS date")
            )
            .from('matches')
            .innerJoin('player_match_stats', 'matches.id', 'player_match_stats.match_id')
            .groupBy(knex.raw('WEEK(datetime)'))
            .groupBy('color')
            .orderBy(knex.raw('WEEK(`datetime`)'))
            .then(callback);
        },

        getWeeklyMatchesPlayedData : function(callback)
        {
            knex.select(
                'color',
                knex.raw('COUNT(*) AS point'),
                knex.raw("STR_TO_DATE(CONCAT(YEAR(datetime),WEEK(datetime),' Monday'), '%X%V %W') AS date")
            )
            .from('matches')
            .innerJoin('player_match_stats', 'matches.id', 'player_match_stats.match_id')
            .groupBy(knex.raw('WEEK(datetime)'))
            .groupBy('color')
            .orderBy(knex.raw('WEEK(`datetime`)'))
            .then(callback);
        },

        getTeamWinRateData : function(callback)
        {
            var twoVsTwoMatchIdsSubquery = knex
                .select('match_id')
                .from('player_match_stats')
                .groupBy('match_id')
                .having(knex.raw('SUM(won) > 1 AND SUM(!won) > 1'));

            knex.select(
                'match_id',
                knex.raw('GROUP_CONCAT(IF(won, color, null) ORDER BY color SEPARATOR "/") AS winners'),
                knex.raw('GROUP_CONCAT(IF(!won, color, null) ORDER BY color SEPARATOR "/") AS losers')
            )
            .from('player_match_stats')
            .whereIn('match_id', twoVsTwoMatchIdsSubquery)
            .groupBy('match_id')
            .then(function (rows) {
                var results = {};

                rows.forEach(function (row) {
                    if (! results[row.winners]) {
                        results[row.winners] = {wins : 0, matches: 0};
                    }
                    if (! results[row.losers]) {
                        results[row.losers] = {wins : 0, matches: 0};
                    }
                    results[row.winners].matches++;
                    results[row.losers].matches++;
                    results[row.winners].wins++;
                });

                var resultsArray = [];
                for (var team in results) {
                    results[team].rate = results[team].wins / results[team].matches;
                    results[team].team = team;
                    resultsArray.push(results[team]);
                }

                callback(sortby(resultsArray, function (result) {return result.rate * -1;}));
            });
        }
    };
};

exports['@singleton'] = true;
