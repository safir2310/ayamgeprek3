'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, Store, Settings as SettingsIcon, ArrowLeft, Clock, DollarSign, CreditCard, Gift, Bell, Database, Moon, Sun, Globe, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { useStore } from '@/store/useStore'

interface BusinessHours {
  [day: string]: { open: string; close: string; isOpen: boolean }
}

interface AdminSettings {
  id?: string
  storeName: string
  storeDescription?: string
  storeAddress?: string
  storePhone?: string
  storeEmail?: string
  businessHours?: BusinessHours
  taxRate: number
  currency: string
  pointMultiplier: number
  redemptionMultiplier: number
  defaultPaymentMethods: string[]
  enableLoyaltyProgram: boolean
  loyaltyPointsPerRp: number
  minOrderForPoints: number
  autoApprovePayments: boolean
  sendNotifications: boolean
  backupEnabled: boolean
  theme: string
  language: string
  updatedAt?: string
}

export function AdminSettings({ onBack }: { onBack?: () => void }) {
  const { token } = useStore()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [activeTab, setActiveTab] = useState<'store' | 'payments' | 'loyalty' | 'notifications' | 'appearance'>('store')
  const [settings, setSettings] = useState<AdminSettings>({
    storeName: '',
    taxRate: 0.11,
    currency: 'IDR',
    pointMultiplier: 1.0,
    redemptionMultiplier: 1.0,
    defaultPaymentMethods: ['QRIS', 'Cash', 'COD'],
    enableLoyaltyProgram: true,
    loyaltyPointsPerRp: 100,
    minOrderForPoints: 10000,
    autoApprovePayments: false,
    sendNotifications: true,
    backupEnabled: true,
    theme: 'light',
    language: 'id',
  })

  const loadSettings = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/settings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setSettings(data.settings)
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Gagal memuat pengaturan')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          toast.success('✅ Pengaturan berhasil disimpan!')
          setHasChanges(false)
          loadSettings()
        } else {
          toast.error(data.error || 'Gagal menyimpan pengaturan')
        }
      } else {
        toast.error('Gagal menyimpan pengaturan')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Gagal menyimpan pengaturan')
    } finally {
      setIsSaving(false)
    }
  }

  const handleBusinessHoursChange = (day: string, field: 'open' | 'close' | 'isOpen', value: string | boolean) => {
    const newBusinessHours = {
      ...settings.businessHours,
      [day]: {
        ...settings.businessHours?.[day],
        [field]: value,
      },
    }
    setSettings({ ...settings, businessHours: newBusinessHours })
    setHasChanges(true)
  }

  const togglePaymentMethod = (method: string) => {
    const newMethods = settings.defaultPaymentMethods.includes(method)
      ? settings.defaultPaymentMethods.filter((m) => m !== method)
      : [...settings.defaultPaymentMethods, method]
    setSettings({ ...settings, defaultPaymentMethods: newMethods })
    setHasChanges(true)
  }

  useEffect(() => {
    loadSettings()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-300">Memuat pengaturan...</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'store', label: 'Toko', icon: Store },
    { id: 'payments', label: 'Pembayaran', icon: CreditCard },
    { id: 'loyalty', label: 'Loyalty', icon: Gift },
    { id: 'notifications', label: 'Notifikasi', icon: Bell },
    { id: 'appearance', label: 'Tampilan', icon: settings.theme === 'dark' ? Moon : Sun },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Pengaturan Admin</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Konfigurasi toko dan sistem</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {hasChanges && (
            <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">
              Ada perubahan yang belum disimpan
            </span>
          )}
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Simpan Pengaturan
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-2 border border-slate-100 dark:border-slate-700">
        <div className="flex space-x-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                <span className="font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Store Settings */}
          {activeTab === 'store' && (
            <Card className="border border-slate-100 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Store className="w-5 h-5 mr-2 text-violet-600" />
                  Informasi Toko
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="storeName">Nama Toko</Label>
                    <Input
                      id="storeName"
                      value={settings.storeName}
                      onChange={(e) => {
                        setSettings({ ...settings, storeName: e.target.value })
                        setHasChanges(true)
                      }}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="storeEmail">Email Toko</Label>
                    <Input
                      id="storeEmail"
                      type="email"
                      value={settings.storeEmail || ''}
                      onChange={(e) => {
                        setSettings({ ...settings, storeEmail: e.target.value })
                        setHasChanges(true)
                      }}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="storePhone">Telepon Toko</Label>
                    <Input
                      id="storePhone"
                      type="tel"
                      value={settings.storePhone || ''}
                      onChange={(e) => {
                        setSettings({ ...settings, storePhone: e.target.value })
                        setHasChanges(true)
                      }}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Mata Uang</Label>
                    <Input
                      id="currency"
                      value={settings.currency}
                      onChange={(e) => {
                        setSettings({ ...settings, currency: e.target.value })
                        setHasChanges(true)
                      }}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="storeDescription">Deskripsi Toko</Label>
                  <textarea
                    id="storeDescription"
                    value={settings.storeDescription || ''}
                    onChange={(e) => {
                      setSettings({ ...settings, storeDescription: e.target.value })
                      setHasChanges(true)
                    }}
                    className="mt-2 w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="storeAddress">Alamat Toko</Label>
                  <textarea
                    id="storeAddress"
                    value={settings.storeAddress || ''}
                    onChange={(e) => {
                      setSettings({ ...settings, storeAddress: e.target.value })
                      setHasChanges(true)
                    }}
                    className="mt-2 w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                <div>
                  <Label className="flex items-center mb-4">
                    <Clock className="w-5 h-5 mr-2 text-violet-600" />
                    Jam Operasional
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                      <div key={day} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium text-slate-800 dark:text-white capitalize">
                            {day === 'monday' ? 'Senin' :
                             day === 'tuesday' ? 'Selasa' :
                             day === 'wednesday' ? 'Rabu' :
                             day === 'thursday' ? 'Kamis' :
                             day === 'friday' ? 'Jumat' :
                             day === 'saturday' ? 'Sabtu' : 'Minggu'}
                          </span>
                          <Switch
                            checked={settings.businessHours?.[day]?.isOpen || false}
                            onCheckedChange={(checked) => handleBusinessHoursChange(day, 'isOpen', checked)}
                          />
                        </div>
                        {settings.businessHours?.[day]?.isOpen && (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor={`${day}-open`} className="text-sm text-slate-600 dark:text-slate-400">Buka</Label>
                              <Input
                                id={`${day}-open`}
                                type="time"
                                value={settings.businessHours?.[day]?.open || '08:00'}
                                onChange={(e) => handleBusinessHoursChange(day, 'open', e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`${day}-close`} className="text-sm text-slate-600 dark:text-slate-400">Tutup</Label>
                              <Input
                                id={`${day}-close`}
                                type="time"
                                value={settings.businessHours?.[day]?.close || '22:00'}
                                onChange={(e) => handleBusinessHoursChange(day, 'close', e.target.value)}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Settings */}
          {activeTab === 'payments' && (
            <Card className="border border-slate-100 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-violet-600" />
                  Pengaturan Pembayaran
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="taxRate">Pajak (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.01"
                    value={settings.taxRate * 100}
                    onChange={(e) => {
                      setSettings({ ...settings, taxRate: parseFloat(e.target.value) / 100 })
                      setHasChanges(true)
                    }}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Metode Pembayaran Default</Label>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {['QRIS', 'Cash', 'COD', 'Transfer'].map((method) => (
                      <button
                        key={method}
                        onClick={() => togglePaymentMethod(method)}
                        className={`px-4 py-2 rounded-xl border-2 transition-all ${
                          settings.defaultPaymentMethods.includes(method)
                            ? 'border-violet-600 bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300'
                            : 'border-slate-200 dark:border-slate-700 hover:border-violet-400'
                        }`}
                      >
                        <span className="font-medium">{method}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div>
                    <Label className="text-slate-800 dark:text-white">Otomatis Approve Pembayaran</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Pembayaran akan otomatis disetujui
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoApprovePayments}
                    onCheckedChange={(checked) => {
                      setSettings({ ...settings, autoApprovePayments: checked })
                      setHasChanges(true)
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loyalty Settings */}
          {activeTab === 'loyalty' && (
            <Card className="border border-slate-100 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gift className="w-5 h-5 mr-2 text-violet-600" />
                  Program Loyalty
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950 rounded-xl">
                  <div>
                    <Label className="text-slate-800 dark:text-white">Aktifkan Program Loyalty</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Pelanggan bisa mengumpulkan dan menukarkan poin
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableLoyaltyProgram}
                    onCheckedChange={(checked) => {
                      setSettings({ ...settings, enableLoyaltyProgram: checked })
                      setHasChanges(true)
                    }}
                  />
                </div>

                {settings.enableLoyaltyProgram && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="loyaltyPointsPerRp">Poin per Rp</Label>
                        <div className="flex items-center mt-2 space-x-2">
                          <DollarSign className="w-5 h-5 text-slate-400" />
                          <Input
                            id="loyaltyPointsPerRp"
                            type="number"
                            value={settings.loyaltyPointsPerRp}
                            onChange={(e) => {
                              setSettings({ ...settings, loyaltyPointsPerRp: parseInt(e.target.value) })
                              setHasChanges(true)
                            }}
                            className="flex-1"
                          />
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          Poin yang didapat pelanggan per Rp belanja
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="minOrderForPoints">Minimum Order untuk Poin</Label>
                        <div className="flex items-center mt-2 space-x-2">
                          <DollarSign className="w-5 h-5 text-slate-400" />
                          <Input
                            id="minOrderForPoints"
                            type="number"
                            value={settings.minOrderForPoints}
                            onChange={(e) => {
                              setSettings({ ...settings, minOrderForPoints: parseInt(e.target.value) })
                              setHasChanges(true)
                            }}
                            className="flex-1"
                          />
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          Minimum order untuk mendapatkan poin
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="pointMultiplier">Multiplier Poin Earn</Label>
                        <Input
                          id="pointMultiplier"
                          type="number"
                          step="0.1"
                          value={settings.pointMultiplier}
                          onChange={(e) => {
                            setSettings({ ...settings, pointMultiplier: parseFloat(e.target.value) })
                            setHasChanges(true)
                          }}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="redemptionMultiplier">Multiplier Poin Redeem</Label>
                        <Input
                          id="redemptionMultiplier"
                          type="number"
                          step="0.1"
                          value={settings.redemptionMultiplier}
                          onChange={(e) => {
                            setSettings({ ...settings, redemptionMultiplier: parseFloat(e.target.value) })
                            setHasChanges(true)
                          }}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <Card className="border border-slate-100 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-violet-600" />
                  Notifikasi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div>
                    <Label className="text-slate-800 dark:text-white">Kirim Notifikasi</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Aktifkan notifikasi untuk pelanggan
                    </p>
                  </div>
                  <Switch
                    checked={settings.sendNotifications}
                    onCheckedChange={(checked) => {
                      setSettings({ ...settings, sendNotifications: checked })
                      setHasChanges(true)
                    }}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div>
                    <Label className="text-slate-800 dark:text-white">Backup Otomatis</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Backup data secara otomatis
                    </p>
                  </div>
                  <Switch
                    checked={settings.backupEnabled}
                    onCheckedChange={(checked) => {
                      setSettings({ ...settings, backupEnabled: checked })
                      setHasChanges(true)
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <Card className="border border-slate-100 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <SettingsIcon className="w-5 h-5 mr-2 text-violet-600" />
                  Tampilan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Tema</Label>
                  <div className="mt-3 flex space-x-3">
                    {['light', 'dark', 'auto'].map((theme) => (
                      <button
                        key={theme}
                        onClick={() => {
                          setSettings({ ...settings, theme })
                          setHasChanges(true)
                        }}
                        className={`flex items-center px-4 py-3 rounded-xl border-2 transition-all ${
                          settings.theme === theme
                            ? 'border-violet-600 bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300'
                            : 'border-slate-200 dark:border-slate-700 hover:border-violet-400'
                        }`}
                      >
                        {theme === 'light' && <Sun className="w-5 h-5 mr-2" />}
                        {theme === 'dark' && <Moon className="w-5 h-5 mr-2" />}
                        {theme === 'auto' && <Globe className="w-5 h-5 mr-2" />}
                        <span className="font-medium capitalize">{theme}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="language">Bahasa</Label>
                  <select
                    id="language"
                    value={settings.language}
                    onChange={(e) => {
                      setSettings({ ...settings, language: e.target.value })
                      setHasChanges(true)
                    }}
                    className="mt-2 w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  >
                    <option value="id">Bahasa Indonesia</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
