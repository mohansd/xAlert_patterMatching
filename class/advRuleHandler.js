const AdvEvent = require('../collections/advEvent')
const { debug, info, warn, error } = require('../services/logger')

/**
 * @param: {
 *   _id: '5cdcf607f1487e08f11750ce',
 *   alarmList: [
 *     {
 *       signatrueId: "100419",
 *       alarmType: "THREAT",
 *       expire: "86400000‬"
 *     }, { ... }, ...
 *   ]
 * } pRule
 *
 * @return: {
 *   log: [_id, _id, ...],
 *   queues: [{
 *     head: head_index_in_log,
 *     current: current_status_in_rule,
 *     expireTimestamp:  2316892769
 *   }, { ... }, ...],
 *   alarmList: [
 *     { _id, key: { value: '1004139', field: 'signetureId' } }
 *   ]
 * }
 */
function RuleHandler(pRule) {
  this._id = pRule._id
  this.log = new Array()
  this.queues = [{ head: null, current: 0, expireTimestamp: 0 }]
  pRule.alarmList.forEach(alarm => {
    alarm.expire = parseInt(alarm.expire)
  })
  this.alarmList = pRule.alarmList
}

/**In rules weather or not */
RuleHandler.prototype.receiveEvent = function(event) {
  let index = 0
  for (; index < this.alarmList.length; index++) {
    if (this.alarmList[index].alarmType == event.type && this.alarmList[index].signatureId == event.signatureId) {
      this.log.push(event._id)
      break
    } else {
    }
  }
  debug(`receive event: complete`)
  return index == this.alarmList.length ? false : true
}

RuleHandler.prototype.handlerEvent = function(event) {
  return new Promise((resolve, reject) => {
    /**if event is the entrypoint in this rule while no queue wait for entrypoint, create one in queues */
    if (event.type == this.alarmList[0].alarmType && event.signatureId == this.alarmList[0].signatureId) {
      let index = 0
      for (; index < this.queues.length; index++) {
        if (this.queues[index].current == 0) {
          break
        }
      }
      if (index == this.queues.length) {
        this.queues.push({ head: null, current: 0, expireTimestamp: 0 })
      }
    }
    for (let i in this.queues) {
      let waitForEvent = this.alarmList[this.queues[i].current]
      let currentEvent = this.queues[i].current != 0 ? this.alarmList[this.queues[i].current - 1] : null
      debug(`waitForEvnet: ${JSON.stringify(waitForEvent)}`)
      debug(`currentEvnet: ${JSON.stringify(currentEvent)}`)
      if (event.type == waitForEvent.alarmType && event.signatureId == waitForEvent.signatureId) {
        if (event.type == this.alarmList[0].alarmType && event.signatureId == this.alarmList[0].signatureId && this.queues[i].head == null) {
          this.queues[i].head = this.log.length - 1
        }
        if ((this.queues[i].current + 1) % this.alarmList.length !== 0) {
          /**reveice wait for event: jump to next */
          info(`queue[${i}]: jump to next status`)
          this.queues[i].current = ++this.queues[i].current
          this.queues[i].expireTimestamp = new Date(event.timestamp).getTime() + waitForEvent.expire
          resolve()
          return
        } else {
          /**reveice wait for event: jump to end */
          info(`queue[${i}]: jump to end`)
          debug('log' + JSON.stringify(this.log))
          /**save to DB */
          debug(`save to DB`)
          AdvEvent.create({
            rule: this._id,
            name: `${this._id}_${new Date().toLocaleString()}`,
            events: this.log.slice(this.queues[i].head)
          }).then(doc => {
            debug(`save to DB`)
            /**remove the expire events in log */
            let nextHead = this.queues[i].head
            for (let queue of this.queues) {
              if (queue.head !== null && queue.head > this.queues[i].head && queue.head < nextHead) {
                nextHead = queue.head
              }
            }
            this.log.splice(0, nextHead)
            for (let queue of this.queues) {
              if (queue.head !== null) {
                queue.head = queue.head - nextHead
              }
            }
            /**remove queue which is end */
            this.queues.splice(i, 1)
            --i
            resolve()
            return
          })
        }
      } else if (currentEvent && event.type == currentEvent.alarmType && event.signatureId == currentEvent.signatureId) {
        /**reveice current event: fresh expire */
        info(`queue[${i}]: fresh expire`)
        this.queues[i].expireTimestamp = new Date(event.timestamp).getTime() + currentEvent.expire
        resolve()
        return
      } else {
        /**receive other event: ignore */
        /**to do nothing */
        info(`queue[${i}]: ignore`)
        resolve()
        return
      }
    }
    info(`${this._id} receiveEvent: complete`)
  })
}

/**
 * @function: remove expire queue of rule
 */
RuleHandler.prototype.expireCheck = function(event) {
  for (let index in this.queues) {
    if (this.queues[index].expireTimestamp < new Date(event.timestamp).getTime() && this.queues[index].expireTimestamp !== 0) {
      debug(`timeout remove`)
      /**remove the expire events in log */
      let nextHead = this.queues[index].head
      for (let queue of this.queues) {
        if (queue.head !== null && queue.head > this.queues[index].head && queue.head < nextHead) {
          nextHead = queue.head
        }
      }
      this.log.splice(0, nextHead)
      for (let queue of this.queues) {
        if (queue.head !== null) {
          queue.head = queue.head - nextHead
        }
      }
      /**remove queue which expire */
      this.queues.splice(index, 1)
      --i
      resolve()
      return
    }
  }
  debug(`expire check: complete`)
  return
}

/**
 * @function: get uncompleted events list
 */
RuleHandler.prototype.getTraces = function() {
  let traces = []
  for (let queue of this.queues) {
    if (queue.expireTimestamp == 0) {
      /**wait for first event */
      continue
    } else {
      /**middle of a event list */
      traces.push({
        rule: this.alarmList.name,
        currentStatus: this.alarmList.slice(0, queue.current)
      })
    }
  }
  return traces
}

module.exports = RuleHandler
