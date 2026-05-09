'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Edit, Trash2, Gift, Save, Table, Grid as GridIcon, ToggleLeft, ToggleRight, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { DatabaseTableView } from './DatabaseTableView'
import { useStore } from '@/store/useStore'
import { autoLoginAsAdmin } from '@/lib/admin-auto-login'

interface Product {
  id: string
  name: string
  image?: string
  price: number
}

interface PointRedemption {
  id: string
  name: string
  description: string
  pointsRequired: number
  productId: string
  productImage?: string
  active: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export function PointRedemptionManagement() {
  const { token, _hasHydrated, user } = useStore()
  const [redemptions, setRedemptions] = useState<PointRedemption[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [editingRedemption, setEditingRedemption] = useState<PointRedemption | null>(null)
  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pointsRequired: '',
    productId: '',
    productImage: '',
    active: true,
    order: '0',
  })

  // Load data
  useEffect(() => {
    console.log('[Component useEffect] _hasHydrated:', _hasHydrated, 'user:', user)
    if (_hasHydrated) {
      // Auto-login as admin if not logged in
      if (!user || user.role !== 'admin') {
        console.log('[Component] User not admin, calling handleAutoLogin')
        handleAutoLogin()
      } else {
        console.log('[Component] User is admin, loading data')
        loadRedemptions()
        loadProducts()
      }
    }
  }, [_hasHydrated, user])

  const handleAutoLogin = async () => {
    if (isAutoLoggingIn) return

    setIsAutoLoggingIn(true)
    const result = await autoLoginAsAdmin()

    if (result.success) {
      console.log('[Component] Auto-login successful, loading data...')
      // Load data directly after successful login instead of refreshing
      setIsAutoLoggingIn(false)
      loadRedemptions()
      loadProducts()
    } else {
      console.error('[Component] Auto-login failed:', result.error)
      setIsAutoLoggingIn(false)
    }
  }

