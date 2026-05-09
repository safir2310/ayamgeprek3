'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Calendar, Download, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'

interface DailySale {
  date: string
  revenue: number
  orders: number
}

interface ProductSale {
  name: string
  quantity: number
  revenue: number
}

interface CategorySale {
  category: string
  revenue: number
  percentage: number
}

export function SalesReports() {
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [dailySales, setDailySales] = useState<DailySale[]>([])
  const [topProducts, setTopProducts] = useState<ProductSale[]>([])
  const [categorySales, setCategorySales] = useState<CategorySale[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/sales-reports?period=${selectedPeriod}`)
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setDailySales(data.dailySales || [])
          setTopProducts(data.topProducts || [])
          setCategorySales(data.categorySales || [])
        } else {
          toast({
            title: data.error || 'Gagal mengambil data laporan',
            variant: 'destructive',
          })
        }
      } else {
        toast({
          title: 'Gagal mengambil data laporan',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error loading sales reports:', error)
      toast({
        title: 'Gagal mengambil data laporan',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedPeriod])

  const totalRevenue = dailySales.reduce((sum, day) => sum + day.revenue, 0)
  const totalOrders = dailySales.reduce((sum, day) => sum + day.orders, 0)
  const avgRevenue = dailySales.length > 0 ? Math.round(totalRevenue / dailySales.length) : 0
  const avgOrders = dailySales.length > 0 ? Math.round(totalOrders / dailySales.length) : 0

  const maxRevenue = dailySales.length > 0 ? Math.max(...dailySales.map(d => d.revenue)) : 0
  const maxOrders = dailySales.length > 0 ? Math.max(...dailySales.map(d => d.orders)) : 0

  const periodLabel = {
    week: '7 Hari Terakhir',
    month: '30 Hari Terakhir',
    quarter: '90 Hari Terakhir'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Laporan Penjualan</h2>
          <p className="text-gray-600">Analisis dan ringkasan performa penjualan</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Period Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Periode:</span>
            </div>
            <div className="flex gap-2">
              {(['week', 'month', 'quarter'] as const).map(period => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod(period)}
                  className={
                    selectedPeriod === period
                      ? 'bg-gradient-to-r from-red-600 to-orange-500'
                      : ''
                  }
                >
                  {period === 'week' ? '7 Hari' : period === 'month' ? '30 Hari' : '90 Hari'}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              {periodLabel[selectedPeriod as keyof typeof periodLabel]}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white">
                  <DollarSign className="h-5 w-5" />
                </div>
                <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +12.5%
                </Badge>
              </div>
              <p className="text-2xl font-bold text-gray-900">Rp {(totalRevenue / 1000000).toFixed(1)}M</p>
              <p className="text-sm text-gray-600">Total Pendapatan</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +8.3%
                </Badge>
              </div>
              <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
              <p className="text-sm text-gray-600">Total Pesanan</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <Badge className="bg-yellow-100 text-yellow-700 flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" />
                  -2.1%
                </Badge>
              </div>
              <p className="text-2xl font-bold text-gray-900">Rp {avgRevenue.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Rata-rata Harian</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +5.7%
                </Badge>
              </div>
              <p className="text-2xl font-bold text-gray-900">{avgOrders}</p>
              <p className="text-sm text-gray-600">Rata-rata Order</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-red-600" />
            Grafik Pendapatan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-end gap-2 h-48">
              {dailySales.map((day, index) => {
                const height = day.revenue > 0 ? (day.revenue / maxRevenue) * 100 : 0
                return (
                  <motion.div
                    key={index}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: index * 0.05 }}
                    className="flex-1 flex flex-col items-center gap-1 group relative"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      Rp {day.revenue.toLocaleString()}
                    </div>
                    <div className="w-full bg-gradient-to-t from-red-600 to-orange-500 rounded-t-sm hover:from-red-500 hover:to-orange-400 transition-colors relative" style={{ height: `${height}%` }}>
                      {day.orders > 20 && (
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 text-white text-xs font-bold">
                          {day.orders}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
            <div className="flex items-end gap-2 overflow-x-auto">
              {dailySales.map((day, index) => (
                <div key={index} className="flex-shrink-0 text-xs text-gray-600" style={{ width: `${100 / dailySales.length}%` }}>
                  {day.date}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-red-600" />
              Produk Terlaris
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                  <p>Memuat data...</p>
                </div>
              ) : topProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Tidak ada data penjualan</p>
                </div>
              ) : topProducts.map((product, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-red-600">#{index + 1}</span>
                        <h4 className="font-semibold truncate">{product.name}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {product.quantity} terjual • Rp {product.revenue.toLocaleString()}
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-700">
                      Top {index + 1}
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(product.revenue / (topProducts[0]?.revenue || 1)) * 100}%` }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                      className="bg-gradient-to-r from-red-600 to-orange-500 h-full rounded-full"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-red-600" />
              Distribusi Kategori
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                  <p>Memuat data...</p>
                </div>
              ) : categorySales.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Tidak ada data penjualan</p>
                </div>
              ) : categorySales.map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold">{category.category}</h4>
                      <p className="text-sm text-gray-600">Rp {category.revenue.toLocaleString()}</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700">
                      {category.percentage}%
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${category.percentage}%` }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                      className={`h-full rounded-full ${
                        index === 0
                          ? 'bg-gradient-to-r from-red-600 to-orange-500'
                          : index === 1
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-500'
                          : 'bg-gradient-to-r from-green-600 to-teal-500'
                      }`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
