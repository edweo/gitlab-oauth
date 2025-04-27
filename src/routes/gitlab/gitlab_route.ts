import express, { type Router } from 'express'
import * as controller from '../../controllers/gitlab/gitlab_project.js'
import { allowIfUserLoggedIn } from '../../middleware/is_user_logged_in.js'
import {
  allowIfUserAuthenticatedWithGitLab
} from '../../middleware/is_user_authenticated_gitlab.js'
import { processGitLabWebHookRequest } from '../../controllers/gitlab/gitlab_project.js'

const router: Router = express.Router()
export default router

/* eslint-disable @typescript-eslint/no-misused-promises */
router.post('/project/:id', allowIfUserLoggedIn(),
  allowIfUserAuthenticatedWithGitLab,
  controller.showProjectPage)

router.post('/webhook/:id', processGitLabWebHookRequest)
