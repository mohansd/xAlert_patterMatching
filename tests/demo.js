const EventList
const patterMatch = require('../services/patternMatch')
const common = require('../services/common')

common.getEvents().then(events => {
  patterMatch.ruleHandlers.forEach(ruleHandler => {
    for (let event of events) {
      ruleHandler.accept(event)
    }
  })
})

setTimeout(() => {
  patterMatch.ruleHandlers.forEach(ruleHandler => {
    console.log(ruleHandler.getEvents())
  })
}, 1000 * 60)
