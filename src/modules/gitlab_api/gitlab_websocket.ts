import type WebSocket from 'ws'
import { WebSocketServer } from 'ws'
import server_config from '../../../server_config.js'
import { type Application } from 'express'
import { getAllGitLabWebHooks } from '../../models/gitlab_webhooks/queries.js'
import { type IGitLabWebHook } from '../../models/gitlab_webhooks/model.js'

export default class GitLabWebSocket {
  static sockets: Map<number, GitLabWebSocket> = new Map<number, GitLabWebSocket>()
  static app: Application | null = null
  static lastPort = 1020

  readonly socketServer: WebSocketServer
  readonly connect_url: string
  readonly port: number
  readonly projectID: number

  constructor (projectID: number) {
    // Randomize with try-catch ports above 1024 or other limits to see which work
    let port = GitLabWebSocket.lastPort
    while (true) { // Find an allowed port that is nto taken yet
      try {
        port++
        this.socketServer = new WebSocketServer({
          port
        })
        GitLabWebSocket.lastPort = port
        break
      } catch (e) {}
    }

    this.socketServer.on('connection', (socketClient: WebSocket) => {
      socketClient.on('message', (msg: string) => {
        let msgJSON: object = {}
        try {
          msgJSON = JSON.parse(msg)
          this.broadcastToAllExcept(socketClient, JSON.stringify(msgJSON))
        } catch (e) {}
      })

      // TODO remove
      setInterval(() => {
        socketClient.send('heartbeat')
      }, 2000)
    })

    this.connect_url = server_config.socket_type + server_config.domain + `/${projectID}`
    this.projectID = projectID
    this.port = port

    GitLabWebSocket.sockets.set(Number(projectID), this)
  }

  broadcastToAllExcept (ws: WebSocket, msg: string): void {
    this.socketServer.clients.forEach(client => {
      if (client !== ws) {
        client.send(msg)
      }
    })
  }

  broadcastToAllClients (msg: string): void {
    this.socketServer.clients.forEach(client => {
      client.send(msg)
    })
  }

  static async InitAppExpress (app: Application): Promise<void> {
    if (this.app === null) this.app = app

    // Create Web Sockets from FB
    const socketsDB: IGitLabWebHook[] = await getAllGitLabWebHooks()
    socketsDB.forEach(hook => {
      // eslint-disable-next-line no-new
      // @ts-expect-error err
      // eslint-disable-next-line no-new
      new GitLabWebSocket(hook.project_id, hook.secret)
    })
  }
}
