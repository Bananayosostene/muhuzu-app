/** The signed-in account with what it may do (`GET /auth/me` + `GET /authorization/me`). */
export interface User {
  id: string
  email: string
  full_name: string
  roles: string[]
  permissions: string[]
}
