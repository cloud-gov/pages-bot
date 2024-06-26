const client = require('./client');
const queries = require('./queries');

module.exports = {
  ...client,
  ...queries,
};
