/**export modules */
const mongoose = require('mongoose')
/**local modules */
const conf = require('./config')
const { debug, info, warn, error } = require('./logger')

const getMongoDBUrl = () => {
  return `mongodb://${conf.database.ip}:${conf.database.port}/test`
}

const connectMongoDB = () => {
  const connect = () => {
    var options = {
      // server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
      // replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
      useNewUrlParser: true,
      useFindAndModify: false // enable use findOneAndUpdate or findOneAndRemove
    }
    return (connct = mongoose.connect(getMongoDBUrl(), options))
  }

  mongoose.connection
    .on('error', err => {
      error(err)
    })
    .on('disconnected', () => {
      connect() // reconnect to the mongodb
    })
    .on('open', () => {
      info(`connect to the ${getMongoDBUrl()}`)
    })
  return connect() // connect to the mongodb
}

module.exports = {
  getMongoDBUrl,
  connectMongoDB
}
