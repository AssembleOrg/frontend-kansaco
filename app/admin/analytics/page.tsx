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
  getUsersByZone,
  AnalyticsStats,
  AnalyticsEvent,
  TopSearch,
  AnalyticsUser,
  ProductRankingItem,
  TopViewedProduct,
  ProductCompareResult,
  UsersByZoneItem,
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
  MapPin,
  ArrowUpDown,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
} from '@/components/ui/responsive-dialog';
import { useIsMobile } from '@/hooks/useMediaQuery';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

type TabKey = 'overview' | 'events' | 'users' | 'products' | 'compare' | 'zones';

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
  const [eventsError, setEventsError] = useState<string | null>(null);
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

  // Zones tab state
  const [zones, setZones] = useState<UsersByZoneItem[]>([]);
  const [zonesLoaded, setZonesLoaded] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const loadZones = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const result = await getUsersByZone(token);
      setZones(result);
      setZonesLoaded(true);
    } catch (error) {
      console.error('Error loading zones:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Load overview data (single endpoint)
  const loadOverview = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      let df: string | undefined;
      let dt: string | undefined;
      const p = period;
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
    setEventsError(null);
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
      setEventsError('No se pudieron cargar los registros. Intentá de nuevo.');
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
      const df = period === 'custom' && customDateRange.from ? format(customDateRange.from, 'yyyy-MM-dd') : undefined;
      const dt = period === 'custom' && customDateRange.to ? format(customDateRange.to, 'yyyy-MM-dd') : undefined;
      const result = await getProductRanking(token, { order: productRankOrder, limit: 20, period, dateFrom: df, dateTo: dt });
      setProductRanking(result);
    } catch (error) {
      console.error('Error loading product ranking:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token, productRankOrder, period, customDateRange]);

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
      else if (activeTab === 'compare') await loadCompare();
      else if (activeTab === 'zones') await loadZones();
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
    else if (activeTab === 'zones' && !zonesLoaded) loadZones();
  }, [activeTab, token, loadOverview, loadEvents, loadUsers, loadProductRanking, loadZones, zonesLoaded]);

  // Debounced user search
  useEffect(() => {
    if (activeTab !== 'users') return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => loadUsers(), 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    { key: 'zones', label: 'Zonas', icon: <MapPin className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/admin/dashboard">
            <Button variant="outline" size="sm" className="-ml-1 h-8 px-2 sm:ml-0 sm:px-3">
              <ChevronLeft className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </Link>
          <h1 className="text-[20px] font-semibold tracking-tight text-neutral-900 sm:text-2xl">
            Analytics
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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
            <RefreshCw className={`h-4 w-4 sm:mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Actualizando...' : 'Actualizar datos'}</span>
          </Button>
        </div>
      </div>

      {/* Tabs (scrolleables horizontal en mobile) */}
      <div className="-mx-4 overflow-x-auto border-b border-neutral-200/70 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex shrink-0 items-center gap-2 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-green-600 text-green-700'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
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
          onNavigateToEvents={(filters) => {
            setEventFilters((prev) => ({ ...prev, ...filters }));
            setActiveTab('events');
          }}
          onNavigateToUsers={() => setActiveTab('users')}
        />
      )}

      {activeTab === 'events' && (
        <EventsTab
          events={events}
          pagination={eventsPagination}
          filters={eventFilters}
          isLoading={isLoading}
          error={eventsError}
          onFilterChange={(key, value) => setEventFilters((prev) => ({ ...prev, [key]: value }))}
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

      {activeTab === 'zones' && (
        <ZonesTab zones={zones} isLoading={isLoading && !zonesLoaded} />
      )}

      {/* Modal for custom date range */}
      <ResponsiveDialog open={showCustomModal} onOpenChange={setShowCustomModal}>
        <ResponsiveDialogContent className="max-w-[820px] overflow-hidden p-0 sm:p-0">
          <ResponsiveDialogHeader className="sr-only">
            <ResponsiveDialogTitle>Período personalizado</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>Seleccioná el rango de fechas para filtrar los datos.</ResponsiveDialogDescription>
          </ResponsiveDialogHeader>

          {/* Date display header */}
          <div className="border-b border-neutral-200/70 px-4 pt-4 pb-3 sm:px-6 sm:pt-5">
            <div className="flex items-center gap-3 rounded-lg border border-neutral-200/70 bg-neutral-50 px-3 py-2.5 sm:px-4">
              <Calendar className="h-4 w-4 shrink-0 text-green-600" />
              <span className="text-sm font-medium tabular-nums text-neutral-700">
                {customDateRange.from
                  ? format(customDateRange.from, 'yyyy-MM-dd')
                  : 'Fecha inicio'}
              </span>
              <span className="text-neutral-400">~</span>
              <span className="text-sm font-medium tabular-nums text-neutral-700">
                {customDateRange.to
                  ? format(customDateRange.to, 'yyyy-MM-dd')
                  : 'Fecha fin'}
              </span>
              {customDateRange.from && (
                <button
                  type="button"
                  onClick={() => setCustomDateRange({ from: undefined, to: undefined })}
                  className="ml-auto text-neutral-400 transition-colors hover:text-neutral-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {customDateRange.from && customDateRange.to && customDateRange.from > customDateRange.to && (
              <p className="mt-2 flex items-center gap-1 text-xs text-red-500">
                La fecha de inicio no puede ser posterior a la fecha de fin.
              </p>
            )}
          </div>

          {/* Presets: bar horizontal scrolleable en mobile, sidebar en desktop */}
          <div className="flex flex-col md:flex-row">
            <div className="-mx-0 flex shrink-0 gap-1 overflow-x-auto border-b border-neutral-200/70 px-2 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:w-40 md:flex-col md:gap-0.5 md:overflow-visible md:border-b-0 md:border-r md:px-2 md:py-3">
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
                  className="shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-sm text-neutral-600 transition-colors hover:bg-green-50 hover:text-green-700 md:w-full md:py-2 md:text-left"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Calendars */}
            <div className="flex-1 px-3 py-3 sm:px-4 sm:py-4">
              <CustomRangeCalendar
                selected={customDateRange}
                onSelect={setCustomDateRange}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-neutral-200/70 bg-neutral-50 px-4 py-3 sm:gap-3 sm:px-6">
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
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </div>
  );
}

// =============================================
// Overview Tab with Charts
// =============================================
function OverviewTab({
  stats, topSearches, anonymousSearches, topProducts, bottomProducts, topViewed, isLoading, onNavigateToEvents, onNavigateToUsers,
}: {
  stats: AnalyticsStats | null;
  topSearches: TopSearch[];
  anonymousSearches: TopSearch[];
  topProducts: ProductRankingItem[];
  bottomProducts: ProductRankingItem[];
  topViewed: TopViewedProduct[];
  isLoading: boolean;
  onNavigateToEvents: (filters: { eventType?: string; dateFrom?: string; dateTo?: string; search?: string; userId?: string }) => void;
  onNavigateToUsers: () => void;
}) {
  const isMobile = useIsMobile();
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

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const weekStr = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const monthStr = format(startOfMonth(new Date()), 'yyyy-MM-dd');

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
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Users className="h-5 w-5 text-blue-600" />}
          title="Usuarios totales"
          value={stats?.totalUsers ?? 0}
          onClick={onNavigateToUsers}
        />
        <StatCard
          icon={<LogIn className="h-5 w-5 text-green-600" />}
          title="Logins hoy"
          value={stats?.logins?.today ?? 0}
          onClick={() => onNavigateToEvents({ eventType: 'login', dateFrom: todayStr })}
        />
        <StatCard
          icon={<Search className="h-5 w-5 text-purple-600" />}
          title="Búsquedas hoy"
          value={stats?.searches?.today ?? 0}
          onClick={() => onNavigateToEvents({ eventType: 'search', dateFrom: todayStr })}
        />
        <StatCard
          icon={<Activity className="h-5 w-5 text-orange-600" />}
          title="Interacciones totales"
          value={stats?.totalEvents ?? 0}
          onClick={() => onNavigateToEvents({})}
        />
      </div>

      {/* Activity Chart: Logins + Searches */}
      <div className="rounded-xl border border-neutral-200/70 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-600" />
          Actividad del Sistema
        </h3>
        <p className="text-xs text-gray-400 mb-4">Logins y busquedas por periodo</p>
        <div className="h-56 sm:h-72">
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
        <div className="rounded-xl border border-neutral-200/70 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Productos Mas Vendidos
          </h3>
          <p className="text-xs text-gray-400 mb-4">Unidades vendidas por producto</p>
          {topProductsChartData.length === 0 ? (
            <EmptyState text="Todavia no hay datos de ventas" />
          ) : (
            <div className="h-56 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsChartData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#9ca3af' }} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    width={isMobile ? 90 : 150}
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
        <div className="rounded-xl border border-neutral-200/70 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:p-6">
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
        <div className="rounded-xl border border-neutral-200/70 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <Search className="h-5 w-5 text-purple-600" />
            Busquedas Mas Frecuentes
          </h3>
          <p className="text-xs text-gray-400 mb-4">Que buscan los clientes registrados</p>
          {searchesPieData.length === 0 ? (
            <EmptyState text="Todavia no hay busquedas" />
          ) : (
            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={searchesPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={isMobile ? 70 : 90}
                    innerRadius={isMobile ? 35 : 45}
                    paddingAngle={3}
                    dataKey="value"
                    label={
                      isMobile
                        ? ({ percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`
                        : ({ name, percent }) =>
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
        <div className="rounded-xl border border-neutral-200/70 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <Search className="h-5 w-5 text-gray-500" />
            Que buscan los visitantes
          </h3>
          <p className="text-xs text-gray-400 mb-4">Personas que visitaron la tienda sin iniciar sesion</p>
          {anonymousPieData.length === 0 ? (
            <EmptyState text="Todavia no hay busquedas de visitantes" />
          ) : (
            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={anonymousPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={isMobile ? 70 : 90}
                    innerRadius={isMobile ? 35 : 45}
                    paddingAngle={3}
                    dataKey="value"
                    label={
                      isMobile
                        ? ({ percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`
                        : ({ name, percent }) =>
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
      <div className="rounded-xl border border-neutral-200/70 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <Eye className="h-5 w-5 text-blue-600" />
          Productos que mas interesan
        </h3>
        <p className="text-xs text-gray-400 mb-4">Productos que los clientes abren para ver en detalle</p>
        {topViewedChartData.length === 0 ? (
          <EmptyState text="Todavia no hay visitas a productos" />
        ) : (
          <div className="h-64 sm:h-80">
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

// =============================================
// Zones Tab — distribución de usuarios por provincia
// =============================================
type ZoneSortKey = 'provincia' | 'total' | 'enabled' | 'pending';

function ZonesTab({
  zones,
  isLoading,
}: {
  zones: UsersByZoneItem[];
  isLoading: boolean;
}) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<ZoneSortKey>('total');
  const [sortAsc, setSortAsc] = useState(false);

  if (isLoading && zones.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-green-500" />
          <p className="text-sm text-gray-500">Cargando zonas...</p>
        </div>
      </div>
    );
  }

  const withZone = zones.filter((z) => z.provincia !== 'Sin especificar');
  const unknown = zones.find((z) => z.provincia === 'Sin especificar');
  const totalConZona = withZone.reduce((sum, z) => sum + z.total, 0);
  const totalUsers = zones.reduce((sum, z) => sum + z.total, 0);
  const cobertura = totalUsers > 0 ? Math.round((totalConZona / totalUsers) * 100) : 0;

  // Orden por la columna elegida (las provincias reales; "Sin especificar" va al final).
  const sorted = [...withZone].sort((a, b) => {
    const dir = sortAsc ? 1 : -1;
    if (sortKey === 'provincia') return dir * a.provincia.localeCompare(b.provincia);
    return dir * (a[sortKey] - b[sortKey]);
  });

  const toggleSort = (key: ZoneSortKey) => {
    if (key === sortKey) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(key === 'provincia'); // texto asc por defecto, números desc
    }
  };

  // Top-5 para el donut (+ "Otras" agrupando el resto).
  const byTotal = [...withZone].sort((a, b) => b.total - a.total);
  const top5 = byTotal.slice(0, 5);
  const restTotal = byTotal.slice(5).reduce((s, z) => s + z.total, 0);
  const donutData = [
    ...top5.map((z) => ({ name: z.provincia, value: z.total })),
    ...(restTotal > 0 ? [{ name: 'Otras', value: restTotal }] : []),
  ];

  const goTo = (provincia: string) =>
    router.push(`/admin/users?provincia=${encodeURIComponent(provincia)}`);

  const SortableTh = ({ label, k, align = 'right' }: { label: string; k: ZoneSortKey; align?: 'left' | 'right' }) => (
    <th
      onClick={() => toggleSort(k)}
      className={`cursor-pointer select-none px-4 py-3 text-${align} text-[11px] font-semibold uppercase tracking-wide text-neutral-500 hover:text-neutral-700`}
    >
      <span className={`inline-flex items-center gap-1 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
        {label}
        <ArrowUpDown
          className={`h-3.5 w-3.5 ${sortKey === k ? 'text-green-600' : 'text-neutral-300'}`}
        />
      </span>
    </th>
  );

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <StatCard
          icon={<MapPin className="h-5 w-5 text-green-600" />}
          title="Provincias activas"
          value={withZone.length}
        />
        <StatCard
          icon={<Users className="h-5 w-5 text-blue-600" />}
          title="Usuarios con zona"
          value={totalConZona}
        />
        <StatCard
          icon={<Activity className="h-5 w-5 text-purple-600" />}
          title="Cobertura de zona"
          value={cobertura}
        />
      </div>

      {withZone.length === 0 ? (
        <div className="rounded-xl border border-neutral-200/70 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <EmptyState text="Todavía no hay usuarios con zona registrada" />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          {/* Tabla-pivote */}
          <div className="overflow-hidden rounded-xl border border-neutral-200/70 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-neutral-200/70 bg-neutral-50/60">
                  <tr>
                    <SortableTh label="Provincia" k="provincia" align="left" />
                    <SortableTh label="Usuarios" k="total" />
                    <SortableTh label="Habilitados" k="enabled" />
                    <SortableTh label="Pendientes" k="pending" />
                    <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                      % del total
                    </th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200/60">
                  {sorted.map((z) => {
                    const pct = totalConZona > 0 ? Math.round((z.total / totalConZona) * 100) : 0;
                    return (
                      <tr
                        key={z.provincia}
                        onClick={() => goTo(z.provincia)}
                        className="group cursor-pointer transition-colors hover:bg-green-50/50"
                      >
                        <td className="px-4 py-2.5 text-sm font-medium text-neutral-800">
                          {z.provincia}
                        </td>
                        <td className="px-4 py-2.5 text-right text-sm font-semibold tabular-nums text-neutral-900">
                          {z.total}
                        </td>
                        <td className="px-4 py-2.5 text-right text-sm tabular-nums text-green-700">
                          {z.enabled}
                        </td>
                        <td className="px-4 py-2.5 text-right text-sm tabular-nums text-amber-600">
                          {z.pending}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center justify-end gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-neutral-100">
                              <div className="h-full rounded-full bg-green-500" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="w-8 text-right text-xs tabular-nums text-neutral-500">{pct}%</span>
                          </div>
                        </td>
                        <td className="pr-3 text-right">
                          <ChevronRight className="h-4 w-4 text-neutral-300 transition-colors group-hover:text-green-600" />
                        </td>
                      </tr>
                    );
                  })}
                  {unknown && unknown.total > 0 && (
                    <tr className="bg-neutral-50/40 text-neutral-400">
                      <td className="px-4 py-2.5 text-sm italic">Sin especificar</td>
                      <td className="px-4 py-2.5 text-right text-sm tabular-nums">{unknown.total}</td>
                      <td className="px-4 py-2.5 text-right text-sm tabular-nums">{unknown.enabled}</td>
                      <td className="px-4 py-2.5 text-right text-sm tabular-nums">{unknown.pending}</td>
                      <td className="px-4 py-2.5" />
                      <td />
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Donut top-5 */}
          <div className="rounded-xl border border-neutral-200/70 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-900">
              <MapPin className="h-4 w-4 text-green-600" />
              Top 5 provincias
            </h3>
            <p className="mb-2 text-xs text-gray-400">Distribución de usuarios con zona</p>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {donutData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      fontSize: '13px',
                    }}
                    formatter={(value) => [`${value} usuarios`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Leyenda compacta */}
            <ul className="mt-2 space-y-1">
              {donutData.map((d, i) => (
                <li key={d.name} className="flex items-center gap-2 text-xs text-neutral-600">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-sm"
                    style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                  <span className="flex-1 truncate">{d.name}</span>
                  <span className="tabular-nums text-neutral-500">{d.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon, title, value, onClick,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border border-neutral-200/70 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] sm:p-5 ${onClick ? 'cursor-pointer hover:ring-1 hover:ring-green-300' : ''}`}
    >
      <div className="mb-2 flex items-center gap-2.5">
        <div className="rounded-lg bg-neutral-50 p-2 ring-1 ring-neutral-200/70">
          {icon}
        </div>
        <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">{title}</span>
      </div>
      <p className="text-2xl font-semibold tabular-nums tracking-tight text-neutral-900 sm:text-3xl">
        {value.toLocaleString('es-AR')}
      </p>
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
        <div className="absolute left-0 top-full z-50 mt-1.5 w-52 rounded-xl border border-gray-200 bg-white py-1.5 shadow-xl animate-in fade-in-0 zoom-in-95 duration-150 sm:left-auto sm:right-0">
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
  events, pagination, filters, isLoading, error, onFilterChange, onPageChange, formatDate,
}: {
  events: AnalyticsEvent[];
  pagination: { page: number; totalPages: number; total: number; hasNext: boolean; hasPrev: boolean };
  filters: { userId: string; eventType: string; dateFrom: string; dateTo: string; search: string };
  isLoading: boolean;
  error: string | null;
  onFilterChange: (key: string, value: string) => void;
  onPageChange: (page: number) => void;
  formatDate: (d: string) => string;
}) {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="rounded-xl border border-neutral-200/70 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="mb-3 flex items-center gap-2">
          <Filter className="h-4 w-4 text-neutral-500" />
          <span className="text-sm font-medium text-neutral-700">Filtros</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            placeholder="Email, producto o término..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="text-sm"
          />
          <select
            value={filters.eventType}
            onChange={(e) => onFilterChange('eventType', e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Todos los tipos</option>
            <option value="login">Login</option>
            <option value="search">Búsqueda</option>
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
        </div>
      </div>

      {/* Events — mobile cards */}
      <div className="overflow-hidden rounded-xl border border-neutral-200/70 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] lg:hidden">
        {isLoading && events.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-neutral-500">Cargando...</p>
        ) : error ? (
          <p className="px-4 py-8 text-center text-sm text-red-500">{error}</p>
        ) : events.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-neutral-500">No se encontraron registros</p>
        ) : (
          events.map((event) => {
            const detalle =
              event.eventType === 'search' && event.payload?.query
                ? `"${event.payload.query}" (${event.payload.resultsCount ?? '?'} resultados)`
                : event.eventType === 'product_view' && event.payload?.productName
                  ? event.payload.productName
                  : event.eventType === 'login'
                    ? 'Ingresó al sistema'
                    : null;
            const usuario = event.payload?.email || 'Visitante';
            return (
              <div
                key={event.id}
                className="flex flex-col gap-1 border-b border-neutral-200/60 px-4 py-3 last:border-b-0"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    event.eventType === 'login'
                      ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
                      : event.eventType === 'product_view'
                        ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                        : 'bg-purple-50 text-purple-700 ring-1 ring-purple-200'
                  }`}>
                    {event.eventType === 'login' ? <LogIn className="h-3 w-3" /> : event.eventType === 'product_view' ? <Eye className="h-3 w-3" /> : <Search className="h-3 w-3" />}
                    {event.eventType === 'product_view' ? 'vista' : event.eventType}
                  </span>
                  <span className="shrink-0 text-[11px] tabular-nums text-neutral-500">
                    {formatDate(event.createdAt)}
                  </span>
                </div>
                <p className="truncate text-[13px] text-neutral-700">{usuario}</p>
                {detalle ? (
                  <p className="truncate text-[12px] text-neutral-500">{detalle}</p>
                ) : null}
              </div>
            );
          })
        )}

        {/* Pagination mobile */}
        <div className="flex flex-col items-stretch justify-between gap-2 border-t border-neutral-200/70 px-4 py-3 sm:flex-row sm:items-center">
          <span className="text-sm tabular-nums text-neutral-600">
            {pagination.total} eventos
          </span>
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrev}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              Anterior
            </Button>
            <span className="text-sm tabular-nums text-neutral-600">
              {pagination.page} / {pagination.totalPages || 1}
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

      {/* Events Table — desktop */}
      <div className="hidden overflow-hidden rounded-xl border border-neutral-200/70 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] lg:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-neutral-200/70 bg-neutral-50/60">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Fecha</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Tipo</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Usuario</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200/60">
              {isLoading && events.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-neutral-500">Cargando...</td></tr>
              ) : error ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-red-500">{error}</td></tr>
              ) : events.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-neutral-500">No se encontraron registros</td></tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id} className="transition-colors hover:bg-neutral-50/60">
                    <td className="whitespace-nowrap px-4 py-3 text-sm tabular-nums text-neutral-600">
                      {formatDate(event.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        event.eventType === 'login'
                          ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
                          : event.eventType === 'product_view'
                            ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                            : 'bg-purple-50 text-purple-700 ring-1 ring-purple-200'
                      }`}>
                        {event.eventType === 'login' ? <LogIn className="h-3 w-3" /> : event.eventType === 'product_view' ? <Eye className="h-3 w-3" /> : <Search className="h-3 w-3" />}
                        {event.eventType === 'product_view' ? 'vista' : event.eventType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600">
                      {event.payload?.email || <span className="italic text-neutral-400">Visitante</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600">
                      {event.eventType === 'search' && event.payload?.query
                        ? `"${event.payload.query}" (${event.payload.resultsCount ?? '?'} resultados)`
                        : event.eventType === 'product_view' && event.payload?.productName
                          ? event.payload.productName
                          : event.eventType === 'login'
                            ? 'Ingresó al sistema'
                            : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination desktop */}
        <div className="flex items-center justify-between border-t border-neutral-200/70 px-4 py-3">
          <span className="text-sm tabular-nums text-neutral-600">
            {pagination.total} eventos
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
            <span className="text-sm tabular-nums text-neutral-600">
              {pagination.page} / {pagination.totalPages || 1}
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
      <ResponsiveDialog
        open={selectedUser !== null}
        onOpenChange={(open) => { if (!open) onCloseDetail(); }}
      >
        <ResponsiveDialogContent className="sm:max-w-md">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>
              {selectedUser
                ? `Actividad de ${selectedUser.user.nombre} ${selectedUser.user.apellido}`
                : 'Actividad'}
            </ResponsiveDialogTitle>
          </ResponsiveDialogHeader>
          {selectedUser && (
            <div className="grid grid-cols-1 gap-3 py-2 sm:grid-cols-3">
              <div className="rounded-lg border border-neutral-200/70 bg-neutral-50/60 p-3">
                <p className="text-[11px] uppercase tracking-wide text-neutral-500">Último login</p>
                <p className="mt-1 text-sm font-medium tabular-nums text-neutral-900">
                  {selectedUser.activity.lastLogin ? formatDate(selectedUser.activity.lastLogin) : 'Nunca'}
                </p>
              </div>
              <div className="rounded-lg border border-neutral-200/70 bg-neutral-50/60 p-3">
                <p className="text-[11px] uppercase tracking-wide text-neutral-500">Total logins</p>
                <p className="mt-1 text-sm font-semibold tabular-nums text-neutral-900">
                  {selectedUser.activity.loginCount}
                </p>
              </div>
              <div className="rounded-lg border border-neutral-200/70 bg-neutral-50/60 p-3">
                <p className="text-[11px] uppercase tracking-wide text-neutral-500">Total búsquedas</p>
                <p className="mt-1 text-sm font-semibold tabular-nums text-neutral-900">
                  {selectedUser.activity.searchCount}
                </p>
              </div>
            </div>
          )}
        </ResponsiveDialogContent>
      </ResponsiveDialog>

      {/* Users — mobile cards */}
      <div className="overflow-hidden rounded-xl border border-neutral-200/70 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] lg:hidden">
        {isLoading && users.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-neutral-500">Cargando...</p>
        ) : users.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-neutral-500">No se encontraron usuarios</p>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 border-b border-neutral-200/60 px-4 py-3 last:border-b-0"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-[14px] font-medium tracking-tight text-neutral-900">
                    {user.nombre} {user.apellido}
                  </p>
                  <span className={`inline-flex shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${rolBadgeColor(user.rol)}`}>
                    {rolLabel(user.rol)}
                  </span>
                </div>
                {user.email ? (
                  <p className="mt-0.5 truncate text-[12px] text-neutral-500">
                    {user.email}
                  </p>
                ) : null}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewUser(user)}
                className="shrink-0 gap-1 text-xs"
              >
                <Eye className="h-3 w-3" />
                Ver
              </Button>
            </div>
          ))
        )}

        {/* Pagination mobile */}
        <div className="flex flex-col items-stretch justify-between gap-2 border-t border-neutral-200/70 px-4 py-3 sm:flex-row sm:items-center">
          <span className="text-sm tabular-nums text-neutral-600">
            {pagination.total} usuarios
          </span>
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrev}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              Anterior
            </Button>
            <span className="text-sm tabular-nums text-neutral-600">
              {pagination.page} / {pagination.totalPages || 1}
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

      {/* Users Table — desktop */}
      <div className="hidden overflow-hidden rounded-xl border border-neutral-200/70 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] lg:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-neutral-200/70 bg-neutral-50/60">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Nombre</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Email</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Teléfono</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Rol</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200/60">
              {isLoading && users.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-neutral-500">Cargando...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-neutral-500">No se encontraron usuarios</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-neutral-50/60">
                    <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                      {user.nombre} {user.apellido}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600">{user.email}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600">{user.telefono}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${rolBadgeColor(user.rol)}`}>
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
        <div className="flex flex-col items-stretch justify-between gap-2 border-t border-neutral-200/70 px-4 py-3 sm:flex-row sm:items-center">
          <span className="text-sm tabular-nums text-neutral-600">
            {pagination.total} usuarios
          </span>
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrev}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              Anterior
            </Button>
            <span className="text-sm tabular-nums text-neutral-600">
              {pagination.page} / {pagination.totalPages || 1}
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

      {/* Ranking Chart — solo desktop (mobile usa cards de abajo) */}
      {ranking.length > 0 && (
        <div className="hidden rounded-xl border border-neutral-200/70 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:p-6 lg:block">
          <div className="h-64 sm:h-80">
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

      {/* Ranking — cards mobile */}
      <div className="overflow-hidden rounded-xl border border-neutral-200/70 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] lg:hidden">
        {isLoading && ranking.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-neutral-500">Cargando...</p>
        ) : ranking.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-neutral-500">Sin datos de ventas aun</p>
        ) : (
          ranking.map((item, i) => (
            <div
              key={item.productId}
              className="flex items-center gap-3 border-b border-neutral-200/60 px-4 py-3 last:border-b-0"
            >
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[12px] font-semibold tabular-nums text-neutral-500 ring-1 ring-neutral-200/70">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium tracking-tight text-neutral-900">
                  {item.productName}
                </p>
                <p className="mt-0.5 text-[12px] tabular-nums text-neutral-500">
                  {item.orderCount} {item.orderCount === 1 ? 'orden' : 'órdenes'}
                </p>
              </div>
              <span
                className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[12px] font-semibold tabular-nums ring-1 ${
                  order === 'top'
                    ? 'bg-green-50 text-green-700 ring-green-200'
                    : 'bg-red-50 text-red-700 ring-red-200'
                }`}
              >
                {item.totalSold}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Ranking Table — desktop */}
      <div className="hidden overflow-hidden rounded-xl border border-neutral-200/70 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] lg:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-neutral-200/70 bg-neutral-50/60">
              <tr>
                <th className="w-12 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-500">#</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Producto</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Unidades vendidas</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Órdenes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200/60">
              {isLoading && ranking.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-neutral-500">Cargando...</td></tr>
              ) : ranking.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-neutral-500">Sin datos de ventas aun</td></tr>
              ) : (
                ranking.map((item, i) => (
                  <tr key={item.productId} className="transition-colors hover:bg-neutral-50/60">
                    <td className="px-4 py-3 text-sm font-semibold tabular-nums text-neutral-400">{i + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-neutral-900">{item.productName}</td>
                    <td className="px-4 py-3 text-right text-sm">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium tabular-nums ring-1 ${
                        order === 'top' ? 'bg-green-50 text-green-700 ring-green-200' : 'bg-red-50 text-red-700 ring-red-200'
                      }`}>
                        {item.totalSold}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm tabular-nums text-neutral-600">{item.orderCount}</td>
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

      <ResponsiveDialog open={open} onOpenChange={setOpen}>
        <ResponsiveDialogContent className="max-w-[820px] overflow-hidden p-0 sm:p-0">
          <ResponsiveDialogHeader className="sr-only">
            <ResponsiveDialogTitle>{placeholder}</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>Seleccioná el rango de fechas.</ResponsiveDialogDescription>
          </ResponsiveDialogHeader>

          {/* Date display header */}
          <div className="border-b border-neutral-200/70 px-4 pt-4 pb-3 sm:px-6 sm:pt-5">
            <div className="flex items-center gap-3 rounded-lg border border-neutral-200/70 bg-neutral-50 px-3 py-2.5 sm:px-4">
              <Calendar className={`h-4 w-4 ${accentClasses.icon} shrink-0`} />
              <span className="text-sm font-medium tabular-nums text-neutral-700">
                {tempRange.from ? format(tempRange.from, 'yyyy-MM-dd') : 'Fecha inicio'}
              </span>
              <span className="text-neutral-400">~</span>
              <span className="text-sm font-medium tabular-nums text-neutral-700">
                {tempRange.to ? format(tempRange.to, 'yyyy-MM-dd') : 'Fecha fin'}
              </span>
              {tempRange.from && (
                <button
                  type="button"
                  onClick={() => setTempRange({ from: undefined, to: undefined })}
                  className="ml-auto text-neutral-400 transition-colors hover:text-neutral-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {tempRange.from && tempRange.to && tempRange.from > tempRange.to && (
              <p className="mt-2 text-xs text-red-500">
                La fecha de inicio no puede ser posterior a la fecha de fin.
              </p>
            )}
          </div>

          {/* Presets: bar horizontal en mobile, sidebar en desktop */}
          <div className="flex flex-col md:flex-row">
            <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-neutral-200/70 px-2 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:w-40 md:flex-col md:gap-0.5 md:overflow-visible md:border-b-0 md:border-r md:px-2 md:py-3">
              {SIDEBAR_PRESETS.map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => applyPreset(preset.key)}
                  className="shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-sm text-neutral-600 transition-colors hover:bg-green-50 hover:text-green-700 md:w-full md:py-2 md:text-left"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="flex-1 px-3 py-3 sm:px-4 sm:py-4">
              <CustomRangeCalendar
                selected={tempRange}
                onSelect={setTempRange}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-neutral-200/70 bg-neutral-50 px-4 py-3 sm:gap-3 sm:px-6">
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
        </ResponsiveDialogContent>
      </ResponsiveDialog>
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
      <div className="rounded-xl border border-neutral-200/70 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:p-6">
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
        <div className="rounded-xl border border-neutral-200/70 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:p-6">
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
