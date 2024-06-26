function formatInsertRecords(records, foreignKeys) {
  return records.map((record) => {
    if (foreignKeys.length > 0) {
      for (const property in foreignKeys) {
        if (record[foreignKeys[property]]) {
          record[foreignKeys[property]] = [record[foreignKeys[property]]];
        }
      }
      return { fields: { ...record } };
    }

    return { fields: { ...record } };
  });
}

function chunkArray(arrayToChunk, chunkSize = 10) {
  const arraysOfChunks = [];
  for (let i = 0; i < arrayToChunk.length; i += chunkSize) {
    arraysOfChunks.push(arrayToChunk.slice(i, i + chunkSize));
  }
  return arraysOfChunks;
}

function normalizeRecords(records) {
  return records.map(({ id, fields }) => ({ airtableId: id, ...fields }));
}

async function upsertRecordsInChunks(
  table,
  records,
  fieldsToMergeOn,
  foreignKeys
) {
  const formated = formatInsertRecords(records, foreignKeys);
  const arrayOfChunks = chunkArray(formated);

  for (const chunkOfRecords of arrayOfChunks) {
    try {
      await table.update(chunkOfRecords, {
        performUpsert: { fieldsToMergeOn: fieldsToMergeOn },
      });
    } catch (error) {
      const message = `Error updating table ${table.name}: ${error.message}`;
      const detailedError = new Error(message);
      throw detailedError;
    }
  }
}

function findRelatedAirtableId(record, related, relationKey) {
  const updated = related.find((r) => r['id'] === record[relationKey]);

  return { ...record, [relationKey]: updated['airtableId'] };
}

function updateRecordRelations(records, related, relationKey) {
  return records.map((record) => findRelatedAirtableId(record, related, relationKey));
}

module.exports = {
  chunkArray,
  formatInsertRecords,
  findRelatedAirtableId,
  normalizeRecords,
  upsertRecordsInChunks,
  updateRecordRelations,
};
