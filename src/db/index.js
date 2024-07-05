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
}

module.exports = {
  ...client,
  BotDBQueries,
};
