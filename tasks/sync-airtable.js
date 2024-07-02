const { TaskRunner, utils } = require('../src');

const connectionString = utils.getVcapDbUrl();
const tasker = new TaskRunner({ connectionString });

tasker
  .syncAirtableBase()
  .then((res) => {
    console.log(res);
    process.exit();
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
