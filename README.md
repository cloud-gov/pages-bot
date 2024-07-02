pages-bot
=========

cloud.gov Pages bot is a collection of tasks to help manage the platform and connect data with other cloud.gov sources.

## Tasks

### Syncing Pages info to airtable

Airtable is used to manage, aggregate, and view disparate data streams in cloud.gov. The `syncAirtableBase` task runs daily to sync our Pages platfrom data with our cloud.gov Airtable base. This "upserts" data from Pages to the base to avoid duplicate data entries while providing the latest information to date. This task only runs in production since we only need to sync from the production environment.

### Verify database queries

The `verifyDBQueries` task runs in each environment on every update to verify the database connection is valid for the results schema is as expected. This task is used to provide added confidence with updates since the `syncAirtableBase` task only runs in production and relies on the database queries.

#### Environment Vars

The task to sync Pages info into airtable wiil need to have access to the database and the read/write credentials for airtable

- `DATABASE_URL`: This will be provided by the `app-env` task in CI.
- `AIRTABLE_API_KEY`: This will be in credhub as `/concourse/pages/pages-bot/airtable-api-key`
- `AIRTABLE_BASE_ID`: This will be in credhub as `/concourse/pages/pages-bot/airtable-base-id`

To run the tasks locally, you can create a copy of the `.env.sample` file as `.env` and update the values with the database connection string and your personal airtable credentials.

#### Environments

The environments in CI will be `dev`, `staging`, and `production`.

The `dev` and `staging` environments will only run tasks to verify the database queries are as expected.

The `production` environment will be the only environment with a task that will sync the platform info with airtable.
