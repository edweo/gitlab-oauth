import { type Response } from 'express'
import { type SessionServer } from './session/session_server.js'

export const renderPage = (session: SessionServer, res: Response, pageView: string, layout: string, title: string, extraOptions?: RenderOption[]): void => {
  const options = { layout, title, session } // Default options

  // Add additional options
  extraOptions?.forEach((option: RenderOption) => {
    // @ts-expect-error might throw error when creating new field in object
    options[option.name] = option.data
  })

  res.render(`pages/${pageView}`, options)
}

export interface RenderOption {
  name: string
  data: unknown
}
