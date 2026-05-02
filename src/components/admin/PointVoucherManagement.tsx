'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Gift, CheckCircle, XCircle, Copy, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface PointVoucher {
  id: string
  code: string
  pointsRequired: number
  productId: string
  userId: string
  userName?: string
  userEmail?: string
  isUsed: boolean
  usedOrderId?: string
  createdAt: string
  usedAt?: string
}

export function PointVoucherManagement() {
  const [vouchers, setVouchers] = useState<PointVoucher[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadVouchers()
  }, [])

  const loadVouchers = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/point-vouchers')
      if (res.ok) {
        const data = await res.json()
        setVouchers(data.vouchers || [])
      } else {
        toast.error('Gagal mengambil data voucher')
      }
    } catch (error) {
      console.error('Error loading vouchers:', error)
      toast.error('Gagal mengambil data voucher')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredVouchers = vouchers.filter((voucher) => {
    const matchesSearch =
      voucher.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voucher.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voucher.userEmail?.toLowerCase().includes(searchQuery.toLowerCase())

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Kelola Voucher Poin</h2>
        <p className="text-gray-600">Lihat dan kelola voucher dari penukaran poin pelanggan</p>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Cari kode, nama, atau email user..."
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

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Gift className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Voucher</p>
                <p className="text-2xl font-bold text-gray-900">{vouchers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Sudah Dipakai</p>
                <p className="text-2xl font-bold text-gray-900">
                  {vouchers.filter((v) => v.isUsed).length}
                </p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {vouchers.filter((v) => !v.isUsed).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vouchers List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
        </div>
      ) : filteredVouchers.length === 0 ? (
        <Card className="p-12 text-center">
          <Gift className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">Tidak ada voucher ditemukan</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredVouchers.map((voucher, index) => (
            <motion.div
              key={voucher.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white border rounded-lg p-4 hover:shadow-lg transition-all ${
                voucher.isUsed ? 'border-gray-200' : 'border-green-200 bg-green-50/50'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
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
                        Oleh: {voucher.userName || voucher.userEmail || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm">
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
                  {voucher.usedOrderId && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-500">Order ID: {voucher.usedOrderId}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
