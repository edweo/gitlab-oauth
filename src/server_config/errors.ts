import { handleError } from '../middleware/error_handling.js'
import { type Application } from 'express'

export default function initErrors (app: Application): void {
  app.use(handleError)
}
