'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store/useStore'
import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Package,
  Users,
  CreditCard,
  TrendingUp,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  LogOut,
  Store,
  BarChart3,
  RefreshCw,
  Database,
  Clock,
  DollarSign,
  Menu,
  X,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Tag,
  Gift,
  Percent,
  Layers,
  CheckSquare,
  MessageCircle,
  ArrowLeft,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { POS } from '@/components/admin/POS'
import { ProductManagement } from '@/components/admin/ProductManagement'
import { OrderManagement } from '@/components/admin/OrderManagement'
import { CustomerManagement } from '@/components/admin/CustomerManagement'
import { SalesReports } from '@/components/admin/SalesReports'
import { CategoryManagement } from '@/components/admin/CategoryManagement'
import { VoucherManagement } from '@/components/admin/VoucherManagement'
import { PointVoucherManagement } from '@/components/admin/PointVoucherManagement'
import { PromoManagement } from '@/components/admin/PromoManagement'
import { PaymentConfirmation } from '@/components/admin/PaymentConfirmation'
import { ChatManagement } from '@/components/admin/ChatManagement'
import { PointRedemptionManagement } from '@/components/admin/PointRedemptionManagement'

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  salesChange: number;
  ordersChange: number;
  customersChange: number;
}

interface RecentOrder {
  id: string;
  customerName: string;
  items: number;
  total: number;
  status: 'completed' | 'pending' | 'cancelled';
  date: string;
}

interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  image: string;
}

