import { IOrder } from '@/models/order.model'; // Assuming you can share types from backend, or redefine here

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// This function fetches all orders for a given user
export const getOrdersByUserId = async (userId: string): Promise<IOrder[]> => {
  if (!userId) {
    // Return empty array if no user ID is provided, to prevent unnecessary errors
    return [];
  }
  const response = await fetch(`${API_BASE_URL}/orders/user/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }
  return response.json();
};