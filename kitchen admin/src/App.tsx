import { useState, useEffect, useCallback } from 'react';
import { Order, MenuItem, OrderStatus } from './types';
import { sampleOrders, sampleMenuItems } from './data/sampleData';
import { useLocalStorage } from './hooks/useLocalStorage';
import { OrdersScreen } from './components/OrdersScreen';
import { MenuScreen } from './components/MenuScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { BottomNav, Screen } from './components/BottomNav';
import { Notification } from './components/Notification';
import { cn } from './utils/cn';

// Notification sound
function playNotificationSound() {
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    
    // Create a more restaurant-like notification sound
    const playTone = (freq: number, startTime: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.2, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    const now = audioContext.currentTime;
    playTone(880, now, 0.15);
    playTone(1100, now + 0.15, 0.15);
    playTone(880, now + 0.3, 0.2);
  } catch (e) {
    console.log('Audio not supported');
  }
}

// Customer name generator
const customerNames = [
  'Rahul Sharma', 'Priya Singh', 'Amit Kumar', 'Sneha Patel', 'Arjun Reddy',
  'Kavita Nair', 'Vikram Mehta', 'Anita Gupta', 'Rajesh Iyer', 'Pooja Desai',
  'Sanjay Joshi', 'Meera Krishnan', 'Karan Malhotra', 'Divya Rao', 'Arun Pillai'
];

