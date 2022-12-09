const express = require('express')
const router = express.Router()
const tweeteController = require('../../controllers/tweet-controller')
router.get('/', tweeteController.getTweets)
module.exports = router
