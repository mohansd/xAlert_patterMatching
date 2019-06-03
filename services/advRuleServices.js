/**collections */
const AdvRule = require('../collections/advRule')
/**local modules */
const AdvRuleHandler = require('../class/advRuleHandler')
const { debug, info, warn, error } = require('./logger')
const { dbException, paramsException, noDataExcetion } = require('../class/exceptions')

let advRuleHandlers = []

/**init ruleHandlers by rules */
const addRuleHandlers = advRules => {
  return new Promise((resolve, reject) => {
    try {
      advRules.forEach(advRule => {
        advRuleHandlers.push(new AdvRuleHandler(advRule))
      })
      resolve(advRuleHandlers)
    } catch (err) {
      reject(err)
    }
  })
}

/**init rule handler with advance rules in DB */
const initRules = () => {
  return new Promise((resolve, reject) => {
    AdvRule.find({})
      .then(docs => {
        if (docs.length !== 0) {
          resolve(docs)
        } else {
          throw new noDataExcetion(`No advance rule in DB`)
        }
      })
      .then(addRuleHandlers)
      .then(data => {
        debug(JSON.stringify(data))
        resolve(data)
      })
      .catch(err => {
        reject(err)
      })
  })
}

/**receive a event by a advance rule handler */
const receiveEventByOne = async (advRuleHandler, events) => {
  return new Promise((resolve, reject) => {
    try {
      for (let event of events) {
        advRuleHandler.expireCheck(event)
        if (advRuleHandler.receiveEvent(event)) {
          await advRuleHandler.handlerEvent(event)
        } else {
          debug(`not match`)
        }
      }
      debug()
      resolve(advRuleHandler)
    } catch (err) {
      reject(err)
    }
  })
}

const receiveEventByAll = events => {
  advRuleHandlers.forEach(advRulehandler => {
    receiveEventByOne(advRulehandler, events)
    .then()
  })
}

//TODO
/**get all trace list */
const getAdvanceEvent = ruleHandlers => {
  let advRuleHandlers = []
  ruleHandlers.forEach(ruleHandler => {
    advRuleHandlers.push(ruleHandlers.getUncompleteAdvanceEvent(ruleHandler))
  })
  return advRuleHandlers
}

module.exports = {
  advRuleHandlers,
  addRuleHandlers,
  initRules,
  receiveEventByOne,
  receiveEventByAll
}
