'use client'
import { type CreateWorkspaceDto } from '@pikzee/shared-types'

import { useApiClient } from '../../../lib/api-client'

const client = useApiClient()

export const createWorkspace = async (data: CreateWorkspaceDto): Promise<unknown> => {
  try {
    const response = await client.post('/workspace/', data)
    return response
  } catch (error) {
    console.error('[Workspace Service] Failed to create workspace:', error)
    throw error
  }
}
