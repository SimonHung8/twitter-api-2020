const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { Tweet, User, sequelize } = require('../models')
const adminController = {
  login: async (req, res, next) => {
    try {
      // check account and password
      const { account, password } = req.body
      const user = await User.findOne({
        where: { account, role: 'admin' },
        attributes: ['id', 'account', 'name', 'email', 'password', 'role']
      })
      if (!user) return res.status(401).json({ status: 'error', message: '帳號不存在' })
      const isPasswordCorrect = await bcrypt.compare(password, user.password)
      if (!isPasswordCorrect) return res.status(401).json({ status: 'error', message: '帳號或密碼錯誤' })
      // sign token
      const userData = user.toJSON()
      delete userData.password
      const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '14d' })
      res.status(200).json({ token, user: userData })
    } catch (err) {
      next(err)
    }
  },
  getUsers: async (req, res, next) => {
    try {
      const page = Number(req.query.page) || 1
      const limit = 16
      const offset = (page - 1) * limit
      const users = await User.findAll({
        attributes: [
          'id', 'account', 'name', 'avatar', 'cover',
          [sequelize.literal('(SELECT COUNT(*) FROM Tweets WHERE Tweets.User_id = User.id)'), 'tweetCounts'],
          [sequelize.literal('(SELECT COUNT(*) FROM Likes WHERE Likes.User_id = User.id)'), 'likeCounts'],
          [sequelize.literal('(SELECT COUNT(*) FROM Followships WHERE Followships.follower_id = User.id)'), 'followingCounts'],
          [sequelize.literal('(SELECT COUNT(*) FROM Followships WHERE Followships.following_id = User.id)'), 'followerCounts']
        ],
        limit,
        offset,
        raw: true,
        order: [[sequelize.literal('tweetCounts'), 'DESC'], ['role', 'DESC'], ['id', 'ASC']]
      })
      res.status(200).json(users)
    } catch (err) {
      next(err)
    }
  },
  getTweets: async (req, res, next) => {
    try {
      const page = Number(req.query.page) || 1
      const limit = 10
      const offset = (page - 1) * limit
      const tweets = await Tweet.findAll({
        include: [{ model: User, attributes: ['id', 'account', 'name', 'avatar'] }],
        order: [['createdAt', 'DESC'], ['id', 'ASC']],
        limit,
        offset,
        raw: true,
        nest: true
      })
      const data = tweets.map(t => ({
        ...t,
        description: t.description.substring(0, 50)
      }))
      res.status(200).json(data)
    } catch (err) {
      next(err)
    }
  },
  deleteTweet: async (req, res, next) => {
    try {
      const TweetId = req.params.id
      const tweet = await Tweet.findByPk(TweetId, { raw: true })
      if (!tweet) throw new Error('推文不存在')
      await Tweet.destroy({ where: { id: TweetId } })
      res.status(200).json(tweet)
    } catch (err) {
      next(err)
    }
  }
}
module.exports = adminController
