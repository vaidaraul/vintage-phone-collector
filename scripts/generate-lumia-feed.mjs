// Generates the OneService article feed consumed by the revived
// Microsoft News UWP app on the Lumia 535.
//
// Source: Microsoft's public CMS query API (cdn.query.prod.cms.msn.com).
// Output: { "Value": [ OneServiceArticleDataModel, ... ] }
//
// The app's source resolver requests
//   https://{OneServiceDomain}/Common/Search?...&q={SourceName}&documentId={Href}
// and deserializes the response into
//   Microsoft.Msn.News.DataModels.OneService.OneServiceArticleListDataModel
// whose only list property is "Value".

import fs from 'node:fs';
import path from 'node:path';

const CMS = 'https://cdn.query.prod.cms.msn.com';
const MARKET = process.env.LUMIA_MARKET || 'en-gb';
const COUNT = Number(process.env.LUMIA_COUNT || 12);
const OUT = process.argv[2] || 'docs/oneservice.json';
const LOOKBACK_HOURS = Number(process.env.LUMIA_LOOKBACK_HOURS || 72);

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

const since = new Date(Date.now() - LOOKBACK_HOURS * 60 * 60 * 1000).toISOString();
const filter = `'$type'eq'article'and'_locale'eq'${MARKET}'and'_lastPublishedDateTime'gt'${since}'`;
const query = `${CMS}/cms/api/amp/search?%24filter=${encodeURIComponent(filter)}&%24top=${COUNT}&%24orderby=${encodeURIComponent("'_lastPublishedDateTime' desc")}`;

const results = await getJson(query);
console.log(`search results: ${results.length}`);

const seen = new Set();
const value = [];

for (const item of results) {
  if (!item?._id || seen.has(item._id)) continue;
  seen.add(item._id);
  try {
    const articleHref = item._links?.self?.[0]?.href || `cms/api/amp/article/${item._id}`;
    const article = await getJson(`${CMS}/${articleHref}`);
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
      Provider: {
        Name: providerName,
        DisplayName: providerName
      },
      Images: image?.href
        ? [{ Url: `${image.href}?w=1200&h=675&q=80`, Width: 1200, Height: 675, Quality: 80 }]
        : [],
      Categories: [],
      TagEvaluationGroups: []
    });
  } catch (err) {
    console.error(`skip ${item._id}: ${err.message}`);
  }
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ Value: value }, null, 2) + '\n');
console.log(`wrote ${OUT} with ${value.length} articles`);
