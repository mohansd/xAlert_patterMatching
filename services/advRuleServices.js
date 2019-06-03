/**collections */
const AdvRule = require('../collections/advRule')
/**local modules */
const AdvRuleHandler = require('../class/advRuleHandler')
const { debug, info, warn, error } = require('./logger')
const { dbException, paramsException, noDataExcetion } = require('../class/exceptions')

let advRuleHandlers = []

/**add a new advance rule handler to advRuleHandlers */
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
const receiveEventByOne = (advRuleHandler, events) => {
  return new Promise(async (resolve, reject) => {
    try {
      for (let event of events) {
        advRuleHandler.expireCheck(event)
        if (advRuleHandler.receiveEvent(event)) {
          await advRuleHandler.handlerEvent(event)
        } else {
          debug(`not match`)
        }
      }
      debug(`${advRuleHandler._id} accept new event`)
      resolve(advRuleHandler)
    } catch (err) {
      reject(err)
    }
  })
}

const receiveEventByAll = events => {
  return new Promise((resolve, reject) => {
    advRuleHandlers.forEach(advRulehandler => {
      receiveEventByOne(advRulehandler, events)
    })
    debug(`all handler accept new event`)
    resolve()
  })
}

/**get all rule handler with trace list */
const getAdvRuleHandler = () => {
  let results = []
  advRuleHandlers.forEach(advRuleHandler => {
    results.push(
      Object.assign(advRuleHandler, {
        traces: advRuleHandler.getTraces()
      })
    )
  })
  return results
}

module.exports = {
  advRuleHandlers,
  addRuleHandlers,
  initRules,
  receiveEventByOne,
  receiveEventByAll,
  getAdvRuleHandler
}
