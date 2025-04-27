import { type Application } from 'express'
import session from 'express-session'
import MongoStore from 'connect-mongo'

const initExpressSession = (app: Application, mongoUrl: string): object => {
  // const mongoUrl = process.env.NODE_ENV === 'test' ? mongoMemoryServer.getUri() : process.env.MONGO_DB_URI
  const sessionParser = session({
    secret: 'a5bv!-24@4-78A91v9B17A1B0A3B2-@#$%-14sv0ab6A1WA6Ggv5sb-#@-1a/*-a-f-2x6A7A7B16v55v5a5a5a/**-a!@-55aA7A7a5sas1c1Z',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl,
      autoRemove: 'native'
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 2.5 // 2h 30 min hour session-cookie | ms ss mm hh
    }
  })
  app.use(sessionParser)
  return sessionParser
}

export default initExpressSession
