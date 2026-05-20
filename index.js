'use strict'

const StaticmanAPI = require('./server')
const api = new StaticmanAPI()

module.exports = async (req, res) => {
  return api.handleRequest(req, res)
}
