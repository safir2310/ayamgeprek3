'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/store/useStore'
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Printer,
  CreditCard,
  DollarSign,
  Store,
  X,
  Barcode,
  Scan,
  Tag,
  Package,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'

interface POSCartItem {
  productId: string
  name: string
  price: number
  quantity: number
  barcode?: string
}

const POS_CATEGORIES = [
  { id: 'all', name: 'Semua', icon: '🛒' },
  { id: 'makanan', name: 'Makanan', icon: '🍽️' },
  { id: 'minuman', name: 'Minuman', icon: '🥤' },
  { id: 'snack', name: 'Snack', icon: '🍿' },
  { id: 'bumbu', name: 'Bumbu', icon: '🌶️' },
  { id: 'kebutuhan-rumah', name: 'Kebutuhan Rumah', icon: '🏠' },
]

const POS_PRODUCTS = [
  {
    id: '1',
    name: 'Ayam Geprek Original',
    price: 15000,
    category: 'makanan',
    barcode: 'AG001',
    stock: 50,
    image: '🍗',
  },
  {
    id: '2',
    name: 'Ayam Geprek Keju',
    price: 15000,
    category: 'makanan',
    barcode: 'AG002',
    stock: 30,
    image: '🧀',
  },
  {
    id: '3',
    name: 'Nasi Pecel Ayam',
    price: 20000,
    category: 'makanan',
    barcode: 'NP001',
    stock: 40,
    image: '🍛',
  },
  {
    id: '4',
    name: 'Es Teh Manis',
    price: 5000,
    category: 'minuman',
    barcode: 'ET001',
    stock: 100,
    image: '🧊',
  },
  {
    id: '5',
    name: 'Es Jeruk Peras',
    price: 8000,
    category: 'minuman',
    barcode: 'EJ001',
    stock: 80,
    image: '🍊',
  },
  {
    id: '6',
    name: 'Kopi Susu Gula Aren',
    price: 12000,
    category: 'minuman',
    barcode: 'KS001',
    stock: 60,
    image: '☕',
  },
  {
    id: '7',
    name: 'Keripik Singkong',
    price: 10000,
    category: 'snack',
    barcode: 'KS002',
    stock: 50,
    image: '🍠',
  },
  {
    id: '8',
    name: 'Kerupuk Udang',
    price: 10000,
    category: 'snack',
    barcode: 'KU001',
    stock: 40,
    image: '🦐',
  },
  {
    id: '9',
    name: 'Sambal Ijo Botol',
    price: 25000,
    category: 'bumbu',
    barcode: 'SI001',
    stock: 30,
    image: '🌶️',
  },
  {
    id: '10',
    name: 'Sambal Merah',
    price: 20000,
    category: 'bumbu',
    barcode: 'SM001',
    stock: 35,
    image: '🔴',
  },
  {
    id: '11',
    name: 'Minyak Goreng 2L',
    price: 30000,
    category: 'kebutuhan-rumah',
    barcode: 'MG001',
    stock: 25,
    image: '🫗',
  },
]

