'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Gift, User, CheckCircle, XCircle, Copy, Calendar, ArrowDownRight, RefreshCw, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useStore } from '@/store/useStore'
import { autoLoginAsAdmin } from '@/lib/admin-auto-login'

interface Product {
  id: string
  name: string
  image?: string
  price: number
}

interface User {
  id: string
  name: string
  email?: string
  phone?: string
}

interface RedemptionOption {
  id: string
  name: string
  description: string
  pointsRequired: number
  active: boolean
}

interface PointVoucher {
  id: string
  code: string
  pointsRequired: number
  productId: string
  userId: string
  userName?: string
  userEmail?: string
  userPhone?: string
  productName?: string
  productImage?: string
  productPrice?: number
  isUsed: boolean
  usedOrderId?: string
  createdAt: string
  usedAt?: string
}

export function PointRedemptionAdmin() {
  const { token, _hasHydrated, user } = useStore()
  const [history, setHistory] = useState<PointVoucher[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [redemptions, setRedemptions] = useState<RedemptionOption[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [showManualRedeemDialog, setShowManualRedeemDialog] = useState(false)
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false)

  const [manualRedeemForm, setManualRedeemForm] = useState({
    userId: '',
    redemptionId: '',
  })

  useEffect(() => {
    if (_hasHydrated) {
      // Auto-login as admin if not logged in
      if (!user || user.role !== 'admin') {
        handleAutoLogin()
      } else {
        loadHistory()
        loadUsers()
        loadProducts()
        loadRedemptions()
      }
    }
  }, [_hasHydrated, user])

  const handleAutoLogin = async () => {
    if (isAutoLoggingIn) return

    setIsAutoLoggingIn(true)
    const result = await autoLoginAsAdmin()

    if (result.success) {
      console.log('[AdminComponent] Auto-login successful, forcing page refresh...')
      // Immediately refresh page to get fresh admin state
      window.location.href = window.location.href
    } else {
      console.error('[AdminComponent] Auto-login failed:', result.error)
      setIsAutoLoggingIn(false)
    }
  }

  const loadHistory = async () => {
    // Only load if hydrated and have user
    if (!_hasHydrated) {
      return
    }

    // Check if user is admin
    if (!user || user.role !== 'admin') {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/point-redemption-history', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.ok) {
        const data = await res.json()
        setHistory(data.vouchers || [])
      } else if (res.status === 401) {
        // Silently handle 401, don't show notification
      } else {
        const errorData = await res.json()
        toast.error(errorData.error || 'Gagal mengambil riwayat penukaran')
      }
    } catch (error) {
      console.error('Error loading history:', error)
      toast.error('Gagal mengambil riwayat penukaran')
    } finally {
      setIsLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/admin/customers', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      if (res.ok) {
        const data = await res.json()
        setUsers(data.customers || [])
      }
    } catch (error) {
      console.error('Error loading users:', error)
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

  const loadRedemptions = async () => {
    try {
      const res = await fetch('/api/admin/point-redemption', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      if (res.ok) {
        const data = await res.json()
        setRedemptions(data.redemptions || [])
      }
    } catch (error) {
      console.error('Error loading redemptions:', error)
    }
  }

  const filteredHistory = history.filter((voucher) => {
    const matchesSearch =
      voucher.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voucher.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voucher.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voucher.productName?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'used' && voucher.isUsed) ||
      (statusFilter === 'unused' && !voucher.isUsed)

    return matchesSearch && matchesStatus
  })

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Kode voucher berhasil disalin!')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleManualRedeem = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!manualRedeemForm.userId || !manualRedeemForm.redemptionId) {
      toast.error('Pilih user dan opsi penukaran')
      return
    }

    setIsRedeeming(true)
    try {
      const res = await fetch('/api/admin/manual-redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(manualRedeemForm),
      })

      if (res.ok) {
        const data = await res.json()
        toast.success(`✅ Poin berhasil ditukar! Voucher: ${data.voucherCode}`)
        setShowManualRedeemDialog(false)
        setManualRedeemForm({ userId: '', redemptionId: '' })
        loadHistory()
      } else if (res.status === 401) {
        // Silently handle 401, don't show notification
      } else {
        const errorData = await res.json()
        toast.error(errorData.error || 'Gagal menukar poin')
      }
    } catch (error) {
      console.error('Error manual redeeming:', error)
      toast.error('Gagal menukar poin')
    } finally {
      setIsRedeeming(false)
    }
  }

  const selectedUser = users.find(u => u.id === manualRedeemForm.userId)
  const selectedRedemption = redemptions.find(r => r.id === manualRedeemForm.redemptionId)
  const selectedProduct = products.find(p => p.id === selectedRedemption?.productId)

  const totalRedeemed = history.length
  const totalUsed = history.filter(v => v.isUsed).length
  const totalUnused = history.filter(v => !v.isUsed).length
  const totalPointsUsed = history.reduce((sum, v) => sum + v.pointsRequired, 0)

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
          <h2 className="text-2xl font-bold text-gray-800">Redeem Produk</h2>
          <p className="text-gray-600">Kelola penukaran poin user dan redeem manual</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadHistory}
            className="hover:bg-gray-100"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => setShowManualRedeemDialog(true)}
            className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600"
          >
            <ArrowDownRight className="h-4 w-4 mr-2" />
            Redeem Manual
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Gift className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Redeem</p>
                <p className="text-2xl font-bold text-gray-900">{totalRedeemed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Sudah Dipakai</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <XCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Belum Dipakai</p>
                <p className="text-2xl font-bold text-gray-900">{totalUnused}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Poin</p>
                <p className="text-2xl font-bold text-gray-900">{totalPointsUsed.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Cari kode, nama user, atau produk..."
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
                variant={statusFilter === 'unused' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('unused')}
                className={statusFilter === 'unused' ? 'bg-gradient-to-r from-red-600 to-orange-500' : ''}
              >
                Belum Dipakai
              </Button>
              <Button
                variant={statusFilter === 'used' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('used')}
                className={statusFilter === 'used' ? 'bg-gradient-to-r from-red-600 to-orange-500' : ''}
              >
                Sudah Dipakai
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Redemption History List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
        </div>
      ) : filteredHistory.length === 0 ? (
        <Card className="p-12 text-center">
          <Gift className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">
            {searchQuery ? 'Tidak ada riwayat penukaran ditemukan' : 'Belum ada riwayat penukaran poin'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((voucher, index) => (
            <motion.div
              key={voucher.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white border rounded-lg p-4 hover:shadow-lg transition-all ${
                voucher.isUsed ? 'border-gray-200' : 'border-green-200 bg-green-50/50'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  {/* Header: Code & Status */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold ${
                        voucher.isUsed ? 'bg-gray-400' : 'bg-gradient-to-br from-red-500 to-orange-500'
                      }`}
                    >
                      <Gift className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-mono font-bold text-lg text-gray-900">{voucher.code}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyCode(voucher.code)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        {voucher.isUsed ? (
                          <Badge className="bg-gray-100 text-gray-700">Dipakai</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-700">Aktif</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        User: {voucher.userName || voucher.userEmail || voucher.userPhone || 'Unknown'}
                      </p>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex items-start gap-4 mb-2">
                    {voucher.productImage ? (
                      <img
                        src={voucher.productImage}
                        alt={voucher.productName}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg flex items-center justify-center">
                        <Gift className="h-8 w-8 text-red-500" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{voucher.productName || 'Produk'}</p>
                      {voucher.productPrice && (
                        <p className="text-sm text-gray-600">Rp {voucher.productPrice.toLocaleString()}</p>
                      )}
                      <div className="flex flex-wrap gap-4 mt-2 text-sm">
                        <span className="text-gray-600">
                          <strong>Poin:</strong> {voucher.pointsRequired}
                        </span>
                        <span className="text-gray-600">
                          <strong>Dibuat:</strong> {formatDate(voucher.createdAt)}
                        </span>
                        {voucher.usedAt && (
                          <span className="text-gray-600">
                            <strong>Dipakai:</strong> {formatDate(voucher.usedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {voucher.usedOrderId && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        Order ID: {voucher.usedOrderId}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Manual Redeem Dialog */}
      <Dialog open={showManualRedeemDialog} onOpenChange={setShowManualRedeemDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Redeem Poin Manual</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleManualRedeem} className="space-y-4 py-4">
            {/* Select User */}
            <div>
              <label className="block text-sm font-medium mb-2">Pilih User *</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={manualRedeemForm.userId}
                onChange={(e) => setManualRedeemForm({ ...manualRedeemForm, userId: e.target.value })}
                required
              >
                <option value="">-- Pilih User --</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} {user.email ? `(${user.email})` : ''} - {user.points || 0} poin
                  </option>
                ))}
              </select>
              {selectedUser && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>User:</strong> {selectedUser.name}<br />
                    {selectedUser.email && <><strong>Email:</strong> {selectedUser.email}<br /></>}
                    {selectedUser.phone && <><strong>Phone:</strong> {selectedUser.phone}</>}
                  </p>
                </div>
              )}
            </div>

            {/* Select Redemption Option */}
            <div>
              <label className="block text-sm font-medium mb-2">Pilih Opsi Penukaran *</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={manualRedeemForm.redemptionId}
                onChange={(e) => setManualRedeemForm({ ...manualRedeemForm, redemptionId: e.target.value })}
                required
              >
                <option value="">-- Pilih Opsi Penukaran --</option>
                {redemptions.filter(r => r.active).map((redemption) => (
                  <option key={redemption.id} value={redemption.id}>
                    {redemption.name} - {redemption.pointsRequired} poin
                  </option>
                ))}
              </select>
              {selectedRedemption && selectedProduct && (
                <div className="mt-2 p-3 bg-orange-50 rounded-lg flex items-center gap-3">
                  {selectedProduct.image ? (
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Gift className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{selectedRedemption.name}</p>
                    <p className="text-xs text-gray-500">{selectedRedemption.description}</p>
                    <p className="text-sm font-bold text-red-600 mt-1">
                      {selectedRedemption.pointsRequired} Poin
                    </p>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowManualRedeemDialog(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isRedeeming}
                className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600"
              >
                {isRedeeming ? (
                  'Memproses...'
                ) : (
                  <>
                    <ArrowDownRight className="h-4 w-4 mr-2" />
                    Redeem Poin
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
