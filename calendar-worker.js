// Stablus – Cloudflare Worker
// Fetches the Booking.com iCal feed server-side and returns it
// with CORS headers so the website can read it from the browser.
//
// Deploy steps:
//   1. Go to https://workers.cloudflare.com — sign up free
//   2. Click "Create a Worker"
//   3. Paste this entire file into the editor, replacing the default code
//   4. Click "Save and Deploy"
//   5. Copy the worker URL (e.g. https://stablus-cal.your-name.workers.dev)
//   6. In index.html, set:  const WORKER_URL = 'YOUR_WORKER_URL_HERE';

const ICAL_URL = 'https://ical.booking.com/v1/export?t=7d070feb-6e8b-4429-8930-53a99e4823b0';

export default {
  async fetch(request) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    try {
      const response = await fetch(ICAL_URL, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CalendarSync/1.0)',
          'Accept': 'text/calendar, text/plain, */*',
        },
        cf: { cacheTtl: 1800, cacheEverything: true },
      });

      const body = await response.text();

      return new Response(body, {
        status: response.status,
        headers: {
          'Content-Type': 'text/calendar; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=1800',
        },
      });
    } catch (err) {
      return new Response('Failed to fetch calendar: ' + err.message, {
        status: 502,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }
  },
};
