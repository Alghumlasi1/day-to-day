'use strict';

const fetch = require('node-fetch');
const dataURL = 'https://foolip.github.io/day-to-day/data.json';

const ORG_PATTERNS = [
  ['annevk@annevk.nl', 'Mozilla'],
  ['anssi.kostiainen@gmail.com', 'Intel'],
  ['beaufort.francois@gmail.com', 'Google'],
  ['bernard.aboba@gmail.com', 'Microsoft'],
  ['birtles@gmail.com', 'Mozilla'],
  ['d@domenic.me', 'Google'],
  ['emilio@crisal.io', 'Mozilla'],
  ['ewilligers@users.noreply.github.com', 'Google'],
  ['41213225+FrankYFTang@users.noreply.github.com', 'Google'],
  ['jackalmage@gmail.com', 'Google'],
  ['jan-ivar@users.noreply.github.com', 'Mozilla'],
  ['Johanna-hub@users.noreply.github.com', 'Mozilla'],
  ['jyherman@gmail.com', 'Mozilla'],
  ['kenneth.christiansen@gmail.com', 'Intel'],
  ['krit@webkit.org', 'Adobe'],
  ['littledan@chromium.org', 'Igalia'],
  ['marcos@marcosc.com', 'Mozilla'],
  ['Ms2ger@gmail.com', 'Igalia'],
  ['Ms2ger@igalia.com', 'Igalia'],
  ['paul@paul.cx', 'Mozilla'],
  ['reillyeon@users.noreply.github.com', 'Google'],
  ['yoav@yoav.ws', 'Google'],
  ['wingboy@gmail.com', 'Mozilla'],
  ['zcorpan@gmail.com', 'Bocoup'],
  [/@apple.com$/, 'Apple'],
  [/@chromium.org$/, 'Google'], // with exception above
  [/@google.com$/, 'Google'],
  [/@intel.com$/, 'Intel'],
  [/@mozilla.com$/, 'Mozilla'],
  [/@w3.org$/, 'W3C'],
];

function orgFromEmail(email) {
  for (const [pattern, org] of ORG_PATTERNS) {
    if (pattern instanceof RegExp && pattern.exec(email)) {
      return org;
    }
    if (pattern === email) {
      return org;
    }
  }
  return null;
}

async function main() {
  const data = await (await fetch(dataURL)).json();

  // Active days are counted as commit counts (or PR counts) are skewed a lot
  // by working mode, i.e. how changes are split and whether branches are
  // squashed. Doing work on multiple days is a decent indicator of activity.
  const authorActivity = new Map;

  for (const spec of data.specs) {
    for (const entry of spec.speclog) {
      const {author, date} = entry;
      if (!authorActivity.has(author)) {
        authorActivity.set(author, new Set);
      }
      authorActivity.get(author).add(date);
    }
  }

  // When aggregating to org activity it doesn't make as much sense to treat
  // each day as its own bucket. Instead add up "org member active days".
  const orgActivity = new Map([['Unaffiliated', 0]]);

  for (const [author, dates] of authorActivity.entries()) {
    if (dates.size < 3) {
      // Skip less active contributors. To include authors going far into
      // the tail will lead to a recognition bias unless all are
      // accounted for.
      continue;
    }

    let org = orgFromEmail(author);
    if (!org) {
      console.warn(`Unaffiliated author: ${author}`);
      org = 'Unaffiliated';
    }

    const count = orgActivity.get(org) || 0;
    orgActivity.set(org, count + dates.size);
  }

  for (const [org, count] of orgActivity.entries()) {
    console.log(`${count}\t${org}`);
  }
}

main();
