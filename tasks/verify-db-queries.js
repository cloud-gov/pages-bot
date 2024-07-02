const { TaskRunner, utils } = require('../src');

const connectionString = utils.getVcapDbUrl();
const tasker = new TaskRunner({ connectionString });

tasker
  .verifyDBQueries()
  .then(() => {
    console.log('Database queries were successful.');
    process.exit();
  })
  .catch((error) => {
    console.error('Database queries failed.');
    console.error(error);
    process.exit(1);
  });
