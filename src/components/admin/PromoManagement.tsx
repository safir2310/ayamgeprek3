'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Edit, Trash2, Gift, X, Save, Calendar, Percent, Sparkles, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'

interface PromoProduct {
  id: string
  productId: string
  productName: string
  productImage: string
  originalPrice: number
  promoPrice: number
  discountPercent: number
  startDate: Date
  endDate: Date
  isActive: boolean
  createdAt: Date
}

export function PromoManagement() {
  const [promoProducts, setPromoProducts] = useState<PromoProduct[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPromo, setEditingPromo] = useState<PromoProduct | null>(null)
  const [formData, setFormData] = useState({
    productName: '',
    originalPrice: '',
    promoPrice: '',
    startDate: '',
    endDate: '',
    isActive: true
  })

  // Mock products that can be put on promo
  const availableProducts = [
    { id: '1', name: 'Ayam Geprek Original', price: 15000, image: '🍗' },
    { id: '2', name: 'Ayam Geprek Keju', price: 18000, image: '🧀' },
    { id: '3', name: 'Ayam Geprek Spesial', price: 20000, image: '🌶️' },
    { id: '4', name: 'Es Teh Manis', price: 5000, image: '🧃' },
    { id: '5', name: 'Es Jeruk Peras', price: 8000, image: '🍊' },
    { id: '6', name: 'Nasi Pecel', price: 15000, image: '🥗' },
    { id: '7', name: 'Keripik Singkong', price: 10000, image: '🥔' },
    { id: '8', name: 'Sambal Ijo', price: 5000, image: '🌶️' },
  ]

  useEffect(() => {
    loadPromoProducts()
  }, [])

  const loadPromoProducts = () => {
    // Mock promo products - will be replaced with API call
    setPromoProducts([
      {
        id: '1',
        productId: '1',
        productName: 'Ayam Geprek Original',
        productImage: '🍗',
        originalPrice: 15000,
        promoPrice: 12000,
        discountPercent: 20,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        isActive: true,
        createdAt: new Date('2024-01-01')
      },
      {
        id: '2',
        productId: '2',
        productName: 'Ayam Geprek Keju',
        productImage: '🧀',
        originalPrice: 18000,
        promoPrice: 15000,
        discountPercent: 17,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        isActive: true,
        createdAt: new Date('2024-01-15')
      },
      {
        id: '3',
        productId: '4',
        productName: 'Es Teh Manis',
        productImage: '🧃',
        originalPrice: 5000,
        promoPrice: 4000,
        discountPercent: 20,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31'),
        isActive: true,
        createdAt: new Date('2024-02-01')
      },
      {
        id: '4',
        productId: '6',
        productName: 'Nasi Pecel',
        productImage: '🥗',
        originalPrice: 15000,
        promoPrice: 10000,
        discountPercent: 33,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-02-28'),
        isActive: false,
        createdAt: new Date('2024-01-20')
      },
    ])
  }

  const filteredPromoProducts = promoProducts.filter(promo => {
    const matchesSearch = promo.productName.toLowerCase().includes(searchQuery.toLowerCase())
    
    const now = new Date()
    const isExpired = promo.endDate < now
    const isActivePeriod = !isExpired && promo.startDate <= now

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && promo.isActive && isActivePeriod) ||
      (statusFilter === 'expired' && (!promo.isActive || isExpired))
    
    return matchesSearch && matchesStatus
  })

  const handleAdd = () => {
    setEditingPromo(null)
    const today = new Date()
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())
    
    setFormData({
      productName: '',
      originalPrice: '',
      promoPrice: '',
      startDate: today.toISOString().split('T')[0],
      endDate: nextMonth.toISOString().split('T')[0],
      isActive: true
    })
    setIsModalOpen(true)
  }

  const handleEdit = (promo: PromoProduct) => {
    setEditingPromo(promo)
    setFormData({
      productName: promo.productName,
      originalPrice: promo.originalPrice.toString(),
      promoPrice: promo.promoPrice.toString(),
      startDate: promo.startDate.toISOString().split('T')[0],
      endDate: promo.endDate.toISOString().split('T')[0],
      isActive: promo.isActive
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus promo ini?')) return

    try {
      // Mock delete - will be replaced with API call
      setPromoProducts(prev => prev.filter(p => p.id !== id))
      toast.success('✅ Promo berhasil dihapus!')
    } catch (error) {
      toast.error('Gagal menghapus promo')
    }
  }

  const calculateDiscountPercent = (original: number, promo: number) => {
    return Math.round(((original - promo) / original) * 100)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.productName || !formData.originalPrice || !formData.promoPrice) {
      toast.error('Mohon lengkapi semua data yang diperlukan!')
      return
    }

    const originalPrice = parseInt(formData.originalPrice)
    const promoPrice = parseInt(formData.promoPrice)

    if (promoPrice >= originalPrice) {
      toast.error('Harga promo harus lebih rendah dari harga asli!')
      return
    }

    try {
      const product = availableProducts.find(p => p.name === formData.productName)
      const discountPercent = calculateDiscountPercent(originalPrice, promoPrice)

      const promoData = {
        productId: product?.id || '',
        productName: formData.productName,
        productImage: product?.image || '📦',
        originalPrice,
        promoPrice,
        discountPercent,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        isActive: formData.isActive
      }

      if (editingPromo) {
        // Update existing promo
        setPromoProducts(prev =>
          prev.map(p =>
            p.id === editingPromo.id
              ? { ...p, ...promoData }
              : p
          )
        )
        toast.success('✅ Promo berhasil diperbarui!')
      } else {
        // Add new promo
        const newPromo: PromoProduct = {
          id: Date.now().toString(),
          ...promoData,
          createdAt: new Date()
        }
        setPromoProducts(prev => [...prev, newPromo])
        toast.success('✅ Promo berhasil ditambahkan!')
      }

      setIsModalOpen(false)
    } catch (error) {
      toast.error('Gagal menyimpan promo')
    }
  }

  const getStatusBadge = (promo: PromoProduct) => {
    const now = new Date()
    const isExpired = promo.endDate < now

    if (!promo.isActive || isExpired) {
      return <Badge className="bg-red-100 text-red-700">Kadaluarsa</Badge>
    } else {
      return <Badge className="bg-green-100 text-green-700">Aktif</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Kelola Promo</h2>
          <p className="text-gray-600">Atur produk yang sedang promo</p>
        </div>
        <Button
          onClick={handleAdd}
          className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Promo
        </Button>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Cari produk promo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
                className={statusFilter === 'all' ? 'bg-gradient-to-r from-red-600 to-orange-500' : ''}
              >
                Semua
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('active')}
                className={statusFilter === 'active' ? 'bg-gradient-to-r from-red-600 to-orange-500' : ''}
              >
                Aktif
              </Button>
              <Button
                variant={statusFilter === 'expired' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('expired')}
                className={statusFilter === 'expired' ? 'bg-gradient-to-r from-red-600 to-orange-500' : ''}
              >
                Kadaluarsa
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Promo Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredPromoProducts.map((promo, index) => (
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="absolute top-3 right-3 z-10">
                  {getStatusBadge(promo)}
                </div>
                <div className="absolute top-0 left-0 bg-gradient-to-r from-red-600 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-br-lg">
                  PROMO
                </div>
                <CardHeader className="pb-3 pt-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg overflow-hidden flex items-center justify-center text-4xl">
                    {promo.productImage}
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{promo.productName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-500 line-through">
                        Rp {promo.originalPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-red-600" />
                      <span className="text-2xl font-bold text-red-600">
                        Rp {promo.promoPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-center bg-green-100 text-green-700 rounded-md py-1">
                      <Percent className="h-3 w-3 mr-1" />
                      <span className="font-bold">Diskon {promo.discountPercent}%</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    s/d {new Date(promo.endDate).toLocaleDateString('id-ID')}
                  </div>
                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(promo)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(promo.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Hapus
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredPromoProducts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Gift className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>Tidak ada promo ditemukan</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md p-4">
          <DialogHeader className="pb-3">
            <DialogTitle className="text-lg font-semibold">
              {editingPromo ? 'Edit Promo' : 'Tambah Promo Baru'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Produk *</label>
              <select
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              >
                <option value="">Pilih Produk</option>
                {availableProducts.map(product => (
                  <option key={product.id} value={product.name}>
                    {product.name} - Rp {product.price.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga Asli (Rp) *</label>
                <Input
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  placeholder="15000"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga Promo (Rp) *</label>
                <Input
                  type="number"
                  value={formData.promoPrice}
                  onChange={(e) => setFormData({ ...formData, promoPrice: e.target.value })}
                  placeholder="12000"
                  required
                  min="0"
                />
              </div>
            </div>

            {formData.originalPrice && formData.promoPrice && (
              <div className="bg-green-100 text-green-700 rounded-lg p-3 text-center">
                <span className="font-bold text-lg">
                  Diskon: {calculateDiscountPercent(parseInt(formData.originalPrice), parseInt(formData.promoPrice))}%
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai *</label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Berakhir *</label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Aktifkan Promo
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="h-4 w-4 mr-2" />
                Batal
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600"
              >
                <Save className="h-4 w-4 mr-2" />
                Simpan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
