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
