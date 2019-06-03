/**export modules */
const mongoose = require('mongoose')
const { Schema } = mongoose

var Rules = new Schema(
  {
    rule: { type: Array, require: true, default: [] },
    name: { type: String, require: true, default: '', trim: true }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
)

module.exports = mongoose.model('Rules', Rules)
