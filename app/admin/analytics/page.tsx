'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  getAnalyticsDashboard,
  getAnalyticsEvents,
  getAnalyticsUsers,
  getProductRanking,
  getUserActivity,
  compareProducts,
  AnalyticsStats,
  AnalyticsEvent,
  TopSearch,
  AnalyticsUser,
  ProductRankingItem,
  TopViewedProduct,
  ProductCompareItem,
  ProductCompareResult,
  PaginatedEventsResponse,
  PaginatedUsersResponse,
} from '@/lib/api';
import {
  BarChart3,
  Users,
  Search,
  LogIn,
  TrendingUp,
  TrendingDown,
  Filter,
  ChevronLeft,
  Activity,
  Eye,
  RefreshCw,
  Calendar,
  ChevronDown,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import Link from 'next/link';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  isBefore,
  isAfter,
} from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

type TabKey = 'overview' | 'events' | 'users' | 'products' | 'compare';

const CHART_COLORS = [
  '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444',
  '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1',
];

export default function AnalyticsPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [period, setPeriod] = useState<string>('month');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  // Overview state
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [topSearches, setTopSearches] = useState<TopSearch[]>([]);
  const [anonymousSearches, setAnonymousSearches] = useState<TopSearch[]>([]);
  const [topProducts, setTopProducts] = useState<ProductRankingItem[]>([]);
  const [bottomProducts, setBottomProducts] = useState<ProductRankingItem[]>([]);
  const [topViewed, setTopViewed] = useState<TopViewedProduct[]>([]);

  // Events state
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [eventsPagination, setEventsPagination] = useState({ page: 1, totalPages: 1, total: 0, hasNext: false, hasPrev: false });
  const [eventFilters, setEventFilters] = useState({
    userId: '',
    eventType: '',
    dateFrom: '',
    dateTo: '',
    search: '',
  });

  // Users state
  const [users, setUsers] = useState<AnalyticsUser[]>([]);
  const [usersPagination, setUsersPagination] = useState({ page: 1, totalPages: 1, total: 0, hasNext: false, hasPrev: false });
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<{ user: AnalyticsUser; activity: { lastLogin: string | null; loginCount: number; searchCount: number } } | null>(null);

  // Products tab state
  const [productRankOrder, setProductRankOrder] = useState<'top' | 'bottom'>('top');
  const [productRanking, setProductRanking] = useState<ProductRankingItem[]>([]);

  // Compare tab state
  const [compareResult, setCompareResult] = useState<ProductCompareResult | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [comparePeriodA, setComparePeriodA] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [comparePeriodB, setComparePeriodB] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Load overview data (single endpoint)
  const loadOverview = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      let df: string | undefined;
      let dt: string | undefined;
      let p = period;
      if (period === 'custom' && customDateRange.from) {
        df = format(customDateRange.from, 'yyyy-MM-dd');
        dt = customDateRange.to ? format(customDateRange.to, 'yyyy-MM-dd') : undefined;
      }
      const dashboard = await getAnalyticsDashboard(token, p, df, dt);
      setStats(dashboard.stats);
      setTopSearches(dashboard.topSearches);
      setAnonymousSearches(dashboard.anonymousSearches);
      setTopProducts(dashboard.topProducts);
      setBottomProducts(dashboard.bottomProducts);
      setTopViewed(dashboard.topViewed);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token, period, customDateRange]);

  // Load events
  const loadEvents = useCallback(async (page = 1) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const result = await getAnalyticsEvents(token, {
        page,
        limit: 20,
        userId: eventFilters.userId || undefined,
        eventType: eventFilters.eventType || undefined,
        dateFrom: eventFilters.dateFrom || undefined,
        dateTo: eventFilters.dateTo || undefined,
        search: eventFilters.search || undefined,
      });
      setEvents(result.data);
      setEventsPagination({ page: result.page, totalPages: result.totalPages, total: result.total, hasNext: result.hasNext, hasPrev: result.hasPrev });
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token, eventFilters]);

  // Load users
  const loadUsers = useCallback(async (page = 1) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const result = await getAnalyticsUsers(token, {
        page,
        limit: 20,
        search: userSearch || undefined,
      });
      setUsers(result.data);
      setUsersPagination({ page: result.page, totalPages: result.totalPages, total: result.total, hasNext: result.hasNext, hasPrev: result.hasPrev });
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token, userSearch]);

  // Load product ranking
  const loadProductRanking = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const result = await getProductRanking(token, { order: productRankOrder, limit: 20 });
      setProductRanking(result);
    } catch (error) {
      console.error('Error loading product ranking:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token, productRankOrder]);

  // Load user activity detail
  const handleViewUser = async (user: AnalyticsUser) => {
    if (!token) return;
    try {
      const activity = await getUserActivity(token, user.id);
      setSelectedUser({ user, activity });
    } catch (error) {
      console.error('Error loading user activity:', error);
    }
  };

  // Load compare data
  const loadCompare = useCallback(async () => {
    if (!token || !comparePeriodA.from || !comparePeriodA.to || !comparePeriodB.from || !comparePeriodB.to) return;
    setCompareLoading(true);
    try {
      const result = await compareProducts(token, {
        periodAFrom: format(comparePeriodA.from, 'yyyy-MM-dd'),
        periodATo: format(comparePeriodA.to, 'yyyy-MM-dd'),
        periodBFrom: format(comparePeriodB.from, 'yyyy-MM-dd'),
        periodBTo: format(comparePeriodB.to, 'yyyy-MM-dd'),
        limit: 30,
      });
      setCompareResult(result);
    } catch (error) {
      console.error('Error loading comparison:', error);
    } finally {
      setCompareLoading(false);
    }
  }, [token, comparePeriodA, comparePeriodB]);

  // Refresh handler for CTA button
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (activeTab === 'overview') await loadOverview();
      else if (activeTab === 'events') await loadEvents(eventsPagination.page);
      else if (activeTab === 'users') await loadUsers(usersPagination.page);
      else if (activeTab === 'products') await loadProductRanking();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Initial load based on active tab
  useEffect(() => {
    if (!token) return;
    if (activeTab === 'overview') loadOverview();
    else if (activeTab === 'events') loadEvents();
    else if (activeTab === 'users') loadUsers();
    else if (activeTab === 'products') loadProductRanking();
  }, [activeTab, token, loadOverview, loadEvents, loadUsers, loadProductRanking]);

  // Debounced user search
  useEffect(() => {
    if (activeTab !== 'users') return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => loadUsers(), 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [userSearch]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('es-AR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return dateStr; }
  };

  const rolLabel = (rol: string) => {
    const labels: Record<string, string> = {
      ADMIN: 'Admin',
      CLIENTE_MINORISTA: 'Minorista',
      CLIENTE_MAYORISTA: 'Mayorista',
      ASISTENTE: 'Asistente',
    };
    return labels[rol] || rol;
  };

  const rolBadgeColor = (rol: string) => {
    const colors: Record<string, string> = {
      ADMIN: 'bg-purple-100 text-purple-800',
      CLIENTE_MINORISTA: 'bg-blue-100 text-blue-800',
      CLIENTE_MAYORISTA: 'bg-amber-100 text-amber-800',
      ASISTENTE: 'bg-teal-100 text-teal-800',
    };
    return colors[rol] || 'bg-gray-100 text-gray-800';
  };

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Resumen', icon: <BarChart3 className="h-4 w-4" /> },
    { key: 'events', label: 'Eventos', icon: <Activity className="h-4 w-4" /> },
    { key: 'users', label: 'Usuarios', icon: <Users className="h-4 w-4" /> },
    { key: 'products', label: 'Productos', icon: <TrendingUp className="h-4 w-4" /> },
    { key: 'compare', label: 'Comparativas', icon: <BarChart3 className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard">
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        </div>
        <div className="flex items-center gap-3">
          <PeriodSelector
            period={period}
            customDateRange={customDateRange}
            onPeriodChange={setPeriod}
            onCustomClick={() => setShowCustomModal(true)}
          />
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/25 transition-all hover:shadow-green-600/40"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Actualizando...' : 'Actualizar datos'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-green-600 text-green-700'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab
          stats={stats}
          topSearches={topSearches}
          anonymousSearches={anonymousSearches}
          topProducts={topProducts}
          bottomProducts={bottomProducts}
          topViewed={topViewed}
          isLoading={isLoading}
        />
      )}

      {activeTab === 'events' && (
        <EventsTab
          events={events}
          pagination={eventsPagination}
          filters={eventFilters}
          isLoading={isLoading}
          onFilterChange={(key, value) => setEventFilters((prev) => ({ ...prev, [key]: value }))}
          onApplyFilters={() => loadEvents(1)}
          onPageChange={(page) => loadEvents(page)}
          formatDate={formatDate}
        />
      )}

      {activeTab === 'users' && (
        <UsersTab
          users={users}
          pagination={usersPagination}
          search={userSearch}
          isLoading={isLoading}
          selectedUser={selectedUser}
          onSearchChange={setUserSearch}
          onPageChange={(page) => loadUsers(page)}
          onViewUser={handleViewUser}
          onCloseDetail={() => setSelectedUser(null)}
          formatDate={formatDate}
          rolLabel={rolLabel}
          rolBadgeColor={rolBadgeColor}
        />
      )}

      {activeTab === 'products' && (
        <ProductsTab
          ranking={productRanking}
          order={productRankOrder}
          isLoading={isLoading}
          onOrderChange={(order) => setProductRankOrder(order)}
        />
      )}

      {activeTab === 'compare' && (
        <CompareTab
          periodA={comparePeriodA}
          periodB={comparePeriodB}
          result={compareResult}
          isLoading={compareLoading}
          onPeriodAChange={setComparePeriodA}
          onPeriodBChange={setComparePeriodB}
          onCompare={loadCompare}
        />
      )}

      {/* Modal for custom date range */}
      <Dialog open={showCustomModal} onOpenChange={setShowCustomModal}>
        <DialogContent className="max-w-[820px] p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Período personalizado</DialogTitle>
            <DialogDescription>Seleccioná el rango de fechas para filtrar los datos.</DialogDescription>
          </DialogHeader>

          {/* Date display header */}
          <div className="px-6 pt-5 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5">
              <Calendar className="h-4 w-4 text-green-600 shrink-0" />
              <span className="text-sm font-medium text-gray-700">
                {customDateRange.from
                  ? format(customDateRange.from, 'yyyy-MM-dd')
                  : 'Fecha inicio'}
              </span>
              <span className="text-gray-400">~</span>
              <span className="text-sm font-medium text-gray-700">
                {customDateRange.to
                  ? format(customDateRange.to, 'yyyy-MM-dd')
                  : 'Fecha fin'}
              </span>
              {customDateRange.from && (
                <button
                  type="button"
                  onClick={() => setCustomDateRange({ from: undefined, to: undefined })}
                  className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {customDateRange.from && customDateRange.to && customDateRange.from > customDateRange.to && (
              <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                La fecha de inicio no puede ser posterior a la fecha de fin.
              </p>
            )}
          </div>

          {/* Body: presets sidebar + calendars */}
          <div className="flex">
            {/* Presets sidebar */}
            <div className="w-40 shrink-0 border-r border-gray-100 py-3 px-2 space-y-0.5">
              {[
                { label: 'Hoy', key: 'today' },
                { label: 'Ayer', key: 'yesterday' },
                { label: 'Últimos 7 días', key: 'last7' },
                { label: 'Últimos 30 días', key: 'last30' },
                { label: 'Este mes', key: 'month' },
                { label: 'Mes anterior', key: 'lastMonth' },
              ].map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    let from = today;
                    let to = today;
                    if (preset.key === 'yesterday') {
                      from = new Date(today);
                      from.setDate(today.getDate() - 1);
                      to = new Date(from);
                    } else if (preset.key === 'last7') {
                      from = new Date(today);
                      from.setDate(today.getDate() - 6);
                    } else if (preset.key === 'last30') {
                      from = new Date(today);
                      from.setDate(today.getDate() - 29);
                    } else if (preset.key === 'month') {
                      from = new Date(today.getFullYear(), today.getMonth(), 1);
                    } else if (preset.key === 'lastMonth') {
                      from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                      to = new Date(today.getFullYear(), today.getMonth(), 0);
                    }
                    setCustomDateRange({ from, to });
                  }}
                  className="w-full text-left px-3 py-2 text-sm rounded-md transition-colors text-gray-600 hover:bg-green-50 hover:text-green-700"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Calendars */}
            <div className="flex-1 py-4 px-4">
              <CustomRangeCalendar
                selected={customDateRange}
                onSelect={setCustomDateRange}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-6 py-3 flex items-center justify-end gap-3 bg-gray-50">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCustomModal(false)}
              className="text-xs px-4"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (customDateRange.from && customDateRange.to && customDateRange.from <= customDateRange.to) {
                  setPeriod('custom');
                  setShowCustomModal(false);
                }
              }}
              disabled={!customDateRange.from || !customDateRange.to || (customDateRange.from > customDateRange.to)}
              className="bg-green-600 hover:bg-green-700 text-white text-xs px-6"
            >
              Aplicar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// =============================================
// Overview Tab with Charts
// =============================================
function OverviewTab({
  stats, topSearches, anonymousSearches, topProducts, bottomProducts, topViewed, isLoading,
}: {
  stats: AnalyticsStats | null;
  topSearches: TopSearch[];
  anonymousSearches: TopSearch[];
  topProducts: ProductRankingItem[];
  bottomProducts: ProductRankingItem[];
  topViewed: TopViewedProduct[];
  isLoading: boolean;
}) {
  if (isLoading && !stats) {
    return (
      <div className="flex justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-green-500" />
          <p className="text-sm text-gray-500">Cargando datos...</p>
        </div>
      </div>
    );
  }

  // Chart data
  const loginChartData = [
    { name: 'Hoy', logins: stats?.logins?.today ?? 0, busquedas: stats?.searches?.today ?? 0 },
    { name: 'Semana', logins: stats?.logins?.week ?? 0, busquedas: stats?.searches?.week ?? 0 },
    { name: 'Mes', logins: stats?.logins?.month ?? 0, busquedas: stats?.searches?.month ?? 0 },
  ];

  const topProductsChartData = topProducts.slice(0, 8).map((p) => ({
    name: p.productName.length > 20 ? p.productName.substring(0, 20) + '...' : p.productName,
    vendidos: p.totalSold,
    ordenes: p.orderCount,
  }));

  const topViewedChartData = topViewed.slice(0, 8).map((p) => ({
    name: p.productName.length > 20 ? p.productName.substring(0, 20) + '...' : p.productName,
    visitas: p.views,
  }));

  const searchesPieData = topSearches.slice(0, 6).map((s) => ({
    name: s.query,
    value: s.count,
  }));

  const anonymousPieData = anonymousSearches.slice(0, 6).map((s) => ({
    name: s.query,
    value: s.count,
  }));

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="h-6 w-6 text-blue-600" />}
          title="Usuarios Registrados"
          value={stats?.totalUsers ?? 0}
          bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
          borderColor="border-blue-200"
        />
        <StatCard
          icon={<LogIn className="h-6 w-6 text-green-600" />}
          title="Logins Hoy"
          value={stats?.logins?.today ?? 0}
          subtitle={`Semana: ${stats?.logins?.week ?? 0} | Mes: ${stats?.logins?.month ?? 0}`}
          bgColor="bg-gradient-to-br from-green-50 to-green-100"
          borderColor="border-green-200"
        />
        <StatCard
          icon={<Search className="h-6 w-6 text-purple-600" />}
          title="Busquedas Hoy"
          value={stats?.searches?.today ?? 0}
          subtitle={`Semana: ${stats?.searches?.week ?? 0} | Mes: ${stats?.searches?.month ?? 0}`}
          bgColor="bg-gradient-to-br from-purple-50 to-purple-100"
          borderColor="border-purple-200"
        />
        <StatCard
          icon={<Activity className="h-6 w-6 text-orange-600" />}
          title="Total Eventos"
          value={stats?.totalEvents ?? 0}
          bgColor="bg-gradient-to-br from-orange-50 to-orange-100"
          borderColor="border-orange-200"
        />
      </div>

      {/* Activity Chart: Logins + Searches */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-600" />
          Actividad del Sistema
        </h3>
        <p className="text-xs text-gray-400 mb-4">Logins y busquedas por periodo</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={loginChartData} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: '13px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '13px' }} />
              <Bar dataKey="logins" name="Logins" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="busquedas" name="Busquedas" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Products Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Chart */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Productos Mas Vendidos
          </h3>
          <p className="text-xs text-gray-400 mb-4">Unidades vendidas por producto</p>
          {topProductsChartData.length === 0 ? (
            <EmptyState text="Todavia no hay datos de ventas" />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsChartData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#9ca3af' }} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    width={150}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      fontSize: '13px',
                    }}
                  />
                  <Bar dataKey="vendidos" name="Uds. vendidas" fill="#10b981" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Bottom Products List */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-500" />
            Productos Menos Vendidos
          </h3>
          <p className="text-xs text-gray-400 mb-4">Los que necesitan mas impulso</p>
          {bottomProducts.length === 0 ? (
            <EmptyState text="Todavia no hay datos de ventas" />
          ) : (
            <div className="space-y-2">
              {bottomProducts.slice(0, 8).map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2 px-4 rounded-lg bg-red-50/60 border border-red-100">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">
                      {i + 1}
                    </span>
                    <div>
                      <span className="text-sm font-medium text-gray-800">{p.productName}</span>
                      <span className="text-xs text-gray-400 ml-2">{p.orderCount} ordenes</span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-red-600">
                    {p.totalSold} uds
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Searches Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Searches Pie */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <Search className="h-5 w-5 text-purple-600" />
            Busquedas Mas Frecuentes
          </h3>
          <p className="text-xs text-gray-400 mb-4">Que buscan los clientes registrados</p>
          {searchesPieData.length === 0 ? (
            <EmptyState text="Todavia no hay busquedas" />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={searchesPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={45}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                    }
                    labelLine={{ strokeWidth: 1 }}
                  >
                    {searchesPieData.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      fontSize: '13px',
                    }}
                    formatter={(value) => [`${value} busquedas`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Anonymous Searches Pie */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <Search className="h-5 w-5 text-gray-500" />
            Que buscan los visitantes
          </h3>
          <p className="text-xs text-gray-400 mb-4">Personas que visitaron la tienda sin iniciar sesion</p>
          {anonymousPieData.length === 0 ? (
            <EmptyState text="Todavia no hay busquedas de visitantes" />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={anonymousPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={45}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `"${name}" (${((percent ?? 0) * 100).toFixed(0)}%)`
                    }
                    labelLine={{ strokeWidth: 1 }}
                  >
                    {anonymousPieData.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[(index + 3) % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      fontSize: '13px',
                    }}
                    formatter={(value) => [`${value} busquedas`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Most Viewed Products Chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <Eye className="h-5 w-5 text-blue-600" />
          Productos que mas interesan
        </h3>
        <p className="text-xs text-gray-400 mb-4">Productos que los clientes abren para ver en detalle</p>
        {topViewedChartData.length === 0 ? (
          <EmptyState text="Todavia no hay visitas a productos" />
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topViewedChartData} margin={{ bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '13px',
                  }}
                />
                <Bar dataKey="visitas" name="Visitas" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                  {topViewedChartData.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon, title, value, subtitle, bgColor, borderColor,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  subtitle?: string;
  bgColor: string;
  borderColor?: string;
}) {
  return (
    <div className={`rounded-xl border ${borderColor || 'border-gray-200'} ${bgColor} p-5 shadow-sm transition-transform hover:scale-[1.02]`}>
      <div className="flex items-center gap-3 mb-2">
        <div className="rounded-lg bg-white/70 p-2 shadow-sm">
          {icon}
        </div>
        <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">{title}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value.toLocaleString('es-AR')}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <BarChart3 className="h-10 w-10 text-gray-200 mb-3" />
      <p className="text-sm text-gray-400">{text}</p>
    </div>
  );
}

// =============================================
// Custom Range Calendar (matches reference design)
// =============================================
const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function CustomRangeCalendar({
  selected,
  onSelect,
}: {
  selected: { from: Date | undefined; to: Date | undefined };
  onSelect: (range: { from: Date | undefined; to: Date | undefined }) => void;
}) {
  const [leftMonth, setLeftMonth] = useState(() => {
    if (selected.from) return startOfMonth(selected.from);
    return startOfMonth(new Date());
  });
  const [rightMonth, setRightMonth] = useState(() => {
    if (selected.from) return startOfMonth(addMonths(selected.from, 1));
    return startOfMonth(addMonths(new Date(), 1));
  });
  const [hoverDay, setHoverDay] = useState<Date | null>(null);

  const handleDayClick = (day: Date) => {
    if (!selected.from || (selected.from && selected.to)) {
      // Start new selection
      onSelect({ from: day, to: undefined });
    } else {
      // Complete the range
      if (isBefore(day, selected.from)) {
        onSelect({ from: day, to: selected.from });
      } else {
        onSelect({ from: selected.from, to: day });
      }
    }
  };

  const isInRange = (day: Date) => {
    if (!selected.from) return false;
    const end = selected.to || hoverDay;
    if (!end) return false;
    const rangeStart = isBefore(end, selected.from) ? end : selected.from;
    const rangeEnd = isAfter(end, selected.from) ? end : selected.from;
    return isWithinInterval(day, { start: rangeStart, end: rangeEnd });
  };

  const isRangeStart = (day: Date) => {
    if (!selected.from) return false;
    const end = selected.to || hoverDay;
    if (!end) return isSameDay(day, selected.from);
    const rangeStart = isBefore(end, selected.from) ? end : selected.from;
    return isSameDay(day, rangeStart);
  };

  const isRangeEnd = (day: Date) => {
    if (!selected.from) return false;
    const end = selected.to || hoverDay;
    if (!end) return false;
    const rangeEnd = isAfter(end, selected.from) ? end : selected.from;
    return isSameDay(day, rangeEnd);
  };

  const getDaysForMonth = (monthStart: Date) => {
    const start = startOfWeek(monthStart, { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(monthStart), { weekStartsOn: 0 });
    const days: Date[] = [];
    let current = start;
    while (current <= end) {
      days.push(current);
      current = addDays(current, 1);
    }
    return days;
  };

  const renderMonth = (monthDate: Date, onPrev: () => void, onNext: () => void) => {
    const days = getDaysForMonth(monthDate);
    const today = new Date();

    return (
      <div className="flex-1 min-w-0">
        {/* Month header with arrows */}
        <div className="flex items-center justify-between px-2 mb-3">
          <button
            type="button"
            onClick={onPrev}
            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
            {MONTH_NAMES[monthDate.getMonth()]} {monthDate.getFullYear()}
          </span>
          <button
            type="button"
            onClick={onNext}
            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 rotate-180" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-400 py-1.5">
              {d}
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 mb-1" />

        {/* Day grid */}
        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            const isCurrentMonth = isSameMonth(day, monthDate);
            const isToday = isSameDay(day, today);
            const inRange = isInRange(day);
            const rangeStart = isRangeStart(day);
            const rangeEnd = isRangeEnd(day);
            const isSingleDay = rangeStart && rangeEnd;

            // Background band for range middle
            let bgClass = '';
            if (inRange && !rangeStart && !rangeEnd) {
              bgClass = 'bg-green-50';
            } else if (rangeStart && !isSingleDay) {
              bgClass = 'bg-gradient-to-r from-transparent via-green-50 to-green-50';
            } else if (rangeEnd && !isSingleDay) {
              bgClass = 'bg-gradient-to-l from-transparent via-green-50 to-green-50';
            }

            return (
              <div
                key={i}
                className={`relative flex items-center justify-center h-9 ${bgClass}`}
              >
                <button
                  type="button"
                  onClick={() => isCurrentMonth && handleDayClick(day)}
                  onMouseEnter={() => isCurrentMonth && setHoverDay(day)}
                  onMouseLeave={() => setHoverDay(null)}
                  disabled={!isCurrentMonth}
                  className={`relative w-8 h-8 flex items-center justify-center text-sm rounded-full transition-colors
                    ${!isCurrentMonth ? 'text-gray-300 cursor-default' : 'cursor-pointer'}
                    ${isCurrentMonth && !inRange && !isToday ? 'text-gray-700 hover:bg-gray-100' : ''}
                    ${isToday && !rangeStart && !rangeEnd ? 'font-bold text-green-600 ring-1 ring-green-400' : ''}
                    ${rangeStart || rangeEnd ? 'bg-green-600 text-white font-semibold shadow-sm' : ''}
                    ${inRange && !rangeStart && !rangeEnd && isCurrentMonth ? 'text-green-800' : ''}
                  `}
                >
                  {day.getDate()}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex gap-6">
      {renderMonth(
        leftMonth,
        () => setLeftMonth(subMonths(leftMonth, 1)),
        () => setLeftMonth(addMonths(leftMonth, 1))
      )}
      <div className="w-px bg-gray-100 self-stretch" />
      {renderMonth(
        rightMonth,
        () => setRightMonth(subMonths(rightMonth, 1)),
        () => setRightMonth(addMonths(rightMonth, 1))
      )}
    </div>
  );
}

// =============================================
// Period Selector (custom dropdown)
// =============================================
const PERIOD_OPTIONS: { value: string; label: string }[] = [
  { value: 'month', label: 'Este mes' },
  { value: 'week', label: 'Esta semana' },
  { value: 'year', label: 'Este año' },
  { value: 'lastYear', label: 'Año anterior' },
  { value: 'all', label: 'Todo el tiempo' },
];

function PeriodSelector({
  period,
  customDateRange,
  onPeriodChange,
  onCustomClick,
}: {
  period: string;
  customDateRange: { from: Date | undefined; to: Date | undefined };
  onPeriodChange: (p: string) => void;
  onCustomClick: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const currentLabel = period === 'custom' && customDateRange.from
    ? `${format(customDateRange.from, 'dd/MM/yy')}${customDateRange.to ? ` — ${format(customDateRange.to, 'dd/MM/yy')}` : ''}`
    : PERIOD_OPTIONS.find((o) => o.value === period)?.label || 'Este mes';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 rounded-lg border bg-white pl-3 pr-3 py-2 text-sm font-medium shadow-sm transition-all hover:border-gray-400 cursor-pointer ${
          open ? 'border-green-500 ring-2 ring-green-500/20' : 'border-gray-300'
        } ${period === 'custom' ? 'text-green-700' : 'text-gray-700'}`}
      >
        <Calendar className="h-4 w-4 text-green-600 shrink-0" />
        <span className="truncate">{currentLabel}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-52 rounded-xl border border-gray-200 bg-white py-1.5 shadow-xl animate-in fade-in-0 zoom-in-95 duration-150">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onPeriodChange(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                period === opt.value
                  ? 'bg-green-50 text-green-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
          <div className="border-t border-gray-100 mt-1 pt-1">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onCustomClick();
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                period === 'custom'
                  ? 'bg-green-50 text-green-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              Personalizado...
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================
// Events Tab
// =============================================
function EventsTab({
  events, pagination, filters, isLoading, onFilterChange, onApplyFilters, onPageChange, formatDate,
}: {
  events: AnalyticsEvent[];
  pagination: { page: number; totalPages: number; total: number; hasNext: boolean; hasPrev: boolean };
  filters: { userId: string; eventType: string; dateFrom: string; dateTo: string; search: string };
  isLoading: boolean;
  onFilterChange: (key: string, value: string) => void;
  onApplyFilters: () => void;
  onPageChange: (page: number) => void;
  formatDate: (d: string) => string;
}) {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filtros</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          <Input
            placeholder="ID de usuario"
            value={filters.userId}
            onChange={(e) => onFilterChange('userId', e.target.value)}
            className="text-sm"
          />
          <select
            value={filters.eventType}
            onChange={(e) => onFilterChange('eventType', e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Todos los tipos</option>
            <option value="login">Login</option>
            <option value="search">Busqueda</option>
            <option value="product_view">Vista de producto</option>
          </select>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onFilterChange('dateFrom', e.target.value)}
            className="text-sm"
          />
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => onFilterChange('dateTo', e.target.value)}
            className="text-sm"
          />
          <Input
            placeholder="Buscar en payload..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="text-sm"
          />
          <Button onClick={onApplyFilters} className="bg-green-600 hover:bg-green-700 text-sm">
            Filtrar
          </Button>
        </div>
      </div>

      {/* Events Table */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700">Usuario</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading && events.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Cargando...</td></tr>
              ) : events.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No se encontraron eventos</td></tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(event.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        event.eventType === 'login'
                          ? 'bg-green-100 text-green-800'
                          : event.eventType === 'product_view'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                      }`}>
                        {event.eventType === 'login' ? <LogIn className="h-3 w-3" /> : event.eventType === 'product_view' ? <Eye className="h-3 w-3" /> : <Search className="h-3 w-3" />}
                        {event.eventType === 'product_view' ? 'vista' : event.eventType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {event.payload?.email || event.userId || <span className="text-gray-400 italic">Visitante</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {event.eventType === 'search' && event.payload?.query
                        ? `"${event.payload.query}" (${event.payload.resultsCount ?? '?'} resultados)`
                        : event.eventType === 'product_view' && event.payload?.productName
                          ? event.payload.productName
                          : event.payload?.rol
                            ? `Rol: ${event.payload.rol}`
                            : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
          <span className="text-sm text-gray-600">
            {pagination.total} eventos totales
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrev}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              Anterior
            </Button>
            <span className="text-sm text-gray-600">
              Pagina {pagination.page} de {pagination.totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNext}
              onClick={() => onPageChange(pagination.page + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================
// Users Tab
// =============================================
function UsersTab({
  users, pagination, search, isLoading, selectedUser,
  onSearchChange, onPageChange, onViewUser, onCloseDetail,
  formatDate, rolLabel, rolBadgeColor,
}: {
  users: AnalyticsUser[];
  pagination: { page: number; totalPages: number; total: number; hasNext: boolean; hasPrev: boolean };
  search: string;
  isLoading: boolean;
  selectedUser: { user: AnalyticsUser; activity: { lastLogin: string | null; loginCount: number; searchCount: number } } | null;
  onSearchChange: (search: string) => void;
  onPageChange: (page: number) => void;
  onViewUser: (user: AnalyticsUser) => void;
  onCloseDetail: () => void;
  formatDate: (d: string) => string;
  rolLabel: (rol: string) => string;
  rolBadgeColor: (rol: string) => string;
}) {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar por nombre, apellido o email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-blue-900">
              Actividad de {selectedUser.user.nombre} {selectedUser.user.apellido}
            </h3>
            <Button variant="outline" size="sm" onClick={onCloseDetail}>Cerrar</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-3 border border-blue-100">
              <p className="text-xs text-gray-500">Ultimo Login</p>
              <p className="text-sm font-medium text-gray-900">
                {selectedUser.activity.lastLogin ? formatDate(selectedUser.activity.lastLogin) : 'Nunca'}
              </p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-blue-100">
              <p className="text-xs text-gray-500">Total Logins</p>
              <p className="text-sm font-medium text-gray-900">{selectedUser.activity.loginCount}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-blue-100">
              <p className="text-xs text-gray-500">Total Busquedas</p>
              <p className="text-sm font-medium text-gray-900">{selectedUser.activity.searchCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700">Telefono</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700">Rol</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading && users.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Cargando...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No se encontraron usuarios</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {user.nombre} {user.apellido}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user.telefono}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${rolBadgeColor(user.rol)}`}>
                        {rolLabel(user.rol)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewUser(user)}
                        className="gap-1 text-xs"
                      >
                        <Eye className="h-3 w-3" />
                        Ver actividad
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
          <span className="text-sm text-gray-600">
            {pagination.total} usuarios totales
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrev}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              Anterior
            </Button>
            <span className="text-sm text-gray-600">
              Pagina {pagination.page} de {pagination.totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNext}
              onClick={() => onPageChange(pagination.page + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================
// Products Tab
// =============================================
function ProductsTab({
  ranking, order, isLoading, onOrderChange,
}: {
  ranking: ProductRankingItem[];
  order: 'top' | 'bottom';
  isLoading: boolean;
  onOrderChange: (order: 'top' | 'bottom') => void;
}) {
  return (
    <div className="space-y-4">
      {/* Order Toggle */}
      <div className="flex gap-2">
        <Button
          variant={order === 'top' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onOrderChange('top')}
          className={order === 'top' ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          <TrendingUp className="h-4 w-4 mr-1" />
          Mas Vendidos
        </Button>
        <Button
          variant={order === 'bottom' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onOrderChange('bottom')}
          className={order === 'bottom' ? 'bg-red-600 hover:bg-red-700' : ''}
        >
          <TrendingDown className="h-4 w-4 mr-1" />
          Menos Vendidos
        </Button>
      </div>

      {/* Ranking Chart */}
      {ranking.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ranking.slice(0, 15).map((p) => ({
                  name: p.productName.length > 25 ? p.productName.substring(0, 25) + '...' : p.productName,
                  vendidos: p.totalSold,
                  ordenes: p.orderCount,
                }))}
                margin={{ bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  angle={-40}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '13px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '13px' }} />
                <Bar
                  dataKey="vendidos"
                  name="Uds. vendidas"
                  fill={order === 'top' ? '#10b981' : '#ef4444'}
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="ordenes"
                  name="Ordenes"
                  fill={order === 'top' ? '#6ee7b7' : '#fca5a5'}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Ranking Table */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700 w-12">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700">Producto</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-700">Unidades Vendidas</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-700">Ordenes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading && ranking.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Cargando...</td></tr>
              ) : ranking.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Sin datos de ventas aun</td></tr>
              ) : (
                ranking.map((item, i) => (
                  <tr key={item.productId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-bold text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.productName}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        order === 'top' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.totalSold}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">{item.orderCount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// =============================================
// Compare Tab
// =============================================
// =============================================
// Compare Date Range Button (opens modal with CustomRangeCalendar)
// =============================================
function CompareDateRangeButton({
  value,
  onChange,
  placeholder,
  accentColor,
}: {
  value: { from: Date | undefined; to: Date | undefined };
  onChange: (v: { from: Date | undefined; to: Date | undefined }) => void;
  placeholder: string;
  accentColor: 'blue' | 'green';
}) {
  const [open, setOpen] = useState(false);
  const [tempRange, setTempRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: value.from,
    to: value.to,
  });

  const handleOpen = () => {
    setTempRange({ from: value.from, to: value.to });
    setOpen(true);
  };

  const handleApply = () => {
    if (tempRange.from && tempRange.to && tempRange.from <= tempRange.to) {
      onChange(tempRange);
      setOpen(false);
    }
  };

  const accentClasses = accentColor === 'blue'
    ? { icon: 'text-blue-600', border: 'border-blue-500 ring-blue-500/20', text: 'text-blue-700' }
    : { icon: 'text-green-600', border: 'border-green-500 ring-green-500/20', text: 'text-green-700' };

  const hasValue = value.from && value.to;
  const SIDEBAR_PRESETS = [
    { label: 'Hoy', key: 'today' },
    { label: 'Ayer', key: 'yesterday' },
    { label: 'Últimos 7 días', key: 'last7' },
    { label: 'Últimos 30 días', key: 'last30' },
    { label: 'Este mes', key: 'month' },
    { label: 'Mes anterior', key: 'lastMonth' },
  ];

  const applyPreset = (key: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let from = today;
    let to = today;
    if (key === 'yesterday') {
      from = new Date(today);
      from.setDate(today.getDate() - 1);
      to = new Date(from);
    } else if (key === 'last7') {
      from = new Date(today);
      from.setDate(today.getDate() - 6);
    } else if (key === 'last30') {
      from = new Date(today);
      from.setDate(today.getDate() - 29);
    } else if (key === 'month') {
      from = new Date(today.getFullYear(), today.getMonth(), 1);
    } else if (key === 'lastMonth') {
      from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      to = new Date(today.getFullYear(), today.getMonth(), 0);
    }
    setTempRange({ from, to });
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={`flex items-center gap-2 w-full rounded-lg border bg-white px-3 py-2.5 text-sm font-medium shadow-sm transition-all hover:border-gray-400 cursor-pointer ${
          hasValue ? accentClasses.text : 'text-gray-500'
        } border-gray-300`}
      >
        <Calendar className={`h-4 w-4 ${accentClasses.icon} shrink-0`} />
        <span className="truncate">
          {hasValue
            ? `${format(value.from!, 'dd/MM/yyyy')} — ${format(value.to!, 'dd/MM/yyyy')}`
            : placeholder}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-gray-400 shrink-0 ml-auto" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[820px] p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>{placeholder}</DialogTitle>
            <DialogDescription>Seleccioná el rango de fechas.</DialogDescription>
          </DialogHeader>

          {/* Date display header */}
          <div className="px-6 pt-5 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5">
              <Calendar className={`h-4 w-4 ${accentClasses.icon} shrink-0`} />
              <span className="text-sm font-medium text-gray-700">
                {tempRange.from ? format(tempRange.from, 'yyyy-MM-dd') : 'Fecha inicio'}
              </span>
              <span className="text-gray-400">~</span>
              <span className="text-sm font-medium text-gray-700">
                {tempRange.to ? format(tempRange.to, 'yyyy-MM-dd') : 'Fecha fin'}
              </span>
              {tempRange.from && (
                <button
                  type="button"
                  onClick={() => setTempRange({ from: undefined, to: undefined })}
                  className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {tempRange.from && tempRange.to && tempRange.from > tempRange.to && (
              <p className="text-xs text-red-500 mt-2">
                La fecha de inicio no puede ser posterior a la fecha de fin.
              </p>
            )}
          </div>

          {/* Body: presets sidebar + calendars */}
          <div className="flex">
            <div className="w-40 shrink-0 border-r border-gray-100 py-3 px-2 space-y-0.5">
              {SIDEBAR_PRESETS.map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => applyPreset(preset.key)}
                  className="w-full text-left px-3 py-2 text-sm rounded-md transition-colors text-gray-600 hover:bg-green-50 hover:text-green-700"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="flex-1 py-4 px-4">
              <CustomRangeCalendar
                selected={tempRange}
                onSelect={setTempRange}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-6 py-3 flex items-center justify-end gap-3 bg-gray-50">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              className="text-xs px-4"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleApply}
              disabled={!tempRange.from || !tempRange.to || (tempRange.from > tempRange.to)}
              className="bg-green-600 hover:bg-green-700 text-white text-xs px-6"
            >
              Aplicar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function CompareTab({
  periodA, periodB, result, isLoading, onPeriodAChange, onPeriodBChange, onCompare,
}: {
  periodA: { from: Date | undefined; to: Date | undefined };
  periodB: { from: Date | undefined; to: Date | undefined };
  result: ProductCompareResult | null;
  isLoading: boolean;
  onPeriodAChange: (v: { from: Date | undefined; to: Date | undefined }) => void;
  onPeriodBChange: (v: { from: Date | undefined; to: Date | undefined }) => void;
  onCompare: () => void;
}) {
  const canCompare = periodA.from && periodA.to && periodB.from && periodB.to;

  const chartData = result?.products.slice(0, 12).map((p) => ({
    name: p.productName.length > 18 ? p.productName.substring(0, 18) + '...' : p.productName,
    periodoA: p.periodA.totalSold,
    periodoB: p.periodB.totalSold,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Period Selectors */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          Comparar periodos de productos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Period A */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-blue-500"></span>
              Periodo A
            </label>
            <CompareDateRangeButton
              value={periodA}
              onChange={onPeriodAChange}
              placeholder="Seleccionar periodo A"
              accentColor="blue"
            />
          </div>
          {/* Period B */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
              Periodo B
            </label>
            <CompareDateRangeButton
              value={periodB}
              onChange={onPeriodBChange}
              placeholder="Seleccionar periodo B"
              accentColor="green"
            />
          </div>
        </div>
        <div className="mt-4">
          <Button
            onClick={onCompare}
            disabled={!canCompare || isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Comparando...
              </>
            ) : (
              <>
                <BarChart3 className="h-4 w-4 mr-2" />
                Comparar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Comparison Chart */}
      {result && chartData.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-1">Unidades vendidas por periodo</h3>
          <p className="text-xs text-gray-400 mb-4">
            Periodo A: {result.periodA.from} a {result.periodA.to} vs Periodo B: {result.periodB.from} a {result.periodB.to}
          </p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  angle={-40}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '13px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '13px' }} />
                <Bar dataKey="periodoA" name="Periodo A" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="periodoB" name="Periodo B" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      {result && (
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700">Producto</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-700">
                    <span className="flex items-center justify-end gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                      Periodo A
                    </span>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-700">
                    <span className="flex items-center justify-end gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                      Periodo B
                    </span>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-700">Diferencia</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-700">Variacion %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {result.products.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Sin datos para comparar en estos periodos</td></tr>
                ) : (
                  result.products.map((item) => (
                    <tr key={item.productId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.productName}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600">{item.periodA.totalSold} uds</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600">{item.periodB.totalSold} uds</td>
                      <td className="px-4 py-3 text-sm text-right">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          item.soldDiff > 0
                            ? 'bg-green-100 text-green-800'
                            : item.soldDiff < 0
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-600'
                        }`}>
                          {item.soldDiff > 0 ? '+' : ''}{item.soldDiff}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        {item.soldDiffPercent !== null ? (
                          <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                            item.soldDiffPercent > 0 ? 'text-green-700' : item.soldDiffPercent < 0 ? 'text-red-700' : 'text-gray-500'
                          }`}>
                            {item.soldDiffPercent > 0 ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : item.soldDiffPercent < 0 ? (
                              <TrendingDown className="h-3 w-3" />
                            ) : null}
                            {item.soldDiffPercent > 0 ? '+' : ''}{item.soldDiffPercent}%
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!result && !isLoading && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Selecciona dos periodos y hace click en &quot;Comparar&quot; para ver la diferencia en ventas de productos</p>
        </div>
      )}
    </div>
  );
}
