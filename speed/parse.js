const fs = require('fs');

function parseLighthouse(path, label) {
  const data = JSON.parse(fs.readFileSync(path, 'utf8'));
  console.log(`\n--- ${label} ---`);
  console.log(`Performance Score: ${data.categories.performance.score * 100}`);
  console.log(`FCP: ${data.audits['first-contentful-paint'].displayValue}`);
  console.log(`LCP: ${data.audits['largest-contentful-paint'].displayValue}`);
  console.log(`TBT: ${data.audits['total-blocking-time'].displayValue}`);
  console.log(`CLS: ${data.audits['cumulative-layout-shift'].displayValue}`);
  console.log(`Speed Index: ${data.audits['speed-index'].displayValue}`);
  
  console.log('\nTop Opportunities:');
  Object.values(data.audits)
    .filter(a => a.details && a.details.type === 'opportunity' && a.details.overallSavingsMs > 0)
    .sort((a, b) => b.details.overallSavingsMs - a.details.overallSavingsMs)
    .slice(0, 5)
    .forEach(a => {
      console.log(`- ${a.title}: saves ${a.details.overallSavingsMs}ms`);
    });

  console.log('\nTop Diagnostics:');
  const diagnostics = ['mainthread-work-breakdown', 'bootup-time', 'dom-size', 'server-response-time'];
  diagnostics.forEach(id => {
    const a = data.audits[id];
    if (a) {
       console.log(`- ${a.title}: ${a.displayValue || a.score}`);
    }
  });
}

parseLighthouse('C:/Users/anil_/Downloads/Apps/NepTechNews/speed/neptechbrief.com-lighthouse mobile 20260826T030206.json', 'Lighthouse Mobile');
parseLighthouse('C:/Users/anil_/Downloads/Apps/NepTechNews/speed/neptechbrief.com-lighthouse desktop 20260826T030317.json', 'Lighthouse Desktop');

const har = JSON.parse(fs.readFileSync('C:/Users/anil_/Downloads/Apps/NepTechNews/speed/neptechbrief.com.har', 'utf8'));
let totalSize = 0;
let imageSize = 0;
let scriptSize = 0;
har.log.entries.forEach(e => {
  const size = e.response.bodySize > 0 ? e.response.bodySize : 0;
  totalSize += size;
  if (e.response.content.mimeType.includes('image')) imageSize += size;
  if (e.response.content.mimeType.includes('javascript')) scriptSize += size;
});
console.log('\n--- HAR Summary ---');
console.log('Total Bytes:', (totalSize / 1024).toFixed(2), 'KB');
console.log('Image Bytes:', (imageSize / 1024).toFixed(2), 'KB');
console.log('Script Bytes:', (scriptSize / 1024).toFixed(2), 'KB');
