const RuleHandlers = require('../collections/ruleHandlers')
const Rules = require('../collections/rules')
const RuleHandler = require('../class/ruleHandler')
const { dbException, paramsException, noDataExcetion } = require('../class/exceptions')

let ruleHandlers = null

/**init ruleHandlers by rules */
const initRules = () => {
  return new Promise((resolve, reject) => {
    Rules.find({})
      .then(
        docs => {
          if (docs.length == 0) {
            ruleHandlers = []
            resolve(ruleHandlers)
          } else {
            for (let doc of docs) {
              ruleHandlers.push(new RuleHandler(doc))
            }
            resolve(ruleHandlers)
          }
        },
        err => {
          throw new dbException(err)
        }
      )
      .catch(err => {
        reject(err)
      })
  })
}

/**get ruleHandlers from local mongodb */
const getRuleHandlerFromLocal = () => {
  return new Promise((resolve, reject) => {
    RuleHandlers.find({})
      .then(
        docs => {
          if (docs.length == 0) {
            resolve(null)
          } else {
            ruleHandlers = docs.map(doc => {
              return {
                log: doc.log,
                queues: doc.queues,
                rule: doc.rule
              }
            })
            resolve(ruleHandlers)
          }
        },
        err => {
          throw new dbException(err)
        }
      )
      .catch(err => {
        reject(err)
      })
  })
}

const acceptEvent = event => {
  ruleHandlers.forEach(ruleHandler => {})
}