export function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>('orders');
  const [orders, setOrders] = useLocalStorage<Order[]>('zomato-orders', sampleOrders);
  const [menuItems, setMenuItems] = useLocalStorage<MenuItem[]>('zomato-menu', sampleMenuItems);
  const [isStoreOpen, setIsStoreOpen] = useLocalStorage<boolean>('store-open', true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setNotification({ message: 'Back online! Data synced.', type: 'success' });
    };
    const handleOffline = () => {
      setIsOnline(false);
      setNotification({ message: 'You are offline. Changes will sync when connected.', type: 'warning' });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Simulate receiving new orders periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8 && isStoreOpen) {
        const availableItems = menuItems.filter(m => m.available);
        if (availableItems.length === 0) return;

        const numItems = Math.floor(Math.random() * 3) + 1;
        const orderItems = [];
        let total = 0;

        for (let i = 0; i < numItems; i++) {
          const item = availableItems[Math.floor(Math.random() * availableItems.length)];
          const qty = Math.floor(Math.random() * 2) + 1;
          orderItems.push({
            id: String(Date.now() + i),
            name: item.name,
            quantity: qty,
            price: item.price,
          });
          total += item.price * qty;
        }

        const newOrder: Order = {
          id: `ZMT-${String(Date.now()).slice(-4)}`,
          customerName: customerNames[Math.floor(Math.random() * customerNames.length)],
          items: orderItems,
          total,
          paymentMode: Math.random() > 0.4 ? 'Paid' : 'COD',
          status: 'new',
          createdAt: new Date(),
          prepTime: Math.floor(Math.random() * 15) + 15,
        };

        setOrders((prev) => [newOrder, ...prev]);
        playNotificationSound();
        setNotification({ message: `🔔 New Order from ${newOrder.customerName}!`, type: 'info' });
      }
    }, 25000);

    return () => clearInterval(interval);
  }, [isStoreOpen, menuItems, setOrders]);

  // Handle order status change
  const handleStatusChange = useCallback(
    (orderId: string, newStatus: OrderStatus) => {
      setOrders((prev) =>
        prev.map((order) => {
          if (order.id === orderId) {
            const updated = { ...order, status: newStatus };
            if (newStatus === 'accepted') {
              updated.acceptedAt = new Date();
            }
            if (newStatus === 'preparing') {
              updated.preparingAt = new Date();
            }
            if (newStatus === 'ready') {
              updated.readyAt = new Date();
              // Simulate delivery partner assignment
              updated.deliveryPartner = ['Vikram', 'Raju', 'Suresh', 'Amit', 'Kiran'][Math.floor(Math.random() * 5)];
            }
            if (newStatus === 'picked') {
              updated.pickedAt = new Date();
            }
            return updated;
          }
          return order;
        })
      );

      const statusMessages: Record<OrderStatus, string> = {
        new: 'Order updated',
        accepted: '✓ Order accepted!',
        preparing: '👨‍🍳 Started preparing order',
        ready: '✅ Order ready for pickup!',
        picked: '🚴 Order picked up by rider',
      };

      setNotification({ message: statusMessages[newStatus], type: 'success' });
    },
    [setOrders]
  );

  // Menu handlers
  const handleToggleAvailability = useCallback(
    (itemId: string) => {
      setMenuItems((prev) =>
        prev.map((item) => {
          if (item.id === itemId) {
            const newAvailable = !item.available;
            setNotification({ 
              message: newAvailable ? `${item.name} is now available` : `${item.name} marked as out of stock`, 
              type: newAvailable ? 'success' : 'warning' 
            });
            return { ...item, available: newAvailable };
          }
          return item;
        })
      );
    },
    [setMenuItems]
  );

  const handleUpdatePrice = useCallback(
    (itemId: string, newPrice: number) => {
      setMenuItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, price: newPrice } : item)));
      setNotification({ message: 'Price updated successfully!', type: 'success' });
    },
    [setMenuItems]
  );

  const handleAddItem = useCallback(
    (item: Omit<MenuItem, 'id'>) => {
      const newItem: MenuItem = {
        ...item,
        id: String(Date.now()),
      };
      setMenuItems((prev) => [...prev, newItem]);
      setNotification({ message: `${item.name} added to menu!`, type: 'success' });
    },
    [setMenuItems]
  );

  const handleDeleteItem = useCallback(
    (itemId: string) => {
      const item = menuItems.find(m => m.id === itemId);
      setMenuItems((prev) => prev.filter((i) => i.id !== itemId));
      setNotification({ message: `${item?.name || 'Item'} removed from menu`, type: 'info' });
    },
    [setMenuItems, menuItems]
  );

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      setNotification({ message: 'Logged out successfully', type: 'info' });
    }
  };

  const newOrdersCount = orders.filter((o) => o.status === 'new').length;

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-[99] bg-[#E23744] text-white text-center py-2.5 text-sm font-medium flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
          </svg>
          You're Offline - Limited Functionality
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Header */}
      <header
        className={cn(
          'sticky top-0 z-40 bg-white shadow-sm',
          !isOnline && 'mt-10'
        )}
      >
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Zomato-style Logo */}
              <div className="w-10 h-10 rounded-xl zomato-gradient flex items-center justify-center">
                <span className="text-white font-bold text-xl">Z</span>
              </div>
              <div>
                <h1 className="font-bold text-lg text-[#1C1C1C]">Restaurant Partner</h1>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'w-2 h-2 rounded-full',
                    isStoreOpen ? 'bg-[#3AB757]' : 'bg-[#E23744]'
                  )} />
                  <p className="text-xs text-gray-500">
                    {isStoreOpen ? 'Accepting Orders' : 'Currently Closed'}
                  </p>
                </div>
              </div>
            </div>

            {/* New Orders Badge */}
            {newOrdersCount > 0 && activeScreen !== 'orders' && (
              <button
                onClick={() => setActiveScreen('orders')}
                className="flex items-center gap-2 px-3 py-2 bg-[#E23744] text-white rounded-xl text-sm font-semibold animate-pulse"
              >
                <span className="text-lg">🔔</span>
                <span>{newOrdersCount} New</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto bg-[#F8F8F8] min-h-[calc(100vh-60px)]">
        {activeScreen === 'orders' && <OrdersScreen orders={orders} onStatusChange={handleStatusChange} />}
        {activeScreen === 'menu' && (
          <MenuScreen
            menuItems={menuItems}
            onToggleAvailability={handleToggleAvailability}
            onUpdatePrice={handleUpdatePrice}
            onAddItem={handleAddItem}
            onDeleteItem={handleDeleteItem}
          />
        )}
        {activeScreen === 'settings' && (
          <SettingsScreen
            isStoreOpen={isStoreOpen}
            onToggleStore={() => setIsStoreOpen(!isStoreOpen)}
            orders={orders}
            onLogout={handleLogout}
            isOnline={isOnline}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeScreen={activeScreen} onChangeScreen={setActiveScreen} newOrdersCount={newOrdersCount} />
    </div>
  );
}
