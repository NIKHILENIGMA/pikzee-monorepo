export interface NotificationChannelProvider {
  send(payload: NotificationPayload): Promise<void>
}

export type NotificationEvent = {
  WORKSPACE_INVITATION: 'WORKSPACE_INVITATION'
  WELCOME_EMAIL: 'WELCOME_EMAIL'
}

export enum NotificationEventEnum {
  WORKSPACE_INVITATION = 'WORKSPACE_INVITATION',
  WELCOME_EMAIL = 'WELCOME_EMAIL',
}

export type NotificationChannel = 'EMAIL' | 'SMS' | 'IN_APP' | 'PUSH_NOTIFICATION'

export enum NotificationChannelEnum {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  IN_APP = 'IN_APP',
  PUSH_NOTIFICATION = 'PUSH_NOTIFICATION',
}

export interface NotificationPayload {
  recipient: string
  event: NotificationEvent[keyof NotificationEvent]
  channel: NotificationChannel[]
  meta: NotificationMetaData
}

export interface NotificationMetaData {
  workspaceName?: string
  invitationLink?: string
  welcomeMessage?: string
  token?: string
  inviterName?: string
  userName?: string
}
