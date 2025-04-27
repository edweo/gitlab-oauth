import { type Application } from 'express'
import { engine } from 'express-handlebars'
import path from 'node:path'
import { baseUrl, descriptionFormat } from '../handlebars_helpers/helpers.js'

export default function initHandlebars (app: Application, rootDir: string): void {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  app.engine('handlebars', engine({
    helpers: {
      baseUrl,
      descriptionFormat
    }
  }))
  app.set('view engine', 'handlebars')
  app.set('views', path.join(rootDir, 'views'))
}
