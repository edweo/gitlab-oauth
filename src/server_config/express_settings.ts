import { type Application } from 'express'

export default function initExpressSettings (app: Application): void {
  app.disable('x-powered-by')
}