export function POS({ onBack }: { onBack?: () => void }) {
  const { user } = useStore()
  const [cart, setCart] = useState<POSCartItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<any>(null)
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
  })
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [receivedAmount, setReceivedAmount] = useState('')
  const [notes, setNotes] = useState('')

  const filteredProducts = POS_PRODUCTS.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const addToCart = (product: any) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.productId === product.id)
      if (existingItem) {
        return prevCart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [
        ...prevCart,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          barcode: product.barcode,
        },
      ]
    })
    toast.success(`${product.name} ditambahkan`)
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.productId === productId ? { ...item, quantity: newQuantity } : item
        )
      )
    }
  }

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.productId !== productId))
  }

  const clearCart = () => {
    setCart([])
    setSearchQuery('')
    setSelectedCategory('all')
    setCustomerInfo({ name: '', phone: '', address: '' })
    setPaymentMethod('Cash')
    setReceivedAmount('')
    setNotes('')
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Keranjang kosong')
      return
    }

    const order = {
      orderNumber: `POS${Date.now()}`,
      items: [...cart],
      total: cartTotal,
      customer: customerInfo,
      paymentMethod,
      received: paymentMethod === 'Cash' ? parseInt(receivedAmount) || 0 : cartTotal,
      change: paymentMethod === 'Cash' ? (parseInt(receivedAmount) || 0) - cartTotal : 0,
      notes,
      timestamp: new Date().toLocaleString('id-ID'),
    }

    if (paymentMethod === 'Cash' && order.received < order.total) {
      toast.error('Uang yang diterima kurang')
      return
    }

    setCurrentOrder(order)
    setIsCheckoutOpen(false)
    setIsReceiptOpen(true)
    toast.success('Order berhasil dibuat!')
  }

  const handlePrintReceipt = () => {
    toast.success('Struk dicetak!')
    setTimeout(() => {
      setIsReceiptOpen(false)
      clearCart()
    }, 500)
  }

  const handleNewOrder = () => {
    setIsReceiptOpen(false)
    clearCart()
    toast.success('Order baru siap diproses')
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Store className="h-16 w-16 mx-auto mb-4 text-red-600" />
            <h2 className="text-xl font-bold mb-2">Akses Ditolak</h2>
            <p className="text-gray-600">Hanya admin yang dapat mengakses POS</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={onBack}
              >
                <X className="h-6 w-6" />
              </Button>
            )}
            <Store className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Point of Sale</h1>
              <p className="text-sm text-white/80">Ayam Geprek Sambal Ijo</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-white text-red-600 font-bold text-lg px-4 py-2">
              {cartCount} Item
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Products */}
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          {/* Search & Barcode */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari produk atau scan barcode..."
                className="pl-10 h-12 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Button className="h-12 bg-gradient-to-r from-red-500 to-orange-500" onClick={() => setSearchQuery('')}>
              <Scan className="h-5 w-5 mr-2" />
              Scan Barcode
            </Button>
          </div>

          {/* Categories */}
          <div className="flex gap-3 mb-4 overflow-x-auto pb-2">
            {POS_CATEGORIES.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 shadow hover:shadow-md'
                }`}
              >
                <span className="text-xl">{category.icon}</span>
                <span className="font-medium">{category.name}</span>
              </motion.button>
            ))}
          </div>

          {/* Products Grid */}
          <ScrollArea className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => addToCart(product)}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden"
                >
                  <div className="aspect-square bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center text-6xl">
                    {product.image}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        <Barcode className="h-3 w-3 mr-1" />
                        {product.barcode}
                      </Badge>
                    </div>
                    <p className="font-bold text-red-600 text-lg">
                      Rp {product.price.toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Right: Cart */}
        <div className="w-96 bg-white shadow-lg flex flex-col border-l">
          <div className="p-4 border-b bg-gradient-to-r from-red-600 to-orange-500">
            <div className="flex items-center gap-2 text-white">
              <ShoppingCart className="h-6 w-6" />
              <h2 className="text-xl font-bold">Keranjang</h2>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            {cart.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Keranjang Kosong</p>
                <p className="text-sm">Tambahkan produk untuk memulai</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <motion.div
                    key={item.productId}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gray-50 rounded-lg p-3"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-sm flex-1">{item.name}</h4>
                      <p className="font-bold text-red-600">
                        Rp {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="font-semibold w-8 text-center">{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeFromCart(item.productId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Cart Summary */}
          <div className="p-4 border-t bg-gray-50 space-y-3">
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">Rp {cartTotal.toLocaleString()}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total</span>
              <span className="text-red-600">Rp {cartTotal.toLocaleString()}</span>
            </div>
            <Button
              className="w-full h-12 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-lg font-bold"
              onClick={() => setIsCheckoutOpen(true)}
              disabled={cart.length === 0}
            >
              <CreditCard className="h-5 w-5 mr-2" />
              Bayar Sekarang
            </Button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Pembayaran</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              {/* Order Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Ringkasan Pesanan</h4>
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span>{item.name} x{item.quantity}</span>
                      <span>Rp {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between font-bold text-lg text-red-600">
                  <span>Total</span>
                  <span>Rp {cartTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-3">
                <div>
                  <Label className="mb-1 block">Nama Pelanggan</Label>
                  <Input
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    placeholder="Nama (opsional)"
                  />
                </div>
                <div>
                  <Label className="mb-1 block">No. HP</Label>
                  <Input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    placeholder="081234567890 (opsional)"
                  />
                </div>
                <div>
                  <Label className="mb-1 block">Alamat</Label>
                  <Textarea
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                    placeholder="Alamat (opsional)"
                    rows={2}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label className="mb-1 block">Catatan</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan pesanan (opsional)"
                  rows={2}
                />
              </div>

              {/* Payment Method */}
              <div>
                <Label className="mb-2 block">Metode Pembayaran</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="Cash" id="cash" />
                    <Label htmlFor="cash" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Tunai (Cash)</span>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="QRIS" id="qris-pos" />
                    <Label htmlFor="qris-pos" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Tag className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">QRIS</span>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="Transfer" id="transfer" />
                    <Label htmlFor="transfer" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-purple-600" />
                        <span className="font-medium">Transfer Bank</span>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {paymentMethod === 'Cash' && (
                <div>
                  <Label className="mb-1 block">Uang Diterima</Label>
                  <Input
                    type="number"
                    value={receivedAmount}
                    onChange={(e) => setReceivedAmount(e.target.value)}
                    placeholder={`Minimal Rp ${cartTotal.toLocaleString()}`}
                  />
                  {receivedAmount && parseInt(receivedAmount) >= cartTotal && (
                    <p className="text-green-600 mt-2 font-semibold">
                      Kembalian: Rp {(parseInt(receivedAmount) - cartTotal).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              <Button
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 h-12 text-lg"
                onClick={handleCheckout}
              >
                Proses Pembayaran
              </Button>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Receipt Modal */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Struk Pembelian</DialogTitle>
          </DialogHeader>
          {currentOrder && (
            <div className="font-mono text-sm">
              <div className="text-center border-b pb-4 mb-4">
                <h2 className="text-xl font-bold">Ayam Geprek Sambal Ijo</h2>
                <p className="text-xs">Jl. Medan - Banda Aceh, Simpang Camat</p>
                <p className="text-xs">Gampong Tijue, 24151</p>
                <p className="text-xs">Telp: 085260812758</p>
              </div>

              <div className="mb-4">
                <div className="flex justify-between">
                  <span>No. Order:</span>
                  <span>{currentOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tanggal:</span>
                  <span>{currentOrder.timestamp}</span>
                </div>
                {currentOrder.customer.name && (
                  <div className="flex justify-between">
                    <span>Pelanggan:</span>
                    <span>{currentOrder.customer.name}</span>
                  </div>
                )}
                {currentOrder.customer.phone && (
                  <div className="flex justify-between">
                    <span>Telepon:</span>
                    <span>{currentOrder.customer.phone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Metode Bayar:</span>
                  <span>{currentOrder.paymentMethod}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 mb-4">
                {currentOrder.items.map((item: POSCartItem, index: number) => (
                  <div key={index}>
                    <div className="flex justify-between">
                      <span>{item.name}</span>
                      <span>{item.quantity}x</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span className="text-xs">Rp {item.price.toLocaleString()}</span>
                      <span>Rp {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-1 mb-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>TOTAL</span>
                  <span>Rp {currentOrder.total.toLocaleString()}</span>
                </div>
                {currentOrder.paymentMethod === 'Cash' && currentOrder.received > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span>Tunai Diterima:</span>
                      <span>Rp {currentOrder.received.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-green-600 font-bold">
                      <span>Kembalian:</span>
                      <span>Rp {Math.abs(currentOrder.change).toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>

              {currentOrder.notes && (
                <>
                  <Separator className="my-4" />
                  <div className="text-xs text-gray-600">
                    <span className="font-semibold">Catatan:</span>
                    <p>{currentOrder.notes}</p>
                  </div>
                </>
              )}

              <Separator className="my-4" />

              <div className="text-center text-xs text-gray-600">
                <p>Terima kasih atas kunjungan Anda!</p>
                <p>Barang yang sudah dibeli tidak dapat ditukar</p>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handlePrintReceipt}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Cetak
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-red-500 to-orange-500"
                  onClick={handleNewOrder}
                >
                  Order Baru
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
