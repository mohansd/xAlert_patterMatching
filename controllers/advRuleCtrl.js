const common = require('../services/common')
const advRuleServices = require('../services/advRuleServices')
const { advRuleHandlers } = advRuleServices
const { debug, info, warn, error } = require('../services/logger')

function getAdvanceRule(req, res) {
  advRuleServices.initRules(advRuleHandlers)
}
