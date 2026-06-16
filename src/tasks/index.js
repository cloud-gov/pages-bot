const assert = require('node:assert');
const { BotDBQueries } = require('../db');
const { exportToCsv, CSV_USAGE_FOCUS, CSV_EXPORT_RAW } = require('../s3');
const { areArraysEqual } = require('../utils');

class TaskRunner {
  constructor({ connectionString }) {
    this.db = new BotDBQueries({ connectionString });
  }

  async verifyDBQueries() {
    const collections = await this.getCollectionsData([CSV_EXPORT_RAW, CSV_USAGE_FOCUS]);

    // Runs through all queries to verify records exist
    collections.map((namedCollectionData) => {
      exportToCsv(namedCollectionData.csvFormat)(namedCollectionData.collection);

      assert.ok(Array.isArray(namedCollectionData.collection));
      assert.ok(namedCollectionData.collection.length >= 1);

      // Runs through all possible query result fields
      // to verify the result record schema matches
      const hasExpectResultProperties = Object.entries(this.db.tableSchema).filter(
        ([_, value]) =>
          areArraysEqual(
            Object.keys(namedCollectionData.collection[0]),
            value.resultFields,
          ),
      );

      assert.ok(hasExpectResultProperties.length === 1);
    });
  }

  async getCollectionsData(csvFormats) {
    const collections = await Promise.all([
      ...(csvFormats.includes(CSV_EXPORT_RAW)
        ? [
            this.getNamedCollectionData('Domains', await this.db.getDomains(), 'domains'),
            this.getNamedCollectionData('Orgs', await this.db.getOrgs(), 'orgs'),
            this.getNamedCollectionData(
              'Org Roles',
              await this.db.getOrgRoles(),
              'org-roles',
            ),
            this.getNamedCollectionData('Sites', await this.db.getSites(), 'sites'),
            this.getNamedCollectionData('Users', await this.db.getUsers(), 'users'),
          ]
        : []),
      ...(csvFormats.includes(CSV_USAGE_FOCUS)
        ? [
            this.getNamedCollectionData(
              'Usage',
              await this.db.getUsage(),
              'usage',
              CSV_USAGE_FOCUS,
            ),
          ]
        : []),
    ]);
    return collections;
  }

  async getNamedCollectionData(table, data, fileName, csvFormat = CSV_EXPORT_RAW) {
    return Promise.resolve({
      collectionName: table,
      collection: data,
      fileName,
      csvFormat,
    });
  }

  async syncS3(csvFormat) {
    const date = new Date();

    const collections = await this.getCollectionsData([csvFormat]);

    collections.map(async (namedCollectionData) => {
      console.log(`Exporting collection: ${namedCollectionData.collectionName}`);

      try {
        const destinationDir = await exportToCsv(namedCollectionData.csvFormat)(
          namedCollectionData.collection,
          namedCollectionData.fileName,
          date,
        );
        console.log(
          `Exported collection ${namedCollectionData.collectionName} into ${destinationDir}, ${namedCollectionData.collection.length} records.`,
        );
      } catch (e) {
        console.error(e);
        console.error(e.stack);
      }
    });

    return 'success';
  }
}

module.exports = {
  TaskRunner,
};
