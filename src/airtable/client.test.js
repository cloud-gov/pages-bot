const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { AirtableClient } = require('./client');

describe('client', () => {
  it('should throw an error if the API Key and Base Id is not set', () => {
    assert.throws(() => AirtableClient());
  });

  it('should return a new client when API Key and Base Id are provided as arguments', () => {
    const client = AirtableClient('apikey', 'baseId');
    assert.ok(client);
  });

  it('should return a new client when env vars AIRTABLE_API_KEY and AIRTABLE_BASE_ID are set', () => {
    process.env.AIRTABLE_API_KEY = 'apikey';
    process.env.AIRTABLE_BASE_ID = 'baseid';

    const client = AirtableClient();
    assert.ok(client);

    delete process.env.AIRTABLE_API_KEY;
    delete process.env.AIRTABLE_BASE_ID;
  });
});
