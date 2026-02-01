import { useState, useRef } from 'react';
import { Order, OrderStatus } from '../types';
import { cn } from '../utils/cn';

interface OrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const statusConfig: Record<OrderStatus, {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  nextStatus: OrderStatus | null;
  buttonLabel: string;
  buttonBg: string;
}> = {
  new: {
    label: 'NEW ORDER',
    bgColor: 'bg-[#E23744]',
    textColor: 'text-white',
    borderColor: 'border-l-[#E23744]',
    nextStatus: 'accepted',
    buttonLabel: 'Accept Order',
    buttonBg: 'bg-[#E23744]',
  },
  accepted: {
    label: 'ACCEPTED',
    bgColor: 'bg-[#F5A623]',
    textColor: 'text-white',
    borderColor: 'border-l-[#F5A623]',
    nextStatus: 'preparing',
    buttonLabel: 'Start Preparing',
    buttonBg: 'bg-[#F5A623]',
  },
  preparing: {
    label: 'PREPARING',
    bgColor: 'bg-[#3B82F6]',
    textColor: 'text-white',
    borderColor: 'border-l-[#3B82F6]',
    nextStatus: 'ready',
    buttonLabel: 'Mark Ready',
    buttonBg: 'bg-[#3AB757]',
  },
  ready: {
    label: 'READY',
    bgColor: 'bg-[#3AB757]',
    textColor: 'text-white',
    borderColor: 'border-l-[#3AB757]',
    nextStatus: 'picked',
    buttonLabel: 'Order Picked Up',
    buttonBg: 'bg-[#3AB757]',
  },
  picked: {
    label: 'PICKED UP',
    bgColor: 'bg-gray-400',
    textColor: 'text-white',
    borderColor: 'border-l-gray-400',
    nextStatus: null,
    buttonLabel: 'Completed',
    buttonBg: 'bg-gray-400',
  },
};

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 60000);
  if (diff < 1) return 'Just now';
  if (diff === 1) return '1 min ago';
  if (diff < 60) return `${diff} mins ago`;
  const hours = Math.floor(diff / 60);
  if (hours === 1) return '1 hour ago';
  return `${hours} hours ago`;
}

