pages-bot
=========

cloud.gov Pages bot is a collection of tasks to help manage the platform and connect data with other cloud.gov sources.

## Tasks

### Syncing Pages info to S3

The `syncS3` task runs daily to sync our Pages platform data into S3. This task only runs in production since we only need to sync from the production environment.

### Verify database queries

The `verifyDBQueries` task runs in each environment on every update to verify the database connection is valid for the results schema is as expected. This task is used to provide added confidence with updates since the `syncS3` task only runs in production and relies on the database queries.

#### Environment Vars

The task to sync Pages info into S3 will need to have access to the database

- `DATABASE_URL`: This will be provided by the `app-env` task in CI.

To run the tasks locally, you can create a copy of the `.env.sample` file as `.env` and update the values with the database connection string.

#### Environments

The environments in CI will be `dev`, `staging`, and `production`.

The `dev` and `staging` environments will only run tasks to verify the database queries are as expected.

The `production` environment will be the only environment with a task that will sync the platform info into S3.

## Pages usage CSV format version

The last column of the Pages usage CSV, `x_FormatVersion`, records the format version of each record. A record with no `x_FormatVersion` column is version `1`.

Each file covers one hour: the charge period runs from the start of the hour to the start of the next hour, exclusive. There is one row per site domain.

### Version 1

`ConsumedQuantity` is in credits. Columns, in order:

- `ServiceName`: always `Pages:Site:Domain`.
- `ChargeCategory`: always `Usage`.
- `ConsumedQuantity`: credits used by the domain in the hour. For an `Active` domain it is `SITE_DOMAIN_CREDITS_PER_MONTH / SITE_DOMAIN_USAGE_HOURS_PER_MONTH`, rounded to 8 decimal places (`12 / 730` = `0.01643836` with the defaults). For an `Inactive` or `Discontinued` domain it is `0`.
- `ConsumedUnit`: always `site-domain-hours`, although the quantity is in credits.
- `ChargePeriodStart`: start of the hour in UTC, for example `2026-06-12T01:00:00Z`.
- `ChargePeriodEnd`: start of the next hour in UTC, exclusive.
- `Tags`: JSON object with `Pages Org Name`, `Pages Org Id`, `Site Id`, `Site Owner` and `Site Repository`.
- `ResourceId`: domain id.
- `ResourceName`: domain names.
- `ResourceType`: always `pages-site-domain`.
- `x_ResourceState`: `Discontinued` if the domain is deleted, `Active` if the domain is provisioned, `Inactive` otherwise.
- `x_PagesOrgResourceId`: Pages organization id.
- `x_PagesOrgName`: Pages organization name.
- `x_SiteResourceId`: site id.
- `x_SiteName`: site owner and repository, as `owner/repository`.
- `x_ChargePeriodStartET`: `ChargePeriodStart` in America/New_York time, for example `2026-06-11T21:00:00`.
- `x_ChargePeriodEndET`: `ChargePeriodEnd` in America/New_York time.
- `x_ResourceLifespanStartET`: when the domain was created, in America/New_York time.
- `x_ResourceLifespanEndET`: when the domain was deleted, in America/New_York time; empty if it is not deleted.
- `x_ResourceRetentionStartET`: when the site was created, in America/New_York time. Together with `x_ResourceRetentionEndET`, it says how long consumers should include the resource in reports and views.
- `x_ResourceRetentionEndET`: when the site was deleted, in America/New_York time; empty if it is not deleted.
- `x_CreditsPerYear`: always `144`. Added in #2978; files written before that end with `x_ResourceRetentionEndET`.

### Version 2

Same columns as version 1, with these changes:

- `ConsumedQuantity` is in site-domain-hours: `1` for an `Active` domain, `0` for an `Inactive` or `Discontinued` domain.
- `x_CreditsPerYear` is removed.
- `x_FormatVersion` is added as the last column, always `2`.
