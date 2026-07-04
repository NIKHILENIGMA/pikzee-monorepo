'use client'

import { useSignout } from '../hooks/use-signout'

export function LogoutButton() {
  const { handleSignout } = useSignout()

  return (
    <button
      onClick={handleSignout}
      type="button"
      className="w-full rounded-md bg-red-600 py-2 px-4 text-sm font-semibold text-white hover:bg-red-500 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Logout
    </button>
  )
}
