import config from '../../../server_config.js'
import {
  createGitLabWebHook, deleteGitLabWebHook,
  doesGitLabWebHookExistForProject,
  findGitLabWebHook
} from '../../models/gitlab_webhooks/queries.js'
import { type IGitLabWebHook } from '../../models/gitlab_webhooks/model.js'

const events: string[] = [
  'push_events',
  'releases_events',
  'tag_push_events',
  'note_events',
  'issues_events'
]

export const createWebHook = async (projectID: number, accessToken: string, secret: string): Promise<boolean> => {
  let done = false
  // Check that no web hook created in the project already
  const webhookExistsInDB: boolean = await doesGitLabWebHookExistForProject(projectID)

  // Make sure webhook is same as stored in database
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const hooks_in_project = await fetch(config.gitlab_api_url + `/projects/${projectID}/hooks?access_token=${accessToken}`)
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const hooks_data: [] = await hooks_in_project.json()

  // @ts-expect-error err
  if (webhookExistsInDB && hooks_data.length === 1) {
    return true
  }

  let params = `access_token=${accessToken}&url=${config.gitlab_webhook_url}/${projectID}&token=${secret}`
  if (hooks_data.length === 0 && !webhookExistsInDB) {
    events.forEach(event => {
      params += `&${event}=true`
    })
    const createHookResponse = await fetch(config.gitlab_api_url + `/projects/${projectID}/hooks?${params}`, { method: 'post' })
    const data = await createHookResponse.json()

    const newHook: IGitLabWebHook = {
      hook_id: data.id,
      project_id: data.project_id,
      url: data.url,
      created_at: data.created_at,
      secret
    }
    try {
      done = await createGitLabWebHook(newHook)
    } catch (e) {
      // Delete webhook from gitlab
      await deleteGitLabWebHook(projectID)
    }
    done = true
  } else if (hooks_data.length > 0 && !webhookExistsInDB) {
    try {
      for (const hook of hooks_data) {
        // @ts-expect-error err
        const url = config.gitlab_api_url + `/projects/${hook.project_id}/hooks/${hook.id}?access_token=${accessToken}`
        const deleteResp = await fetch(url, { method: 'delete' })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const data = await deleteResp.json()
      }
    } catch (e) {}
  } else { // check if same IDs in db and gitlab hook
    const hookDB: IGitLabWebHook | null = await findGitLabWebHook(projectID)
    if (hookDB !== null && hooks_data.length > 0) {
      hooks_data.forEach(hook => {
        // @ts-expect-error err
        if (hook.id === hookDB.hook_id && hook.url === hookDB.url && hook.created_at === hookDB.created_at && hook.project_id === hookDB.project_id) {
          return true
        }
      })
    } else {
      await deleteGitLabWebHook(projectID)
    }
  }
  return done
}
