import { type Request, type Response } from 'express'
import type ActionResult from '../../modules/server_action/action_result.js'
import { authenticateUser } from '../../models/user/user_queries.js'
import { asyncCall } from '../../modules/async_callbacks.js'
import { type SessionServer } from '../../modules/session/session_server.js'
import { renderPage } from '../../modules/render_page.js'
import { handleActionControllerFlashMessage } from '../../modules/server_action/handle_action_controller_flash_message.js'
import config from '../../../server_config.js'

export const getLoginPage = async (req: Request, res: Response): Promise<void> => {
  renderPage(req.session, res, 'login', 'hero', 'Login')
}

export const handleLogin = async (req: Request, res: Response): Promise<void> => {
  const formData = req.body
  const username: string = formData.username
  const password: string = formData.password

  asyncCall(req, res, async (): Promise<void> => {
    const userAuthenticated: ActionResult<boolean> = await authenticateUser(username, password)
    await handleActionControllerFlashMessage(userAuthenticated, req, res, async () => {
      const session: SessionServer = req.session
      session.username = username
      res.redirect(config.base_url + '/')
    })
  }, () => {})
}
