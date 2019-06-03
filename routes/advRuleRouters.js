const router = require('router')
const advRuleCtrl = require('../controllers/advRuleCtrl')

router.get('/', advRuleCtrl.getAdvanceRule)
router.get('/events', advRuleCtrl.getEvents)

module.exports = router
