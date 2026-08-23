export const InvitationStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REVOKED: 'REVOKED',
  EXPIRED: 'EXPIRED',
} as const

// This extracts the union type ('PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED')
export type InvitationStatusType = (typeof InvitationStatus)[keyof typeof InvitationStatus]
