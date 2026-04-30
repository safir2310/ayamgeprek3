'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Edit, Trash2, Package, X, Save, Upload, X as XIcon, Image as ImageIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  category: string
  description?: string
  image?: string
  createdAt: Date
}

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: 'makanan',
    description: '',
    image: ''
  })

  const categories = ['all', 'makanan', 'minuman', 'snack', 'lainnya']

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = () => {
    // Mock products - will be replaced with API call
    setProducts([
      {
        id: '1',
        name: 'Ayam Geprek Sambal Ijo',
        price: 18000,
        stock: 50,
        category: 'makanan',
        description: 'Ayam geprek dengan sambal ijo pedas',
        image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23fee2e2" width="100" height="100"/%3E%3Ctext x="50" y="55" font-size="40" text-anchor="middle"%3E🍗%3C/text%3E%3C/svg%3E',
        createdAt: new Date()
      },
      {
        id: '2',
        name: 'Es Teh Manis',
        price: 5000,
        stock: 100,
        category: 'minuman',
        description: 'Es teh manis segar',
        image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23dbeafe" width="100" height="100"/%3E%3Ctext x="50" y="55" font-size="40" text-anchor="middle"%3E🧃%3C/text%3E%3C/svg%3E',
        createdAt: new Date()
      },
      {
        id: '3',
        name: 'Keripik Singkong',
        price: 8000,
        stock: 35,
        category: 'snack',
        description: 'Keripik singkong renyah dengan bumbu gurih',
        image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23fef3c7" width="100" height="100"/%3E%3Ctext x="50" y="55" font-size="40" text-anchor="middle"%3E🍟%3C/text%3E%3C/svg%3E',
        createdAt: new Date()
      },
    ])
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleAdd = () => {
    setEditingProduct(null)
    setImagePreview(null)
    setSelectedFile(null)
    setFormData({
      name: '',
      price: '',
      stock: '',
      category: 'makanan',
      description: '',
      image: ''
    })
    setIsModalOpen(true)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setImagePreview(product.image || null)
    setSelectedFile(null)
    setFormData({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category,
      description: product.description || '',
      image: product.image || ''
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return

    try {
      // Mock delete - will be replaced with API call
      setProducts(prev => prev.filter(p => p.id !== id))
      toast.success('✅ Produk berhasil dihapus!')
    } catch (error) {
      toast.error('Gagal menghapus produk')
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Ukuran gambar maksimal 2MB')
        return
      }
      
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
        setFormData({ ...formData, image: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImagePreview(null)
    setSelectedFile(null)
    setFormData({ ...formData, image: '' })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.price || !formData.stock) {
      toast.error('Mohon lengkapi semua data yang diperlukan!')
      return
    }

    try {
      const productData = {
        name: formData.name.trim(),
        price: parseInt(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category,
        description: formData.description.trim(),
        image: imagePreview || ''
      }

      if (editingProduct) {
        // Update existing product
        setProducts(prev =>
          prev.map(p =>
            p.id === editingProduct.id
              ? { ...p, ...productData }
              : p
          )
        )
        toast.success('✅ Produk berhasil diperbarui!')
      } else {
        // Add new product
        const newProduct: Product = {
          id: Date.now().toString(),
          ...productData,
          createdAt: new Date()
        }
        setProducts(prev => [...prev, newProduct])
        toast.success('✅ Produk berhasil ditambahkan!')
      }

      setIsModalOpen(false)
      setImagePreview(null)
      setSelectedFile(null)
    } catch (error) {
      toast.error('Gagal menyimpan produk')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Kelola Produk</h2>
          <p className="text-gray-600">Tambah, edit, atau hapus produk</p>
        </div>
        <Button
          onClick={handleAdd}
          className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Produk
        </Button>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-red-600 to-orange-500'
                      : ''
                  }
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg overflow-hidden flex items-center justify-center">
                      {product.image ? (
                        product.image.startsWith('data:') ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-4xl">{product.image}</span>
                        )
                      ) : (
                        <Package className="h-8 w-8 text-red-600" />
                      )}
                    </div>
                    <Badge
                      className={
                        product.stock > 20
                          ? 'bg-green-100 text-green-700'
                          : product.stock > 0
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }
                    >
                      {product.stock > 20 ? 'Tersedia' : product.stock > 0 ? 'Menipis' : 'Habis'}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {product.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-red-600">
                        Rp {product.price.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Stok: {product.stock}</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700">
                      {product.category}
                    </Badge>
                  </div>
                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(product.id)}
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

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>Tidak ada produk ditemukan</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xs p-3">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-base font-semibold">
              {editingProduct ? 'Edit Produk' : 'Tambah Produk'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Nama Produk *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Masukkan nama produk"
                required
                className="h-8 text-xs px-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">Harga (Rp) *</label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0"
                  required
                  min="0"
                  className="h-8 text-xs px-2"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">Stok *</label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="0"
                  required
                  min="0"
                  className="h-8 text-xs px-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Kategori *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent text-xs h-8"
                required
              >
                <option value="makanan">Makanan</option>
                <option value="minuman">Minuman</option>
                <option value="snack">Snack</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Deskripsi</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi produk"
                rows={1}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-xs h-12"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Gambar Produk</label>
              <div className="space-y-1">
                {imagePreview ? (
                  <div className="relative w-full h-20 rounded-md overflow-hidden border border-gray-200">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-20 border border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Upload className="h-4 w-4 text-gray-400 mb-0.5" />
                    <p className="text-[10px] text-gray-600">Upload</p>
                    <p className="text-[10px] text-gray-400">Max 2MB</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {selectedFile && (
                  <p className="text-xs text-gray-500">File: {selectedFile.name}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
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