const AdminDashboard: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [activePage, setActivePage] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    salesChange: 0,
    ordersChange: 0,
    customersChange: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [isMobileAdminMode, setIsMobileAdminMode] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [tapTimeout, setTapTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  // Handle triple-tap on mobile logo to access admin
  const handleLogoTap = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Only check for mobile
    if (window.innerWidth >= 768) {
      setIsMobileAdminMode(true);
      return;
    }

    const newTapCount = tapCount + 1;
    setTapCount(newTapCount);

    // Clear existing timeout
    if (tapTimeout) {
      clearTimeout(tapTimeout);
    }

    // Check if triple-tap within 1 second
    const timeout = setTimeout(() => {
      if (newTapCount >= 3) {
        setIsMobileAdminMode(true);
        setTapCount(0);
        toast.success('🔓 Admin panel terbuka!');
      } else {
        setTapCount(0);
      }
    }, 1000);

    setTapTimeout(timeout);
  }, [tapCount, tapTimeout]);

  // Handle mobile close/back
  const handleMobileClose = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      setIsMobileAdminMode(false);
    }
  }, [onBack]);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch dashboard stats from database
      const res = await fetch('/api/admin/stats');

      if (res.ok) {
        const data = await res.json();

        // Calculate percentage changes (mock comparison for now)
        const previousMonthSales = data.data.totalRevenue * 0.9;
        const previousMonthOrders = data.data.totalOrders * 0.9;
        const previousMonthCustomers = data.data.totalUsers * 0.9;

        const salesChange = previousMonthSales > 0
          ? ((data.data.totalRevenue - previousMonthSales) / previousMonthSales) * 100
          : 12.5;
        const ordersChange = previousMonthOrders > 0
          ? ((data.data.totalOrders - previousMonthOrders) / previousMonthOrders) * 100
          : 8.2;
        const customersChange = previousMonthCustomers > 0
          ? ((data.data.totalUsers - previousMonthCustomers) / previousMonthCustomers) * 100
          : 15.3;

        setStats({
          totalSales: data.data.totalRevenue,
          totalOrders: data.data.totalOrders,
          totalCustomers: data.data.totalUsers,
          averageOrderValue: data.data.totalOrders > 0 ? data.data.totalRevenue / data.data.totalOrders : 0,
          salesChange: parseFloat(salesChange.toFixed(1)),
          ordersChange: parseFloat(ordersChange.toFixed(1)),
          customersChange: parseFloat(customersChange.toFixed(1)),
        });
      } else {
        throw new Error('Failed to fetch dashboard data');
      }

      // Fetch recent orders
      const ordersRes = await fetch('/api/orders');
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        const recentOrdersData = (ordersData.orders || []).slice(0, 5).map((order: any) => ({
          id: order.id,
          customerName: order.customerName || 'Guest',
          items: order.items?.length || 0,
          total: order.finalAmount || order.totalAmount,
          status: order.orderStatus || 'pending',
          date: new Date(order.createdAt).toLocaleString(),
        }));
        setRecentOrders(recentOrdersData);
      }

      // Fetch top products
      const productsRes = await fetch('/api/products');
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        const topProductsData = (productsData.products || [])
          .sort((a: any, b: any) => (b.soldCount || 0) - (a.soldCount || 0))
          .slice(0, 4)
          .map((product: any) => ({
            id: product.id,
            name: product.name,
            sales: product.soldCount || 0,
            revenue: (product.soldCount || 0) * product.price,
            image: product.image || '/api/placeholder/100/100',
          }));
        setTopProducts(topProductsData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Gagal memuat data dashboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDatabaseSync = useCallback(async () => {
    setIsSyncing(true);
    setSyncStatus('syncing');

    try {
      const res = await fetch('/api/admin/sync');

      if (res.ok) {
        const data = await res.json();

        if (data.success) {
          setSyncStatus('success');
          await loadDashboardData();
          setTimeout(() => setSyncStatus('idle'), 3000);
          toast.success('✅ Database berhasil disinkronisasi!');
        } else {
          throw new Error(data.error || 'Sync failed');
        }
      } else {
        throw new Error('Failed to sync database');
      }
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
      toast.error('Gagal menyinkronisasi database');
    } finally {
      setIsSyncing(false);
    }
  }, [loadDashboardData]);

  // Auto-enable mobile mode when accessed from main page
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsMobileAdminMode(true);
    }
  }, []);

  // Check URL parameter for admin access
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
      setIsMobileAdminMode(true);
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (tapTimeout) {
        clearTimeout(tapTimeout);
      }
    };
  }, [tapTimeout]);

  // Load dashboard data
  useEffect(() => {
    if (!showAdminDashboard) return;
    loadDashboardData();
  }, [showAdminDashboard, loadDashboardData]);

  // Early return for POS page
  if (activePage === 'pos') {
    return (
      <div className="w-full">
        <POS onClose={() => setActivePage('dashboard')} />
      </div>
    );
  }

  const sidebarItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'pos', icon: ShoppingCart, label: 'POS System' },
    { id: 'products', icon: Package, label: 'Products' },
    { id: 'categories', icon: Layers, label: 'Categories' },
    { id: 'vouchers', icon: Percent, label: 'Voucher Diskon' },
    { id: 'point-redemptions', icon: Gift, label: 'Tukar Poin' },
    { id: 'point-vouchers', icon: Gift, label: 'Voucher Poin' },
    { id: 'promo', icon: Tag, label: 'Promo' },
    { id: 'orders', icon: ShoppingBag, label: 'Orders' },
    { id: 'payments', icon: CheckSquare, label: 'Payment Confirmation' },
    { id: 'customers', icon: Users, label: 'Customers' },
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'reports', icon: TrendingUp, label: 'Reports' },
    { id: 'database', icon: Database, label: 'Database' },
  ];

  const quickActions = [
    { id: 'pos', icon: ShoppingCart, label: 'New Sale', color: 'bg-blue-500' },
    { id: 'products', icon: Package, label: 'Add Product', color: 'bg-green-500' },
    { id: 'orders', icon: ShoppingCart, label: 'View Orders', color: 'bg-purple-500' },
    { id: 'customers', icon: Users, label: 'Add Customer', color: 'bg-orange-500' },
  ];

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <>
      <div className="flex min-h-screen bg-gray-50 flex">
        {/* Mobile Hamburger Button - Always Visible on Mobile */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="md:hidden fixed top-4 left-4 z-50 bg-white shadow-lg rounded-full p-3 hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          {isSidebarOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
        </button>

        {/* Mobile Close Button for Back Navigation */}
        {isMobileAdminMode && !isSidebarOpen && (
          <button
            onClick={handleMobileClose}
            className="md:hidden fixed top-4 right-4 z-50 bg-white shadow-lg rounded-full p-3 hover:bg-gray-100 transition-colors"
            aria-label="Close admin panel"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}

        {/* Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`w-64 bg-white shadow-lg h-full z-20 flex flex-col ${isMobileAdminMode ? 'fixed inset-0' : 'relative md:relative'}`}
            >
              {/* Mobile Close Button in Sidebar */}
              <div className="md:hidden flex items-center justify-between p-4 border-b">
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
                <span className="font-semibold text-gray-800">Menu</span>
                <div className="w-6"></div>
              </div>

              <div className="p-6 flex-shrink-0 hidden md:block">
                <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
                <p className="text-sm text-gray-500 mt-1">Management System</p>
              </div>

              <nav className="mt-6 flex-1 overflow-y-auto">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActivePage(item.id);
                        // Close sidebar on mobile after selecting item
                        if (isMobileAdminMode) {
                          setIsSidebarOpen(false);
                        }
                      }}
                      className={`w-full flex items-center px-6 py-3 transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile sidebar overlay */}
        {isSidebarOpen && isMobileAdminMode && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-10"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
          {/* Header - Desktop Only */}
          <header className="hidden md:flex bg-white shadow-sm sticky top-0 z-10">
            <div className="flex items-center justify-between w-full px-6 py-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <div className="flex items-center space-x-4">
                <button
                  onClick={loadDashboardData}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Refresh Data"
                >
                  <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  AD
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="p-4 md:p-6">
            {activePage === 'dashboard' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <motion.button
                        key={action.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActivePage(action.id)}
                        className={`${action.color} text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all`}
                      >
                        <Icon className="w-8 h-8 mb-3" />
                        <span className="font-semibold">{action.label}</span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl shadow-sm p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">Total Sales</p>
                        <p className="text-2xl font-bold text-gray-800 mt-1">
                          ${stats.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        <p className={`text-sm mt-2 flex items-center ${stats.salesChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stats.salesChange >= 0 ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                          {Math.abs(stats.salesChange)}% from last month
                        </p>
                      </div>
                      <div className="bg-green-100 p-3 rounded-full">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl shadow-sm p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">Total Orders</p>
                        <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalOrders}</p>
                        <p className={`text-sm mt-2 flex items-center ${stats.ordersChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stats.ordersChange >= 0 ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                          {Math.abs(stats.ordersChange)}% from last month
                        </p>
                      </div>
                      <div className="bg-blue-100 p-3 rounded-full">
                        <ShoppingCart className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl shadow-sm p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">Total Customers</p>
                        <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalCustomers}</p>
                        <p className={`text-sm mt-2 flex items-center ${stats.customersChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stats.customersChange >= 0 ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                          {Math.abs(stats.customersChange)}% from last month
                        </p>
                      </div>
                      <div className="bg-purple-100 p-3 rounded-full">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-xl shadow-sm p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">Avg. Order Value</p>
                        <p className="text-2xl font-bold text-gray-800 mt-1">
                          ${stats.averageOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm mt-2 text-gray-600 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Per order
                        </p>
                      </div>
                      <div className="bg-orange-100 p-3 rounded-full">
                        <TrendingUp className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Recent Orders and Top Products */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Recent Orders */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-xl shadow-sm p-6"
                  >
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Orders</h3>
                    <div className="space-y-4">
                      {recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <ShoppingCart className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{order.customerName}</p>
                              <p className="text-sm text-gray-500">{order.id} • {order.items} items</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-800">${order.total.toFixed(2)}</p>
                            <div className="flex items-center justify-end space-x-2">
                              {getStatusBadge(order.status)}
                              <span className="text-xs text-gray-400">{order.date}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Top Products */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white rounded-xl shadow-sm p-6"
                  >
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Top Products</h3>
                    <div className="space-y-4">
                      {topProducts.map((product, index) => (
                        <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{product.name}</p>
                              <p className="text-sm text-gray-500">{product.sales} sold</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-800">${product.revenue.toLocaleString()}</p>
                            <span className="text-xs text-gray-400">Revenue</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Products Page */}
            {activePage === 'products' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <ProductManagement onBack={() => setActivePage('dashboard')} />
              </motion.div>
            )}

            {/* Categories Page */}
            {activePage === 'categories' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <CategoryManagement onBack={() => setActivePage('dashboard')} />
              </motion.div>
            )}

            {/* Vouchers Page */}
            {activePage === 'vouchers' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <VoucherManagement onBack={() => setActivePage('dashboard')} />
              </motion.div>
            )}

            {/* Point Redemptions Page */}
            {activePage === 'point-redemptions' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <PointRedemptionManagement />
              </motion.div>
            )}

            {/* Point Vouchers Page */}
            {activePage === 'point-vouchers' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <PointVoucherManagement />
              </motion.div>
            )}

            {/* Promo Page */}
            {activePage === 'promo' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <PromoManagement onBack={() => setActivePage('dashboard')} />
              </motion.div>
            )}

            {/* Orders Page */}
            {activePage === 'orders' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <OrderManagement onBack={() => setActivePage('dashboard')} />
              </motion.div>
            )}

            {/* Payments Page */}
            {activePage === 'payments' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <PaymentConfirmation />
              </motion.div>
            )}

            {/* Customers Page */}
            {activePage === 'customers' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <CustomerManagement onBack={() => setActivePage('dashboard')} />
              </motion.div>
            )}

            {/* Chat Page */}
            {activePage === 'chat' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <ChatManagement />
              </motion.div>
            )}

            {/* Reports Page */}
            {activePage === 'reports' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <SalesReports onBack={() => setActivePage('dashboard')} />
              </motion.div>
            )}

            {/* Database Page */}
            {activePage === 'database' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
              >
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Database Management</h2>

                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Database Sync</h3>
                      <p className="text-gray-500 mt-1">Synchronize your local database with the remote server</p>
                    </div>
                    {syncStatus === 'success' && (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <span className="font-medium">Sync Complete</span>
                      </div>
                    )}
                    {syncStatus === 'error' && (
                      <div className="flex items-center text-red-600">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        <span className="font-medium">Sync Failed</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-800">Products</span>
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-blue-900">{stats.totalOrders}</p>
                      <p className="text-xs text-blue-600 mt-1">Total orders</p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-800">Orders</span>
                        <ShoppingCart className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-green-900">{stats.totalOrders}</p>
                      <p className="text-xs text-green-600 mt-1">Last synced: Just now</p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-purple-800">Customers</span>
                        <Users className="w-5 h-5 text-purple-600" />
                      </div>
                      <p className="text-2xl font-bold text-purple-900">{stats.totalCustomers}</p>
                      <p className="text-xs text-purple-600 mt-1">Last synced: Just now</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-6">
                    <div className="flex items-center space-x-3">
                      <Database className="w-8 h-8 text-gray-600" />
                      <div>
                        <p className="font-semibold text-gray-800">Remote Database Status</p>
                        <p className="text-sm text-gray-500">Connected and operational</p>
                      </div>
                    </div>
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      <span className="font-medium">Online</span>
                    </div>
                  </div>

                  <button
                    onClick={handleDatabaseSync}
                    disabled={isSyncing}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all ${
                      isSyncing
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                    } flex items-center justify-center space-x-2`}
                  >
                    <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Syncing Database...' : 'Sync Database Now'}</span>
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Sync History</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-800">Successful Sync</p>
                          <p className="text-sm text-gray-500">All data synchronized</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">2 minutes ago</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-800">Successful Sync</p>
                          <p className="text-sm text-gray-500">All data synchronized</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">1 hour ago</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <div>
                          <p className="font-medium text-gray-800">Failed Sync</p>
                          <p className="text-sm text-gray-500">Connection timeout</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">3 hours ago</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="hidden md:flex bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">© 2024 Admin Panel. All rights reserved.</p>
            <p className="text-sm text-gray-500">Version 1.0.0</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default AdminDashboard;
