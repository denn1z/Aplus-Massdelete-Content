# Aplus-Massdelete-Content
JavaScript to delete the current contentlist from A Plus

Open amazon A+ ContentList and filter which items you want to delete. The script iterates through all links and splits the a+ content reference keys into an array.
Then it will send an post request to Achieve the Content. Keep in mind to replace the apiUrl with your current one. Use this script on your own risk! Also try to understand it before using.

Copy Paste into Dev Console:

javascript:(function(){ (async () => {
  const apiUrl = "https://sellercentral.amazon.de/aplus/api/ArchiveContent"; // << replace with your authorized endpoint

  // Optional: set an Authorization header if you have a bearer token for your own API.
  // const authHeader = "Bearer YOUR_TOKEN_HERE"; // << only use if you are authorized

  // Delay between requests (ms)
  const delayMs = 500;

  // ----- helper functions -----
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  // Extract content IDs from the grid
  function getContentIdsFromGrid() {
    const container = document.querySelector('.ag-center-cols-container');
    if (!container) {
      console.warn('Container not found.');
      return [];
    }

    const katLinks = container.querySelectorAll('kat-link');

    const ids = Array.from(katLinks)
      .map(link => link.getAttribute('href'))
      .filter(Boolean)                      // remove null/undefined
      .filter(href => !href.endsWith('/asins')) // ignore /asins links
      .map(href => href.split('/').pop())   // take the last segment
      .filter(Boolean);                     // remove any empty strings

    // deduplicate
    return Array.from(new Set(ids));
  }

  // Generic POST helper
  async function postProjectId(id) {
    const payload = { projectId: id };
    try {
      const resp = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // "Authorization": authHeader, // uncomment only if you legitimately have an auth token
        },
        body: JSON.stringify(payload),
        // credentials: 'include' // if you want to include cookies for same-origin requests (use with caution)
      });

      // Try to parse JSON but handle non-JSON responses gracefully
      let body;
      try { body = await resp.json(); } catch(e) { body = await resp.text(); }

      return { ok: resp.ok, status: resp.status, body };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  }

  // ----- Main flow -----
  const contentIds = getContentIdsFromGrid();
  console.log('Found content IDs:', contentIds);

  if (!contentIds.length) {
    console.log('No content IDs found — aborting.');
    return;
  }

  // OPTIONAL: Ask user for confirmation in the console before proceeding
  // (Uncomment if you want a safety confirmation)
  // const proceed = confirm(`Send ${contentIds.length} POST requests to ${apiUrl}?`);
  // if (!proceed) { console.log('Aborted by user.'); return; }

  for (const id of contentIds) {
    console.log(`Posting projectId=${id} ...`);
    const result = await postProjectId(id);
    console.log(`Result for ${id}:`, result);

    // rate limit between requests
    await sleep(delayMs);
  }

  console.log('Done.');
})(); })();
