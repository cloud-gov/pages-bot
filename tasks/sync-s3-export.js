const { TaskRunner, utils } = require('../src');
const { CSV_EXPORT_RAW } = require('../src/s3');

const connectionString = utils.getVcapDbUrl();
const tasker = new TaskRunner({ connectionString });

tasker
  .syncS3(CSV_EXPORT_RAW)
  .then((res) => {
    console.log(`syncS3-export result: ${res}`);
    process.exit();
  })
  .catch((err) => {
    console.log(`syncS3-export result: error`);
    console.log(err);
    process.exit(1);
  });
