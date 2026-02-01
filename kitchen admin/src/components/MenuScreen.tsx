import { useState } from 'react';
import { MenuItem } from '../types';
import { cn } from '../utils/cn';

interface MenuScreenProps {
  menuItems: MenuItem[];
  onToggleAvailability: (itemId: string) => void;
  onUpdatePrice: (itemId: string, newPrice: number) => void;
  onAddItem: (item: Omit<MenuItem, 'id'>) => void;
  onDeleteItem: (itemId: string) => void;
}

const emojiOptions = ['🍛', '🍲', '🍚', '🧀', '🫓', '🥤', '🍜', '🥗', '🍕', '🍔', '🌮', '🥘', '🍝', '🍱', '☕', '🍰', '🥞', '🍗', '🥛', '🌯'];

export function MenuScreen({
  menuItems,
  onToggleAvailability,
  onUpdatePrice,
  onAddItem,
  onDeleteItem,
}: MenuScreenProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editPriceValue, setEditPriceValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [newItem, setNewItem] = useState({ name: '', price: '', image: '🍛', isVeg: true, description: '' });

  const filteredItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availableCount = menuItems.filter(i => i.available).length;
  const outOfStockCount = menuItems.filter(i => !i.available).length;

  const handlePriceEdit = (item: MenuItem) => {
    setEditingPriceId(item.id);
    setEditPriceValue(item.price.toString());
  };

  const handlePriceSave = (itemId: string) => {
    const price = parseFloat(editPriceValue);
    if (!isNaN(price) && price > 0) {
      onUpdatePrice(itemId, price);
    }
    setEditingPriceId(null);
  };

  const handleAddItem = () => {
    if (newItem.name && newItem.price) {
      onAddItem({
        name: newItem.name,
        price: parseFloat(newItem.price),
        image: newItem.image,
        available: true,
        isVeg: newItem.isVeg,
        description: newItem.description,
      });
      setNewItem({ name: '', price: '', image: '🍛', isVeg: true, description: '' });
      setShowAddModal(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F8F8F8]">
      {/* Header with Stats */}
      <div className="bg-white sticky top-0 z-10 shadow-sm">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-[#1C1C1C]">Menu</h2>
              <p className="text-sm text-gray-500">{menuItems.length} items</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#E23744] text-white rounded-xl text-sm font-semibold hover:bg-[#CB202D] transition-all active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Item
            </button>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 bg-green-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-[#3AB757]">{availableCount}</p>
              <p className="text-xs text-gray-600">Available</p>
            </div>
            <div className="flex-1 bg-red-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-[#E23744]">{outOfStockCount}</p>
              <p className="text-xs text-gray-600">Out of Stock</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search menu items..."
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E23744]/20"
            />
          </div>
        </div>
      </div>

      {/* Menu Items List */}
      <div className="flex-1 overflow-auto p-4 space-y-3 pb-24">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={cn(
              'bg-white rounded-xl transition-all card-shadow overflow-hidden',
              !item.available && 'opacity-60'
            )}
          >
            <div className="p-4">
              <div className="flex gap-4">
                {/* Image/Emoji */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center text-4xl">
                    {item.image}
                  </div>
                  {/* Veg/Non-veg indicator */}
                  <div className={cn(
                    "absolute -top-1 -left-1 w-5 h-5 rounded border-2 flex items-center justify-center bg-white",
                    item.isVeg ? "border-[#3AB757]" : "border-[#E23744]"
                  )}>
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      item.isVeg ? "bg-[#3AB757]" : "bg-[#E23744]"
                    )} />
                  </div>
                  {item.isBestseller && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#F5A623] text-white text-[9px] font-bold rounded whitespace-nowrap">
                      ★ BESTSELLER
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className={cn('font-semibold text-[#1C1C1C]', !item.available && 'line-through')}>
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
                  )}
                  
                  {/* Price Editor */}
                  <div className="mt-2">
                    {editingPriceId === item.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 font-medium">₹</span>
                        <input
                          type="number"
                          value={editPriceValue}
                          onChange={(e) => setEditPriceValue(e.target.value)}
                          className="w-20 px-2 py-1.5 border-2 border-[#E23744] rounded-lg text-sm font-bold focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handlePriceSave(item.id)}
                          className="px-3 py-1.5 bg-[#3AB757] text-white rounded-lg text-xs font-bold"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingPriceId(null)}
                          className="px-3 py-1.5 bg-gray-200 text-gray-600 rounded-lg text-xs font-bold"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handlePriceEdit(item)}
                        className="flex items-center gap-1 text-lg font-bold text-[#1C1C1C] hover:text-[#E23744] transition-colors"
                      >
                        ₹{item.price}
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Toggle Switch */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => onToggleAvailability(item.id)}
                    className={cn(
                      'relative w-12 h-7 rounded-full transition-all',
                      item.available ? 'bg-[#3AB757]' : 'bg-gray-300'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all',
                        item.available ? 'left-5' : 'left-0.5'
                      )}
                    />
                  </button>
                  <span className={cn(
                    'text-[10px] font-semibold',
                    item.available ? 'text-[#3AB757]' : 'text-[#E23744]'
                  )}>
                    {item.available ? 'In Stock' : 'Out'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex border-t border-gray-100">
              <button
                onClick={() => handlePriceEdit(item)}
                className="flex-1 py-3 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Price
              </button>
              <div className="w-px bg-gray-100" />
              <button
                onClick={() => onDeleteItem(item.id)}
                className="flex-1 py-3 text-xs font-medium text-[#E23744] hover:bg-red-50 transition-colors flex items-center justify-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <div className="w-24 h-24 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-4xl">🍽️</span>
            </div>
            <p className="text-lg font-semibold text-gray-600">
              {searchQuery ? 'No items found' : 'No menu items yet'}
            </p>
            <p className="text-sm text-gray-400">
              {searchQuery ? 'Try a different search' : 'Add your first menu item'}
            </p>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={() => setShowAddModal(false)}>
          <div 
            className="w-full max-w-lg bg-white rounded-t-3xl animate-slide-up max-h-[90vh] overflow-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#1C1C1C]">Add New Item</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Emoji Picker */}
              <div>
                <label className="block text-sm font-semibold text-[#1C1C1C] mb-3">Item Icon</label>
                <div className="flex flex-wrap gap-2">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setNewItem({ ...newItem, image: emoji })}
                      className={cn(
                        'w-12 h-12 text-2xl rounded-xl transition-all',
                        newItem.image === emoji
                          ? 'bg-[#E23744]/10 ring-2 ring-[#E23744]'
                          : 'bg-gray-100 hover:bg-gray-200'
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Veg/Non-veg Toggle */}
              <div>
                <label className="block text-sm font-semibold text-[#1C1C1C] mb-3">Item Type</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setNewItem({ ...newItem, isVeg: true })}
                    className={cn(
                      'flex-1 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all',
                      newItem.isVeg 
                        ? 'bg-[#3AB757] text-white' 
                        : 'bg-gray-100 text-gray-600'
                    )}
                  >
                    <span className="w-4 h-4 rounded border-2 border-current flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-current" />
                    </span>
                    Veg
                  </button>
                  <button
                    onClick={() => setNewItem({ ...newItem, isVeg: false })}
                    className={cn(
                      'flex-1 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all',
                      !newItem.isVeg 
                        ? 'bg-[#E23744] text-white' 
                        : 'bg-gray-100 text-gray-600'
                    )}
                  >
                    <span className="w-4 h-4 rounded border-2 border-current flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-current" />
                    </span>
                    Non-Veg
                  </button>
                </div>
              </div>

              {/* Item Name */}
              <div>
                <label className="block text-sm font-semibold text-[#1C1C1C] mb-2">Item Name *</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="e.g., Butter Chicken"
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E23744] transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-[#1C1C1C] mb-2">Description (optional)</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Add a short description..."
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E23744] transition-colors resize-none"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-[#1C1C1C] mb-2">Price (₹) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                  <input
                    type="number"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#E23744] transition-colors"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleAddItem}
                disabled={!newItem.name || !newItem.price}
                className={cn(
                  'w-full py-4 rounded-xl text-white font-bold text-base transition-all',
                  newItem.name && newItem.price
                    ? 'bg-[#E23744] hover:bg-[#CB202D] active:scale-[0.98]'
                    : 'bg-gray-300 cursor-not-allowed'
                )}
              >
                Add to Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
