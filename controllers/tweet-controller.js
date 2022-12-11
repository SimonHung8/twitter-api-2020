const { Tweet, User, sequelize, Like } = require('../models')
const { getUser } = require('../_helpers')

const tweeteController = {
  getTweets: async (req, res, next) => {
    try {
      const tweets = await Tweet.findAll({
        include: [{ model: User, attributes: ['id', 'account', 'name', 'avatar'] }],
        attributes: {
          include: [
            [sequelize.literal(`(SELECT COUNT(*) AS replyCounts FROM ac_twitter_workspace.replies
          WHERE Tweet_id = tweet.id)`), 'replyCounts'],
            [sequelize.literal('(SELECT COUNT(*) AS likeCounts FROM ac_twitter_workspace.likes WHERE Tweet_id = tweet.id)'), 'likeCounts']
          ]
        },
        order: [['createdAt', 'DESC']],
        raw: true,
        nest: true
      })
      const loginUser = getUser(req).id
      const likes = await Like.findAll({
        where: { UserId: loginUser },
        raw: true,
        nest: true
      })
      const data = await tweets.map(tweet =>
        ({
          ...tweet,
          isLiked: likes.some(like => like.TweetId === tweet.id),
          description: tweet.description.substring(0, 50)
        })
      )
      res.status(200).json(data)
    } catch (err) {
      next(err)
    }
  }
}
module.exports = tweeteController
