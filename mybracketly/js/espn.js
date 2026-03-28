/* ============================================
   MyBracketly ESPN Multi-Sport Integration
   ============================================ */

export const SPORTS_REGISTRY = {
    'ncaa-basketball': {
        label: 'NCAA Basketball',
        icon: 'fa-basketball',
        url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard',
        periodLabels: ['1st Half', '2nd Half', 'OT'],
        scoringUnit: 'points'
    },
    'nba': {
        label: 'NBA',
        icon: 'fa-basketball',
        url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',
        periodLabels: ['Q1', 'Q2', 'Q3', 'Q4', 'OT'],
        scoringUnit: 'points'
    },
    'nfl': {
        label: 'NFL',
        icon: 'fa-football',
        url: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
        periodLabels: ['Q1', 'Q2', 'Q3', 'Q4', 'OT'],
        scoringUnit: 'points'
    },
    'mlb': {
        label: 'MLB',
        icon: 'fa-baseball',
        url: 'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard',
        periodLabels: ['Top', 'Bot'],
        scoringUnit: 'runs'
    },
    'nhl': {
        label: 'NHL',
        icon: 'fa-hockey-puck',
        url: 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard',
        periodLabels: ['P1', 'P2', 'P3', 'OT'],
        scoringUnit: 'goals'
    },
    'mls': {
        label: 'MLS',
        icon: 'fa-futbol',
        url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/scoreboard',
        periodLabels: ['1st Half', '2nd Half', 'ET', 'PK'],
        scoringUnit: 'goals'
    },
    'ncaa-football': {
        label: 'NCAA Football',
        icon: 'fa-football',
        url: 'https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard',
        periodLabels: ['Q1', 'Q2', 'Q3', 'Q4', 'OT'],
        scoringUnit: 'points'
    },
    'epl': {
        label: 'Premier League',
        icon: 'fa-futbol',
        url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard',
        periodLabels: ['1st Half', '2nd Half', 'ET', 'PK'],
        scoringUnit: 'goals'
    }
};

export function getSportConfig(sportKey) {
    return SPORTS_REGISTRY[sportKey] || null;
}

export function normalizeEspnGame(event, sportKey) {
    const comp = event.competitions && event.competitions[0];
    if (!comp) return null;

    const sport = SPORTS_REGISTRY[sportKey] || {};
    const status = comp.status || {};
    const statusType = status.type || {};
    const rawState = statusType.state || 'pre';
    const gameState = rawState === 'in' ? 'live' : (rawState === 'post' ? 'final' : 'pre');

    let home = null, away = null;
    (comp.competitors || []).forEach(function (c) {
        const obj = {
            name: c.team ? (c.team.shortDisplayName || c.team.displayName || c.team.abbreviation || '') : '',
            abbreviation: c.team ? (c.team.abbreviation || '') : '',
            score: c.score || null,
            seed: c.curatedRank ? (c.curatedRank.current <= 25 ? c.curatedRank.current : null) : null,
            logo: c.team && c.team.logo ? c.team.logo : '',
            winner: c.winner || false
        };
        if (c.homeAway === 'home') home = obj;
        else away = obj;
    });

    const detail = statusType.detail || status.detail || '';
    const clock = status.displayClock || '';
    const period = status.period || 0;

    let periodText = '';
    if (sportKey === 'mlb') {
        const inningHalf = (period % 1 === 0) ? '' : '';
        periodText = period > 0 ? ('Inn ' + period) : '';
        if (detail) periodText = detail.split(' - ')[0] || periodText;
    } else if (sport.periodLabels) {
        if (period > 0 && period <= sport.periodLabels.length) {
            periodText = sport.periodLabels[period - 1];
        } else if (period > sport.periodLabels.length) {
            periodText = sport.periodLabels[sport.periodLabels.length - 1];
        }
    }

    let network = '';
    if (comp.geoBroadcasts && comp.geoBroadcasts.length > 0) {
        network = comp.geoBroadcasts[0].media ? comp.geoBroadcasts[0].media.shortName : '';
    }

    let startTime = '';
    if (event.date) {
        try {
            const d = new Date(event.date);
            startTime = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        } catch (e) { /* ignore */ }
    }

    return {
        id: event.id,
        home: home,
        away: away,
        gameState: gameState,
        detail: detail,
        clock: clock,
        period: period,
        periodText: periodText,
        network: network,
        startTime: startTime,
        headline: (comp.notes && comp.notes.length > 0) ? comp.notes[0].headline : ''
    };
}

export async function fetchScores(sportKey) {
    const sport = SPORTS_REGISTRY[sportKey];
    if (!sport) return [];

    try {
        const response = await fetch(sport.url);
        const data = await response.json();
        if (data && data.events) {
            return data.events.map(function (ev) {
                return normalizeEspnGame(ev, sportKey);
            }).filter(Boolean);
        }
    } catch (error) {
        console.error('Error fetching ' + sportKey + ' scores:', error);
    }
    return [];
}

// --- Live Feed Manager ---
const activeFeeds = {};

export function startLiveFeed(sportKey, callback, intervalMs) {
    const feedId = sportKey + '_' + Date.now();
    intervalMs = intervalMs || 60000;

    async function tick() {
        const scores = await fetchScores(sportKey);
        callback(scores, sportKey);
    }

    tick();
    const interval = setInterval(tick, intervalMs);
    activeFeeds[feedId] = interval;
    return feedId;
}

export function stopLiveFeed(feedId) {
    if (activeFeeds[feedId]) {
        clearInterval(activeFeeds[feedId]);
        delete activeFeeds[feedId];
    }
}

export function stopAllFeeds() {
    Object.keys(activeFeeds).forEach(function (id) {
        clearInterval(activeFeeds[id]);
    });
    Object.keys(activeFeeds).forEach(function (id) {
        delete activeFeeds[id];
    });
}
