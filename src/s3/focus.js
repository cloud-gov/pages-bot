const db = require('../db');
const fs = require('fs');

const SITE_DOMAIN_CREDITS_PER_MONTH =
  Number(process.env.SITE_DOMAIN_CREDITS_PER_MONTH) || 12;
const SITE_DOMAIN_USAGE_HOURS_PER_MONTH =
  Number(process.env.SITE_DOMAIN_USAGE_HOURS_PER_MONTH) || 730;

console.log(
  `process.env.SITE_DOMAIN_CREDITS_PER_MONTH: ${process.env.SITE_DOMAIN_CREDITS_PER_MONTH}`,
);
console.log(
  `process.env.SITE_DOMAIN_USAGE_HOURS_PER_MONTH: ${process.env.SITE_DOMAIN_USAGE_HOURS_PER_MONTH}`,
);
console.log(`SITE_DOMAIN_CREDITS_PER_MONTH: ${SITE_DOMAIN_CREDITS_PER_MONTH}`);
console.log(`SITE_DOMAIN_USAGE_HOURS_PER_MONTH: ${SITE_DOMAIN_USAGE_HOURS_PER_MONTH}`);

const PAGES_USAGE_DIR = `pages-usage`;
const PAGES_USAGE_FILE_PREFIX = `pages-usage`;

const RESOURCE_STATE_ACTIVE = 'Active';
const RESOURCE_STATE_INACTIVE = 'Inactive';
const RESOURCE_STATE_DISCONTINUED = 'Discontinued';

const toS3DateFormat = (date) => {
  return date.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
};

const getFileName = (startOfHour, exclusiveEndOfHour) => {
  const dateString = `${toS3DateFormat(startOfHour)}-${toS3DateFormat(exclusiveEndOfHour)}`;
  return `${PAGES_USAGE_DIR}/${PAGES_USAGE_FILE_PREFIX}-${dateString}.csv`;
};

function getChargePeriodStartEnd(date) {
  const startOfHour = new Date(date);
  startOfHour.setMinutes(0, 0, 0);

  const exclusiveEndOfHour = new Date(startOfHour);
  exclusiveEndOfHour.setHours(startOfHour.getHours() + 1); // exactly next hour, exclusive
  return { startOfHour, exclusiveEndOfHour };
}

function getCsvContent(records, date) {
  // CSV headers
  const headers = [
    'ServiceName',
    'ChargeCategory',
    'ConsumedQuantity',
    'ConsumedUnit',
    'ChargePeriodStart',
    'ChargePeriodEnd',
    'Tags',
    'ResourceId',
    'ResourceName',
    'ResourceType',
    'x_ResourceState',
    'x_PagesOrgResourceId',
    'x_SiteResourceId',
    'x_ChargePeriodStartET',
    'x_ChargePeriodEndET',
    'x_ResourceLifespanStartET',
    'x_ResourceLifespanEndET',
    'x_ResourceRetentionStartET',
    'x_ResourceRetentionEndET',
  ];

  const { startOfHour, exclusiveEndOfHour } = getChargePeriodStartEnd(date);

  const csvRows = [
    headers.join(','), // header row
    ...records.map((row) => getRow(headers, row, startOfHour, exclusiveEndOfHour)),
  ];

  return csvRows.join('\n');
}

const exportToCsvFocus = async (records, collectionName, date) => {
  console.log(`exportToCsvFocus ....`);

  if (!records?.length) {
    console.log('No records found');
    return;
  }
  const csvContent = getCsvContent(records, date);

  fs.mkdirSync(PAGES_USAGE_DIR, { recursive: true });
  const { startOfHour, exclusiveEndOfHour } = getChargePeriodStartEnd(date);
  const fileName = getFileName(startOfHour, exclusiveEndOfHour);
  fs.writeFileSync(fileName, csvContent);

  return PAGES_USAGE_DIR;
};

