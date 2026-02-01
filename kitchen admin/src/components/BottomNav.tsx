import { ReactNode } from 'react';
import { cn } from '../utils/cn';

export type Screen = 'orders' | 'menu' | 'settings';

interface BottomNavProps {
  activeScreen: Screen;
  onChangeScreen: (screen: Screen) => void;
  newOrdersCount: number;
}

export function BottomNav({ activeScreen, onChangeScreen, newOrdersCount }: BottomNavProps) {
  const navItems: { key: Screen; label: string; icon: ReactNode; activeIcon: ReactNode }[] = [
    { 
      key: 'orders', 
      label: 'Orders',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      activeIcon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 2a2 2 0 00-2 2v1H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2h-2V4a2 2 0 00-2-2H9zm0 2h6v1H9V4zm-1 6h8v2H8v-2zm0 4h5v2H8v-2z"/>
        </svg>
      ),
    },
    { 
      key: 'menu', 
      label: 'Menu',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      activeIcon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
        </svg>
      ),
    },
    { 
      key: 'settings', 
      label: 'More',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
      activeIcon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onChangeScreen(item.key)}
            className={cn(
              'relative flex flex-col items-center py-3 px-6 transition-all',
              activeScreen === item.key ? 'text-[#E23744]' : 'text-gray-400'
            )}
          >
            {activeScreen === item.key ? item.activeIcon : item.icon}
            <span className={cn(
              'text-[10px] font-semibold mt-1',
              activeScreen === item.key ? 'text-[#E23744]' : 'text-gray-400'
            )}>
              {item.label}
            </span>
            
            {/* Badge for new orders */}
            {item.key === 'orders' && newOrdersCount > 0 && (
              <span className="absolute top-1 right-3 flex items-center justify-center min-w-5 h-5 px-1.5 bg-[#E23744] text-white text-[10px] font-bold rounded-full animate-bounce-in">
                {newOrdersCount}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
