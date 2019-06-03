/**collections */
const Rules = require('../collections/rules')
const RuleHandlers = require('../collections/ruleHandlers')
/**local modules */
const RuleHandler = require('../class/ruleHandler')
const { debug, info, warn, error } = require('./logger')
const { dbException, paramsException, noDataExcetion } = require('../class/exceptions')

/**init ruleHandlers by rules */
const initRules = advanceRules => {
  let ruleHandlers = []
  return new Promise((resolve, reject) => {
    advanceRules.forEach(advanceRule => {
      ruleHandlers.push(new RuleHandler(advanceRule))
    })
    resolve(ruleHandlers)
  })
}

/**receive a event */
const receiveEvent = async (ruleHandler, eventList) => {
  for (let event of eventList) {
    ruleHandler.expireCheck(event)
    if (ruleHandler.receiveEvent(event)) {
      await ruleHandler.handlerEvent(event)
    } else {
      debug(`not match`)
    }
  }
}

//TODO
/**get all trace list */
const getAdvanceEvent = ruleHandlers => {
  let advanceRules = []
  ruleHandlers.forEach(ruleHandler => {
    advanceRules.push(ruleHandlers.getUncompleteAdvanceEvent(ruleHandler))
  })
  return advanceRules
}

module.exports = {
  initRules,
  receiveEvent,
  getAdvanceEvent
}
