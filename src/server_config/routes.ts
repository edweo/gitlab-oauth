import { type Application } from 'express'

import indexRoute from '../routes/index_route.js'
import loginRoute from '../routes/login/login_route.js'
import logoutRoute from '../routes/logout/logout_route.js'
import registerRoute from '../routes/register/register_route.js'
import gitlabAuthRoute from '../routes/gitlab_auth/gitlab_auth_route.js'
import gitlabRoute from '../routes/gitlab/gitlab_route.js'
import notFound404Route from '../routes/404/404_route.js'
import config from '../../server_config.ts'

export default function initRoutes (app: Application): void {
  const baseUrl: string | undefined = config.base_url
  const firstChar = baseUrl?.charAt(0)
  const lastChar = baseUrl?.charAt(baseUrl?.length - 1)
  if (baseUrl === undefined || baseUrl.length < 1 || firstChar !== '/' || (lastChar === '/' && baseUrl.length > 1)) {
    console.log('BASE URL ENV is not valid or empty')
    console.log('example URIs: "/", "/api, "/v2/api"')
    process.exit()
  }

  if (baseUrl?.length === 1 && firstChar === '/') {
    config.base_url = ''
  }

  app.use(uri('/'), indexRoute)
  app.use(uri('/login'), loginRoute)
  app.use(uri('/register'), registerRoute)
  app.use(uri('/logout'), logoutRoute)
  app.use(uri('/auth/gitlab'), gitlabAuthRoute)
  app.use(uri('/gitlab'), gitlabRoute)
  app.use('*', notFound404Route)
}

export function uri (u: string): string {
  return config.base_url + u
}
