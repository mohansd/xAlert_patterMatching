const express = require('express')
const http = require('http')
const mongoose = require('mongoose')
const bodyParse = require('body-parse')

const conf = require('./config')
const common = require('./common')
const advRuleServices = require('./advRuleServices')
const { advRuleHandlers } = advRuleServices
const { debug, info, warn, error } = require('./logger')

function initApp(app) {
  app.set('port', conf.port.http)
  app.use(bodyParse.json())
  app.use(bodyParse.urlencoded({ extended: false }))
  common.connectMongoDB()
  advRuleServices.initRules(advRuleHandlers).then()

  app.use('/api/advanceRule', require('../routes/advancenRuleRouter'))
}

let app = express()
initApp(app)
let server = http.Server(app)
server.listen(app.get('port'), function() {
  info(`server listening on port ${app.get('port')}@${app.get('env')}`)
})
