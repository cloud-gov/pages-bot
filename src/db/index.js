const client = require('./client');

const DOMAINS_FIELDS = [
  'id',
  'siteId',
  'names',
  'serviceName',
  'state',
  'createdAt',
  'updatedAt',
  'deletedAt',
];

const ORG_FIELDS = [
  'id',
  'name',
  'agency',
  'isSandbox',
  'isActive',
  'isSelfAuthorized',
  'createdAt',
  'deletedAt',
];

const ORG_ROLES_QUERY_FIELDS = [
  'organization_role.id',
  'organization_role.organizationId',
  'organization_role.userId',
  'role.name as role',
  'organization_role.createdAt',
  'organization_role.updatedAt',
];

const ORG_ROLES_RESULT_FIELDS = [
  'id',
  'organizationId',
  'userId',
  'role',
  'createdAt',
  'updatedAt',
];

const SITE_FIELDS = [
  'id',
  'organizationId',
  'owner',
  'repository',
  'engine',
  'isActive',
  'awsBucketKeyUpdatedAt',
  'createdAt',
  'deletedAt',
];

const USER_QUERY_FIELDS = [
  'user.id',
  'user.username',
  'uaa_identity.email',
  'uaa_identity.origin',
  'user.signedInAt',
  'user.deletedAt',
];

const USER_RESULT_FIELDS = [
  'id',
  'username',
  'email',
  'origin',
  'signedInAt',
  'deletedAt',
];

const FIELD_ORG_ID = 'organizationId';
const FIELD_ORG_NAME = 'organizationName';
const FIELD_SITE_ID = 'siteId';
const FIELD_SITE_OWNER = 'siteOwner';
const FIELD_SITE_REPOSITORY = 'siteRepository';
const FIELD_SITE_CREATED_AT = 'siteCreatedAt';
const FIELD_SITE_DELETED_AT = 'siteDeletedAt';
const FIELD_DOMAIN_ID = 'domainId';
const FIELD_DOMAIN_NAMES = 'domainNames';
const FIELD_DOMAIN_STATE = 'domainState';
const FIELD_DOMAIN_CREATED_AT = 'domainCreatedAt';
const FIELD_DOMAIN_DELETED_AT = 'domainDeletedAt';

const USAGE_QUERY_FIELDS = [
  'organization.id as organizationId',
  'organization.name as organizationName',
  'site.id as siteId',
  'site.owner as siteOwner',
  'site.repository as siteRepository',
  'site.createdAt as siteCreatedAt',
  'site.deletedAt as siteDeletedAt',
  'domain.id as domainId',
  'domain.names as domainNames',
  'domain.state as domainState',
  'domain.createdAt as domainCreatedAt',
  'domain.deletedAt as domainDeletedAt',
];

const USAGE_RESULT_FIELDS = [
  FIELD_ORG_ID,
  FIELD_ORG_NAME,
  FIELD_SITE_ID,
  FIELD_SITE_OWNER,
  FIELD_SITE_REPOSITORY,
  FIELD_SITE_CREATED_AT,
  FIELD_SITE_DELETED_AT,
  FIELD_DOMAIN_ID,
  FIELD_DOMAIN_NAMES,
  FIELD_DOMAIN_STATE,
  FIELD_DOMAIN_CREATED_AT,
  FIELD_DOMAIN_DELETED_AT,
];

class BotDBQueries {
  constructor({ connectionString }) {
    this.client = client.DBClient({ connectionString });
  }

  tableSchema = {
    domains: {
      queryFields: DOMAINS_FIELDS,
      resultFields: DOMAINS_FIELDS,
      tableName: 'domain',
    },
    orgs: {
      queryFields: ORG_FIELDS,
      resultFields: ORG_FIELDS,
      tableName: 'organization',
    },
    orgRoles: {
      queryFields: ORG_ROLES_QUERY_FIELDS,
      resultFields: ORG_ROLES_RESULT_FIELDS,
      tableName: 'organization_role',
    },
    sites: {
      queryFields: SITE_FIELDS,
      resultFields: SITE_FIELDS,
      tableName: 'site',
    },
    users: {
      queryFields: USER_QUERY_FIELDS,
      resultFields: USER_RESULT_FIELDS,
      tableName: 'user',
    },
    usage: {
      queryFields: USAGE_QUERY_FIELDS,
      resultFields: USAGE_RESULT_FIELDS,
      tableName: 'usage',
    },
  };

  getTableFields(tableName) {
    const schema = this.tableSchema[tableName];
    if (!schema) throw new Error(`No fields exist for table ${tableName}`);

    return schema;
  }

  async getSingleTableRecords(table) {
    const { tableName, queryFields } = this.getTableFields(table);
    return this.client(tableName).select(...queryFields);
  }

  async getDomains() {
    return this.getSingleTableRecords('domains');
  }

  async getOrgs() {
    return this.getSingleTableRecords('orgs');
  }

  async getOrgRoles() {
    const { tableName, queryFields } = this.getTableFields('orgRoles');
    return this.client(tableName)
      .join('role', 'organization_role.roleId', '=', 'role.id')
      .select(...queryFields);
  }

  async getSites() {
    const { tableName, queryFields } = this.getTableFields('sites');
    return this.client(tableName)
      .select(...queryFields)
      .whereNotNull('organizationId');
  }

  async getUsers() {
    const { tableName, queryFields } = this.getTableFields('users');
    return this.client(tableName)
      .join('uaa_identity', 'user.id', '=', 'uaa_identity.userId')
      .select(...queryFields);
  }

  async getUsage() {
    const { queryFields } = this.getTableFields('usage');
    return this.client('organization')
      .join('site', 'organization.id', '=', 'site.organizationId')
      .join('domain', 'site.id', '=', 'domain.siteId')
      .select(...queryFields)
      .orderBy('organization.id')
      .orderBy('site.id')
      .orderBy('domain.id');
  }
}

module.exports = {
  ...client,
  BotDBQueries,
  FIELD_DOMAIN_ID,
  FIELD_DOMAIN_NAMES,
  FIELD_DOMAIN_STATE,
  FIELD_DOMAIN_CREATED_AT,
  FIELD_DOMAIN_DELETED_AT,
  FIELD_ORG_ID,
  FIELD_ORG_NAME,
  FIELD_SITE_ID,
  FIELD_SITE_OWNER,
  FIELD_SITE_REPOSITORY,
  FIELD_SITE_CREATED_AT,
  FIELD_SITE_DELETED_AT,
};
