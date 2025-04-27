import { type Request, type Response } from 'express'
import { nanoid } from 'nanoid'
import { type SessionServer } from '../../modules/session/session_server.js'
import { setFlashMessageError } from '../../modules/session/set_flash_message.js'
import {
  type GitlabAccessToken,
  type GitLabCommit,
  type GitLabIssue2,
  type GitLabProject,
  type GitLabRelease,
  type GitLabTag
} from '../../http_req_res_interfaces/gitlab_webhook_api.js'
import { getUserGitLabAccessToken } from '../../models/user/user_queries.js'
import { createWebHook } from '../../modules/gitlab_api/gitlab_webhook.js'
import { type RenderOption, renderPage } from '../../modules/render_page.js'
import server_config from '../../../server_config.js'
import GitLabWebSocket from '../../modules/gitlab_api/gitlab_websocket.js'
import { findGitLabWebHook } from '../../models/gitlab_webhooks/queries.js'

export const showProjectPage = async (req: Request, res: Response): Promise<void> => {
  const session: SessionServer = req.session
  const formData = req.body

  let id: number
  try {
    id = formData.id
  } catch (e) {
    res.status(400).send('Bad request. ID not valid.')
    return
  }

  const secret = nanoid(40)
  // @ts-expect-error err
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const access_token_obj: GitlabAccessToken = await getUserGitLabAccessToken(session.username ?? '')
  const result: boolean = await createWebHook(id, access_token_obj.access_token ?? '', secret)

  if (!result) {
    const secondAttemptCreaterHook = await createWebHook(id, access_token_obj.access_token ?? '', secret)
    if (!secondAttemptCreaterHook) {
      setFlashMessageError(session, 'Internal server error creating GitLab WebHook')
      res.status(500).redirect(server_config.base_url + '/')
      return
    }
  }

  // TODO Create server socket
  const socket: GitLabWebSocket | undefined = GitLabWebSocket.sockets.get(id)
  if (socket === undefined) {
    // @ts-expect-error err
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const newSocket = new GitLabWebSocket(id, secret).socketServer
  }

  // TODO fetch and render current commits, issues, releases and tags
  // TODO add data to render parameters

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const access_token = await getUserGitLabAccessToken(session.username ?? '')
  if (access_token === null) {
    setFlashMessageError(session, 'Internal server error creating GitLab WebHook')
    res.status(500).redirect(server_config.base_url + '/')
    return
  }
  let commits = await fetch(server_config.gitlab_api_url + `/projects/${id}/repository/commits?access_token=${access_token.access_token}`)
  let tags = await fetch(server_config.gitlab_api_url + `/projects/${id}/repository/tags?access_token=${access_token.access_token}`)
  let releases = await fetch(server_config.gitlab_api_url + `/projects/${id}/releases?access_token=${access_token.access_token}`)
  let issues = await fetch(server_config.gitlab_api_url + `/projects/${id}/issues?access_token=${access_token.access_token}`)

  await Promise.all([commits, tags, releases, issues]).then(responses => { return responses })
    .then(async responses => await Promise.all(responses.map(async r => await r.json())))
    .then(data => {
      commits = data[0].map((commit: object): GitLabCommit => {
        return {
          // @ts-expect-error some error
          id: commit.id,
          // @ts-expect-error some error
          title: commit.title,
          // @ts-expect-error some error
          message: commit.message,
          // @ts-expect-error some error
          url: commit.web_url,
          // @ts-expect-error some error
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          timestamp: trimTimeStampGitLab(commit.created_at)
        }
      })

      // TODO fix url
      console.log(data[1])
      tags = data[1].map((tag: object): GitLabTag => {
        return {
          // @ts-expect-error err
          id: tag.commit.id,
          // @ts-expect-error err
          title: tag.name,
          // @ts-expect-error err
          message: tag.commit.message,
          // @ts-expect-error err
          url: tag.commit.web_url
        }
      })

      // TODO maybe fix link
      releases = data[2].map((release: object): GitLabRelease => {
        return {
          // @ts-expect-error err
          title: release.name,
          // @ts-expect-error err
          message: release.description,
          // @ts-expect-error err
          url: release._links.self,
          // @ts-expect-error err
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          timestamp: trimTimeStampGitLab(release.created_at)
        }
      })

      issues = data[3].map((issue: object): GitLabIssue2 => {
        return {
          // @ts-expect-error err
          id: issue.id,
          // @ts-expect-error err
          title: issue.title,
          // @ts-expect-error err
          message: issue.description,
          // @ts-expect-error err
          url: issue.web_url
        }
      })
    })

  delete session.csrf_token
  const options: RenderOption[] = [
    { name: 'ws_url', data: `${server_config.socket_type}${server_config.domain}${server_config.base_url}/gitlab/project/${formData.id}` },
    { name: 'commits', data: commits },
    { name: 'tags', data: tags },
    { name: 'releases', data: releases },
    { name: 'issues', data: issues }
  ]
  renderPage(req.session, res, 'gitlab_project', 'main', 'Project', options)
}

