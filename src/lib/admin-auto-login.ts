import { useStore } from '@/store/useStore'

/**
 * Auto-login as admin without PIN
 * This function logs in user as admin using hardcoded admin PIN
 */
export async function autoLoginAsAdmin(): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/auth/admin-pin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pin: '1234', // Default admin PIN
      }),
    })

    if (res.ok) {
      const data = await res.json()

      // Update Zustand store
      const { setUser, setToken } = useStore.getState()
      setUser(data.user)
      setToken(data.token)

      return { success: true }
    } else {
      const errorData = await res.json()
      return { success: false, error: errorData.error || 'Login gagal' }
    }
  } catch (error) {
    console.error('Auto-login error:', error)
    return { success: false, error: 'Terjadi kesalahan saat login' }
  }
}
