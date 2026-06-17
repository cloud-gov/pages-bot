const { test, describe } = require('node:test');
const assert = require('node:assert');
const { toS3DateFormat, getFileName, getCsvContent } = require('./focus');

test('toS3DateFormat formats correctly', () => {
  const date = new Date('2024-03-15T14:00:00.000Z');
  assert.strictEqual(toS3DateFormat(date), '20240315T140000Z');
});

test('getFileName has correct format', () => {
  assert.strictEqual(
    getFileName(
      new Date('2024-03-15T14:00:00.000Z'),
      new Date('2024-03-15T15:00:00.000Z'),
    ),
    'pages-usage/pages-usage-20240315T140000Z-20240315T150000Z.csv',
  );
});

test('getCsvContent processes collection to focus format, active', () => {
  const usageCollection = [
    {
      organizationId: 1,
      organizationName: 'org name',
      siteId: 2,
      siteOwner: 'cloud-gov',
      siteRepository: 'pages-editor',
      siteCreatedAt: new Date('2024-03-15T14:00:00.000Z'),
      siteDeletedAt: new Date('2027-03-15T14:00:00.000Z'),
      domainId: 3,
      domainNames: 'cloud.gov',
      domainState: 'provisioned',
      domainCreatedAt: new Date('2024-04-15T14:00:00.000Z'),
    },
  ];
  const headersFocus = `ServiceName,ChargeCategory,ConsumedQuantity,ConsumedUnit,ChargePeriodStart,ChargePeriodEnd,Tags,ResourceId,ResourceName,ResourceType`;
  const headersCustom = `x_ResourceState,x_PagesOrgResourceId,x_SiteResourceId,x_ChargePeriodStartET,x_ChargePeriodEndET,x_ResourceLifespanStartET,x_ResourceLifespanEndET,x_ResourceRetentionStartET,x_ResourceRetentionEndET`;
  const serviceAndUsage = `Pages:Site:Domain,Usage,0.01643836,site-domain-hours`;
  const startEndUTC = `2026-06-12T01:00:00Z,2026-06-12T02:00:00Z`;
  const tags = `"{""Pages Org Name"":""org name"",""Pages Org Id"":1,""Site Id"":2,""Site Owner"":""cloud-gov"",""Site Repository"":""pages-editor""}"`;
  const resources = `3,cloud.gov,pages-site-domain,Active,1,2`;
  const startEndET = `2026-06-11T21:00:00,2026-06-11T22:00:00,2024-04-15T10:00:00,,2024-03-15T10:00:00,2027-03-15T10:00:00`;
  assert.strictEqual(
    getCsvContent(usageCollection, new Date('2026-06-12T01:46:10.000Z')),
    `${headersFocus},${headersCustom}
${serviceAndUsage},${startEndUTC},${tags},${resources},${startEndET}`,
  );
});

test('getCsvContent processes collection to focus format, inactive', () => {
  const usageCollection = [
    {
      organizationId: 1,
      organizationName: 'org name',
      siteId: 2,
      siteOwner: 'cloud-gov',
      siteRepository: 'pages-editor',
      siteCreatedAt: new Date('2024-03-15T14:00:00.000Z'),
      siteDeletedAt: new Date('2027-03-15T14:00:00.000Z'),
      domainId: 3,
      domainNames: 'cloud.gov',
      domainState: 'pending',
      domainCreatedAt: new Date('2024-04-15T14:00:00.000Z'),
    },
  ];
  const headersFocus = `ServiceName,ChargeCategory,ConsumedQuantity,ConsumedUnit,ChargePeriodStart,ChargePeriodEnd,Tags,ResourceId,ResourceName,ResourceType`;
  const headersCustom = `x_ResourceState,x_PagesOrgResourceId,x_SiteResourceId,x_ChargePeriodStartET,x_ChargePeriodEndET,x_ResourceLifespanStartET,x_ResourceLifespanEndET,x_ResourceRetentionStartET,x_ResourceRetentionEndET`;
  const serviceAndUsage = `Pages:Site:Domain,Usage,0,site-domain-hours`;
  const startEndUTC = `2026-06-12T01:00:00Z,2026-06-12T02:00:00Z`;
  const tags = `"{""Pages Org Name"":""org name"",""Pages Org Id"":1,""Site Id"":2,""Site Owner"":""cloud-gov"",""Site Repository"":""pages-editor""}"`;
  const resources = `3,cloud.gov,pages-site-domain,Inactive,1,2`;
  const startEndET = `2026-06-11T21:00:00,2026-06-11T22:00:00,2024-04-15T10:00:00,,2024-03-15T10:00:00,2027-03-15T10:00:00`;
  assert.strictEqual(
    getCsvContent(usageCollection, new Date('2026-06-12T01:46:10.000Z')),
    `${headersFocus},${headersCustom}
${serviceAndUsage},${startEndUTC},${tags},${resources},${startEndET}`,
  );
});

test('getCsvContent processes collection to focus format, discontinued', () => {
  const usageCollection = [
    {
      organizationId: 1,
      organizationName: 'org name',
      siteId: 2,
      siteOwner: 'cloud-gov',
      siteRepository: 'pages-editor',
      siteCreatedAt: new Date('2024-03-15T14:00:00.000Z'),
      siteDeletedAt: new Date('2027-03-15T14:00:00.000Z'),
      domainId: 3,
      domainNames: 'cloud.gov',
      domainState: 'deprovisioning',
      domainCreatedAt: new Date('2024-04-15T14:00:00.000Z'),
      domainDeletedAt: new Date('2026-02-15T14:00:00.000Z'),
    },
  ];
  const headersFocus = `ServiceName,ChargeCategory,ConsumedQuantity,ConsumedUnit,ChargePeriodStart,ChargePeriodEnd,Tags,ResourceId,ResourceName,ResourceType`;
  const headersCustom = `x_ResourceState,x_PagesOrgResourceId,x_SiteResourceId,x_ChargePeriodStartET,x_ChargePeriodEndET,x_ResourceLifespanStartET,x_ResourceLifespanEndET,x_ResourceRetentionStartET,x_ResourceRetentionEndET`;
  const serviceAndUsage = `Pages:Site:Domain,Usage,0,site-domain-hours`;
  const startEndUTC = `2026-06-12T01:00:00Z,2026-06-12T02:00:00Z`;
  const tags = `"{""Pages Org Name"":""org name"",""Pages Org Id"":1,""Site Id"":2,""Site Owner"":""cloud-gov"",""Site Repository"":""pages-editor""}"`;
  const resources = `3,cloud.gov,pages-site-domain,Discontinued,1,2`;
  const startEndET = `2026-06-11T21:00:00,2026-06-11T22:00:00,2024-04-15T10:00:00,2026-02-15T09:00:00,2024-03-15T10:00:00,2027-03-15T10:00:00`;
  assert.strictEqual(
    getCsvContent(usageCollection, new Date('2026-06-12T01:46:10.000Z')),
    `${headersFocus},${headersCustom}
${serviceAndUsage},${startEndUTC},${tags},${resources},${startEndET}`,
  );
});
