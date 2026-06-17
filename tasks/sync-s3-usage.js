const { TaskRunner, utils } = require('../src');
const { CSV_USAGE_FOCUS } = require('../src/s3');

const connectionString = utils.getVcapDbUrl();
const tasker = new TaskRunner({ connectionString });

tasker
  .syncS3(CSV_USAGE_FOCUS)
  .then((res) => {
    console.log(`syncS3-usage result: ${res}`);
    process.exit();
  })
  .catch((err) => {
    console.log(`syncS3-usage result: error`);
    console.log(err);
    process.exit(1);
  });
