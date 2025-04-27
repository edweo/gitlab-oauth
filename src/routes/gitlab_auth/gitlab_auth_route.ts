import express, { type Router } from 'express'
import * as controller from '../../controllers/gitlab_auth/gitlab_auth_controller.js'
import { allowIfUserLoggedIn } from '../../middleware/is_user_logged_in.js'
import { allowIfUserNotAuthenticatedWithGitLab } from '../../middleware/is_user_authenticated_gitlab.js'

const router: Router = express.Router()
export default router

/* eslint-disable @typescript-eslint/no-misused-promises */
router.get('/', allowIfUserLoggedIn(),
  allowIfUserNotAuthenticatedWithGitLab,
  controller.startGitLabAuthProcess)

router.get('/redirect', allowIfUserLoggedIn(),
  allowIfUserNotAuthenticatedWithGitLab,
  controller.handleGitLabAuthorizationToken)