export const processGitLabWebHookRequest = async (req: Request, res: Response): Promise<void> => {
  // Verify that the request is from LNU GitLab
  const ip = req.get('X-Real-IP')
  if (ip === server_config.gitlab_webhook_allowed_ip) {
    res.status(200).send()
  } else {
    res.status(400).send()
    return
  }

  const data = req.body
  const projectID = Number(req.params.id)
  const secret = req.get('X-Gitlab-Token')

  // Check secret token if matches with web socket
  try {
    const webhookInDB = await findGitLabWebHook(projectID)
    if (webhookInDB?.secret !== secret) return // Secret did not match
  } catch (e) {
    console.log('Error fetching secret in DB: ')
    console.log(e)
    return
  }

  // @ts-expect-error err
  const event: string = req.get('X-Gitlab-Event')?.split(' ')[0].toLowerCase()

  const webSocket = GitLabWebSocket.sockets.get(projectID)
  if (webSocket !== undefined) {
    // Continue passing message to websockets
    console.log('Message processing...')
    const request: WebHookRequest = data
    switch (event) {
      case 'push': {
        const commit: NewCommit = {
          type: 'commit',
          action: 'add',
          // @ts-expect-error err
          author: request.user_username,
          // @ts-expect-error err
          title: request.commits[0].title,
          // @ts-expect-error err
          msg: request.commits[0].message,
          // @ts-expect-error err
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          timestamp: trimTimeStampGitLab(request.commits[0].timestamp),
          // @ts-expect-error err
          url: request.commits[0].url
        }
        webSocket.broadcastToAllClients(JSON.stringify(commit))
        break
      }
      case 'issue': {
        const issue: NewIssue = {
          type: 'issue',
          action: 'add',
          // @ts-expect-error err
          title: request.object_attributes.title,
          // @ts-expect-error err
          description: request.object_attributes.description,
          // @ts-expect-error err
          url: request.object_attributes.url,
          // @ts-expect-error err
          id: request.object_attributes.id
        }
        webSocket.broadcastToAllClients(JSON.stringify(issue))
        break
      }
      case 'tag': {
        let titleTag = 'Empty description'
        let urlTag = request.commits.url
        try {
          const newTitle = request.ref?.split('/')[2]
          if (newTitle !== undefined) {
            if (newTitle.length > 0) {
              titleTag = newTitle
              // @ts-expect-error err
              urlTag = request.project.web_url + '/-/tags/' + titleTag
            }
          }
        } catch (e) {}
        const tag: NewTag = {
          type: 'tag',
          action: 'add',
          title: titleTag,
          // @ts-expect-error err
          message: request.message,
          url: urlTag
        }
        webSocket.broadcastToAllClients(JSON.stringify(tag))
        break
      }
      case 'release': {
        const release: NewRelease = {
          type: 'release',
          action: 'add',
          // @ts-expect-error err
          title: request.name,
          // @ts-expect-error err
          description: request.description,
          // @ts-expect-error err
          timestamp: trimTimeStampGitLab(request.released_at),
          // @ts-expect-error err
          url: request.url
        }
        webSocket.broadcastToAllClients(JSON.stringify(release))
        break
      }
    }
    // TODO process data to websockets
  } else {
    console.log('Could not find WebSocket for project ID: ' + projectID)
  }
}

interface WebHookRequest {
  object_kind: string
  event_name: string
  project: GitLabProject
  commits: GitLabCommit
  changes?: object
  message?: string
  ref?: string
  name?: string
  released_at?: string
  user_username?: string
  object_attributes?: object
  url?: string
  description?: string
}

interface NewCommit {
  type: 'commit'
  action: 'add'
  author: string
  title: string
  msg: string
  timestamp: string
  url: string
}

interface NewIssue {
  type: 'issue'
  action: 'add'
  title: string
  description: string
  url: string
  id: number
}

interface NewRelease {
  type: 'release'
  action: 'add'
  title: string
  description: string
  timestamp: string
  url: string
}

interface NewTag {
  type: 'tag'
  action: 'add'
  title: string
  message: string
  url: string
}

export function trimTimeStampGitLab (timestamp: string): string {
  // Example 2024-03-01T21:23:19.501+01:00

  // [2024-03-01, 21:23:19.501+01:00]
  const split = timestamp.split('T')
  // [21:23:19, 501+01:00]
  const split2 = split[1].split('.')

  return `${split[0]} ${split2[0]}`
}