export function OrderCard({ order, onStatusChange }: OrderCardProps) {
  const config = statusConfig[order.status];
  const [swipeX, setSwipeX] = useState(0);
  const [isExpanded, setIsExpanded] = useState(order.status === 'new');
  const startXRef = useRef(0);
  const isDraggingRef = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (order.status === 'picked') return;
    startXRef.current = e.touches[0].clientX;
    isDraggingRef.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || order.status === 'picked') return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startXRef.current;
    if (diff > 0) {
      setSwipeX(Math.min(diff, 120));
    }
  };

  const handleTouchEnd = () => {
    if (swipeX > 100 && config.nextStatus) {
      onStatusChange(order.id, config.nextStatus);
    }
    setSwipeX(0);
    isDraggingRef.current = false;
  };

  const isNew = order.status === 'new';

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-white border-l-4 transition-all duration-300 card-shadow',
        config.borderColor,
        isNew && 'animate-pulse-ring'
      )}
    >
      {/* Swipe indicator background */}
      {order.status !== 'picked' && (
        <div
          className={cn(
            'absolute inset-y-0 left-0 flex items-center justify-center text-white transition-all',
            config.nextStatus === 'ready' || config.nextStatus === 'picked' ? 'bg-[#3AB757]' : 'bg-[#F5A623]'
          )}
          style={{ width: swipeX, opacity: swipeX > 0 ? 1 : 0 }}
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      <div
        className="relative bg-white"
        style={{ transform: `translateX(${swipeX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header */}
        <div 
          className="p-4 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={cn(
                  'px-2 py-0.5 rounded text-[10px] font-bold tracking-wide',
                  config.bgColor,
                  config.textColor
                )}>
                  {config.label}
                </span>
                {order.paymentMode === 'COD' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-600">
                    COD ₹{order.total}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-[#1C1C1C] text-lg">#{order.id}</h3>
              <p className="text-sm text-gray-500">{order.customerName}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">{formatTime(order.createdAt)}</p>
              <p className="text-xs font-medium text-[#E23744]">{getTimeAgo(order.createdAt)}</p>
              {order.prepTime && order.status !== 'picked' && order.status !== 'ready' && (
                <p className="text-xs text-gray-500 mt-1">⏱ {order.prepTime} mins</p>
              )}
            </div>
          </div>

          {/* Items Preview */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">{order.items.reduce((acc, i) => acc + i.quantity, 0)} items</span>
            <span>•</span>
            <span className="font-bold text-[#1C1C1C]">₹{order.total}</span>
            {order.paymentMode === 'Paid' && (
              <>
                <span>•</span>
                <span className="text-[#3AB757] font-medium flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Paid
                </span>
              </>
            )}
          </div>

          {/* Expand indicator */}
          <div className="flex justify-center mt-2">
            <svg 
              className={cn("w-5 h-5 text-gray-300 transition-transform", isExpanded && "rotate-180")} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-gray-100 animate-fade-in">
            {/* Items List */}
            <div className="p-4 bg-gray-50">
              {order.items.map((item, idx) => (
                <div key={item.id} className={cn("flex justify-between py-2", idx !== order.items.length - 1 && "border-b border-gray-200")}>
                  <div className="flex items-start gap-2">
                    <span className={cn(
                      "w-4 h-4 rounded-sm border-2 flex items-center justify-center text-[8px] font-bold mt-0.5",
                      "border-[#3AB757] text-[#3AB757]"
                    )}>●</span>
                    <div>
                      <p className="font-medium text-[#1C1C1C]">{item.name}</p>
                      {item.customizations && item.customizations.length > 0 && (
                        <p className="text-xs text-gray-500">{item.customizations.join(', ')}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-500">x{item.quantity}</span>
                    <p className="font-medium text-[#1C1C1C]">₹{item.price * item.quantity}</p>
                  </div>
                </div>
              ))}

              {order.instructions && (
                <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-xs font-medium text-yellow-800">📝 Instructions: {order.instructions}</p>
                </div>
              )}
            </div>

            {/* Delivery Partner Info */}
            {order.deliveryPartner && order.status !== 'new' && order.status !== 'accepted' && (
              <div className="px-4 py-3 bg-blue-50 border-t border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">{order.deliveryPartner[0]}</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#1C1C1C]">{order.deliveryPartner}</p>
                    <p className="text-xs text-gray-500">Delivery Partner</p>
                  </div>
                </div>
              </div>
            )}

            {/* Status Timeline */}
            <div className="px-4 py-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500">
                {order.createdAt && <span>📦 {formatTime(order.createdAt)}</span>}
                {order.acceptedAt && <span>✓ {formatTime(order.acceptedAt)}</span>}
                {order.preparingAt && <span>👨‍🍳 {formatTime(order.preparingAt)}</span>}
                {order.readyAt && <span>✅ {formatTime(order.readyAt)}</span>}
                {order.pickedAt && <span>🚴 {formatTime(order.pickedAt)}</span>}
              </div>
            </div>

            {/* Action Button */}
            {order.status !== 'picked' && config.nextStatus && (
              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(order.id, config.nextStatus!);
                  }}
                  className={cn(
                    'w-full py-4 rounded-xl text-white font-bold text-base transition-all active:scale-[0.98]',
                    config.buttonBg
                  )}
                >
                  {config.buttonLabel}
                </button>
                {config.nextStatus && (
                  <p className="text-center text-xs text-gray-400 mt-2">
                    👉 Swipe right to {config.buttonLabel.toLowerCase()}
                  </p>
                )}
              </div>
            )}

            {order.status === 'picked' && (
              <div className="p-4 border-t border-gray-100">
                <div className="w-full py-3 rounded-xl bg-gray-100 text-gray-500 font-medium text-center">
                  ✓ Order Completed
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
