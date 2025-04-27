import express, { type Router, type Request, type Response } from 'express'
import config from '../../server_config.ts'
import { allowIfUserLoggedIn } from '../middleware/is_user_logged_in.js'
import { type RenderOption, renderPage } from '../modules/render_page.js'
import { getUserGitLabAccessToken, updateGitlabAccessTokenToUser } from '../models/user/user_queries.js'
import { type SessionServer } from '../modules/session/session_server.js'
import { type GitlabApiProject } from '../http_req_res_interfaces/gitlab_api.js'
import { isUserAuthenticatedGitLab } from '../middleware/is_user_authenticated_gitlab.js'
import { type GitlabAccessToken } from '../http_req_res_interfaces/gitlab_webhook_api.js'
import { nanoid } from 'nanoid'
import { setFlashMessageEvent } from '../modules/session/set_flash_message.js'

const router: Router = express.Router()
export default router

/* eslint-disable-next-line @typescript-eslint/no-misused-promises */
router.get('/', allowIfUserLoggedIn(), async (req: Request, res: Response): Promise<void> => {
  const session: SessionServer = req.session

  const isGitlabAuthenticated = await isUserAuthenticatedGitLab(session)
  const options: RenderOption[] = []

  if (isGitlabAuthenticated) {
    /* eslint-disable @typescript-eslint/naming-convention */
    /* @ts-expect-error might throw errors */
    const access_token_obj: GitlabAccessToken = await getUserGitLabAccessToken(session.username ?? '')
    const access_token = access_token_obj.access_token
    const params = `access_token=${access_token}&min_access_level=${40}`

    const user_id_res = await fetch(config.gitlab_api_url + `/user?access_token=${access_token}`)
    const user_id = await user_id_res.json()

    const projectsRes = await fetch(config.gitlab_api_url + `/users/${user_id.id}/projects?${params}`)
    let projects: GitlabApiProject[] = await projectsRes.json()

    // @ts-expect-error err
    if (projects.message !== undefined) {
      options.push({ name: 'gitlabAuthorized', data: false })
      // @ts-expect-error err
      await updateGitlabAccessTokenToUser(session.username, undefined)
      setFlashMessageEvent(session, 'Access to GitLab was revoked.')
      renderPage(req.session, res, 'index', 'main', 'LNU GitLab Manager', options)
      return
    }

    // TODO ADD CSRF TOKEN TO OPTIONS
    // TODO Provide Project lists personal or maintainer which can create webhooks
    // TODO project overview page which will use websocket conenction
    session.csrf_token = nanoid(40)
    projects = projects.map(project => {
      // @ts-expect-error specific for handlebars
      project.csrf = session.csrf_token
      // @ts-expect-error err
      project.url_action = `/gitlab/project/${project.id}`
      return project
    })
    options.push({ name: 'maintainer_projects', data: projects })
    options.push({ name: 'project_count', data: projects.length })
  }
  options.push({ name: 'gitlabAuthorized', data: isGitlabAuthenticated })

  renderPage(req.session, res, 'index', 'main', 'LNU GitLab Manager', options)
})
