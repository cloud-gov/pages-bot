const fs = require('fs');
const { exportToCsvFocus } = require('./focus');

const CSV_USAGE_FOCUS = 'CSV_USAGE_FOCUS';
const CSV_EXPORT_RAW = 'CSV_EXPORT_RAW';

function getDateString(date) {
  const etString = date.toLocaleString('en-US', { timeZone: 'America/New_York' });
  const et = new Date(etString);
  const isDST =
    date.getTimezoneOffset() < new Date(date.getFullYear(), 0, 1).getTimezoneOffset();
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

async function exportToCsvRaw(records, collectionName, date) {
  console.log(`exportToCsvRaw ....`);

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
  const dateString = getDateString(date);

  let destinationDir = `pages-exports/${dateString}`;
  console.log(destinationDir);
  fs.mkdirSync(destinationDir, { recursive: true });
  let fileName = `${destinationDir}/${collectionName}_${dateString}.csv`;
  fs.writeFileSync(fileName, csvContent);

  return destinationDir;
}

const exportToCsv = (csvFormat) => {
  const exportToCsv = csvFormat === CSV_USAGE_FOCUS ? exportToCsvFocus : exportToCsvRaw;
  return exportToCsv;
};

module.exports = {
  exportToCsv,
  CSV_EXPORT_RAW,
  CSV_USAGE_FOCUS,
};
