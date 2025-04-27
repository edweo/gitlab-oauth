import express, { type Application } from 'express'
import { checkFlashMessage } from '../middleware/check_flash_message.js'
// @ts-expect-error skipping TS types for morgan
import morgan from 'morgan'
import cors from 'cors'
import initExpressSession from '../middleware/express_session.js'
import server_config from '../../server_config.ts'

const allowedOrigins = [
  server_config.domain, 'lnu.se', 'gitlab.lnu.se'
]

export default function initMiddleware (app: Application, mongoUri: string): object {
  app.use(server_config.base_url, express.static('public'))
  app.use(express.json())
  app.use(cors({
    origin: allowedOrigins
  }))
  app.use(express.urlencoded({ extended: true }))
  app.use(morgan(':remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms'))
  const sessionParser = initExpressSession(app, mongoUri)
  app.use(checkFlashMessage)
  return {
    sessionParser
  }
}
