const express = require('express')
const router = express.Router()
const { authenticated } = require('../../middleware/auth')
const tweetController = require('../../controllers/tweet-controller')

// 使用者取得一則貼文
router.get('/:tweet_id', authenticated, tweetController.getTweet)
// 使用者取得所有貼文
router.get('/', authenticated, tweetController.getTweets)
module.exports = router
