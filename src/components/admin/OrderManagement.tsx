'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ShoppingBag, Eye, CheckCircle2, XCircle, Clock, Truck, Filter, Calendar, RefreshCw, FileSpreadsheet, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { downloadOrdersExcel } from '@/lib/downloadExcel'

interface OrderItem {
  id: string
  productName: string
  quantity: number
  price: number
  image?: string
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone?: string
  customerEmail?: string
  customerAddress?: string
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  paymentMethod: string
  paymentStatus: string
  orderStatus: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled' | 'confirmed'
  createdAt: string
  updatedAt: string
}

export function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const statusOptions = ['all', 'pending', 'processing', 'shipped', 'completed', 'cancelled', 'confirmed']

  const loadOrders = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter && statusFilter !== 'all') {
        params.set('status', statusFilter)
      }
      if (searchQuery) {
        params.set('search', searchQuery)
      }

      const res = await fetch(`/api/admin/orders?${params.toString()}`)
      const data = await res.json()

      if (data.success) {
        setOrders(data.orders || [])
      } else {
        toast.error(data.error || 'Gagal memuat pesanan')
      }
    } catch (error) {
      console.error('Error loading orders:', error)
      toast.error('Gagal memuat pesanan')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [statusFilter])

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadOrders()
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const filteredOrders = orders // Filter is now handled on the server side

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'confirmed':
        return 'bg-cyan-100 text-cyan-700'
      case 'processing':
        return 'bg-blue-100 text-blue-700'
      case 'shipped':
        return 'bg-purple-100 text-purple-700'
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'cancelled':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'confirmed':
        return <CheckCircle2 className="h-4 w-4" />
      case 'processing':
        return <Truck className="h-4 w-4" />
      case 'shipped':
        return <Truck className="h-4 w-4" />
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />
      case 'cancelled':
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending'
      case 'confirmed':
        return 'Dikonfirmasi'
      case 'processing':
        return 'Diproses'
      case 'shipped':
        return 'Dikirim'
      case 'completed':
        return 'Selesai'
      case 'cancelled':
        return 'Dibatalkan'
      default:
        return status
    }
  }

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailModalOpen(true)
  }

  const handleStatusChange = async (orderId: string, newStatus: Order['orderStatus']) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, orderStatus: newStatus }),
      })

      const data = await res.json()

      if (data.success) {
        setOrders(prev =>
          prev.map(order =>
            order.id === orderId
              ? { ...order, orderStatus: newStatus, updatedAt: new Date().toISOString() }
              : order
          )
        )
        toast.success(`✅ Status pesanan diperbarui ke ${getStatusLabel(newStatus)}`)
      } else {
        toast.error(data.error || 'Gagal memperbarui status pesanan')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Gagal memperbarui status pesanan')
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pesanan ini?')) return

    try {
      const res = await fetch(`/api/admin/orders?id=${orderId}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (data.success) {
        setOrders(prev => prev.filter(o => o.id !== orderId))
        toast.success('✅ Pesanan berhasil dihapus!')
      } else {
        toast.error(data.error || 'Gagal menghapus pesanan')
      }
    } catch (error) {
      console.error('Error deleting order:', error)
      toast.error('Gagal menghapus pesanan')
    }
  }

  const handleExportToExcel = async () => {
    setIsExporting(true)
    try {
      await downloadOrdersExcel()
      toast.success('✅ Pesanan berhasil diekspor ke Excel!')
    } catch (error) {
      console.error('Error exporting orders:', error)
      toast.error('Gagal mengekspor pesanan ke Excel')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Daftar Pesanan</h2>
          <p className="text-gray-600">Kelola dan pantau semua pesanan</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleExportToExcel}
            disabled={isExporting || orders.length === 0}
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
            variant="outline"
            size="sm"
            onClick={loadOrders}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
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
                placeholder="Cari nomor pesanan atau nama pelanggan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-4 w-4 text-gray-500" />
              {statusOptions.map(status => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className={
                    statusFilter === status
                      ? 'bg-gradient-to-r from-red-600 to-orange-500'
                      : ''
                  }
                >
                  {status === 'all' ? 'Semua' : getStatusLabel(status)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-red-600" />
              Pesanan ({filteredOrders.length})
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              {new Date().toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-gray-500"
                >
                  <RefreshCw className="h-16 w-16 mx-auto mb-4 animate-spin" />
                  <p>Memuat pesanan...</p>
                </motion.div>
              ) : filteredOrders.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-gray-500"
                >
                  <ShoppingBag className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Tidak ada pesanan ditemukan</p>
                </motion.div>
              ) : (
                filteredOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-red-600">{order.orderNumber}</h3>
                          <Badge className={getStatusColor(order.orderStatus)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(order.orderStatus)}
                              {getStatusLabel(order.orderStatus)}
                            </span>
                          </Badge>
                        </div>
                        <p className="font-semibold text-gray-900">{order.customerName}</p>
                        <p className="text-sm text-gray-600">
                          {order.items.length} item • {order.paymentMethod}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(order.createdAt).toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div className="flex sm:flex-col gap-3 justify-between items-start sm:items-end">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-red-600">
                            Rp {order.total.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetail(order)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Detail
                          </Button>
                          {order.orderStatus === 'pending' && (
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-blue-600 to-purple-500"
                              onClick={() => handleStatusChange(order.id, 'processing')}
                            >
                              Proses
                            </Button>
                          )}
                          {order.orderStatus === 'processing' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-purple-600 to-pink-500"
                                onClick={() => handleStatusChange(order.id, 'shipped')}
                              >
                                <Truck className="h-4 w-4 mr-1" />
                                Kirim
                              </Button>
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-green-600 to-teal-500"
                                onClick={() => handleStatusChange(order.id, 'completed')}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Selesai
                              </Button>
                            </>
                          )}
                          {order.orderStatus === 'shipped' && (
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-green-600 to-teal-500"
                              onClick={() => handleStatusChange(order.id, 'completed')}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Selesai
                            </Button>
                          )}
                          {(order.orderStatus === 'pending' || order.orderStatus === 'processing') && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => handleStatusChange(order.id, 'cancelled')}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteOrder(order.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Order Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">
                  Detail Pesanan: {selectedOrder.orderNumber}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                {/* Customer Info */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-red-600" />
                    Informasi Pelanggan
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Nama</p>
                      <p className="font-semibold">{selectedOrder.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Telepon</p>
                      <p className="font-semibold">{selectedOrder.customerPhone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold">{selectedOrder.customerEmail || '-'}</p>
                    </div>
                    {selectedOrder.customerAddress && (
                      <div className="col-span-1 sm:col-span-2">
                        <p className="text-sm text-gray-600">Alamat</p>
                        <p className="font-semibold">{selectedOrder.customerAddress}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-red-600" />
                    Item Pesanan
                  </h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-orange-100 rounded-lg flex items-center justify-center text-2xl">
                          {item.image || '📦'}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{item.productName}</p>
                          <p className="text-sm text-gray-600">
                            Rp {item.price.toLocaleString()} x {item.quantity}
                          </p>
                        </div>
                        <p className="font-bold text-red-600">
                          Rp {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-3">Ringkasan Pembayaran</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">Rp {selectedOrder.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">PPN (10%)</span>
                      <span className="font-semibold">Rp {selectedOrder.tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Metode Pembayaran</span>
                      <span className="font-semibold">{selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status Pembayaran</span>
                      <Badge className={
                        selectedOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                        selectedOrder.paymentStatus === 'verified' ? 'bg-blue-100 text-blue-700' :
                        selectedOrder.paymentStatus === 'failed' || selectedOrder.paymentStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }>
                        {selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-3 border-t">
                      <span>Total</span>
                      <span className="text-red-600">Rp {selectedOrder.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-red-600" />
                    Status & Waktu
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status Saat Ini</span>
                      <Badge className={getStatusColor(selectedOrder.orderStatus)}>
                        {getStatusLabel(selectedOrder.orderStatus)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dibuat Pada</span>
                      <span className="font-semibold">
                        {new Date(selectedOrder.createdAt).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Diperbarui Pada</span>
                      <span className="font-semibold">
                        {new Date(selectedOrder.updatedAt).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  {selectedOrder.orderStatus === 'pending' && (
                    <Button
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-500"
                      onClick={() => {
                        handleStatusChange(selectedOrder.id, 'processing')
                        setIsDetailModalOpen(false)
                      }}
                    >
                      Proses Pesanan
                    </Button>
                  )}
                  {selectedOrder.orderStatus === 'processing' && (
                    <>
                      <Button
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500"
                        onClick={() => {
                          handleStatusChange(selectedOrder.id, 'shipped')
                          setIsDetailModalOpen(false)
                        }}
                      >
                        <Truck className="h-4 w-4 mr-2" />
                        Kirim
                      </Button>
                      <Button
                        className="flex-1 bg-gradient-to-r from-green-600 to-teal-500"
                        onClick={() => {
                          handleStatusChange(selectedOrder.id, 'completed')
                          setIsDetailModalOpen(false)
                        }}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Selesai
                      </Button>
                    </>
                  )}
                  {selectedOrder.orderStatus === 'shipped' && (
                    <Button
                      className="flex-1 bg-gradient-to-r from-green-600 to-teal-500"
                      onClick={() => {
                        handleStatusChange(selectedOrder.id, 'completed')
                        setIsDetailModalOpen(false)
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Selesai
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
