'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Edit, Trash2, Users, X, Save, Mail, Phone, Calendar, ShoppingBag, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'

interface Customer {
  id: string
  name: string
  email?: string
  phone: string
  address?: string
  memberCard?: string
  totalOrders: number
  totalSpent: number
  lastOrderDate?: Date
  createdAt: Date
  isMember: boolean
}

export function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [memberFilter, setMemberFilter] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    isMember: false,
  })

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = () => {
    // Mock customers - will be replaced with API call
    setCustomers([
      {
        id: '1',
        name: 'Budi Santoso',
        email: 'budi@email.com',
        phone: '08123456789',
        address: 'Jl. Merdeka No. 10',
        memberCard: 'MEM-001',
        totalOrders: 15,
        totalSpent: 750000,
        lastOrderDate: new Date('2024-01-14'),
        createdAt: new Date('2023-06-15'),
        isMember: true,
      },
      {
        id: '2',
        name: 'Siti Rahayu',
        email: 'siti@email.com',
        phone: '08198765432',
        address: 'Jl. Sudirman No. 25',
        memberCard: 'MEM-002',
        totalOrders: 28,
        totalSpent: 1200000,
        lastOrderDate: new Date('2024-01-15'),
        createdAt: new Date('2023-05-20'),
        isMember: true,
      },
      {
        id: '3',
        name: 'Ahmad Wijaya',
        email: 'ahmad@email.com',
        phone: '08234567890',
        address: '',
        totalOrders: 5,
        totalSpent: 250000,
        lastOrderDate: new Date('2024-01-10'),
        createdAt: new Date('2023-12-01'),
        isMember: false,
      },
    ])
  }

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery) ||
      (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesMember = memberFilter === 'all' ||
      (memberFilter === 'member' && customer.isMember) ||
      (memberFilter === 'non-member' && !customer.isMember)
    return matchesSearch && matchesMember
  })

  const handleAdd = () => {
    setEditingCustomer(null)
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      isMember: false,
    })
    setIsModalOpen(true)
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setFormData({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone,
      address: customer.address || '',
      isMember: customer.isMember,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pelanggan ini?')) return

    try {
      // Mock delete - will be replaced with API call
      setCustomers(prev => prev.filter(c => c.id !== id))
      toast.success('✅ Pelanggan berhasil dihapus!')
    } catch (error) {
      toast.error('Gagal menghapus pelanggan')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.phone) {
      toast.error('Nama dan nomor telepon wajib diisi!')
      return
    }

    try {
      const customerData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        isMember: formData.isMember,
      }

      if (editingCustomer) {
        // Update existing customer
        setCustomers(prev =>
          prev.map(c =>
            c.id === editingCustomer.id
              ? { ...c, ...customerData }
              : c
          )
        )
        toast.success('✅ Pelanggan berhasil diperbarui!')
      } else {
        // Add new customer
        const newCustomer: Customer = {
          id: Date.now().toString(),
          ...customerData,
          memberCard: formData.isMember ? `MEM-${Date.now().toString().slice(-6)}` : undefined,
          totalOrders: 0,
          totalSpent: 0,
          createdAt: new Date(),
          isMember: formData.isMember,
        }
        setCustomers(prev => [...prev, newCustomer])
        toast.success('✅ Pelanggan berhasil ditambahkan!')
      }

      setIsModalOpen(false)
    } catch (error) {
      toast.error('Gagal menyimpan pelanggan')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Kelola Pelanggan</h2>
          <p className="text-gray-600">Tambah, edit, atau hapus pelanggan</p>
        </div>
        <Button
          onClick={handleAdd}
          className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Pelanggan
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
                <p className="text-xs text-gray-600">Total Pelanggan</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center text-white">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{customers.filter(c => c.isMember).length}</p>
                <p className="text-xs text-gray-600">Member Aktif</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.reduce((sum, c) => sum + c.totalOrders, 0)}
                </p>
                <p className="text-xs text-gray-600">Total Order</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center text-white">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">
                  Rp {(customers.reduce((sum, c) => sum + c.totalSpent, 0) / 1000000).toFixed(1)}M
                </p>
                <p className="text-xs text-gray-600">Total Belanja</p>
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
                placeholder="Cari nama, email, atau telepon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={memberFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMemberFilter('all')}
                className={memberFilter === 'all' ? 'bg-gradient-to-r from-red-600 to-orange-500' : ''}
              >
                Semua
              </Button>
              <Button
                variant={memberFilter === 'member' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMemberFilter('member')}
                className={memberFilter === 'member' ? 'bg-gradient-to-r from-red-600 to-orange-500' : ''}
              >
                Member
              </Button>
              <Button
                variant={memberFilter === 'non-member' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMemberFilter('non-member')}
                className={memberFilter === 'non-member' ? 'bg-gradient-to-r from-red-600 to-orange-500' : ''}
              >
                Non-Member
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      <Card>
        <CardContent className="p-0">
          <div className="space-y-1">
            <AnimatePresence mode="popLayout">
              {filteredCustomers.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-gray-500"
                >
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Tidak ada pelanggan ditemukan</p>
                </motion.div>
              ) : (
                filteredCustomers.map((customer, index) => (
                  <motion.div
                    key={customer.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 hover:bg-gray-50 transition-colors border-b last:border-b-0"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                            {customer.isMember && (
                              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs">
                                Member
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {customer.phone}
                            </span>
                            {customer.email && (
                              <span className="flex items-center gap-1 hidden sm:inline">
                                <Mail className="h-3 w-3" />
                                {customer.email}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-3 mt-2 text-sm">
                            <span className="text-gray-600">
                              <ShoppingBag className="h-3 w-3 inline mr-1" />
                              {customer.totalOrders} Order
                            </span>
                            <span className="text-red-600 font-semibold">
                              Rp {customer.totalSpent.toLocaleString()}
                            </span>
                          </div>
                          {customer.lastOrderDate && (
                            <p className="text-xs text-gray-500 mt-1">
                              Order terakhir: {new Date(customer.lastOrderDate).toLocaleDateString('id-ID')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(customer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(customer.id)}
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
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingCustomer ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Masukkan nama pelanggan"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@contoh.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon *</label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="08xxxxxxxxxx"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Masukkan alamat pelanggan"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isMember"
                checked={formData.isMember}
                onChange={(e) => setFormData({ ...formData, isMember: e.target.checked })}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <label htmlFor="isMember" className="text-sm font-medium text-gray-700">
                Jadikan sebagai Member
              </label>
            </div>
            <div className="flex gap-3 pt-4">
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
