'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Eye, CheckCircle, XCircle, Clock, Download, RefreshCw, Calendar, User, CreditCard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'

interface PaymentRequest {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  amount: number
  paymentMethod: string
  paymentProof?: string
  paymentStatus: 'pending' | 'verified' | 'rejected'
  orderStatus: string
  createdAt: string
  updatedAt: string
  items: { name: string; quantity: number; price: number }[]
  transactionDate?: string
}

export function PaymentConfirmation() {
  const [payments, setPayments] = useState<PaymentRequest[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all')
  const [selectedPayment, setSelectedPayment] = useState<PaymentRequest | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPayments()
  }, [])

  const loadPayments = async () => {
    setIsLoading(true)
    try {
      // Fetch payments from API
      const res = await fetch('/api/payments')

      if (res.ok) {
        const data = await res.json()
        setPayments(data.payments || [])
      } else {
        toast.error('Gagal memuat data pembayaran')
      }
    } catch (error) {
      console.error('Error loading payments:', error)
      toast.error('Gagal memuat data pembayaran')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch =
      payment.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.customerPhone.includes(searchQuery)

    const matchesStatus = statusFilter === 'all' || payment.paymentStatus === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleViewDetail = (payment: PaymentRequest) => {
    setSelectedPayment(payment)
    setIsDetailModalOpen(true)
  }

  const handleVerifyPayment = async (paymentId: string, status: 'verified' | 'rejected') => {
    try {
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, status }),
      })

      if (res.ok) {
        const data = await res.json()

        // Update local state
        setPayments(prev =>
          prev.map(p =>
            p.id === paymentId
              ? { ...p, paymentStatus: status, updatedAt: new Date().toISOString() }
              : p
          )
        )

        toast.success(
          status === 'verified'
            ? `✅ Pembayaran ${data.orderNumber} berhasil dikonfirmasi!`
            : `❌ Pembayaran ${data.orderNumber} ditolak!`
        )

        setIsDetailModalOpen(false)
        loadPayments()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Gagal mengonfirmasi pembayaran')
      }
    } catch (error) {
      console.error('Error verifying payment:', error)
      toast.error('Terjadi kesalahan saat mengonfirmasi pembayaran')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    }
    const labels = {
      pending: 'Menunggu',
      verified: 'Terverifikasi',
      rejected: 'Ditolak',
    }
    return (
      <Badge className={statusStyles[status as keyof typeof statusStyles]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Konfirmasi Pembayaran</h2>
          <p className="text-gray-600">Kelola dan verifikasi pembayaran pelanggan</p>
        </div>
        <Button
          onClick={loadPayments}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-800">{payments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Menunggu</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {payments.filter(p => p.paymentStatus === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Terverifikasi</p>
                <p className="text-2xl font-bold text-green-600">
                  {payments.filter(p => p.paymentStatus === 'verified').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-3 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ditolak</p>
                <p className="text-2xl font-bold text-red-600">
                  {payments.filter(p => p.paymentStatus === 'rejected').length}
                </p>
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
              <input
                type="text"
                placeholder="Cari nama pelanggan, nomor order, atau telepon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('pending')}
                className={statusFilter === 'pending' ? 'bg-gradient-to-r from-red-600 to-orange-500' : ''}
              >
                Menunggu
              </Button>
              <Button
                variant={statusFilter === 'verified' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('verified')}
                className={statusFilter === 'verified' ? 'bg-gradient-to-r from-red-600 to-orange-500' : ''}
              >
                Terverifikasi
              </Button>
              <Button
                variant={statusFilter === 'rejected' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('rejected')}
                className={statusFilter === 'rejected' ? 'bg-gradient-to-r from-red-600 to-orange-500' : ''}
              >
                Ditolak
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-gray-500"
            >
              <RefreshCw className="h-16 w-16 mx-auto mb-4 animate-spin" />
              <p>Memuat data pembayaran...</p>
            </motion.div>
          ) : filteredPayments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-gray-500"
            >
              <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Tidak ada pembayaran ditemukan</p>
            </motion.div>
          ) : (
            filteredPayments.map((payment, index) => (
              <motion.div
                key={payment.id}
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
                        <User className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900">{payment.customerName}</h3>
                          {getStatusBadge(payment.paymentStatus)}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                          <span>{payment.orderNumber}</span>
                          <span>•</span>
                          <span>{payment.customerPhone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{formatDate(payment.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        <span>{payment.paymentMethod}</span>
                      </div>
                      <div className="font-semibold text-gray-800">
                        {formatCurrency(payment.amount)}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleViewDetail(payment)}
                    className="flex-shrink-0"
                    variant="outline"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Lihat Detail
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Payment Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Pembayaran</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              {/* Order Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Informasi Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-500">Nomor Order:</span>
                      <p className="font-medium">{selectedPayment.orderNumber}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Tanggal:</span>
                      <p className="font-medium">{formatDate(selectedPayment.createdAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Informasi Pelanggan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Nama:</span>
                    <p className="font-medium">{selectedPayment.customerName}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Telepon:</span>
                    <p className="font-medium">{selectedPayment.customerPhone}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Item Pesanan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedPayment.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.name} x{item.quantity}</span>
                        <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-red-600">{formatCurrency(selectedPayment.amount)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Proof */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Bukti Pembayaran</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedPayment.paymentProof ? (
                    <div className="space-y-3">
                      <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center min-h-[200px]">
                        <img
                          src={selectedPayment.paymentProof}
                          alt="Bukti Pembayaran"
                          className="max-w-full max-h-[300px] object-contain rounded"
                        />
                      </div>
                      {selectedPayment.transactionDate && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Tanggal Transaksi:</span> {formatDate(selectedPayment.transactionDate)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">Tidak ada bukti pembayaran</p>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              {selectedPayment.paymentStatus === 'pending' && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleVerifyPayment(selectedPayment.id, 'rejected')}
                    variant="outline"
                    className="flex-1 text-red-600 hover:bg-red-50 border-red-200"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Tolak Pembayaran
                  </Button>
                  <Button
                    onClick={() => handleVerifyPayment(selectedPayment.id, 'verified')}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Terima Pembayaran
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
