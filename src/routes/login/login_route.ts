import express, { type Router } from 'express'
import * as controller from '../../controllers/login/login_controller.js'
import { allowIfUserNotLoggedIn } from '../../middleware/is_user_logged_in.js'

const router: Router = express.Router()
export default router
/* eslint-disable @typescript-eslint/no-misused-promises */
router.get('/', allowIfUserNotLoggedIn, controller.getLoginPage)
router.post('/', allowIfUserNotLoggedIn, controller.handleLogin)
