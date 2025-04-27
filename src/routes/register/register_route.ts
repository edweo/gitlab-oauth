import express, { type Router } from 'express'
import * as controller from '../../controllers/register/register_controller.js'
import { allowIfUserNotLoggedIn } from '../../middleware/is_user_logged_in.js'

const router: Router = express.Router()
export default router
/* eslint-disable @typescript-eslint/no-misused-promises */
router.get('/', allowIfUserNotLoggedIn, controller.getRegisterPage)
router.post('/', allowIfUserNotLoggedIn, controller.handleRegister)
