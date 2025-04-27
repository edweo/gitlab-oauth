import { type Request, type Response } from 'express'
import { nanoid } from 'nanoid'
import { type SessionServer } from '../../modules/session/session_server.js'
import config from '../../../server_config.js'
import { setFlashMessageError, setFlashMessageSuccess } from '../../modules/session/set_flash_message.js'
import { type GitlabAccessToken, type GitlabAuthorizationToken } from '../../http_req_res_interfaces/gitlab_webhook_api.js'
import { updateGitlabAccessTokenToUser } from '../../models/user/user_queries.js'

// eslint-disable-next-line @typescript-eslint/naming-convention
const app_id = process.env.GITLAB_APP_ID
const secret = process.env.GITLAB_APP_SECRET

export const startGitLabAuthProcess = async (req: Request, res: Response): Promise<void> => {
  setImmediate(() => {
    const session: SessionServer = req.session
    const state: string = nanoid(100)
    session.gitlab_auth_state = state
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const gitlab_url = config.gitlab_oauth_url + `/oauth/authorize?client_id=${app_id}&redirect_uri=${config.redirect_uri}&response_type=code&state=${state}&scope=${config.scope}`
    res.redirect(gitlab_url)
  })
}

export const handleGitLabAuthorizationToken = async (req: Request, res: Response): Promise<void> => {
  const session: SessionServer = req.session
  const params: GitlabAuthorizationToken = req.query

  if (session.gitlab_auth_state !== params.state && params.state !== undefined) {
    setFlashMessageError(session, 'Error while authorizing GitLab. Try again.')
    delete session.gitlab_authorization_token
    delete session.gitlab_auth_state
    res.status(400).redirect(config.base_url + '/')
    return
  }

  if (params.error !== undefined) {
    setFlashMessageError(session, params.error_description ?? 'Bad request')
    delete session.gitlab_authorization_token
    delete session.gitlab_auth_state
    res.status(400).redirect(config.base_url + '/')
    return
  }

  const paramsPost: string = `client_id=${app_id}&client_secret=${secret}&code=${params.code}&grant_type=authorization_code&redirect_uri=${config.redirect_uri}`
  await fetchAccessToken(session, res, paramsPost)
}

const fetchAccessToken = async (session: SessionServer, res: Response, params: string): Promise<void> => {
  try {
    const response = await fetch(config.gitlab_oauth_url + `/oauth/token?${params}`, { method: 'POST' })
    const result: GitlabAccessToken = await response.json()

    if (response.ok) {
      const token: GitlabAccessToken = {
        access_token: result.access_token,
        token_type: result.token_type,
        expires_in: result.expires_in,
        refresh_token: result.refresh_token,
        scope: result.scope,
        created_at: result.created_at,
        id_token: result.id_token
      }

      try {
        const added = await updateGitlabAccessTokenToUser(session.username ?? '', token)
        if (added) {
          delete session.gitlab_authorization_token
          delete session.gitlab_auth_state
          setFlashMessageSuccess(session, 'Success authenticating with GitLab')
          res.redirect(config.base_url + '/')
        } else {
          delete session.gitlab_authorization_token
          delete session.gitlab_auth_state
          setFlashMessageError(session, 'Internal server error while authorizing GitLab')
          res.status(500).redirect(config.base_url + '/')
        }
      } catch (e) {
        delete session.gitlab_authorization_token
        delete session.gitlab_auth_state
        setFlashMessageError(session, 'Bad request')
        res.status(400).redirect(config.base_url + '/')
      }
    } else {
      delete session.gitlab_authorization_token
      delete session.gitlab_auth_state
      setFlashMessageError(session, 'Bad request')
      res.status(400).redirect(config.base_url + '/')
    }
  } catch (err) {
    delete session.gitlab_authorization_token
    delete session.gitlab_auth_state
    setFlashMessageError(session, 'Internal server error while authorizing GitLab')
    res.status(500).redirect(config.base_url + '/')
  }
}
