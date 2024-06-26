async function getDomains(client) {
  return client('domain').select(
    'id',
    'siteId',
    'names',
    'serviceName',
    'state',
    'createdAt',
    'updatedAt',
    'deletedAt'
  );
}

async function getOrgs(client) {
  return client('organization').select(
    'id',
    'name',
    'agency',
    'isSandbox',
    'isActive',
    'isSelfAuthorized',
    'createdAt',
    'deletedAt'
  );
}

async function getOrgRoles(client) {
  return client('organization_role')
  .join('role', 'organization_role.roleId', '=', 'role.id')
  .select(
    'organization_role.id',
    'organization_role.organizationId',
    'organization_role.userId',
    'role.name as role',
    'organization_role.createdAt',
    'organization_role.updatedAt'
  );
}

async function getSites(client) {
  return client('site')
    .select(
      'id',
      'organizationId',
      'owner',
      'repository',
      'engine',
      'isActive',
      'awsBucketKeyUpdatedAt',
      'createdAt',
      'deletedAt'
    )
    .whereNotNull('organizationId');
}

async function getUsers(client) {
  return client('user')
    .join('uaa_identity', 'user.id', '=', 'uaa_identity.userId')
    .select(
      'user.id',
      'user.username',
      'uaa_identity.email',
      'uaa_identity.origin',
      'user.signedInAt',
      'user.deletedAt'
    );
}

module.exports = { getDomains, getOrgs, getOrgRoles, getSites, getUsers };
