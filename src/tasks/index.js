const assert = require('node:assert');
const { BotDBQueries } = require('../db');
const { exportToCsv } = require('../s3');
const { areArraysEqual } = require('../utils');


class TaskRunner {
  constructor({ connectionString }) {
    this.db = new BotDBQueries({ connectionString });
  }

  async verifyDBQueries() {
    const collections = await Promise.all([
      this.db.getDomains(),
      this.db.getOrgs(),
      this.db.getOrgRoles(),
      this.db.getSites(),
      this.db.getUsers(),
    ]);

    // Runs through all queries to verify records exist
    collections.map((collection) => {

      exportToCsv(collection);

      assert.ok(Array.isArray(collection));
      assert.ok(collection.length >= 1);

      // Runs through all possible query result fields
      // to verify the result record schema matches
      const hasExpectResultProperties = Object.entries(
        this.db.tableSchema
      ).filter(([_, value]) =>
        areArraysEqual(Object.keys(collection[0]), value.resultFields)
      );

      assert.ok(hasExpectResultProperties.length === 1);
    });
  }

  async syncS3() {
        const collections = await Promise.all([
            this.db.getNamedCollectionData("Domains", await this.db.getDomains(), 'domains'),
            this.db.getNamedCollectionData("Orgs", await this.db.getOrgs(), 'orgs'),
            this.db.getNamedCollectionData("Org Roles", await this.db.getOrgRoles(), 'org-roles'),
            this.db.getNamedCollectionData("Sites", await this.db.getSites(), 'sites'),
            this.db.getNamedCollectionData("Users", await this.db.getUsers(), 'users'),
        ]);

        collections.map(async (namedCollectionData) => {
            const destinationDir = await exportToCsv(namedCollectionData.collection, namedCollectionData.fileName);
            console.log(`Exported collection ${namedCollectionData.collectionName} into ${destinationDir}, ${namedCollectionData.collection.length} records.`);
        });

        return 'success';
    }
}

module.exports = {
  TaskRunner,
};