const getResourceState = (row) => {
  if (row[db.FIELD_DOMAIN_DELETED_AT] != null) return RESOURCE_STATE_DISCONTINUED;
  if (row[db.FIELD_DOMAIN_STATE] === 'provisioned') return RESOURCE_STATE_ACTIVE;
  return RESOURCE_STATE_INACTIVE;
};

const getRow = (headers, row, startOfHour, exclusiveEndOfHour) => {
  const resourceState = getResourceState(row);

  const values = [];
  headers.forEach((column) => {
    let value;

    switch (column) {
      case 'ServiceName':
        value = 'Pages:Site:Domain';
        break;
      case 'ChargeCategory':
        value = 'Usage';
        break;
      case 'ConsumedQuantity':
        value =
          resourceState === RESOURCE_STATE_ACTIVE
            ? toFocusQuantity(
                SITE_DOMAIN_CREDITS_PER_MONTH / SITE_DOMAIN_USAGE_HOURS_PER_MONTH,
              )
            : 0;
        break;
      case 'ConsumedUnit':
        value = 'site-domain-hours';
        break;
      case 'ChargePeriodStart':
        value = toFocusFormat(startOfHour);
        break;
      case 'ChargePeriodEnd':
        value = toFocusFormat(exclusiveEndOfHour);
        break;
      case 'Tags':
        value = {
          'Pages Org Name': row[db.FIELD_ORG_NAME],
          'Pages Org Id': row[db.FIELD_ORG_ID],
          'Site Id': row[db.FIELD_SITE_ID],
          'Site Owner': row[db.FIELD_SITE_OWNER],
          'Site Repository': row[db.FIELD_SITE_REPOSITORY],
        };
        break;
      case 'ResourceId':
        value = row[db.FIELD_DOMAIN_ID];
        break;
      case 'ResourceName':
        value = row[db.FIELD_DOMAIN_NAMES];
        break;
      case 'ResourceType':
        value = 'pages-site-domain';
        break;
      case 'x_ResourceState':
        value = resourceState;
        break;
      case 'x_ChargePeriodStartET':
        value = toETFormat(startOfHour);
        break;
      case 'x_ChargePeriodEndET':
        value = toETFormat(exclusiveEndOfHour);
        break;
      case 'x_PagesOrgResourceId':
        value = row[db.FIELD_ORG_ID];
        break;
      case 'x_SiteResourceId':
        value = row[db.FIELD_SITE_ID];
        break;
      // ResourceLifespanStart/End - when the resource was created and discontinued
      case 'x_ResourceLifespanStartET':
        value = toETFormat(row[db.FIELD_DOMAIN_CREATED_AT]);
        break;
      case 'x_ResourceLifespanEndET':
        value = toETFormat(row[db.FIELD_DOMAIN_DELETED_AT]);
        break;
      // ResourceRetentionStart/End - how long the consumer should include the resource in reports and views
      case 'x_ResourceRetentionStartET':
        value = toETFormat(row[db.FIELD_SITE_CREATED_AT]);
        break;
      case 'x_ResourceRetentionEndET':
        value = toETFormat(row[db.FIELD_SITE_DELETED_AT]);
        break;
      default:
        throw new Error(`Unrecognized field ${column}`);
        break;
    }
    values.push(toCSVField(value));
    return JSON.stringify(values ?? '');
  });

  return values.join(',');
};

// Format as 2024-01-01T00:00:00Z
const toFocusFormat = (date) => date.toISOString().slice(0, 19) + 'Z';

const toETFormat = (date) =>
  date == null
    ? ''
    : new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
        .format(date)
        .replace(/(\d+)\/(\d+)\/(\d+),\s(\d+):(\d+):(\d+)/, '$3-$1-$2T$4:$5:$6');

const toFocusQuantity = (value) => parseFloat(value.toFixed(8));

const toCSVField = (value) => {
  const str = typeof value === 'object' ? JSON.stringify(value) : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

module.exports = {
  exportToCsvFocus,
  toS3DateFormat,
  getFileName,
  PAGES_USAGE_DIR,
  getCsvContent,
};
