const fs = require('fs');

function getDateString() {
  const now = new Date();
  const etString = now.toLocaleString('en-US', { timeZone: 'America/New_York' });
  const et = new Date(etString);
  const isDST =
    now.getTimezoneOffset() < new Date(now.getFullYear(), 0, 1).getTimezoneOffset();
  const tzLabel = isDST ? 'EDT' : 'EST';
  const dateString =
    [
      et.getFullYear(),
      String(et.getMonth() + 1).padStart(2, '0'),
      String(et.getDate()).padStart(2, '0'),
      '_',
      String(et.getHours()).padStart(2, '0'),
      String(et.getMinutes()).padStart(2, '0'),
    ].join('_') + `_${tzLabel}`;
  return dateString;
}

async function exportToCsv(records, collectionName) {
  if (!records?.length) {
    console.log('No records found');
    return;
  }

  // CSV headers
  const headers = Object.keys(records[0]);

  // Convert rows
  const csvRows = [
    headers.join(','), // header row
    ...records.map((row) =>
      headers.map((field) => JSON.stringify(row[field] ?? '')).join(','),
    ),
  ];

  const csvContent = csvRows.join('\n');
  const dateString = getDateString();

  let destinationDir = `pages-exports/${dateString}`;
  fs.mkdirSync(destinationDir, { recursive: true });
  let fileName = `${destinationDir}/${collectionName}_${dateString}.csv`;
  fs.writeFileSync(fileName, csvContent);

  return destinationDir;
}

module.exports = {
  exportToCsv,
};
