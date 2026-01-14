import { createServer, plugins } from 'restify'
import { readdirSync } from 'fs'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import corsMiddleware from 'restify-cors-middleware'
import { dbConnect } from './env/db.js'
import { $rootPath } from './env/env.js'
import { $getApiList } from './lib/api.js'
import nunjucks from 'nunjucks'

const server = createServer({ name: process.env.SERVER_NAME })
const { preflight, actual } = corsMiddleware({
  origins: [/.*/],
  credentials: true,
})

server.pre(preflight)
server.use(actual)
server.use(plugins.queryParser())
server.use(plugins.bodyParser())

!(async () => {
  await dbConnect()

  server.use(
    session({
      secret: process.env.SERVER_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: { httpOnly: false, domain: process.env.SERVER_DOMAIN },
      store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URL,
        dbName: process.env.MONGODB_DBNAME,
      }),
    })
  )

  server.use((req, res, next) => {
    const freePath = ['/', '/login', '/auth']
    if (freePath.includes(req.path()) || req.session.staff) {
      return next()
    } else {
      res.status(401)
      res.send()
    }
  })

  for (const fileName of readdirSync($rootPath`api`)) {
    await import(`./api/${fileName}`)
    console.log(`接口[${fileName}]已加载.`)
  }

  const apiList = $getApiList()
  apiList.forEach(apiItem => {
    server[apiItem.method](apiItem.path, apiItem.func)
  })

  nunjucks.configure($rootPath`template`, { autoescape: true, noCache: true })
  server.get('/', (_req, res, next) => {
    res.sendRaw(nunjucks.render(`home.njk`, { apiList: apiList }))
    return next()
  })

  server.listen(process.env.SERVER_PORT, process.env.DEPLOY_HOST, () => {
    console.log(
      `服务器[${server.name}]已经于[${process.env.DEPLOY_HOST}:${process.env.SERVER_PORT}]成功开启.`
    )
  })
})()
