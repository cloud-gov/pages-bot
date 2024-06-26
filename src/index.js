const { syncAirtableBase } = require('./tasks');

syncAirtableBase()
  .then((res) => {
    console.log(res);
    process.exit();
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
