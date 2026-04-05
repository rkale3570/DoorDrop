import apiClient from './apiClient';
import { CartResponse, AddToCartRequest } from './types';

export const cartApi = {
  getCart: () =>
    apiClient.get<CartResponse>('/api/cart').then(r => r.data),

  addItem: (data: AddToCartRequest) =>
    apiClient.post<CartResponse>('/api/cart/items', data).then(r => r.data),

  updateQty: (itemId: number, quantity: number) =>
    apiClient.patch<CartResponse>(`/api/cart/items/${itemId}`, null, { params: { quantity } }).then(r => r.data),

  removeItem: (itemId: number) =>
    apiClient.delete<CartResponse>(`/api/cart/items/${itemId}`).then(r => r.data),

  clearCart: () =>
    apiClient.delete('/api/cart'),
};
