import { useState, useMemo } from 'react';
import { Order, OrderStatus } from '../types';
import { OrderCard } from './OrderCard';
import { cn } from '../utils/cn';

interface OrdersScreenProps {
  orders: Order[];
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
}

type FilterTab = 'all' | 'new' | 'preparing' | 'ready' | 'history';

export function OrdersScreen({ orders, onStatusChange }: OrdersScreenProps) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (activeFilter === 'all') return order.status !== 'picked';
      if (activeFilter === 'new') return order.status === 'new' || order.status === 'accepted';
      if (activeFilter === 'preparing') return order.status === 'preparing';
      if (activeFilter === 'ready') return order.status === 'ready';
      if (activeFilter === 'history') return order.status === 'picked';
      return true;
    });
  }, [orders, activeFilter]);

  const counts = useMemo(() => ({
    all: orders.filter(o => o.status !== 'picked').length,
    new: orders.filter((o) => o.status === 'new' || o.status === 'accepted').length,
    preparing: orders.filter((o) => o.status === 'preparing').length,
    ready: orders.filter((o) => o.status === 'ready').length,
    history: orders.filter((o) => o.status === 'picked').length,
  }), [orders]);

  const tabs: { key: FilterTab; label: string; showBadge?: boolean }[] = [
    { key: 'all', label: 'All' },
    { key: 'new', label: 'New', showBadge: true },
    { key: 'preparing', label: 'Preparing' },
    { key: 'ready', label: 'Ready' },
    { key: 'history', label: 'History' },
  ];

  const newOrdersCount = orders.filter(o => o.status === 'new').length;

  return (
    <div className="flex flex-col h-full bg-[#F8F8F8]">
      {/* Live Orders Header */}
      {newOrdersCount > 0 && (
        <div className="zomato-gradient px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                <span className="text-xl">🔔</span>
              </div>
              <div className="text-white">
                <p className="font-bold text-lg">{newOrdersCount} New Order{newOrdersCount > 1 ? 's' : ''}</p>
                <p className="text-sm opacity-90">Tap to accept</p>
              </div>
            </div>
            <div className="text-white text-right">
              <p className="text-2xl font-bold">₹{orders.filter(o => o.status === 'new').reduce((sum, o) => sum + o.total, 0)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={cn(
                'flex-shrink-0 px-5 py-4 text-sm font-semibold transition-all relative whitespace-nowrap',
                activeFilter === tab.key
                  ? 'text-[#E23744]'
                  : 'text-gray-500'
              )}
            >
              {tab.label}
              {counts[tab.key] > 0 && (
                <span className={cn(
                  'ml-1.5 px-2 py-0.5 rounded-full text-xs font-bold',
                  activeFilter === tab.key 
                    ? 'bg-[#E23744] text-white' 
                    : tab.showBadge && counts[tab.key] > 0 
                      ? 'bg-[#E23744] text-white animate-pulse' 
                      : 'bg-gray-100 text-gray-600'
                )}>
                  {counts[tab.key]}
                </span>
              )}
              {activeFilter === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E23744]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-auto p-4 space-y-3 pb-24">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <div className="w-24 h-24 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-4xl">📋</span>
            </div>
            <p className="text-lg font-semibold text-gray-600">No orders here</p>
            <p className="text-sm text-gray-400">
              {activeFilter === 'history' 
                ? 'Completed orders will appear here' 
                : 'New orders will appear here'}
            </p>
          </div>
        ) : (
          filteredOrders
            .sort((a, b) => {
              // New orders first, then by creation time
              if (a.status === 'new' && b.status !== 'new') return -1;
              if (a.status !== 'new' && b.status === 'new') return 1;
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            })
            .map((order) => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onStatusChange={onStatusChange}
              />
            ))
        )}
      </div>
    </div>
  );
}
