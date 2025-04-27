import { type Session } from 'express-session'
import { type GitlabAccessToken } from '../../http_req_res_interfaces/gitlab_webhook_api.js'
export interface SessionServer extends Session {
  username?: string
  flash_message?: string
  flash_shown_times?: 0
  flash_message_color?: string

  gitlab_oauth?: GitlabAccessToken
  gitlab_authorization_token?: string
  gitlab_auth_state?: string

  csrf_token?: string
}
