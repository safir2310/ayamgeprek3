'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Package, Calendar, User, Phone, MapPin, CheckCircle, Clock, XCircle, Truck, Eye, RefreshCw, Download, FileSpreadsheet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { downloadOrdersExcel } from '@/lib/downloadExcel'

interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  price: number
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone?: string
  address?: string
  items: OrderItem[]
  subtotal: number
  tax: number
  finalAmount: number
  orderStatus: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed'
  paymentMethod: 'qris' | 'cash' | 'transfer'
  createdAt: Date
  notes?: string
}

export function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = () => {
    // Mock orders - will be replaced with API call
    setOrders([
      {
        id: '1',
        orderNumber: 'ORD-2024-001',
        customerName: 'Budi Santoso',
        customerPhone: '081234567890',
        address: 'Jl. Merdeka No. 123, Jakarta',
        items: [
          { id: '1', productId: '1', productName: 'Ayam Geprek Sambal Ijo', quantity: 2, price: 18000 },
          { id: '2', productId: '3', productName: 'Es Teh Manis', quantity: 2, price: 5000 },
        ],
        subtotal: 46000,
        tax: 4600,
        finalAmount: 50600,
        orderStatus: 'completed',
        paymentStatus: 'paid',
        paymentMethod: 'qris',
        createdAt: new Date(Date.now() - 3600000),
      },
      {
        id: '2',
        orderNumber: 'ORD-2024-002',
        customerName: 'Siti Rahayu',
        customerPhone: '081987654321',
        address: 'Jl. Sudirman No. 456, Jakarta',
        items: [
          { id: '1', productId: '2', productName: 'Ayam Geprek Sambal Merah', quantity: 1, price: 18000 },
          { id: '2', productId: '5', productName: 'Kentang Goreng', quantity: 1, price: 12000 },
        ],
        subtotal: 30000,
        tax: 3000,
        finalAmount: 33000,
        orderStatus: 'processing',
        paymentStatus: 'paid',
        paymentMethod: 'cash',
        createdAt: new Date(Date.now() - 7200000),
      },
      {
        id: '3',
        orderNumber: 'ORD-2024-003',
        customerName: 'Ahmad Wijaya',
        customerPhone: '082345678901',
        items: [
          { id: '1', productId: '1', productName: 'Ayam Geprek Sambal Ijo', quantity: 3, price: 18000 },
        ],
        subtotal: 54000,
        tax: 5400,
        finalAmount: 59400,
        orderStatus: 'pending',
        paymentStatus: 'paid',
        paymentMethod: 'qris',
        createdAt: new Date(Date.now() - 10800000),
      },
    ])
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      loadOrders()
      toast.success('✅ Pesanan berhasil diperbarui!')
    } catch (error) {
      toast.error('Gagal memperbarui pesanan')
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleUpdateStatus = async (orderId: string, newStatus: Order['orderStatus']) => {
    try {
      // Mock update - will be replaced with API call
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId
            ? { ...order, orderStatus: newStatus }
            : order
        )
      )
      toast.success('✅ Status pesanan berhasil diperbarui!')
    } catch (error) {
      toast.error('Gagal memperbarui status pesanan')
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

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: Order['orderStatus']) => {
    const config = {
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700' },
      processing: { label: 'Diproses', className: 'bg-blue-100 text-blue-700' },
      shipped: { label: 'Dikirim', className: 'bg-purple-100 text-purple-700' },
      completed: { label: 'Selesai', className: 'bg-green-100 text-green-700' },
      cancelled: { label: 'Dibatalkan', className: 'bg-red-100 text-red-700' },
    }
    return config[status]
  }

  const getPaymentBadge = (status: Order['paymentStatus']) => {
    const config = {
      pending: { label: 'Belum Bayar', className: 'bg-yellow-100 text-yellow-700' },
      paid: { label: 'Lunas', className: 'bg-green-100 text-green-700' },
      failed: { label: 'Gagal', className: 'bg-red-100 text-red-700' },
    }
    return config[status]
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'Baru saja'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} menit lalu`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} jam lalu`
    return `${Math.floor(hours / 24)} hari lalu`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Daftar Pesanan</h2>
          <p className="text-gray-600">Kelola dan pantau semua pesanan</p>
        </div>
        <div className="flex gap-2 flex-wrap">
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
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Memperbarui...' : 'Perbarui'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Cari pesanan..."
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
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('pending')}
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === 'processing' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('processing')}
              >
                Diproses
              </Button>
              <Button
                variant={statusFilter === 'shipped' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('shipped')}
              >
                Dikirim
              </Button>
              <Button
                variant={statusFilter === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('completed')}
              >
                Selesai
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Tidak ada pesanan ditemukan</p>
          </div>
        ) : (
          filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                          {order.customerName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{order.customerName}</h3>
                          <p className="text-sm text-gray-600">{order.orderNumber}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                        {order.customerPhone && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{order.customerPhone}</span>
                          </div>
                        )}
                        {order.address && (
                          <div className="flex items-start gap-2 text-gray-600 col-span-2">
                            <MapPin className="h-4 w-4 mt-0.5" />
                            <span>{order.address}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge className={getStatusBadge(order.orderStatus).className}>
                          {getStatusBadge(order.orderStatus).label}
                        </Badge>
                        <Badge className={getPaymentBadge(order.paymentStatus).className}>
                          {getPaymentBadge(order.paymentStatus).label}
                        </Badge>
                        <Badge className="bg-gray-100 text-gray-700">
                          {order.paymentMethod === 'qris' ? 'QRIS' : order.paymentMethod === 'cash' ? 'Tunai' : 'Transfer'}
                        </Badge>
                        <Badge className="bg-blue-50 text-blue-700">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        </Badge>
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="lg:text-right space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="text-2xl font-bold text-red-600">
                          Rp {order.finalAmount.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex flex-col lg:flex-row gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Detail
                        </Button>

                        {order.orderStatus === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(order.id, 'processing')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Proses
                          </Button>
                        )}
                        {order.orderStatus === 'processing' && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(order.id, 'shipped')}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <Truck className="h-4 w-4 mr-1" />
                            Kirim
                          </Button>
                        )}
                        {order.orderStatus === 'shipped' && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(order.id, 'completed')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Selesai
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Order Detail Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Detail Pesanan - {selectedOrder.orderNumber}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Customer Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5 text-red-600" />
                      Informasi Pelanggan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Nama</p>
                      <p className="font-semibold">{selectedOrder.customerName}</p>
                    </div>
                    {selectedOrder.customerPhone && (
                      <div>
                        <p className="text-sm text-gray-600">Telepon</p>
                        <p className="font-semibold">{selectedOrder.customerPhone}</p>
                      </div>
                    )}
                    {selectedOrder.address && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600">Alamat</p>
                        <p className="font-semibold">{selectedOrder.address}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Order Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-5 w-5 text-red-600" />
                      Item Pesanan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedOrder.items.map(item => (
                        <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-semibold">{item.productName}</p>
                            <p className="text-sm text-gray-600">Rp {item.price.toLocaleString()} × {item.quantity}</p>
                          </div>
                          <p className="font-bold text-red-600">
                            Rp {(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 space-y-2 pt-4 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-semibold">Rp {selectedOrder.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">PPN (10%)</span>
                        <span className="font-semibold">Rp {selectedOrder.tax.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2 border-t">
                        <span>Total</span>
                        <span className="text-red-600">Rp {selectedOrder.finalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Order Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5 text-red-600" />
                      Status Pesanan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getStatusBadge(selectedOrder.orderStatus).className}>
                        {getStatusBadge(selectedOrder.orderStatus).label}
                      </Badge>
                      <Badge className={getPaymentBadge(selectedOrder.paymentStatus).className}>
                        {getPaymentBadge(selectedOrder.paymentStatus).label}
                      </Badge>
                      <Badge className="bg-gray-100 text-gray-700">
                        {selectedOrder.paymentMethod === 'qris' ? 'QRIS' : selectedOrder.paymentMethod === 'cash' ? 'Tunai' : 'Transfer'}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Dibuat: {formatDate(selectedOrder.createdAt)}</p>
                      <p className="text-xs mt-1">{formatTimeAgo(selectedOrder.createdAt)}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
