export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'member'
  createdAt: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    message: string
    code?: string
  }
}
