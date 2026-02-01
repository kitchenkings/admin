import { Order } from '../types';
import { cn } from '../utils/cn';

interface SettingsScreenProps {
  isStoreOpen: boolean;
  onToggleStore: () => void;
  orders: Order[];
  onLogout: () => void;
  isOnline: boolean;
}

export function SettingsScreen({ isStoreOpen, onToggleStore, orders, onLogout, isOnline }: SettingsScreenProps) {
  // Calculate today's stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = orders.filter((order) => new Date(order.createdAt) >= today);
  const completedOrders = todayOrders.filter((order) => order.status === 'picked');
  const todayRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = todayOrders.filter((order) => order.status !== 'picked').length;
  const avgPrepTime = completedOrders.length > 0 
    ? Math.round(completedOrders.reduce((sum, o) => sum + (o.prepTime || 20), 0) / completedOrders.length)
    : 0;

  return (
    <div className="flex flex-col h-full bg-[#F8F8F8]">
      {/* Header */}
      <div className="bg-white p-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-[#1C1C1C]">Settings</h2>
        <p className="text-sm text-gray-500">Manage your restaurant</p>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4 pb-24">
        {/* Store Status Card */}
        <div className={cn(
          'bg-white rounded-2xl overflow-hidden card-shadow transition-all',
        )}>
          <div className={cn(
            'p-4',
            isStoreOpen ? 'bg-[#3AB757]/10' : 'bg-[#E23744]/10'
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  'w-14 h-14 rounded-2xl flex items-center justify-center text-2xl',
                  isStoreOpen ? 'bg-[#3AB757]' : 'bg-[#E23744]'
                )}>
                  {isStoreOpen ? '🏪' : '🔒'}
                </div>
                <div>
                  <h3 className="font-bold text-[#1C1C1C] text-lg">Restaurant Status</h3>
                  <p className={cn(
                    'text-sm font-semibold',
                    isStoreOpen ? 'text-[#3AB757]' : 'text-[#E23744]'
                  )}>
                    {isStoreOpen ? '● Open for Orders' : '● Closed'}
                  </p>
                </div>
              </div>

              <button
                onClick={onToggleStore}
                className={cn(
                  'relative w-16 h-9 rounded-full transition-all shadow-inner',
                  isStoreOpen ? 'bg-[#3AB757]' : 'bg-gray-300'
                )}
              >
                <span
                  className={cn(
                    'absolute top-1 w-7 h-7 bg-white rounded-full shadow-md transition-all',
                    isStoreOpen ? 'left-8' : 'left-1'
                  )}
                />
              </button>
            </div>
          </div>
          
          {!isStoreOpen && (
            <div className="px-4 py-3 bg-yellow-50 border-t border-yellow-100">
              <p className="text-xs text-yellow-700">
                ⚠️ Your restaurant is currently not accepting orders on the platform
              </p>
            </div>
          )}
        </div>

        {/* Today's Summary */}
        <div className="bg-white rounded-2xl p-4 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#1C1C1C]">Today's Summary</h3>
            <span className="text-xs text-gray-400">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">📦</span>
                <span className="text-xs text-gray-600">Total Orders</span>
              </div>
              <p className="text-2xl font-bold text-[#1C1C1C]">{todayOrders.length}</p>
            </div>

            <div className="bg-green-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">💰</span>
                <span className="text-xs text-gray-600">Revenue</span>
              </div>
              <p className="text-2xl font-bold text-[#3AB757]">₹{todayRevenue}</p>
            </div>

            <div className="bg-purple-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">✅</span>
                <span className="text-xs text-gray-600">Completed</span>
              </div>
              <p className="text-2xl font-bold text-[#1C1C1C]">{completedOrders.length}</p>
            </div>

            <div className="bg-orange-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">⏳</span>
                <span className="text-xs text-gray-600">Pending</span>
              </div>
              <p className="text-2xl font-bold text-[#F5A623]">{pendingOrders}</p>
            </div>
          </div>
        </div>

        {/* Performance Card */}
        <div className="zomato-gradient rounded-2xl p-5 text-white card-shadow">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📊</span>
            <h3 className="font-bold text-lg">Performance Today</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-white/70 text-sm">Avg. Prep Time</p>
              <p className="text-2xl font-bold">{avgPrepTime > 0 ? `${avgPrepTime} mins` : '-'}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm">Acceptance Rate</p>
              <p className="text-2xl font-bold">
                {todayOrders.length > 0 
                  ? `${Math.round((completedOrders.length / todayOrders.length) * 100)}%` 
                  : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="bg-white rounded-2xl p-4 card-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center',
                isOnline ? 'bg-green-100' : 'bg-red-100'
              )}>
                {isOnline ? '📡' : '📵'}
              </div>
              <div>
                <p className="font-semibold text-[#1C1C1C]">Connection Status</p>
                <p className={cn(
                  'text-sm',
                  isOnline ? 'text-[#3AB757]' : 'text-[#E23744]'
                )}>
                  {isOnline ? '● Online - All systems active' : '● Offline - Limited functionality'}
                </p>
              </div>
            </div>
            <div className={cn(
              'w-3 h-3 rounded-full',
              isOnline ? 'bg-[#3AB757] animate-pulse' : 'bg-[#E23744]'
            )} />
          </div>
        </div>

        {/* Support & Help */}
        <div className="bg-white rounded-2xl overflow-hidden card-shadow">
          <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">📞</div>
              <span className="font-medium text-[#1C1C1C]">Contact Support</span>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="h-px bg-gray-100" />
          <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">📖</div>
              <span className="font-medium text-[#1C1C1C]">Help Center</span>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="h-px bg-gray-100" />
          <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">⚙️</div>
              <span className="font-medium text-[#1C1C1C]">App Settings</span>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full py-4 bg-white text-[#E23744] font-bold rounded-2xl card-shadow hover:bg-red-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>

        {/* App Version */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-400">Restaurant Partner v2.0.0</p>
          <p className="text-xs text-gray-300">Made with ❤️ for restaurants</p>
        </div>
      </div>
    </div>
  );
}
