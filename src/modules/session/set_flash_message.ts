import type { SessionServer } from './session_server.js'

export const setFlashMessage = (session: SessionServer, msg: string, cssColor: string): void => {
  session.flash_message = msg
  session.flash_shown_times = 0
  session.flash_message_color = cssColor
}

export const setFlashMessageSuccess = (session: SessionServer, msg: string): void => {
  setFlashMessage(session, msg, 'green')
}

export const setFlashMessageError = (session: SessionServer, msg: string): void => {
  setFlashMessage(session, msg, 'red')
}

export const setFlashMessageEvent = (session: SessionServer, msg: string): void => {
  setFlashMessage(session, msg, '#306b8e')
}
