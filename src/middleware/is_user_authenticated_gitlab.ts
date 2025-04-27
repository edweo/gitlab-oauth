import type { SessionServer } from '../modules/session/session_server.js'
import type { NextFunction, Request, Response } from 'express'
import config from '../../server_config.js'
import {
  deleteGitLabAccessToken,
  doesUserHaveGitLabAccessToken,
  getUserGitLabAccessToken
} from '../models/user/user_queries.js'
import { setFlashMessageEvent } from '../modules/session/set_flash_message.js'
import { type GitlabAccessToken } from '../http_req_res_interfaces/gitlab_webhook_api.js'

export const isUserAuthenticatedGitLab = async (session: SessionServer): Promise<boolean> => {
  let isLoggedIn: boolean = false
  if (await doesUserHaveGitLabAccessToken(session.username ?? '')) {
    const token = await getUserGitLabAccessToken(session.username ?? '')
    const timeNow = Date.now() / 1000
    // @ts-expect-error err
    if (timeNow - token?.created_at >= token?.expires_in) { // Invalidate token
      await deleteGitLabAccessToken(session.username ?? '')
      setFlashMessageEvent(session, 'Your GitLab access expired. You need to connect again.')
    } else {
      isLoggedIn = true
    }
  }
  return isLoggedIn
}

export const doesUserHaveAccessToProject = async (session: SessionServer, projectID: number): Promise<boolean> => {
  let hasAccess = false

  // @ts-expect-error err
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const access_token: GitlabAccessToken = await getUserGitLabAccessToken(session.username ?? '')
  const releases = await fetch(config.gitlab_api_url + `/projects/${projectID}/releases?access_token=${access_token.access_token}`)
  if (releases.status === 200) {
    hasAccess = true
  }

  return hasAccess
}

export const allowIfUserNotAuthenticatedWithGitLab = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userSession: SessionServer = req.session
  if (await doesUserHaveGitLabAccessToken(userSession.username ?? '')) {
    setFlashMessageEvent(userSession, 'User already authenticated with GitLab')
    res.redirect(config.base_url + '/')
  } else {
    next()
  }
}

export const allowIfUserAuthenticatedWithGitLab = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userSession: SessionServer = req.session
  if (await isUserAuthenticatedGitLab(userSession)) {
    next()
  } else {
    res.redirect(config.base_url + '/')
  }
}
