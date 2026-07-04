import { useClerk } from '@clerk/nextjs'

export const useSignout = () => {
  const { signOut } = useClerk()

  const handleSignout = async () => {
    try {
      await signOut({
        redirectUrl: '/',
      })
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }
  return { handleSignout }
}
