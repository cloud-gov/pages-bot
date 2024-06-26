const Airtable = require('airtable');

function AirtableClient(
  apiKey = process.env.AIRTABLE_API_KEY,
  baseId = process.env.AIRTABLE_BASE_ID
) {
  if (!apiKey || !baseId) {
    throw 'The apiToken and/or baseId arguments are not set. Please provide.';
  }

  Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: apiKey,
  });

  var base = Airtable.base(baseId);

  return base;
}

module.exports = { AirtableClient };
