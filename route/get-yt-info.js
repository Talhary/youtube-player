const express = require('express')
const route = express.Router()
const {getYtInfo} = require('../controller/youtube')

route.route('/video').get(getYtInfo)

module.exports = route