'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Minus, Trash2, ShoppingBag, X, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface Product {
  id: string
  name: string
  price: number
  stock: number
  category: string
  image?: string
}

export function POS({ onClose }: { onClose?: () => void }) {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const categories = ['all', 'makanan', 'minuman', 'snack', 'lainnya']

  useEffect(() => {
    // Mock products - will be replaced with API call
    setProducts([
      { id: '1', name: 'Ayam Geprek Sambal Ijo', price: 18000, stock: 50, category: 'makanan', image: '🍗' },
      { id: '2', name: 'Ayam Geprek Sambal Merah', price: 18000, stock: 45, category: 'makanan', image: '🍗' },
      { id: '3', name: 'Es Teh Manis', price: 5000, stock: 100, category: 'minuman', image: '🧃' },
      { id: '4', name: 'Es Jeruk', price: 6000, stock: 80, category: 'minuman', image: '🍊' },
      { id: '5', name: 'Kentang Goreng', price: 12000, stock: 60, category: 'snack', image: '🍟' },
      { id: '6', name: 'Tahu Crispy', price: 8000, stock: 70, category: 'snack', image: '🧈' },
      { id: '7', name: 'Nasi', price: 5000, stock: 200, category: 'makanan', image: '🍚' },
      { id: '8', name: 'Air Mineral', price: 4000, stock: 120, category: 'minuman', image: '💧' },
    ])
  }, [])

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast.error('Stok habis!')
      return
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error('Stok tidak mencukupi!')
          return prev
        }
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image
      }]
    })
  }

  const updateQuantity = (itemId: string, change: number) => {
    setCart(prev => {
      const product = products.find(p => p.id === itemId)
      const item = prev.find(i => i.id === itemId)
      if (!item || !product) return prev

      const newQuantity = item.quantity + change
      if (newQuantity <= 0) {
        return prev.filter(i => i.id !== itemId)
      }
      if (newQuantity > product.stock) {
        toast.error('Stok tidak mencukupi!')
        return prev
      }

      return prev.map(i =>
        i.id === itemId ? { ...i, quantity: newQuantity } : i
      )
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId))
  }

  const clearCart = () => {
    setCart([])
    setCustomerName('')
    setCustomerPhone('')
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const tax = Math.round(subtotal * 0.1)
  const total = subtotal + tax

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Keranjang kosong!')
      return
    }

    if (!customerName.trim()) {
      toast.error('Nama pelanggan wajib diisi!')
      return
    }

    setIsProcessing(true)

    try {
      // Mock checkout - will be replaced with API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      toast.success('✅ Transaksi berhasil!')
      clearCart()
    } catch (error) {
      toast.error('Gagal melakukan transaksi')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-4 md:px-6 py-4 shadow-lg sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg md:text-xl font-bold">Point of Sale</h1>
              <p className="text-xs text-white/80">Ayam Geprek Sambal Ijo</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-white/20 text-white hover:bg-white/30">
              <ShoppingBag className="h-4 w-4 mr-1" />
              {cart.length} Item
            </Badge>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Products Section */}
        <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden">
          {/* Search & Filters */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap overflow-x-auto pb-1">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-red-600 to-orange-500'
                      : ''
                  }
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => addToCart(product)}
                  className="cursor-pointer"
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-3 md:p-4">
                      <div className="aspect-square bg-gradient-to-br from-red-50 to-orange-50 rounded-lg flex items-center justify-center text-4xl md:text-5xl mb-2 md:mb-3">
                        {product.image || '📦'}
                      </div>
                      <h3 className="font-semibold text-xs md:text-sm mb-1 line-clamp-2">{product.name}</h3>
                      <div className="flex items-center justify-between">
                        <p className="text-red-600 font-bold text-xs md:text-sm">Rp {product.price.toLocaleString()}</p>
                        <Badge variant={product.stock > 0 ? 'default' : 'secondary'} className="text-xs">
                          {product.stock > 0 ? `${product.stock} stok` : 'Habis'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Cart Section */}
        <div className="w-full md:w-96 bg-white shadow-xl border-t md:border-l md:border-t-0 flex flex-col h-[60vh] md:h-auto">
          <div className="p-4 border-b">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-red-600" />
              Keranjang
            </h2>
          </div>

          {/* Customer Info */}
          <div className="p-4 space-y-3 border-b">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Nama Pelanggan"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="text-sm"
              />
            </div>
            <Input
              placeholder="No. Telepon (Opsional)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="text-sm"
            />
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            <AnimatePresence mode="popLayout">
              {cart.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-gray-500"
                >
                  <ShoppingBag className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Keranjang kosong</p>
                  <p className="text-sm mt-2">Pilih produk untuk mulai</p>
                </motion.div>
              ) : (
                cart.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex gap-3 p-3 bg-gray-50 rounded-lg mb-3"
                  >
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-red-100 to-orange-100 rounded-lg flex items-center justify-center text-2xl md:text-3xl flex-shrink-0">
                      {item.image || '📦'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs md:text-sm truncate">{item.name}</h4>
                      <p className="text-red-600 font-bold text-xs md:text-sm">Rp {item.price.toLocaleString()}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-semibold w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right flex flex-col justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-600 hover:bg-red-50"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <p className="font-bold text-red-600 text-xs md:text-sm">
                        Rp {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Total & Checkout */}
          {cart.length > 0 && (
            <div className="p-4 border-t space-y-3 bg-gray-50">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">Rp {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">PPN (10%)</span>
                  <span className="font-semibold">Rp {tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-red-600">Rp {total.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 text-sm md:text-base"
                  onClick={clearCart}
                  disabled={isProcessing}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-sm md:text-base"
                  onClick={handleCheckout}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    'Memproses...'
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Bayar
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
