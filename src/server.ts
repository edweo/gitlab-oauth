import express, { type Application } from 'express'
import { initEnv, type EnvSettings } from './server_config/env/env.ts'
import initHandlebars from './server_config/handlebars.ts'
import initMiddleware from './server_config/middlewares.ts'
import initExpressSettings from './server_config/express_settings.ts'
import initRoutes, { uri } from './server_config/routes.ts'
import path from 'node:path'
import { fileURLToPath } from 'url'
import { successMessageBold } from './server_config/console_messages/console_messages.js'
import initErrors from './server_config/errors.js'
import GitLabWebSocket from './modules/gitlab_api/gitlab_websocket.js'
import { type WebSocketServer } from 'ws'
import server_config from '../server_config.ts'
import { type Server } from 'node:net'
import { isUserLoggedIn } from './middleware/is_user_logged_in.js'
import { type SessionServer } from './modules/session/session_server.js'
import { doesUserHaveAccessToProject, isUserAuthenticatedGitLab } from './middleware/is_user_authenticated_gitlab.js'

// Root directory: b2-crud/
const rootDir: string = path.join(fileURLToPath(new URL('.', import.meta.url)), '../')

// Express Application
const app: Application = express()

// Environment Variables and Settings
const envSettings: EnvSettings = await initEnv()

// Express Settings
initExpressSettings(app)

// Handlebars Templating Engine
initHandlebars(app, rootDir)

// Middleware
const middlewares = initMiddleware(app, envSettings.mongoUri)
// @ts-expect-error if doe snot exist
const sessionParser = middlewares.sessionParser

// Routes
initRoutes(app)

// Error handling
initErrors(app)

// Export function to start and listen to server
function startServer (): void {
  // WebSockets GitLab init
  GitLabWebSocket.InitAppExpress(app).then().catch(e => {
    console.log('Error initializing WebSockets from DB')
    process.exit()
  })

  const server: Server = app.listen(envSettings.port, (): void => {
    successMessageBold(`Web Client Server started on port: ${envSettings.port}`)
    successMessageBold('SERVER BASE URL: ' + server_config.base_url)
    console.log()
  })

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  server.on('upgrade', async (req, socket, head) => {
    const regEx = new RegExp(`${uri('/gitlab/project/[^d+$]')}`)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    if (!regEx.test(req.url)) return // URL does not match RegEx

    let projectID: number = 0
    try {
      const params: string[] = req.url.split('/')
      projectID = Number(params[4])
    } catch (e) {}

    sessionParser(req, {}, async () => {
      const session: SessionServer = req.session
      if (isUserLoggedIn(session) && await isUserAuthenticatedGitLab(session) && await doesUserHaveAccessToProject(session, projectID)) {
        // Find websocket with current project id
        const socketFound = GitLabWebSocket.sockets.get(projectID)
        let socketToConnect: WebSocketServer
        if (socketFound === undefined) {
          return
        } else {
          socketToConnect = socketFound.socketServer
        }

        // Connect to project socket
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        socketToConnect.handleUpgrade(req, socket, head, (ws) => {
          socketToConnect.emit('connection', ws, req)
        })
      } else {
        console.log('Something happened when validating user')
      }
    })
  })
}

export { app, startServer }
