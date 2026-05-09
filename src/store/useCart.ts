import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartItem {
  id?: string
  productId: string
  name: string
  price: number
  discountPrice?: number
  quantity: number
  image?: string
  barcode?: string
  category?: string
  isFree?: boolean
  voucherCode?: string
}

interface CartState {
  cart: CartItem[]
  isLoading: boolean
  isInitialized: boolean
  setCart: (cart: CartItem[]) => void
  addToCart: (item: CartItem, token?: string | null) => Promise<void>
  updateCartQuantity: (productId: string, quantity: number, token?: string | null) => Promise<void>
  removeFromCart: (productId: string, token?: string | null) => Promise<void>
  clearCart: (token?: string | null) => Promise<void>
  loadCartFromDatabase: (token: string) => Promise<void>
  syncCartToDatabase: (token: string) => Promise<void>
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      isLoading: false,
      isInitialized: false,

      setCart: (cart) => set({ cart, isInitialized: true }),

      addToCart: async (item, token) => {
        const cart = get().cart
        const existingItem = cart.find((i) => i.productId === item.productId)

        let updatedCart: CartItem[]

        if (existingItem) {
          updatedCart = cart.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          )
        } else {
          updatedCart = [...cart, item]
        }

        set({ cart: updatedCart })

        // Sync to database if user is logged in
        if (token) {
          try {
            await fetch('/api/cart', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                productId: item.productId,
                quantity: item.quantity,
              }),
            })
          } catch (error) {
            console.error('Failed to sync cart to database:', error)
          }
        }
      },

      updateCartQuantity: async (productId, quantity, token) => {
        const cart = get().cart

        let updatedCart: CartItem[]
        if (quantity <= 0) {
          updatedCart = cart.filter((i) => i.productId !== productId)
        } else {
          updatedCart = cart.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          )
        }

        set({ cart: updatedCart })

        // Sync to database if user is logged in
        if (token) {
          try {
            await fetch('/api/cart', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ productId, quantity }),
            })
          } catch (error) {
            console.error('Failed to update cart in database:', error)
          }
        }
      },

      removeFromCart: async (productId, token) => {
        const cart = get().cart
        set({ cart: cart.filter((i) => i.productId !== productId) })

        // Sync to database if user is logged in
        if (token) {
          try {
            await fetch(`/api/cart?productId=${productId}`, {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
          } catch (error) {
            console.error('Failed to remove cart item from database:', error)
          }
        }
      },

      clearCart: async (token) => {
        set({ cart: [] })

        // Sync to database if user is logged in
        if (token) {
          try {
            await fetch('/api/cart', {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
          } catch (error) {
            console.error('Failed to clear cart from database:', error)
          }
        }
      },

      loadCartFromDatabase: async (token) => {
        set({ isLoading: true })

        try {
          const response = await fetch('/api/cart', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (response.ok) {
            const data = await response.json()
            if (data.success && data.cartItems) {
              set({ cart: data.cartItems, isInitialized: true })
            }
          }
        } catch (error) {
          console.error('Failed to load cart from database:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      syncCartToDatabase: async (token) => {
        const cart = get().cart

        try {
          // Clear database cart first
          await fetch('/api/cart', {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          // Add all cart items to database
          for (const item of cart) {
            await fetch('/api/cart', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                productId: item.productId,
                quantity: item.quantity,
              }),
            })
          }
        } catch (error) {
          console.error('Failed to sync cart to database:', error)
        }
      },
    }),
    {
      name: 'ayam-geprek-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
