'use strict';

const jsonwebtoken = require('jsonwebtoken');
const config = require('../../config');
const jwt = jsonwebtoken.sign({
  scope: 'app'
}, config.smoochSecret, {
  headers: {
    kid: config.smoochKeyId
  }
});

module.exports = jwt;

// If run directly, print JWT to cmd line
if (process.argv[1] === __filename) {
  console.log(jwt);
}
