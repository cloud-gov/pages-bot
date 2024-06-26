const { getOrgs } = require('../db');
const { AirtableClient } = require('./client');
const {
  normalizeRecords,
  upsertRecordsInChunks,
  updateRecordRelations,
} = require('./utils.js');

async function listRecords(tableName, fields = ['id']) {
  const base = AirtableClient();
  const table = base(tableName);

  const allRecords = [];

  const response = await new Promise((res, rej) => {
    table
      .select({
        fields,
      })
      .eachPage(
        function page(records, fetchNextPage) {
          allRecords.push(...records);
          fetchNextPage();
        },
        function done(err) {
          if (err) {
            rej(err);
          }

          return res(allRecords);
        }
      );
  });

  return normalizeRecords(response);
}

const listOrgs = async (fields = ['id']) => listRecords('Orgs', fields);

const listSites = async (fields = ['id']) => listRecords('Sites', fields);

const listUsers = async (fields = ['id']) => listRecords('Users', fields);

async function upsertRecords(
  records,
  tableName,
  fieldsToMergeOn,
  foreignKeys = []
) {
  const base = AirtableClient();
  const table = base(tableName);

  return upsertRecordsInChunks(table, records, fieldsToMergeOn, foreignKeys);
}

const upsertOrgs = async (records) => upsertRecords(records, 'Orgs', ['id']);

const upsertSites = async (records) => {
  // Get all orgs in airtable to map their airtable id to our org id
  // so we can upsert all of our sites and relate them to the orgs in airtable
  const orgs = await listOrgs();
  const updatedRecords = await updateRecordRelations(
    records,
    orgs,
    'organizationId'
  );

  return upsertRecords(
    updatedRecords,
    'Sites',
    ['id'],
    ['organizationId']
  );
};

const upsertDomains = async (records) => {
  // Get all sites in airtable to map their airtable id to our org id
  // so we can upsert all of our sites and relate them to the orgs in airtable
  const sites = await listSites();
  const updatedRecords = await updateRecordRelations(
    records,
    sites,
    'siteId'
  );

  return upsertRecords(
    updatedRecords,
    'Domains',
    ['id'],
    ['siteId']
  );
};

const upsertOrgRoles = async (records) => {
  // Get all sites in airtable to map their airtable id to our org id
  // so we can upsert all of our sites and relate them to the orgs in airtable
  const orgs = await listOrgs();
  const users = await listUsers();
  const updatedOrgRelation = await updateRecordRelations(
    records,
    orgs,
    'organizationId'
  );

  const updatedUserRelation = await updateRecordRelations(
    updatedOrgRelation,
    users,
    'userId'
  );

  return upsertRecords(
    updatedUserRelation,
    'OrgRoles',
    ['id'],
    ['organizationId', 'userId']
  );
};


const upsertUsers = async (records) => upsertRecords(records, 'Users', ['id']);

module.exports = {
  listOrgs,
  listRecords,
  listSites,
  listUsers,
  upsertDomains,
  upsertOrgs,
  upsertOrgRoles,
  upsertRecords,
  upsertSites,
  upsertUsers,
};
