import { useStore } from '@/store/useStore'

/**
 * Auto-login as admin without PIN
 * This function logs in user as admin using hardcoded admin PIN
 */
export async function autoLoginAsAdmin(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[AutoLogin] Starting auto-login...')

    // Call admin-pin endpoint directly without logging out first
    // This ensures we always use the admin credentials
    const res = await fetch('/api/auth/admin-pin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pin: '1234', // Default admin PIN
      }),
    })

    console.log('[AutoLogin] Response status:', res.status)

    if (res.ok) {
      const data = await res.json()
      console.log('[AutoLogin] Login successful, user:', data.user)
      console.log('[AutoLogin] Token:', data.token.substring(0, 50) + '...')

      // Update Zustand store directly with admin credentials
      const { setUser, setToken } = useStore.getState()
      setUser(data.user)
      setToken(data.token)

      console.log('[AutoLogin] Store updated, new user ID:', data.user.id)

      return { success: true }
    } else {
      const errorData = await res.json()
      console.error('[AutoLogin] Login failed:', errorData)
      return { success: false, error: errorData.error || 'Login gagal' }
    }
  } catch (error) {
    console.error('[AutoLogin] Error:', error)
    return { success: false, error: 'Terjadi kesalahan saat login' }
  }
}
