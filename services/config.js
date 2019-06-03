const path = require('path')
const fs = require('fs')

var config = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/config.json')))

module.exports = config
