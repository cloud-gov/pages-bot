const assert = require('node:assert');
const { BotDBQueries } = require('../db');
const queries = require('../airtable');
const { areArraysEqual } = require('../utils');

class TaskRunner {
  constructor({ connectionString }) {
    this.db = new BotDBQueries({ connectionString });
    this.airtable = queries;
  }

  async syncAirtableBase() {
    console.log('Updating Users');
    const users = await this.db.getUsers();
    await this.airtable.upsertUsers(users);
    console.log(`Updated ${users.length} records\n`);

    console.log('Updating Orgs');
    const orgs = await this.db.getOrgs();
    await this.airtable.upsertOrgs(orgs);
    console.log(`Updated ${orgs.length} records\n`);

    console.log('Updating Sites');
    const sites = await this.db.getSites();
    await this.airtable.upsertSites(sites);
    console.log(`Updated ${sites.length} records\n`);

    console.log('Updating Domains');
    const domains = await this.db.getDomains();
    await this.airtable.upsertDomains(domains);
    console.log(`Updated ${domains.length} records\n`);

    console.log('Updating Org Roles');
    const orgRoles = await this.db.getOrgRoles();
    await this.airtable.upsertOrgRoles(orgRoles);
    console.log(`Updated ${orgRoles.length} \n`);

    return 'success';
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
}

module.exports = {
  TaskRunner,
};
