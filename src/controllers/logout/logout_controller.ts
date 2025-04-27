import { type Request, type Response } from 'express'
import { type SessionServer } from '../../modules/session/session_server.js'
import { setFlashMessageSuccess } from '../../modules/session/set_flash_message.js'
import config from '../../../server_config.js'

export const handleLogout = async (req: Request, res: Response): Promise<void> => {
  const session: SessionServer = req.session

  session.destroy((err: Error) => {
    if (err !== undefined) {
      setFlashMessageSuccess(session, 'Logged out')
      res.redirect(config.base_url + '/login')
    } else {
      res.status(400).send('bad request')
    }
  })
}
