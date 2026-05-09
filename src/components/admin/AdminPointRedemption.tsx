'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Edit,
  Trash2,
  Gift,
  Save,
  Check,
  X,
  Star,
  Tag,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useStore } from '@/store/useStore'

interface PointRedemption {
  id: string
  name: string
  description: string
  pointsRequired: number
  active: boolean
  order: number
}

export function AdminPointRedemption() {
  const [redemptions, setRedemptions] = useState<PointRedemption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [editingRedemption, setEditingRedemption] = useState<PointRedemption | null>(null)

  const { token, user } = useStore()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pointsRequired: 0,
    active: true,
    order: 0,
  })

  useEffect(() => {
    loadRedemptions()
  }, [])

  const loadRedemptions = async () => {
    if (!token) {
      toast.error('Anda belum login. Silakan login terlebih dahulu.')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/point-redemption', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.ok) {
        const data = await res.json()
        setRedemptions(data.redemptions || [])
      } else {
        const errorData = await res.json()
        toast.error(errorData.error || 'Gagal mengambil data tukar poin')
      }
    } catch (error) {
      console.error('Error loading redemptions:', error)
      toast.error('Gagal mengambil data tukar poin')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingRedemption(null)
    setFormData({
      name: '',
      description: '',
      pointsRequired: 0,
      active: true,
      order: redemptions.length,
    })
    setShowDialog(true)
  }

  const handleEdit = (redemption: PointRedemption) => {
    setEditingRedemption(redemption)
    setFormData({
      name: redemption.name,
      description: redemption.description,
      pointsRequired: redemption.pointsRequired,
      active: redemption.active,
      order: redemption.order,
    })
    setShowDialog(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus "${name}"?`)) {
      return
    }

    if (!token) {
      toast.error('Anda belum login. Silakan login terlebih dahulu.')
      return
    }

    try {
      const res = await fetch(`/api/admin/point-redemption?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.ok) {
        toast.success('Berhasil dihapus')
        loadRedemptions()
      } else {
        const errorData = await res.json()
        toast.error(errorData.error || 'Gagal menghapus')
      }
    } catch (error) {
      console.error('Error deleting redemption:', error)
      toast.error('Gagal menghapus')
    }
  }

  const handleToggleActive = async (redemption: PointRedemption) => {
    if (!token) {
      toast.error('Anda belum login. Silakan login terlebih dahulu.')
      return
    }

    try {
      const res = await fetch('/api/admin/point-redemption', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: redemption.id,
          active: !redemption.active,
        }),
      })

      if (res.ok) {
        toast.success(redemption.active ? 'Dinonaktifkan' : 'Diaktifkan')
        loadRedemptions()
      } else {
        const errorData = await res.json()
        toast.error(errorData.error || 'Gagal mengubah status')
      }
    } catch (error) {
      console.error('Error toggling active:', error)
      toast.error('Gagal mengubah status')
    }
  }

  const handleSave = async () => {
    if (!token) {
      toast.error('Anda belum login. Silakan login terlebih dahulu.')
      return
    }

    if (!formData.name.trim()) {
      toast.error('Nama wajib diisi')
      return
    }
    if (!formData.description.trim()) {
      toast.error('Deskripsi wajib diisi')
      return
    }
    if (formData.pointsRequired <= 0) {
      toast.error('Poin harus lebih dari 0')
      return
    }

    setIsSaving(true)
    try {
      const method = editingRedemption ? 'PUT' : 'POST'
      const body = editingRedemption ? { ...formData, id: editingRedemption.id } : formData

      const res = await fetch('/api/admin/point-redemption', {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        toast.success(editingRedemption ? 'Berhasil diupdate' : 'Berhasil ditambah')
        setShowDialog(false)
        loadRedemptions()
      } else {
        const errorData = await res.json()
        toast.error(errorData.error || 'Gagal menyimpan')
      }
    } catch (error) {
      console.error('Error saving redemption:', error)
      toast.error('Gagal menyimpan')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Kelola Tukar Poin</h2>
        <p className="text-gray-600">Atur opsi penukaran poin untuk pelanggan</p>
      </div>

      {/* Add Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleAdd}
          className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Opsi Baru
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Gift className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Opsi</p>
                <p className="text-2xl font-bold text-gray-900">{redemptions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Aktif</p>
                <p className="text-2xl font-bold text-gray-900">
                  {redemptions.filter((r) => r.active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <X className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Nonaktif</p>
                <p className="text-2xl font-bold text-gray-900">
                  {redemptions.filter((r) => !r.active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Redemptions List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
        </div>
      ) : redemptions.length === 0 ? (
        <Card className="p-12 text-center">
          <Gift className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">Belum ada opsi tukar poin</p>
          <Button
            onClick={handleAdd}
            className="mt-4 bg-gradient-to-r from-red-600 to-orange-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Opsi Pertama
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {redemptions.map((redemption, index) => (
            <motion.div
              key={redemption.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white border rounded-xl overflow-hidden hover:shadow-xl transition-all ${
                redemption.active ? 'border-green-200' : 'border-gray-200 opacity-75'
              }`}
            >
              <div className="relative p-6">
                {redemption.active ? (
                  <Badge className="absolute top-4 right-4 bg-green-500">Aktif</Badge>
                ) : (
                  <Badge className="absolute top-4 right-4 bg-gray-400">Nonaktif</Badge>
                )}

                <div className="absolute top-4 left-4 bg-gradient-to-r from-red-600 to-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {redemption.pointsRequired} Poin
                </div>

                <div className="flex items-center justify-center mb-4 mt-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl flex items-center justify-center text-4xl">
                    🎁
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-lg text-gray-800">{redemption.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {redemption.description}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-4 border-t border-gray-100 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(redemption)}
                    className="flex-1"
                  >
                    {redemption.active ? 'Nonaktifkan' : 'Aktifkan'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(redemption)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(redemption.id, redemption.name)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingRedemption ? 'Edit Opsi Tukar Poin' : 'Tambah Opsi Tukar Poin Baru'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nama Opsi *</label>
              <Input
                placeholder="Contoh: Voucher Gratis"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Deskripsi *</label>
              <Textarea
                placeholder="Deskripsi detail tentang opsi tukar poin ini"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Poin yang Dibutuhkan *</label>
              <Input
                type="number"
                min="1"
                placeholder="Contoh: 100"
                value={formData.pointsRequired}
                onChange={(e) => setFormData({ ...formData, pointsRequired: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Urutan Tampilan</label>
              <Input
                type="number"
                min="0"
                placeholder="Contoh: 0"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-gray-500 mt-1">
                Angka lebih kecil akan ditampilkan lebih dulu
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
              />
              <label htmlFor="active" className="text-sm font-medium">
                Aktif (Tampilkan di halaman tukar poin pelanggan)
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600"
            >
              {isSaving ? (
                'Menyimpan...'
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {editingRedemption ? 'Update' : 'Simpan'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
