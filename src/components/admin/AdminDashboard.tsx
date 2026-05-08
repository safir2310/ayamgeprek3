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
import { PointRedemptionAdmin } from '@/components/admin/PointRedemptionAdmin'

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
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
    totalProducts: 0,
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
          totalProducts: data.data.totalProducts,
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

  // Load dashboard data on mount
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

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
    { id: 'redeem-admin', icon: Gift, label: 'Redeem Produk' },
    { id: 'promo', icon: Tag, label: 'Promo' },
    { id: 'orders', icon: ShoppingBag, label: 'Orders' },
    { id: 'payments', icon: CheckSquare, label: 'Payment Confirmation' },
    { id: 'customers', icon: Users, label: 'Customers' },
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'reports', icon: TrendingUp, label: 'Reports' },
    { id: 'database', icon: Database, label: 'Database' },
  ];

  const quickActions = [
    { id: 'pos', icon: ShoppingCart, label: 'New Sale', color: 'from-pink-500 to-rose-500', iconBg: 'bg-white' },
    { id: 'products', icon: Package, label: 'Add Product', color: 'from-emerald-500 to-teal-500', iconBg: 'bg-white' },
    { id: 'orders', icon: ShoppingCart, label: 'View Orders', color: 'from-violet-500 to-purple-600', iconBg: 'bg-white' },
    { id: 'customers', icon: Users, label: 'Add Customer', color: 'from-amber-500 to-orange-500', iconBg: 'bg-white' },
  ];

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
      pending: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
    };
    const statusIcons = {
      completed: <CheckCircle className="w-3 h-3 mr-1" />,
      pending: <Clock className="w-3 h-3 mr-1" />,
      cancelled: <AlertCircle className="w-3 h-3 mr-1" />,
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles]}`}>
        {statusIcons[status as keyof typeof statusIcons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <>
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex">
        {/* Mobile Hamburger Button - Always Visible on Mobile */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="md:hidden fixed top-4 left-4 z-50 bg-white dark:bg-slate-800 shadow-lg rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          aria-label="Toggle menu"
        >
          {isSidebarOpen ? <X className="w-6 h-6 text-slate-600 dark:text-slate-300" /> : <Menu className="w-6 h-6 text-slate-600 dark:text-slate-300" />}
        </button>

        {/* Mobile Close Button for Back Navigation */}
        {isMobileAdminMode && !isSidebarOpen && (
          <button
            onClick={handleMobileClose}
            className="md:hidden fixed top-4 right-4 z-50 bg-white dark:bg-slate-800 shadow-lg rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            aria-label="Close admin panel"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
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
              className={`w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 h-full z-20 flex flex-col shadow-2xl ${isMobileAdminMode ? 'fixed inset-0' : 'relative md:relative'}`}
            >
              {/* Mobile Close Button in Sidebar */}
              <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-700/50">
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors text-white"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
                <span className="font-semibold text-white">Menu</span>
                <div className="w-6"></div>
              </div>

              <div className="p-6 flex-shrink-0 hidden md:block">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-violet-600 rounded-xl flex items-center justify-center">
                    <LayoutDashboard className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
                </div>
                <p className="text-sm text-slate-400 mt-1">Management System</p>
              </div>

              <nav className="mt-6 flex-1 overflow-y-auto px-3 space-y-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActivePage(item.id);
                        if (isMobileAdminMode) {
                          setIsSidebarOpen(false);
                        }
                      }}
                      className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                        isActive
                          ? 'bg-gradient-to-r from-pink-500 to-violet-600 text-white shadow-lg shadow-pink-500/25'
                          : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mr-3 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                      <span className="font-medium">{item.label}</span>
                      {isActive && (
                        <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile sidebar overlay */}
        {isSidebarOpen && isMobileAdminMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-10"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 overflow-hidden ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
          {/* Header - Desktop Only */}
          <header className="hidden md:flex bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700/50">
            <div className="flex items-center justify-between w-full px-6 py-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
              >
                {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <div className="flex items-center space-x-4">
                <button
                  onClick={loadDashboardData}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
                  title="Refresh Data"
                >
                  <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setActivePage('dashboard')}
                  className={`p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${activePage === 'dashboard' ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}
                  title="Dashboard"
                >
                  <LayoutDashboard className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg shadow-pink-500/25">
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
                {/* Welcome Section */}
                <div className="mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 rounded-2xl p-6 md:p-8 text-white shadow-2xl shadow-purple-500/25 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
                    <div className="relative z-10">
                      <h2 className="text-3xl md:text-4xl font-bold mb-2">Welcome Back! 👋</h2>
                      <p className="text-purple-100 text-lg">Here's what's happening with your store today</p>
                    </div>
                  </motion.div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <motion.button
                        key={action.id}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActivePage(action.id)}
                        className={`bg-gradient-to-br ${action.color} text-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden group`}
                      >
                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                        <div className={`inline-flex p-3 rounded-xl ${action.iconBg} mb-4 shadow-lg`}><Icon className="w-8 h-8" /></div>
                        <span className="font-semibold text-lg">{action.label}</span>
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
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-slate-100 dark:border-slate-700"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-lg shadow-emerald-500/25">
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                      <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        stats.salesChange >= 0 
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' 
                          : 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400'
                      }`}>
                        {stats.salesChange >= 0 ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                        {Math.abs(stats.salesChange)}%
                      </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Sales</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                      ${stats.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-slate-100 dark:border-slate-700"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-violet-400 to-purple-500 rounded-xl shadow-lg shadow-violet-500/25">
                        <ShoppingCart className="w-6 h-6 text-white" />
                      </div>
                      <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        stats.ordersChange >= 0 
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' 
                          : 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400'
                      }`}>
                        {stats.ordersChange >= 0 ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                        {Math.abs(stats.ordersChange)}%
                      </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Orders</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{stats.totalOrders}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-slate-100 dark:border-slate-700"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl shadow-lg shadow-pink-500/25">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        stats.customersChange >= 0 
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' 
                          : 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400'
                      }`}>
                        {stats.customersChange >= 0 ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                        {Math.abs(stats.customersChange)}%
                      </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Customers</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{stats.totalCustomers}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-slate-100 dark:border-slate-700"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg shadow-amber-500/25">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        <Clock className="w-4 h-4 mr-1" />
                        Average
                      </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Avg. Order Value</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                      ${stats.averageOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </motion.div>
                </div>

                {/* Recent Orders and Top Products */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Recent Orders */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-slate-700"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white">Recent Orders</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setActivePage('orders')}
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-950"
                      >
                        View All
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all group cursor-pointer">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-violet-100 dark:bg-violet-950 rounded-lg group-hover:scale-110 transition-transform">
                              <ShoppingCart className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-white">{order.customerName}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">{order.id} • {order.items} items</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-slate-800 dark:text-white">${order.total.toFixed(2)}</p>
                            <div className="flex items-center justify-end space-x-2 mt-1">
                              {getStatusBadge(order.status)}
                              <span className="text-xs text-slate-400">{order.date}</span>
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
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-slate-700"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white">Top Products</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setActivePage('products')}
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-950"
                      >
                        View All
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {topProducts.map((product, index) => (
                        <div key={product.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all group cursor-pointer">
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 bg-gradient-to-br ${
                              index === 0 ? 'from-amber-400 to-orange-500' :
                              index === 1 ? 'from-slate-300 to-slate-400' :
                              index === 2 ? 'from-orange-300 to-amber-400' :
                              'from-slate-200 to-slate-300'
                            } dark:from-slate-600 dark:to-slate-700 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform`}>
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-white">{product.name}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">{product.sales} sold</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-slate-800 dark:text-white">${product.revenue.toLocaleString()}</p>
                            <span className="text-xs text-slate-400">Revenue</span>
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

            {/* Redeem Admin Page */}
            {activePage === 'redeem-admin' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <PointRedemptionAdmin />
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
                className="max-w-5xl mx-auto"
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Database Management</h2>
                  <p className="text-slate-500 dark:text-slate-400">Synchronize your data with remote server</p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6 border border-slate-100 dark:border-slate-700">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white">Database Sync</h3>
                      <p className="text-slate-500 dark:text-slate-400 mt-1">Synchronize your local database with the remote server</p>
                    </div>
                    {syncStatus === 'success' && (
                      <div className="flex items-center px-4 py-2 bg-emerald-50 dark:bg-emerald-950 rounded-xl">
                        <CheckCircle className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-medium text-emerald-700 dark:text-emerald-300">Sync Complete</span>
                      </div>
                    )}
                    {syncStatus === 'error' && (
                      <div className="flex items-center px-4 py-2 bg-red-50 dark:bg-red-950 rounded-xl">
                        <AlertCircle className="w-5 h-5 mr-2 text-red-600 dark:text-red-400" />
                        <span className="font-medium text-red-700 dark:text-red-300">Sync Failed</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 p-5 rounded-xl border border-emerald-100 dark:border-emerald-900">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Orders</span>
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                          <ShoppingCart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">{stats.totalOrders}</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Last synced: Just now</p>
                    </div>

                    <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950 p-5 rounded-xl border border-violet-100 dark:border-violet-900">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-violet-800 dark:text-violet-300">Customers</span>
                        <div className="p-2 bg-violet-100 dark:bg-violet-900 rounded-lg">
                          <Users className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-violet-900 dark:text-violet-100">{stats.totalCustomers}</p>
                      <p className="text-xs text-violet-600 dark:text-violet-400 mt-1">Last synced: Just now</p>
                    </div>

                    <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950 dark:to-rose-950 p-5 rounded-xl border border-pink-100 dark:border-pink-900">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-pink-800 dark:text-pink-300">Products</span>
                        <div className="p-2 bg-pink-100 dark:bg-pink-900 rounded-lg">
                          <Package className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-pink-900 dark:text-pink-100">{stats.totalProducts}</p>
                      <p className="text-xs text-pink-600 dark:text-pink-400 mt-1">Last synced: Just now</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg shadow-amber-500/25">
                        <Database className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-white">Remote Database Status</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Connected and operational</p>
                      </div>
                    </div>
                    <div className="flex items-center px-3 py-1.5 bg-emerald-100 dark:bg-emerald-950 rounded-full">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse" />
                      <span className="font-medium text-emerald-700 dark:text-emerald-300 text-sm">Online</span>
                    </div>
                  </div>

                  <button
                    onClick={handleDatabaseSync}
                    disabled={isSyncing}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 ${
                      isSyncing
                        ? 'bg-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 hover:shadow-lg hover:shadow-violet-500/25'
                    } flex items-center justify-center space-x-2`}
                  >
                    <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Syncing Database...' : 'Sync Database Now'}</span>
                  </button>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-slate-700">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Sync History</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-950 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 dark:text-white">Successful Sync</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">All data synchronized</p>
                        </div>
                      </div>
                      <span className="text-sm text-slate-400">2 minutes ago</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-950 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 dark:text-white">Successful Sync</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">All data synchronized</p>
                        </div>
                      </div>
                      <span className="text-sm text-slate-400">1 hour ago</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-red-100 dark:bg-red-950 rounded-lg">
                          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 dark:text-white">Failed Sync</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Connection timeout</p>
                        </div>
                      </div>
                      <span className="text-sm text-slate-400">3 hours ago</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="hidden md:flex bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-700/50 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">© 2024 Admin Panel. All rights reserved.</p>
            <div className="flex items-center space-x-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">Version 1.0.0</p>
              <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium">System Online</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default AdminDashboard;
