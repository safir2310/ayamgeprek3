import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  productId: string
  name: string
  price: number
  discountPrice?: number
  quantity: number
  image?: string
  barcode?: string
}

export interface User {
  id: string
  email: string
  name?: string
  phone?: string
  address?: string
  role: string
  memberLevel: string
  points: number
  stampCount: number
  starCount: number
}

interface StoreState {
  // Auth
  user: User | null
  token: string | null
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  logout: () => void

  // Cart
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  updateCartQuantity: (productId: string, quantity: number) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void

  // UI State
  currentTab: string
  setCurrentTab: (tab: string) => void
  isAdminMode: boolean
  setIsAdminMode: (isAdmin: boolean) => void
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null, cart: [] }),

      // Cart
      cart: [],
      addToCart: (item) => {
        const cart = get().cart
        const existingItem = cart.find((i) => i.productId === item.productId)

        if (existingItem) {
          set({
            cart: cart.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          })
        } else {
          set({ cart: [...cart, item] })
        }
      },
      updateCartQuantity: (productId, quantity) => {
        const cart = get().cart
        if (quantity <= 0) {
          set({ cart: cart.filter((i) => i.productId !== productId) })
        } else {
          set({
            cart: cart.map((i) =>
              i.productId === productId ? { ...i, quantity } : i
            ),
          })
        }
      },
      removeFromCart: (productId) => {
        set({ cart: get().cart.filter((i) => i.productId !== productId) })
      },
      clearCart: () => set({ cart: [] }),

      // UI State
      currentTab: 'home',
      setCurrentTab: (currentTab) => set({ currentTab }),
      isAdminMode: false,
      setIsAdminMode: (isAdminMode) => set({ isAdminMode }),
    }),
    {
      name: 'ayam-geprek-storage',
    }
  )
)
