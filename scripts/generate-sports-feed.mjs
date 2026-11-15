// Generates the static data for the reverse-engineered Sports web app.
//
// News: Microsoft's public CMS search API (cdn.query.prod.cms.msn.com).
// Scores: ESPN's public scoreboard API (site.api.espn.com).
//
// Output:
//   docs/sports/data/news.json   { Updated, Value: [OneServiceArticleDataModel] }
//   docs/sports/data/scores.json { Updated, Leagues: [{ id, name, logo, events }] }

import fs from 'node:fs';
import path from 'node:path';

const CMS = 'https://cdn.query.prod.cms.msn.com';
const MARKET = process.env.LUMIA_MARKET || 'en-gb';
const NEWS_OUT = process.argv[2] || 'docs/sports/data/news.json';
const SCORES_OUT = process.argv[3] || 'docs/sports/data/scores.json';
const LOOKBACK_HOURS = Number(process.env.LUMIA_LOOKBACK_HOURS || 168);
const NEWS_LIMIT = Number(process.env.LUMIA_SPORTS_NEWS_LIMIT || 30);

const NEWS_QUERIES = [
  'Premier League',
  'Champions League',
  'La Liga',
  'football',
  'NBA',
  'NFL',
  'tennis',
  'Formula 1'
];

const LEAGUES = [
  { id: 'eng.1', sport: 'soccer', name: 'Premier League', shortName: 'Premier League', path: 'soccer/eng.1' },
  { id: 'esp.1', sport: 'soccer', name: 'La Liga', shortName: 'La Liga', path: 'soccer/esp.1' },
  { id: 'uefa.champions', sport: 'soccer', name: 'Champions League', shortName: 'Champions League', path: 'soccer/uefa.champions' },
  { id: 'rou.1', sport: 'soccer', name: 'Liga I', shortName: 'Liga I', path: 'soccer/rou.1' },
  { id: 'nfl', sport: 'football', name: 'NFL', shortName: 'NFL', path: 'football/nfl' },
  { id: 'nba', sport: 'basketball', name: 'NBA', shortName: 'NBA', path: 'basketball/nba' },
  { id: 'mlb', sport: 'baseball', name: 'MLB', shortName: 'MLB', path: 'baseball/mlb' },
  { id: 'nhl', sport: 'hockey', name: 'NHL', shortName: 'NHL', path: 'hockey/nhl' }
];

async function getJson(url, attempts = 3) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; vintage-phone-collector/1.0)',
          'Accept': 'application/json'
        }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
      return await res.json();
    } catch (err) {
      lastError = err;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw lastError;
}

