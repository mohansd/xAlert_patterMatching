const mongoose = require('mongoose')
const { Schema } = mongoose

const AdvEvent = new Schema({
  name: { type: String, requrie: true, defualt: '', trim: true },
  events: { type: Array, require: true, default: [] },
  rule: { type: String, require: true, default: '', trim: true }
})

module.exports = mongoose.model('AdvEvent', AdvEvent)
