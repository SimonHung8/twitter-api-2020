if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const passport = require('./config/passport')
// const helpers = require('./_helpers')

const app = express()
const port = 3000

// // use helpers.getUser(req) to replace req.user

app.use(passport.initialize())

app.get('/', (req, res) => res.send('Hello World!'))
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

module.exports = app
