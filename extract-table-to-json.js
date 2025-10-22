javascript:(function(){ (async () => {
  // ----- CONFIG -----
  const delayMs = 100; // Small delay between processing rows
  
  // ----- Helper functions -----
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  
  // Extract data from the grid
  function extractContentData() {
    const container = document.querySelector('.ag-center-cols-container');
    if (!container) {
      console.warn('Container not found.');
      return [];
    }
    
    const rows = container.querySelectorAll('.ag-row');
    const contentData = [];
    
    rows.forEach(row => {
      try {
        // Extract reference key from href
        const katLink = row.querySelector('kat-link[href*="content-manager/content/"]');
        const href = katLink?.getAttribute('href') || '';
        const referenceKey = href.split('/').find(segment => 
          segment.includes('-') && segment.length > 30
        ) || '';
        
        // Extract title from label
        const title = katLink?.getAttribute('label') || '';
        
        // Extract language from locale column
        const localeCell = row.querySelector('[col-id="locale"]');
        const language = localeCell?.textContent.trim() || '';
        
        // Extract updated date from lastActivity column
        const dateCell = row.querySelector('[col-id="lastActivity"]');
        const updated = dateCell?.textContent.trim() || '';
        
        // Extract status from contentStatus column
        const statusCell = row.querySelector('[col-id="contentStatus"]');
        const status = statusCell?.textContent.trim() || '';
        
        if (referenceKey) {
          contentData.push({
            referenceKey,
            title,
            language,
            updated,
            status
          });
        }
      } catch (err) {
        console.warn('Error processing row:', err);
      }
    });
    
    return contentData;
  }
  
  // Download JSON file
  function downloadJSON(data, filename) {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  // ----- Main flow -----
  console.log('Extracting content data...');
  await sleep(delayMs);
  
  const contentData = extractContentData();
  console.log(`Found ${contentData.length} content items:`, contentData);
  
  if (!contentData.length) {
    console.log('No content data found — aborting.');
    return;
  }
  
  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `aplus-content-${timestamp}.json`;
  
  // Download the JSON file
  downloadJSON(contentData, filename);
  console.log(`✅ Downloaded ${filename} with ${contentData.length} items.`);
})(); })();
