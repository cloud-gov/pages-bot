function areArraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }

  for (var i = 0, l = arr1.length; i < l; i++) {
    if (arr1[i] instanceof Array && arr2[i] instanceof Array) {
      if (!areArraysEqual(arr1[i], arr2[i])) return false;
    } else if (arr1[i] !== arr2[i]) {
      return false;
    }
  }

  return true;
}

function getVcapDbUrl() {
  const vcapServices = JSON.parse(process.env.VCAP_SERVICES);

  return vcapServices['aws-rds'][0]['credentials']['uri'];
}

module.exports = {
  areArraysEqual,
  getVcapDbUrl,
};
