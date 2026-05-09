'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Edit, Trash2, Layers, X, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
  description?: string
  icon: string
  productCount: number
  createdAt: Date
}

export function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📦'
  })

  const icons = ['📦', '🍗', '🍟', '🧃', '🍕', '🍰', '🍦', '☕', '🥤', '🍿', '🧸', '📱', '👕', '🧴', '🧊']

  const loadCategories = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/categories')
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setCategories(data.categories || [])
        } else {
          toast.error(data.error || 'Gagal memuat kategori')
        }
      } else {
        toast.error('Gagal memuat kategori')
      }
    } catch (error) {
      console.error('Error loading categories:', error)
      toast.error('Gagal memuat kategori')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAdd = () => {
    setEditingCategory(null)
    setFormData({
      name: '',
      description: '',
      icon: '📦'
    })
    setIsModalOpen(true)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini?')) return

    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setCategories(prev => prev.filter(c => c.id !== id))
          toast.success('✅ Kategori berhasil dihapus!')
        } else {
          toast.error(data.error || 'Gagal menghapus kategori')
        }
      } else {
        toast.error('Gagal menghapus kategori')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Gagal menghapus kategori')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Nama kategori wajib diisi!')
      return
    }

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          if (editingCategory) {
            setCategories(prev =>
              prev.map(c =>
                c.id === editingCategory.id ? data.category : c
              ))
          } else {
            setCategories(prev => [...prev, data.category])
          }
          toast.success(data.message || '✅ Kategori berhasil disimpan!')
        } else {
          toast.error(data.error || 'Gagal menyimpan kategori')
        }
      } else {
        toast.error('Gagal menyimpan kategori')
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error saving category:', error)
      toast.error('Gagal menyimpan kategori')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Kelola Kategori</h2>
          <p className="text-gray-600">Tambah, edit, atau hapus kategori produk</p>
        </div>
        <Button
          onClick={handleAdd}
          className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Kategori
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Cari kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p>Memuat kategori...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Layers className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Tidak ada kategori ditemukan</p>
            </div>
          ) : filteredCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg flex items-center justify-center text-3xl">
                      {category.icon}
                    </div>
                    <Badge className="bg-blue-100 text-blue-700">
                      {category.productCount} Produk
                    </Badge>
                  </div>
                </CardHeader>
                <CardTitle className="text-lg">{category.name}</CardTitle>
                <CardContent className="space-y-3">
                  {category.description && (
                    <p className="text-sm text-gray-600">{category.description}</p>
                  )}
                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(category.id)}
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

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-sm p-3">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-sm font-semibold">
              {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nama Kategori *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nama kategori"
                required
                className="h-7 text-xs px-2"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Deskripsi</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi kategori"
                rows={1}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-xs h-12"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Icon</label>
              <div className="grid grid-cols-5 gap-1">
                {icons.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon })}
                    className={`h-10 rounded-md flex items-center justify-center text-2xl transition-colors ${
                      formData.icon === icon ? 'bg-red-100 border-2 border-red-500' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-7 text-xs"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="h-2.5 w-2.5 mr-1" />
                Batal
              </Button>
              <Button
                type="submit"
                className="flex-1 h-7 text-xs bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600"
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