  const loadRedemptions = async () => {
    // Only load if hydrated and have token
    if (!_hasHydrated) {
      return
    }

    setIsLoading(true)
    try {
      // Get current token from store
      const { token: currentToken } = useStore.getState()

      const res = await fetch('/api/admin/point-redemption', {
        headers: currentToken ? {
          Authorization: `Bearer ${currentToken}`,
        } : {},
      })

      if (res.ok) {
        const data = await res.json()
        setRedemptions(data.redemptions || [])
      } else if (res.status === 401) {
        // Silently handle 401, don't show notification
      } else {
        const errorText = await res.text()
        console.error('Error loading redemptions:', errorText)
        let errorData: any
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText || 'Gagal mengambil data penukaran poin' }
        }
        toast.error(errorData.error || 'Gagal mengambil data penukaran poin')
      }
    } catch (error) {
      console.error('Error loading redemptions:', error)
      toast.error('Gagal mengambil data penukaran poin')
    } finally {
      setIsLoading(false)
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

  const filteredRedemptions = redemptions.filter((redemption) => {
    return redemption.name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const handleAdd = () => {
    setEditingRedemption(null)
    setFormData({
      name: '',
      description: '',
      pointsRequired: '',
      productId: '',
      productImage: '',
      active: true,
      order: '0',
    })
    setShowDialog(true)
  }

  const handleEdit = (redemption: PointRedemption) => {
    setEditingRedemption(redemption)
    setFormData({
      name: redemption.name,
      description: redemption.description,
      pointsRequired: redemption.pointsRequired.toString(),
      productId: redemption.productId,
      productImage: redemption.productImage || '',
      active: redemption.active,
      order: redemption.order.toString(),
    })
    setShowDialog(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus opsi penukaran ini?')) {
      return
    }

    // Check if logged in as admin
    if (!token || !user || user.role !== 'admin') {
      toast.error('Anda belum login sebagai admin. Mohon tunggu sebentar...')
      return
    }

    try {
      const res = await fetch(`/api/admin/point-redemption?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.ok) {
        toast.success('✅ Opsi penukaran berhasil dihapus!')
        loadRedemptions()
      } else if (res.status === 401) {
        // Try auto-login
        const loginResult = await autoLoginAsAdmin()
        if (loginResult.success) {
          toast.success('Login berhasil. Menghapus ulang...')
          const { token: newToken } = useStore.getState()
          const retryRes = await fetch(`/api/admin/point-redemption?id=${id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${newToken}`,
            },
          })

          if (retryRes.ok) {
            toast.success('✅ Opsi penukaran berhasil dihapus!')
            loadRedemptions()
          } else {
            const errorText = await retryRes.text()
            console.error('Retry error:', errorText)
            let errorData: any
            try {
              errorData = JSON.parse(errorText)
            } catch {
              errorData = { error: errorText || 'Gagal menghapus' }
            }
            toast.error(errorData.error || 'Gagal menghapus opsi penukaran')
          }
        } else {
          toast.error('Gagal login sebagai admin')
        }
      } else {
        const errorText = await res.text()
        console.error('Error deleting redemption:', errorText)
        let errorData: any
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText || 'Gagal menghapus opsi penukaran' }
        }
        toast.error(errorData.error || 'Gagal menghapus opsi penukaran')
      }
    } catch (error) {
      console.error('Error deleting redemption:', error)
      toast.error('Gagal menghapus opsi penukaran')
    }
  }

  const handleToggleActive = async (redemption: PointRedemption) => {
    // Check if logged in as admin
    if (!token || !user || user.role !== 'admin') {
      toast.error('Anda belum login sebagai admin. Mohon tunggu sebentar...')
      return
    }

    try {
      const res = await fetch('/api/admin/point-redemption', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: redemption.id,
          active: !redemption.active,
        }),
      })

      if (res.ok) {
        toast.success(redemption.active ? 'Opsi penukaran dinonaktifkan' : 'Opsi penukaran diaktifkan')
        loadRedemptions()
      } else if (res.status === 401) {
        // Try auto-login
        const loginResult = await autoLoginAsAdmin()
        if (loginResult.success) {
          toast.success('Login berhasil. Mengubah ulang status...')
          const { token: newToken } = useStore.getState()
          const retryRes = await fetch('/api/admin/point-redemption', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${newToken}`,
            },
            body: JSON.stringify({
              id: redemption.id,
              active: !redemption.active,
            }),
          })

          if (retryRes.ok) {
            toast.success(redemption.active ? 'Opsi penukaran dinonaktifkan' : 'Opsi penukaran diaktifkan')
            loadRedemptions()
          } else {
            const errorText = await retryRes.text()
            console.error('Retry error:', errorText)
            let errorData: any
            try {
              errorData = JSON.parse(errorText)
            } catch {
              errorData = { error: errorText || 'Gagal mengubah status' }
            }
            toast.error(errorData.error || 'Gagal mengubah status opsi penukaran')
          }
        } else {
          toast.error('Gagal login sebagai admin')
        }
      } else {
        const errorText = await res.text()
        console.error('Error toggling active:', errorText)
        let errorData: any
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText || 'Gagal mengubah status opsi penukaran' }
        }
        toast.error(errorData.error || 'Gagal mengubah status opsi penukaran')
      }
    } catch (error) {
      console.error('Error toggling active:', error)
      toast.error('Gagal mengubah status opsi penukaran')
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!formData.name.trim()) {
      toast.error('Nama wajib diisi')
      return
    }
    if (!formData.description.trim()) {
      toast.error('Deskripsi wajib diisi')
      return
    }
    if (!formData.pointsRequired || parseInt(formData.pointsRequired) <= 0) {
      toast.error('Poin harus lebih dari 0')
      return
    }
    if (!formData.productId) {
      toast.error('Produk wajib dipilih')
      return
    }

    // Check if logged in as admin
    if (!token || !user || user.role !== 'admin') {
      toast.error('Anda belum login sebagai admin. Mohon tunggu sebentar...')
      return
    }

    setIsSaving(true)
    try {
      const method = editingRedemption ? 'PUT' : 'POST'
      const body = {
        ...formData,
        pointsRequired: parseInt(formData.pointsRequired),
        order: parseInt(formData.order),
        ...(editingRedemption ? { id: editingRedemption.id } : {})
      }

      console.log('Saving redemption:', { method, body })

      const res = await fetch('/api/admin/point-redemption', {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      console.log('Response status:', res.status)

      if (res.ok) {
        const data = await res.json()
        console.log('Success response:', data)
        toast.success(editingRedemption ? '✅ Opsi penukaran berhasil diupdate' : '✅ Opsi penukaran berhasil dibuat')
        setShowDialog(false)
        loadRedemptions()
      } else if (res.status === 401) {
        // Try to auto-login and retry
        const loginResult = await autoLoginAsAdmin()
        if (loginResult.success) {
          toast.success('Login berhasil. Menyimpan ulang data...')
          // Retry the save operation after successful login
          const { token: newToken } = useStore.getState()
          const retryRes = await fetch('/api/admin/point-redemption', {
            method,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${newToken}`,
            },
            body: JSON.stringify(body),
          })

          if (retryRes.ok) {
            const retryData = await retryRes.json()
            console.log('Retry success response:', retryData)
            toast.success(editingRedemption ? '✅ Opsi penukaran berhasil diupdate' : '✅ Opsi penukaran berhasil dibuat')
            setShowDialog(false)
            loadRedemptions()
          } else {
            const errorText = await retryRes.text()
            console.error('Retry error response:', errorText)
            let errorData: any
            try {
              errorData = JSON.parse(errorText)
            } catch {
              errorData = { error: errorText || 'Gagal menyimpan setelah login' }
            }
            toast.error(errorData.error || 'Gagal menyimpan setelah login')
          }
        } else {
          toast.error('Gagal login sebagai admin')
        }
      } else {
        const errorText = await res.text()
        console.error('Error response text:', errorText)
        let errorData: any
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText || 'Gagal menyimpan opsi penukaran' }
        }
        toast.error(errorData.error || 'Gagal menyimpan opsi penukaran')
      }
    } catch (error) {
      console.error('[handleSave] Error:', error)
      toast.error('Gagal menyimpan opsi penukaran')
    } finally {
      setIsSaving(false)
    }
  }

  const selectedProduct = products.find(p => p.id === formData.productId)

  // Check if user is authenticated as admin
  if (!_hasHydrated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    )
  }

  if (isAutoLoggingIn) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent mx-auto mb-4"></div>
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
          <h2 className="text-2xl font-bold text-gray-800">Kelola Tukar Poin</h2>
          <p className="text-gray-600">Tambah, edit, atau hapus opsi penukaran poin</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'bg-gradient-to-r from-red-600 to-orange-500' : ''}
          >
            <GridIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
            className={viewMode === 'table' ? 'bg-gradient-to-r from-red-600 to-orange-500' : ''}
          >
            <Table className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleAdd}
            className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Opsi
          </Button>
        </div>
      </div>

      {/* Search - Only show in Grid View */}
      {viewMode === 'grid' && (
        <Card>
          <CardContent className="p-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Cari opsi penukaran..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table View - Excel Style */}
      {viewMode === 'table' && (
        <DatabaseTableView
          title="Database Tukar Poin"
          data={filteredRedemptions}
          columns={[
            {
              key: 'name',
              label: 'Nama Opsi',
              width: '200px'
            },
            {
              key: 'description',
              label: 'Deskripsi',
              width: '300px',
              format: (value) => <span className="line-clamp-2">{value}</span>
            },
            {
              key: 'pointsRequired',
              label: 'Poin Diperlukan',
              width: '120px',
              format: (value) => `${value} Poin`
            },
            {
              key: 'active',
              label: 'Status',
              width: '100px',
              format: (value) => (
                value ? (
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Aktif
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-700">
                    Nonaktif
                  </Badge>
                )
              )
            },
            {
              key: 'order',
              label: 'Urutan',
              width: '80px'
            },
            {
              key: 'createdAt',
              label: 'Dibuat Pada',
              width: '180px',
              format: (value) => new Date(value).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            }
          ]}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
            </div>
          ) : filteredRedemptions.length === 0 ? (
            <Card className="p-12 text-center">
              <Gift className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">
                {searchQuery ? 'Tidak ada opsi penukaran ditemukan' : 'Belum ada opsi penukaran poin'}
              </p>
              {!searchQuery && (
                <Button
                  onClick={handleAdd}
                  className="mt-4 bg-gradient-to-r from-red-600 to-orange-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Opsi Pertama
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredRedemptions.map((redemption, index) => {
                  const product = products.find((p) => p.id === redemption.productId)
                  return (
                    <motion.div
                      key={redemption.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className={`h-full hover:shadow-xl transition-all duration-300 relative ${
                        redemption.active ? 'border-green-200' : 'border-gray-200 opacity-75'
                      }`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="w-20 h-20 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg overflow-hidden flex items-center justify-center">
                              {redemption.productImage ? (
                                <img
                                  src={redemption.productImage}
                                  alt={redemption.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : product?.image ? (
                                <img
                                  src={product.image}
                                  alt={redemption.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Gift className="h-8 w-8 text-red-600" />
                              )}
                            </div>
                            <div className="flex flex-col gap-1">
                              <Badge
                                className={
                                  redemption.active
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-700'
                                }
                              >
                                {redemption.active ? 'Aktif' : 'Nonaktif'}
                              </Badge>
                            </div>
                          </div>
                          <CardTitle className="text-lg line-clamp-2">{redemption.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {redemption.description}
                          </p>
                          {product && (
                            <div className="text-xs text-gray-500">
                              <strong>Produk:</strong> {product.name}
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold text-red-600">
                                {redemption.pointsRequired}
                              </p>
                              <p className="text-sm text-gray-600">Poin</p>
                            </div>
                          </div>
                          <div className="flex gap-2 pt-3 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleToggleActive(redemption)}
                            >
                              {redemption.active ? (
                                <>
                                  <ToggleLeft className="h-4 w-4 mr-1" />
                                  Nonaktif
                                </>
                              ) : (
                                <>
                                  <ToggleRight className="h-4 w-4 mr-1" />
                                  Aktif
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(redemption)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(redemption.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRedemption ? 'Edit Opsi Penukaran Poin' : 'Tambah Opsi Penukaran Poin Baru'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nama Opsi *</label>
              <Input
                placeholder="Contoh: Ayam Geprek Gratis"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Deskripsi *</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Deskripsi detail tentang opsi penukaran poin ini"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Poin yang Dibutuhkan *</label>
              <Input
                type="number"
                min="1"
                placeholder="Contoh: 100"
                value={formData.pointsRequired}
                onChange={(e) => setFormData({ ...formData, pointsRequired: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Pilih Produk *</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                required
              >
                <option value="">-- Pilih Produk --</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} (Rp {product.price.toLocaleString()})
                  </option>
                ))}
              </select>
              {selectedProduct && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                  {selectedProduct.image ? (
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                      <Gift className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{selectedProduct.name}</p>
                    <p className="text-xs text-gray-500">Rp {selectedProduct.price.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">URL Gambar (Opsional)</label>
              <Input
                placeholder="https://..."
                value={formData.productImage}
                onChange={(e) => setFormData({ ...formData, productImage: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">
                Kosongkan untuk menggunakan gambar produk default
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Urutan Tampilan</label>
              <Input
                type="number"
                min="0"
                placeholder="Contoh: 0"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">
                Angka lebih kecil akan ditampilkan lebih dulu
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
              />
              <label htmlFor="active" className="text-sm font-medium">
                Aktif (Tampilkan di halaman tukar poin user)
              </label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600"
              >
                {isSaving ? (
                  'Menyimpan...'
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {editingRedemption ? 'Update' : 'Simpan'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
