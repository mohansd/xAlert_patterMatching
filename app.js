/**export modules */
const fs = require('fs')
const path = require('path')
/**local modules */
const common = require('./services/common')
const advRuleService = require('./services/advRuleServices')
const { advRuleHandler } = advRuleService
const { debug, info, warn, error } = require('./services/logger')

common.connectMongoDB()

const getAdvanceRules = () => {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'tests/advanceRule.json'))).data
}

const getEventList = () => {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'tests/eventList.json'))).eventList
}

let advRules = getAdvanceRules()
let eventList = getEventList()

advRuleService.addRuleHandlers(advRules).then()

advRuleService
  .initRules(advanceRules)
  .then(ruleHandlers => {
    // ruleHandlers.forEach(ruleHandler => {
    //   advRuleService.receiveEvent(ruleHandler, eventList)
    // })
    advRuleService.receiveEvent(ruleHandlers[0], eventList)
    advRuleService.receiveEvent(ruleHandlers[1], eventList)
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        ruleHandlers.forEach(ruleHandler => {
          ruleHandler.traces = []
          ruleHandler.queues.forEach(queue => {
            if (queue.head !== null) {
              ruleHandler.traces.push(ruleHandler.log.slice(queue.head))
            }
          })
        })
        resolve(ruleHandlers)
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
