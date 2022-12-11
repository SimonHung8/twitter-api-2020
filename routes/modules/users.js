const express = require('express')
const router = express.Router()
const { registerValidator } = require('../../middleware/validator')
const userController = require('../../controllers/user-controller')
const { authenticated, authenticatedUser } = require('../../middleware/auth')

// 登入
router.post('/login', userController.login)
// 取得使用者資料
router.get('/:id', authenticated, authenticatedUser, userController.getUser)
// 註冊
router.post('/', registerValidator, userController.register)

module.exports = router
