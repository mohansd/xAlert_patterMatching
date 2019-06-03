/**export modules */
const fs = require('fs')
const path = require('path')
/**local modules */
const common = require('./services/common')
const advRuleService = require('./services/advRuleServices')
const { advRuleHandlers } = advRuleService
const { debug, info, warn, error } = require('./services/logger')

common.connectMongoDB()

const getAdvanceRules = () => {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'tests/advanceRule.json'))).data
}

const getEventList = () => {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'tests/eventList.json'))).eventList
}

let advanceRules = getAdvanceRules()
let eventList = getEventList()

advRuleService
  .addRuleHandlers(advanceRules)
  .then(ruleHandlers => {
    debug(JSON.stringify(ruleHandlers))
    advRuleService.receiveEventByAll(eventList)
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        debug(JSON.stringify(advRuleService.getAdvRuleHandler(), null, '\t'))
      }, 5000)
    })
  })
  .then(data => {
    console.log(JSON.stringify(data, null, '\t'))
  })
  .catch(err => {
    console.log(`warn: ${err}`)
  })

module.exports = {
  getAdvanceRules,
  getEventList
}
