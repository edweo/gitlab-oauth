import { type Request, type Response } from 'express'
import { createNewUser } from '../../models/user/user_queries.js'
import type ActionResult from '../../modules/server_action/action_result.js'
import { asyncCall } from '../../modules/async_callbacks.js'
import { type SessionServer } from '../../modules/session/session_server.js'
import { renderPage } from '../../modules/render_page.js'
import { handleActionControllerFlashMessage } from '../../modules/server_action/handle_action_controller_flash_message.js'
import config from '../../../server_config.js'

export const getRegisterPage = async (req: Request, res: Response): Promise<void> => {
  renderPage(req.session, res, 'register', 'hero', 'Register')
}

export const handleRegister = async (req: Request, res: Response): Promise<void> => {
  const formData = req.body
  const username: string = formData.username
  const password: string = formData.password

  asyncCall(req, res, async () => {
    const userCreated: ActionResult<boolean> = await createNewUser(username, password)
    await handleActionControllerFlashMessage(userCreated, req, res, async () => {
      const session: SessionServer = req.session
      session.username = username
      res.redirect(config.base_url + '/')
    })
  }, () => {})
}
