const mongoose = require('mongoose')
const { Schema } = mongoose

var RuleHandlers = new Schema(
  {
    log: { type: Array, require: true, default: [] },
    queues: { type: Array, require: true, default: [{ head: null, current: 0, exireTimestamp: 0 }] },
    rule: { type: Map, require: true, default: new Map() }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
)

module.exports = mongoose.model('RuleHandlers', RuleHandlers)
