import { type HydratedDocument } from 'mongoose'
import { GitLabWebHook, type IGitLabWebHook } from './model.js'

export const getAllGitLabWebHooks = async (): Promise<IGitLabWebHook[]> => {
  let found: IGitLabWebHook[] = []
  const webhooks = await GitLabWebHook.find()
  found = webhooks.map(hook => {
    const result: IGitLabWebHook = {
      hook_id: hook.id,
      project_id: hook.project_id,
      url: hook.url,
      created_at: hook.created_at,
      secret: hook.secret
    }
    return result
  })
  return found
}

export const findGitLabWebHook = async (projectID: number): Promise<IGitLabWebHook | null> => {
  let found: IGitLabWebHook | null = null
  try {
    const webhook: HydratedDocument<IGitLabWebHook> | null = await GitLabWebHook.findOne({ project_id: projectID })
    if (webhook !== null) {
      found = webhook
    }
  } catch (e) { }
  return found
}

export const doesGitLabWebHookExistForProject = async (projectID: number): Promise<boolean> => {
  let exists = false
  try {
    const webhook: HydratedDocument<IGitLabWebHook> | null = await GitLabWebHook.findOne({ project_id: projectID })
    if (webhook !== null) exists = true
  } catch (e) { }
  return exists
}

export const createGitLabWebHook = async (data: IGitLabWebHook): Promise<boolean> => {
  let done = false
  try {
    const hook = new GitLabWebHook(data)
    await hook.save()
    done = true
  } catch (e) {}
  return done
}

export const deleteGitLabWebHook = async (projectID: number): Promise<boolean> => {
  let found: boolean = false
  try {
    const webhook: HydratedDocument<IGitLabWebHook> | null = await GitLabWebHook.findOne({ project_id: projectID })
    if (webhook !== null) {
      await webhook.deleteOne()
      found = true
    }
  } catch (e) { }
  return found
}
