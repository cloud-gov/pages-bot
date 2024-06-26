const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { findRelatedAirtableId } = require('./utils');

describe('utils', () => {
  describe('.findRelated', () => {
    it('should find the related records based off of a single relation key', () => {
      const recordName = 'test-record';
      const originalRecordId = '123abs';
      const airtableRecordId = 'airtable-id-123';
      const record = { name: recordName, relatedId: originalRecordId };
      const relatedRecords = [
        { id: '456abc', airtableId: '321cab' },
        { id: '111abc', airtableId: '456bnm' },
        { id: originalRecordId, airtableId: airtableRecordId },
      ];
      const relationKey = 'relatedId';

      const expected = findRelatedAirtableId(record, relatedRecords, relationKey);
      assert.equal(expected.name, recordName);
      assert.equal(expected.relatedId, airtableRecordId);
    });
  });
});
