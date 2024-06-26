const db = require('../db');
const airtable = require('../airtable');

async function syncAirtableBase() {
  const client = db.DBClient();

  console.log('Updating Users');
  const users = await db.getUsers(client);
  await airtable.upsertUsers(users);
  console.log(`Updated ${users.length} records\n`);

  console.log('Updating Orgs');
  const orgs = await db.getOrgs(client);
  await airtable.upsertOrgs(orgs);
  console.log(`Updated ${orgs.length} records\n`);

  console.log('Updating Sites');
  const sites = await db.getSites(client);
  await airtable.upsertSites(sites);
  console.log(`Updated ${sites.length} records\n`);

  console.log('Updating Domains');
  const domains = await db.getDomains(client);
  await airtable.upsertDomains(domains);
  console.log(`Updated ${domains.length} records\n`);

  console.log('Updating Org Roles');
  const orgRoles = await db.getOrgRoles(client);
  await airtable.upsertOrgRoles(orgRoles);
  console.log(`Updated ${orgRoles.length} \n`);

  return 'success';
}

module.exports = {
  syncAirtableBase,
};
