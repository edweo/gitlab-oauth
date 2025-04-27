// eslint-disable-next-line @typescript-eslint/naming-convention
const base_url = '/'
const domain = 'localhost:5555'
// eslint-disable-next-line @typescript-eslint/naming-convention
const full_url = 'http://' + domain + base_url

export default {
  base_url,
  domain,
  full_url,
  redirect_uri: `${full_url}/auth/gitlab/redirect`,
  gitlab_oauth_url: '',
  gitlab_webhook_allowed_ip: '',
  gitlab_api_url: '',
  gitlab_webhook_url: '' + base_url + '/gitlab' + '/webhook',
  scope: 'api',
  socket_type: 'ws://'
}
