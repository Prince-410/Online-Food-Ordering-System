import { create } from 'zustand';
import api from '../lib/axios';

export interface CartItem {
  _id: string;
  menuItem: {
    _id: string;
    name: string;
    price: number;
    image: string;
    isVeg?: boolean;
  };
  name?: string;
  price?: number;
  image?: string;
  isVeg?: boolean;
  quantity: number;
  customizations: any[];
}

interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  discount: number;
  appliedCoupon: string | null;
  isLoading: boolean;
  isOpen: boolean;
  fetchCart: () => Promise<void>;
  addItem: (item: any) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  setIsOpen: (isOpen: boolean) => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  restaurantId: null,
  discount: 0,
  appliedCoupon: null,
  isLoading: false,
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/cart');
      set({ 
        items: data.items || [], 
        restaurantId: data.restaurant?._id || data.restaurant || null,
        discount: data.discount || 0,
        appliedCoupon: data.appliedCoupon || null
      });
    } catch (error) {
      console.error('Failed to fetch cart', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (itemData) => {
    try {
      const { data } = await api.post('/cart', itemData);
      set({ 
        items: data.items || [],
        restaurantId: data.restaurant || null,
      });
    } catch (error) {
      console.error('Failed to add item', error);
      throw error;
    }
  },

  removeItem: async (itemId) => {
    try {
      const { data } = await api.delete(`/cart/${itemId}`);
      set({ items: data.items || [], restaurantId: data.restaurant || null });
    } catch (error) {
      console.error('Failed to remove item', error);
    }
  },

  updateQuantity: async (itemId, quantity) => {
    try {
      const { data } = await api.put(`/cart/${itemId}`, { quantity });
      set({ items: data.items || [], restaurantId: data.restaurant || null });
    } catch (error) {
      console.error('Failed to update quantity', error);
    }
  },

  clearCart: async () => {
    try {
      await api.delete('/cart/clear');
      set({ items: [], restaurantId: null, discount: 0, appliedCoupon: null });
    } catch (error) {
      console.error('Failed to clear cart', error);
    }
  }
}));
