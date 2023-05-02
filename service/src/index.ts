import express from 'express'
import type { RowDataPacket } from 'mysql2'
import jwt from 'jsonwebtoken'
import { expressjwt as jsonwt } from 'express-jwt'
import type { RequestProps } from './types'
import type { ChatMessage } from './chatgpt'
import { chatConfig, chatReplyProcess, currentModel } from './chatgpt'
import { auth } from './middleware/auth'
import { limiter } from './middleware/limiter'
import { isNotEmptyString } from './utils/is'
import { createSixNum } from './utils'
import { sendMail } from './sendmail'
import { connectToDatabase } from './mysql'

// import { expressjwt, ExpressJwtRequest } from "express-jwt";

const app = express()
const router = express.Router()

app.use(express.static('public'))
app.use(express.json())

app.all('*', (_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'authorization, Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  next()
})

router.post('/chat-process', [auth, limiter], async (req, res) => {
  res.setHeader('Content-type', 'application/octet-stream')
  const connection = await connectToDatabase()

  try {
    const { prompt, options = {}, systemMessage } = req.body as RequestProps
    let firstChunk = true
    // globalThis.console.log(req.auth.email)
    await chatReplyProcess({
      message: prompt,
      lastContext: options,
      process: (chat: ChatMessage) => {
        res.write(firstChunk ? JSON.stringify(chat) : `\n${JSON.stringify(chat)}`)
        const rows = connection.execute('SELECT * FROM user_times WHERE email = ?', [req.auth.email])
        const row = rows[0] as RowDataPacket
        connection.execute('UPDATE user_times SET token = ? WHERE email = ?;', [row[0].times - 1, req.auth.email])
        firstChunk = false
      },
      systemMessage,
    })
  }
  catch (error) {
    res.write(JSON.stringify(error))
  }
  finally {
    res.end()
  }
})

router.post('/config', auth, async (req, res) => {
  try {
    const response = await chatConfig()
    res.send(response)
  }
  catch (error) {
    res.send(error)
  }
})
router.post('/session', async (req, res) => {
  try {
    const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY
    const hasAuth = isNotEmptyString(AUTH_SECRET_KEY)
    res.send({ status: 'Success', message: '', data: { auth: hasAuth, model: currentModel() } })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body as { token: string }
    if (!token)
      throw new Error('Secret key is empty')

    if (process.env.AUTH_SECRET_KEY !== token)
      globalThis.console.log(token)
    throw new Error('密钥无效 | Secret key is invalid')

    res.send({ status: 'Success', message: 'Verify successfully', data: null })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/sendcode', async (req, res) => {
  try {
    const { email } = req.body as { email: string }
    const code = createSixNum()
    const mailOptions = {
      from: '865672992@qq.com', // 发送者邮箱地址
      to: email, // 接收者邮箱地址
      subject: '登录验证码', // 邮件主题
      text: `您的验证码是：${code}，请不要告诉别人您的验证码`, // 邮件正文
    }
    sendMail(mailOptions)

    globalThis.console.log(code)
    const connection = await connectToDatabase()
    const rows = await connection.execute('SELECT * FROM user_times WHERE email = ?', [email])
    const row = rows[0] as RowDataPacket
    if (row.length > 0) {
      // await connection.execute('UPDATE user_times SET times = ? WHERE email = ?;', [row[0].times - 1, email])
      // await connection.execute('UPDATE user_times SET token = ? WHERE email = ?;', [code, email])
      res.send({ status: 'Success', message: 'SEND and INSERT successfully', data: 1 })
    }
    else {
      const sql = 'INSERT INTO user_times SET ?'
      const data = {
		  email,
		  token: code,
		  times: 100,
      }
      await connection.query(sql, data)
      res.send({ status: 'Success', message: 'SEND and INSERT successfully', data: 1 })
    }
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/checkcode', async (req, res) => {
  try {
    const { email, token } = req.body as { email: string; token: string }

    // sbsbsbsb bug-----------------------------------------
    // const sql = `SELECT * FROM user_times where email=${email}`
    if (!email || !token)
      res.send({ status: 'Fail', message: 'check failed', data: 0 })

    const connection = await connectToDatabase()
    const rows = await connection.execute('SELECT * FROM user_times WHERE email = ?', [email])
    const row = rows[0] as RowDataPacket

    if (token === row[0].token && row[0].times > 0) {
      const tokenStr = jwt.sign({ email }, process.env.JWT_SECRET_KEY, { expiresIn: '30000s' })

      res.send({ status: 'Success', message: 'check successfully', data: tokenStr })
    }
    else {
      res.send({ status: 'Fail', message: 'check failed', data: 0 })
    }
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/testAuth', async (req, res) => {
  try {
    globalThis.console.log(req.auth)
    res.send({ status: 'Success', message: 'check successfully', data: 1 })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/generateAuth', async (req, res) => {
  try {
	  // eslint-disable-next-line no-tabs
	  const tokenStr = jwt.sign({ email: '865672992@qq' }, process.env.JWT_SECRET_KEY, { expiresIn: '30000s' })

    res.send({ status: 'Success', message: 'check successfully', data: tokenStr })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

/* 过滤不需要经过验证的路由 */
const skipMiddleware = (req) => {
  if (req.path === '/checkcode' || req.path === '/sendcode' || req.path === '/generateAuth' || req.path === '/session')
    return true

  return false
}

app.use(jsonwt({
  secret: process.env.JWT_SECRET_KEY,
  algorithms: ['HS256'],
  getToken: function fromHeaderOrQuerystring(req) {
    if (
      req.headers.authorization2
        && req.headers.authorization2.split(' ')[0] === 'Bearer'
    )
      return req.headers.authorization2.split(' ')[1]

    else if (req.query && req.query.token)
      return req.query.token

    return null
  },
}).unless({ custom: skipMiddleware }))
app.use('', router)
app.use('/api', router)
app.set('trust proxy', 1)

app.use((err, req, res, next) => {
  // 判断是否由 Token 解析失败导致的
  if (err.name == 'UnauthorizedError') {
    return res.status(403).send({
      status: 403,
      message: '无效的Token',
    })
  }
  res.status(500).send({
    status: 500,
    message: '未知的错误',
  })
})
app.listen(3002, () => globalThis.console.log('Server is running on port 3002'))
