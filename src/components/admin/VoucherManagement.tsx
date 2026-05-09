'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Edit, Trash2, Tag, X, Save, Calendar, Percent, CheckCircle, XCircle, Copy, FileSpreadsheet, Download, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { downloadVouchersExcel } from '@/lib/downloadExcel'
import { useStore } from '@/store/useStore'
import { autoLoginAsAdmin } from '@/lib/admin-auto-login'

interface Voucher {
  id: string
  code: string
  name: string
  description?: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minOrderAmount?: number
  maxDiscountAmount?: number
  startDate: Date
  endDate: Date
  usageLimit?: number
  usageCount: number
  isActive: boolean
  createdAt: Date
}

export function VoucherManagement() {
  const { token, _hasHydrated, user } = useStore()
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    startDate: '',
    endDate: '',
    usageLimit: '',
    isActive: true
  })

  useEffect(() => {
    if (_hasHydrated) {
      // Auto-login as admin if not logged in
      if (!user || user.role !== 'admin') {
        handleAutoLogin()
      } else {
        loadVouchers()
      }
    }
  }, [_hasHydrated, user])

  const handleAutoLogin = async () => {
    if (isAutoLoggingIn) return

    setIsAutoLoggingIn(true)
    const result = await autoLoginAsAdmin()

    if (result.success) {
      console.log('[VoucherManagement] Auto-login successful, reloading page...')
      window.location.reload()
    } else {
      console.error('[VoucherManagement] Auto-login failed:', result.error)
      setIsAutoLoggingIn(false)
    }
  }

  const loadVouchers = async () => {
    // Only load if hydrated and have user
    if (!_hasHydrated) {
      return
    }

    // Check if user is admin
    if (!user || user.role !== 'admin') {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/vouchers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Gagal mengambil data voucher')
      }

      const data = await response.json()
      if (data.success && data.vouchers) {
        setVouchers(data.vouchers)
      }
    } catch (error) {
      console.error('Error loading vouchers:', error)
      toast.error('Gagal memuat data voucher')
    } finally {
      setLoading(false)
    }
  }

  const filteredVouchers = vouchers.filter(voucher => {
    const matchesSearch =
      voucher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voucher.code.toLowerCase().includes(searchQuery.toLowerCase())
    
    const now = new Date()
    const isExpired = voucher.endDate < now
    const isUpcoming = voucher.startDate > now
    const isActivePeriod = !isExpired && !isUpcoming

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && voucher.isActive && isActivePeriod) ||
      (statusFilter === 'expired' && (isExpired || !voucher.isActive)) ||
      (statusFilter === 'upcoming' && isUpcoming)
    
    return matchesSearch && matchesStatus
  })

  const handleAdd = () => {
    setEditingVoucher(null)
    const today = new Date()
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())
    
    setFormData({
      code: '',
      name: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minOrderAmount: '',
      maxDiscountAmount: '',
      startDate: today.toISOString().split('T')[0],
      endDate: nextMonth.toISOString().split('T')[0],
      usageLimit: '',
      isActive: true
    })
    setIsModalOpen(true)
  }

  const handleEdit = (voucher: Voucher) => {
    setEditingVoucher(voucher)
    setFormData({
      code: voucher.code,
      name: voucher.name,
      description: voucher.description || '',
      discountType: voucher.discountType,
      discountValue: voucher.discountValue.toString(),
      minOrderAmount: voucher.minOrderAmount?.toString() || '',
      maxDiscountAmount: voucher.maxDiscountAmount?.toString() || '',
      startDate: voucher.startDate.toISOString().split('T')[0],
      endDate: voucher.endDate.toISOString().split('T')[0],
      usageLimit: voucher.usageLimit?.toString() || '',
      isActive: voucher.isActive
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus voucher ini?')) return

    try {
      const response = await fetch(`/api/admin/vouchers?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Gagal menghapus voucher')
      }

      const data = await response.json()
      if (data.success) {
        toast.success('✅ Voucher berhasil dihapus!')
        loadVouchers()
      } else {
        throw new Error(data.error || 'Gagal menghapus voucher')
      }
    } catch (error) {
      console.error('Error deleting voucher:', error)
      toast.error('Gagal menghapus voucher')
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Kode voucher berhasil disalin!')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.code.trim() || !formData.name.trim() || !formData.discountValue) {
      toast.error('Mohon lengkapi semua data yang diperlukan!')
      return
    }

    try {
      const voucherData = {
        id: editingVoucher?.id,
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        minOrderAmount: formData.minOrderAmount || undefined,
        maxDiscountAmount: formData.maxDiscountAmount || undefined,
        startDate: formData.startDate,
        endDate: formData.endDate,
        usageLimit: formData.usageLimit || undefined,
        isActive: formData.isActive
      }

      const response = await fetch('/api/admin/vouchers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(voucherData)
      })

      if (!response.ok) {
        throw new Error('Gagal menyimpan voucher')
      }

      const data = await response.json()
      if (data.success) {
        toast.success(editingVoucher ? '✅ Voucher berhasil diperbarui!' : '✅ Voucher berhasil ditambahkan!')
        setIsModalOpen(false)
        loadVouchers()
      } else {
        throw new Error(data.error || 'Gagal menyimpan voucher')
      }
    } catch (error) {
      console.error('Error saving voucher:', error)
      toast.error('Gagal menyimpan voucher')
    }
  }

  const getStatusBadge = (voucher: Voucher) => {
    const now = new Date()
    const isExpired = voucher.endDate < now
    const isUpcoming = voucher.startDate > now

    if (!voucher.isActive || isExpired) {
      return <Badge className="bg-red-100 text-red-700">Kadaluarsa</Badge>
    } else if (isUpcoming) {
      return <Badge className="bg-yellow-100 text-yellow-700">Akan Datang</Badge>
    } else {
      return <Badge className="bg-green-100 text-green-700">Aktif</Badge>
    }
  }

  const handleExportToExcel = async () => {
    setIsExporting(true)
    try {
      await downloadVouchersExcel()
      toast.success('✅ Voucher berhasil diekspor ke Excel!')
    } catch (error) {
      console.error('Error exporting vouchers:', error)
      toast.error('Gagal mengekspor voucher ke Excel')
    } finally {
      setIsExporting(false)
    }
  }

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
          <h2 className="text-2xl font-bold text-gray-800">Kelola Voucher</h2>
          <p className="text-gray-600">Buat dan kelola voucher untuk pelanggan</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleExportToExcel}
            disabled={isExporting || vouchers.length === 0}
            className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600"
          >
            {isExporting ? (
              <Download className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4 mr-2" />
            )}
            Export ke Excel
          </Button>
          <Button
            onClick={handleAdd}
            className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Voucher
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Cari nama atau kode voucher..."
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
                variant={statusFilter === 'upcoming' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('upcoming')}
                className={statusFilter === 'upcoming' ? 'bg-gradient-to-r from-red-600 to-orange-500' : ''}
              >
                Akan Datang
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

      {/* Vouchers List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-gray-500"
            >
              <p>Memuat data voucher...</p>
            </motion.div>
          ) : filteredVouchers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-gray-500"
            >
              <Tag className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Tidak ada voucher ditemukan</p>
            </motion.div>
          ) : (
            filteredVouchers.map((voucher, index) => (
              <motion.div
                key={voucher.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold">
                        <Percent className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{voucher.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded">
                            {voucher.code}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyCode(voucher.code)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          {getStatusBadge(voucher)}
                        </div>
                      </div>
                    </div>
                    {voucher.description && (
                      <p className="text-sm text-gray-600 mb-2">{voucher.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="text-gray-600">
                        {voucher.discountType === 'percentage' 
                          ? `Diskon ${voucher.discountValue}%` 
                          : `Diskon Rp ${voucher.discountValue.toLocaleString()}`
                        }
                      </span>
                      {voucher.minOrderAmount && (
                        <span className="text-gray-600">
                          Min. Rp {voucher.minOrderAmount.toLocaleString()}
                        </span>
                      )}
                      <span className="text-gray-600">
                        {voucher.usageCount} / {voucher.usageLimit || '∞'} digunakan
                      </span>
                      <span className="text-gray-600">
                        s/d {new Date(voucher.endDate).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(voucher)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(voucher.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xs p-2">
          <DialogHeader className="pb-1.5">
            <DialogTitle className="text-sm font-semibold">
              {editingVoucher ? 'Edit' : 'Tambah'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-1.5">
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="block text-[10px] font-medium text-gray-700 mb-0.5">Kode *</label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="CODE10"
                  required
                  className="font-mono h-7 text-[10px] px-2"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-700 mb-0.5">Nama *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Voucher"
                  required
                  className="h-7 text-[10px] px-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-medium text-gray-700 mb-0.5">Deskripsi</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi"
                rows={1}
                className="w-full px-1.5 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-[10px] h-7"
              />
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="block text-[10px] font-medium text-gray-700 mb-0.5">Tipe</label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' })}
                  className="w-full px-1.5 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-[10px] h-7"
                >
                  <option value="percentage">%</option>
                  <option value="fixed">Rp</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-700 mb-0.5">
                  {formData.discountType === 'percentage' ? 'Diskon (%) *' : 'Diskon (Rp) *'}
                </label>
                <Input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  placeholder="10"
                  required
                  min="0"
                  className="h-7 text-[10px] px-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="block text-[10px] font-medium text-gray-700 mb-0.5">Min. Order</label>
                <Input
                  type="number"
                  value={formData.minOrderAmount}
                  onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                  placeholder="50000"
                  min="0"
                  className="h-7 text-[10px] px-2"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-700 mb-0.5">Max. Diskon</label>
                <Input
                  type="number"
                  value={formData.maxDiscountAmount}
                  onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                  placeholder="50000"
                  min="0"
                  className="h-7 text-[10px] px-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="block text-[10px] font-medium text-gray-700 mb-0.5">Mulai *</label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                  className="h-7 text-[10px] px-1.5"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-700 mb-0.5">Berakhir *</label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                  className="h-7 text-[10px] px-1.5"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-medium text-gray-700 mb-0.5">Batas Pakai</label>
              <Input
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                placeholder="100"
                min="1"
                className="h-7 text-[10px] px-2"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-3 h-3 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <label htmlFor="isActive" className="text-[10px] font-medium text-gray-700">
                Aktif
              </label>
            </div>

            <div className="flex gap-1.5 pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-6 text-[10px]"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="h-2.5 w-2.5 mr-0.5" />
                Batal
              </Button>
              <Button
                type="submit"
                className="flex-1 h-6 text-[10px] bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600"
              >
                <Save className="h-2.5 w-2.5 mr-0.5" />
                Simpan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
