#!/usr/bin/env node
// Refreshes a Strava access token and writes current run totals to
// data/strava.json. Run by .github/workflows/strava-sync.yml on a
// schedule; requires STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET and
// STRAVA_REFRESH_TOKEN in the environment.

const fs = require('fs');
const path = require('path');

const CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.STRAVA_REFRESH_TOKEN;

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
  console.error('Missing STRAVA_CLIENT_ID / STRAVA_CLIENT_SECRET / STRAVA_REFRESH_TOKEN env vars.');
  process.exit(1);
}

async function main() {
  const tokenRes = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: 'refresh_token'
    })
  });
  if (!tokenRes.ok) {
    throw new Error(`Token refresh failed: ${tokenRes.status} ${await tokenRes.text()}`);
  }
  const { access_token: accessToken } = await tokenRes.json();

  const athleteRes = await fetch('https://www.strava.com/api/v3/athlete', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!athleteRes.ok) {
    throw new Error(`Athlete lookup failed: ${athleteRes.status} ${await athleteRes.text()}`);
  }
  const athlete = await athleteRes.json();

  const statsRes = await fetch(`https://www.strava.com/api/v3/athletes/${athlete.id}/stats`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!statsRes.ok) {
    throw new Error(`Stats lookup failed: ${statsRes.status} ${await statsRes.text()}`);
  }
  const stats = await statsRes.json();

  const allRun = stats.all_run_totals || { count: 0, distance: 0, elevation_gain: 0 };
  const ytdRun = stats.ytd_run_totals || { count: 0, distance: 0, elevation_gain: 0 };

  const out = {
    updatedAt: new Date().toISOString(),
    allTime: {
      runs: allRun.count,
      km: Math.round(allRun.distance / 1000),
      elevationM: Math.round(allRun.elevation_gain)
    },
    yearToDate: {
      runs: ytdRun.count,
      km: Math.round(ytdRun.distance / 1000),
      elevationM: Math.round(ytdRun.elevation_gain)
    }
  };

  const outPath = path.join(__dirname, '..', 'data', 'strava.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n');
  console.log('Wrote', outPath, out);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
