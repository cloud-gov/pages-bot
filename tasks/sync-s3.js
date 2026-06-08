const { TaskRunner, utils } = require("../src");

const connectionString = utils.getVcapDbUrl();
const tasker = new TaskRunner({ connectionString });

tasker
    .syncS3()
    .then((res) => {
        console.log(`syncS3 result: ${res}`);
        process.exit();
    })
    .catch((err) => {
        console.log(`syncS3 result: error`);
        console.log(err);
        process.exit(1);
    });
