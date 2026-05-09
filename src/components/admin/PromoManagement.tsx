'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Edit, Trash2, Gift, X, Save, Calendar, Percent, Sparkles, DollarSign, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useStore } from '@/store/useStore'
import { autoLoginAsAdmin } from '@/lib/admin-auto-login'

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
  const { token, _hasHydrated, user } = useStore()
  const [promoProducts, setPromoProducts] = useState<PromoProduct[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPromo, setEditingPromo] = useState<PromoProduct | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false)
  const [formData, setFormData] = useState({
    productName: '',
    originalPrice: '',
    promoPrice: '',
    startDate: '',
    endDate: '',
    isActive: true
  })
  const [products, setProducts] = useState<any[]>([])

  // Auto-login on mount
  useEffect(() => {
    if (_hasHydrated) {
      if (!user || user.role !== 'admin') {
        handleAutoLogin()
      } else {
        loadProducts()
        loadPromoProducts()
      }
    }
  }, [_hasHydrated, user])

  const handleAutoLogin = async () => {
    if (isAutoLoggingIn) return

    setIsAutoLoggingIn(true)
    const result = await autoLoginAsAdmin()

    if (result.success) {
      setIsAutoLoggingIn(false)
      loadProducts()
      loadPromoProducts()
    } else {
      console.error('Auto-login failed:', result.error)
      setIsAutoLoggingIn(false)
    }
  }

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error loading products:', error)
    }
  }

  const loadPromoProducts = async () => {
    if (!_hasHydrated) return

    setIsLoading(true)
    try {
      const { token: currentToken } = useStore.getState()
      const res = await fetch('/api/admin/promos', {
        headers: currentToken ? {
          Authorization: `Bearer ${currentToken}`,
        } : {},
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          // Convert string dates to Date objects
          const promosWithDates = (data.promos || []).map((promo: any) => ({
            ...promo,
            startDate: typeof promo.startDate === 'string' ? new Date(promo.startDate) : promo.startDate,
            endDate: typeof promo.endDate === 'string' ? new Date(promo.endDate) : promo.endDate,
            createdAt: typeof promo.createdAt === 'string' ? new Date(promo.createdAt) : promo.createdAt
          }))
          setPromoProducts(promosWithDates)
        } else {
          toast.error(data.error || 'Gagal memuat promo')
        }
      } else if (res.status === 401) {
        // Try auto-login silently
        const loginResult = await autoLoginAsAdmin()
        if (loginResult.success) {
          const { token: newToken } = useStore.getState()
          const retryRes = await fetch('/api/admin/promos', {
            headers: {
              Authorization: `Bearer ${newToken}`,
            },
          })
          if (retryRes.ok) {
            const retryData = await retryRes.json()
            if (retryData.success) {
              // Convert string dates to Date objects
              const promosWithDates = (retryData.promos || []).map((promo: any) => ({
                ...promo,
                startDate: typeof promo.startDate === 'string' ? new Date(promo.startDate) : promo.startDate,
                endDate: typeof promo.endDate === 'string' ? new Date(promo.endDate) : promo.endDate,
                createdAt: typeof promo.createdAt === 'string' ? new Date(promo.createdAt) : promo.createdAt
              }))
              setPromoProducts(promosWithDates)
            } else {
              toast.error(retryData.error || 'Gagal memuat promo')
            }
          }
        }
      } else {
        toast.error('Gagal memuat promo')
      }
    } catch (error) {
      console.error('Error loading promos:', error)
      toast.error('Gagal memuat promo')
    } finally {
      setIsLoading(false)
    }
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
      startDate: typeof promo.startDate === 'string'
        ? promo.startDate.split('T')[0]
        : promo.startDate.toISOString().split('T')[0],
      endDate: typeof promo.endDate === 'string'
        ? promo.endDate.split('T')[0]
        : promo.endDate.toISOString().split('T')[0],
      isActive: promo.isActive
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus promo ini?')) return

    // Check if logged in as admin
    if (!token || !user || user.role !== 'admin') {
      toast.error('Anda belum login sebagai admin. Mohon tunggu sebentar...')
      return
    }

    try {
      const res = await fetch(`/api/admin/promos?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          toast.success('✅ Promo berhasil dihapus!')
          loadPromoProducts()
        } else {
          toast.error(data.error || 'Gagal menghapus promo')
        }
      } else if (res.status === 401) {
        // Try auto-login and retry
        const loginResult = await autoLoginAsAdmin()
        if (loginResult.success) {
          toast.success('Login berhasil. Menghapus ulang...')
          const { token: newToken } = useStore.getState()
          const retryRes = await fetch(`/api/admin/promos?id=${id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${newToken}`,
            },
          })

          if (retryRes.ok) {
            const retryData = await retryRes.json()
            if (retryData.success) {
              toast.success('✅ Promo berhasil dihapus!')
              loadPromoProducts()
            } else {
              toast.error(retryData.error || 'Gagal menghapus promo')
            }
          } else {
            toast.error('Gagal menghapus promo')
          }
        } else {
          toast.error('Gagal login sebagai admin')
        }
      } else {
        toast.error('Gagal menghapus promo')
      }
    } catch (error) {
      console.error('Error deleting promo:', error)
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

    // Check if logged in as admin
    if (!token || !user || user.role !== 'admin') {
      toast.error('Anda belum login sebagai admin. Mohon tunggu sebentar...')
      return
    }

    try {
      const product = products.find(p => p.name === formData.productName)

      // Validate product exists
      if (!product) {
        toast.error('Produk tidak ditemukan. Mohon pilih produk yang valid.')
        return
      }

      const discountPercent = calculateDiscountPercent(originalPrice, promoPrice)

      const promoData = {
        productId: product.id,
        originalPrice,
        promoPrice,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        isActive: formData.isActive
      }

      const res = await fetch('/api/admin/promos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(promoData)
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          toast.success('✅ Promo berhasil ditambahkan!')
          loadPromoProducts()
        } else {
          toast.error(data.error || 'Gagal menyimpan promo')
        }
      } else if (res.status === 401) {
        // Try to auto-login and retry
        const loginResult = await autoLoginAsAdmin()
        if (loginResult.success) {
          toast.success('Login berhasil. Menyimpan ulang data...')
          const { token: newToken } = useStore.getState()
          const retryRes = await fetch('/api/admin/promos', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${newToken}`,
            },
            body: JSON.stringify(promoData)
          })

          if (retryRes.ok) {
            const retryData = await retryRes.json()
            if (retryData.success) {
              toast.success('✅ Promo berhasil ditambahkan!')
              loadPromoProducts()
            } else {
              toast.error(retryData.error || 'Gagal menyimpan promo')
            }
          } else {
            toast.error('Gagal menyimpan promo')
          }
        } else {
          toast.error('Gagal login sebagai admin')
        }
      } else {
        toast.error('Gagal menyimpan promo')
      }

      setIsModalOpen(false)
    } catch (error) {
      console.error('Error saving promo:', error)
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

  // Check if user is authenticated as admin
  if (!_hasHydrated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    )
  }

  if (isAutoLoggingIn) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Login sebagai admin...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Akses Ditolak</h3>
          <p className="text-gray-600 mb-6">Anda belum login sebagai admin.</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600"
          >
            Refresh Halaman
          </Button>
        </Card>
      </div>
    )
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
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p>Memuat promo...</p>
            </div>
          ) : filteredPromoProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Gift className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Tidak ada promo ditemukan</p>
            </div>
          ) : filteredPromoProducts.map((promo, index) => (
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 relative">
                <div className="absolute top-3 right-3 z-10">
                  {getStatusBadge(promo)}
                </div>
                <div className="absolute top-0 left-0 bg-gradient-to-r from-red-600 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-br-lg">
                  PROMO
                </div>
                <CardHeader className="pb-3">
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
                  </div>
                  <div className="flex items-center justify-center bg-green-100 text-green-700 rounded-md py-1">
                    <Percent className="h-3 w-3 mr-1" />
                    <span className="font-bold">Diskon {promo.discountPercent}%</span>
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
          <DialogHeader className="pb-2">
            <DialogTitle className="text-sm font-semibold">
              {editingPromo ? 'Edit Promo' : 'Tambah Promo Baru'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Produk *</label>
              <select
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              >
                <option value="">Pilih Produk</option>
                {products.map(product => (
                  <option key={product.id} value={product.name}>
                    {product.name} - Rp {product.price.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Harga Asli (Rp) *</label>
                <Input
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  placeholder="15000"
                  required
                  min="0"
                  className="h-7 text-xs px-2"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Harga Promo (Rp) *</label>
                <Input
                  type="number"
                  value={formData.promoPrice}
                  onChange={(e) => setFormData({ ...formData, promoPrice: e.target.value })}
                  placeholder="12000"
                  required
                  min="0"
                  className="h-7 text-xs px-2"
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
                <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal Mulai *</label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                  className="h-7 text-xs px-2"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal Berakhir *</label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                  className="h-7 text-xs px-2"
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
              <label htmlFor="isActive" className="text-xs font-medium text-gray-700">
                Aktifkan Promo
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-6 text-xs"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="h-2.5 w-2.5 mr-1" />
                Batal
              </Button>
              <Button
                type="submit"
                className="flex-1 h-6 text-xs bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600"
              >
                <Save className="h-2.5 w-2.5 mr-1" />
                Simpan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