function normalizeText(value) {
  return String(value || '')
    .replace(/\u00e2\u20ac\u2122/g, '\u2019')
    .replace(/\u00e2\u20ac\u0153/g, '\u201c')
    .replace(/\u00e2\u20ac\u009d/g, '\u201d')
    .replace(/\u00e2\u20ac\u201c/g, '\u2014')
    .replace(/\u00e2\u20ac\u201d/g, '\u2014')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectSport(text, fallback) {
  const t = String(text || '').toLowerCase();
  if (/\b(rugby|all blacks|six nations)\b/.test(t)) return 'Rugby';
  if (/\b(tennis|wta|atp|grand slam|wimbledon|us open)\b/.test(t)) return 'Tennis';
  if (/\b(formula 1|f1|grand prix|verstappen|hamilton)\b/.test(t)) return 'Formula 1';
  if (/\b(cricket|wicket|test match)\b/.test(t)) return 'Cricket';
  if (/\b(golf|pga|ryder cup)\b/.test(t)) return 'Golf';
  if (/\b(boxing|heavyweight|knockout)\b/.test(t)) return 'Boxing';
  if (/\b(gaa|gaelic|all-star)\b/.test(t)) return 'GAA';
  if (/\b(nba|lakers|celtics|warriors|damian lillard|lebron)\b/.test(t)) return 'NBA';
  if (/\b(nfl|touchdown|quarterback|patriots|lions|vikings|packers|belichick|rex ryan|college football|lsu)\b/.test(t)) return 'NFL';
  if (/\b(premier league|champions league|la liga|serie a|bundesliga|ligue 1|nations league|world cup|europa league|soccer|football|arsenal|chelsea|liverpool|manchester|real madrid|barcelona)\b/.test(t)) return 'Football';
  return fallback;
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
  console.log(`wrote ${file}`);
}

async function buildNews() {
  const since = new Date(Date.now() - LOOKBACK_HOURS * 60 * 60 * 1000).toISOString();
  const filter = `'$type'eq'article'and'_locale'eq'${MARKET}'and'_lastPublishedDateTime'gt'${since}'`;
  const seen = new Set();
  const articles = [];

  for (const q of NEWS_QUERIES) {
    const url = `${CMS}/cms/api/amp/search?%24filter=${encodeURIComponent(filter)}&%24top=8&q=${encodeURIComponent(q)}&%24orderby=${encodeURIComponent("'_lastPublishedDateTime' desc")}`;
    let results;
    try {
      results = await getJson(url);
    } catch (err) {
      console.error(`news query "${q}" failed: ${err.message}`);
      continue;
    }
    for (const item of results) {
      if (!item?._id || seen.has(item._id)) continue;
      seen.add(item._id);
      articles.push({ item, q });
    }
  }

  articles.sort((a, b) => String(b.item._lastPublishedDateTime || '').localeCompare(String(a.item._lastPublishedDateTime || '')));

  const value = [];
  for (const { item, q } of articles.slice(0, NEWS_LIMIT)) {
    try {
      const articleHref = item._links?.self?.[0]?.href || `cms/api/amp/article/${item._id}`;
      const article = await getJson(`${CMS}/${articleHref}`);

      // Keep only articles that are actually about sport. The CMS `q=` search
      // is fuzzy and otherwise pulls in general news (e.g. "Formula 1" matching
      // "1", or "football" matching a passing tag on a war story).
      const tags = article.tagEvaluationGroups?.tags || [];
      const sportTag = tags.find(t => /^sport$/i.test(String(t.primaryLabel || '').trim()));
      const text = `${article.title || item._title || ''} ${article.abstract || item._abstract || ''}`;
      const SPORT_WORDS = /\b(football|soccer|premier league|champions league|la liga|serie a|bundesliga|ligue 1|nations league|world cup|europa league|nba|nfl|mlb|nhl|tennis|wta|atp|formula 1|f1|grand prix|boxing|golf|cricket|rugby|arsenal|chelsea|liverpool|manchester|real madrid|barcelona|striker|goalkeeper|midfielder|touchdown|playoff|quarterback|pitcher|home run|grand slam|wicket|gaa|gaelic|all-star|lsu|college football|belichick|damian lillard|lebron|verstappen|hamilton)\b/i;
      if (!sportTag && !SPORT_WORDS.test(text)) {
        continue;
      }
      const category = detectSport(text, q);

      const providerHref = item._provider?.href || article._links?.provider?.[0]?.href;
      const provider = providerHref ? await getJson(`${CMS}/${providerHref}`) : null;
      const imageHref = item._image?.href || article._links?.references?.find(r => r.href.includes('/image/'))?.href;
      const image = imageHref ? await getJson(`${CMS}/${imageHref}`) : null;
      const url = article.sourceHref
        || article.seo?.canonicalUrl
        || `https://www.msn.com/${MARKET}/news/ar-${item._id}`;
      const providerName = normalizeText(provider?.displayName || provider?._name);
      value.push({
        Title: normalizeText(article.title || item._title),
        Abstract: normalizeText(article.abstract || item._abstract),
        Url: url,
        ArticleUrl: url,
        ExternalUrl: url,
        PublishedDateTime: article.displayPublishedDateTime || article._lastPublishedDateTime || item._lastPublishedDateTime,
        Provider: { Name: providerName, DisplayName: providerName },
        Images: image?.href
          ? [{ Url: `${image.href}?w=1200&h=675&q=80`, Width: 1200, Height: 675, Quality: 80 }]
          : [],
        Categories: [category],
        Sport: category,
        TagEvaluationGroups: []
      });
    } catch (err) {
      console.error(`skip ${item._id}: ${err.message}`);
    }
  }

  if (value.length === 0) throw new Error('no sports news articles generated');
  writeJson(NEWS_OUT, { Updated: new Date().toISOString(), Value: value });
}

function teamFromCompetitor(c) {
  const team = c?.team || {};
  return {
    name: team.displayName || team.name || '',
    short: team.shortDisplayName || team.abbreviation || team.name || '',
    abbreviation: team.abbreviation || '',
    logo: team.logo || '',
    score: c?.score ?? '0',
    winner: !!c?.winner
  };
}

async function buildScores() {
  const leagues = [];
  for (const league of LEAGUES) {
    const out = { ...league, logo: '', events: [] };
    try {
      const json = await getJson(`https://site.api.espn.com/apis/site/v2/sports/${league.path}/scoreboard`);
      const lg = json.leagues?.[0];
      const logos = lg?.logos || [];
      out.logo = (logos.find(l => l.rel?.includes('default')) || logos[0] || {}).href || '';
      for (const event of json.events || []) {
        const comp = event.competitions?.[0] || {};
        const status = event.status?.type || comp.status?.type || {};
        const home = (comp.competitors || []).find(c => c.homeAway === 'home');
        const away = (comp.competitors || []).find(c => c.homeAway === 'away');
        if (!home || !away) continue;
        out.events.push({
          id: event.id,
          name: normalizeText(event.name),
          date: comp.date || event.date,
          status: status.description || '',
          detail: status.detail || status.shortDetail || '',
          state: status.state || '',
          completed: !!status.completed,
          home: teamFromCompetitor(home),
          away: teamFromCompetitor(away),
          venue: comp.venue?.fullName || ''
        });
      }
    } catch (err) {
      console.error(`scoreboard ${league.id} failed: ${err.message}`);
      out.error = err.message;
    }
    leagues.push(out);
  }

  if (leagues.every(l => l.events.length === 0 && l.error)) throw new Error('all scoreboards failed');
  writeJson(SCORES_OUT, { Updated: new Date().toISOString(), Leagues: leagues });
}

try {
  await buildNews();
} catch (err) {
  console.error(`news generation failed: ${err.message}`);
  if (!fs.existsSync(NEWS_OUT)) writeJson(NEWS_OUT, { Updated: new Date().toISOString(), Value: [] });
}

try {
  await buildScores();
} catch (err) {
  console.error(`scores generation failed: ${err.message}`);
  if (!fs.existsSync(SCORES_OUT)) writeJson(SCORES_OUT, { Updated: new Date().toISOString(), Leagues: [] });
}
