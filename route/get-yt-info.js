const express = require('express')
const route = express.Router()
const {getYtInfo} = require('../controller/youtube')
const {M3U8} = require('../controller/m3u8')
route.route('/video').get(getYtInfo)
route.route('/m3u8').get(M3U8)
module.exports = route