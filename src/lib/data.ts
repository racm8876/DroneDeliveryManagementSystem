
// Re-export types from models for backward compatibility
export type { User } from './models/User'
export type { Drone } from './models/Drone'
export type { Order } from './models/Order'

// Weekly order data for charts
export const weeklyOrders = [
  { name: "Mon", orders: 12 },
  { name: "Tue", orders: 16 },
  { name: "Wed", orders: 15 },
  { name: "Thu", orders: 18 },
  { name: "Fri", orders: 24 },
  { name: "Sat", orders: 28 },
  { name: "Sun", orders: 22 },
];

// Monthly revenue data for charts
export const monthlyRevenue = [
  { name: "Jan", revenue: 4500 },
  { name: "Feb", revenue: 5200 },
  { name: "Mar", revenue: 6100 },
  { name: "Apr", revenue: 5800 },
  { name: "May", revenue: 7200 },
  { name: "Jun", revenue: 8500 },
  { name: "Jul", revenue: 9200 },
  { name: "Aug", revenue: 9800 },
  { name: "Sep", revenue: 10500 },
  { name: "Oct", revenue: 11200 },
  { name: "Nov", revenue: 0 },
  { name: "Dec", revenue: 0 },
];

// Default stats for charts (will be replaced with real data from API)
export const defaultStats = {
  droneStats: {
    total: 0,
    available: 0,
    inTransit: 0,
    charging: 0,
    maintenance: 0,
  },
  orderStats: {
    today: 0,
    pending: 0,
    processing: 0,
    inTransit: 0,
    delivered: 0,
    cancelled: 0,
    totalRevenue: 0,
  },
  deliveryPerformance: {
    avgDeliveryTime: 0,
    onTimeDelivery: 0,
    customerSatisfaction: 0,
    failedDeliveries: 0,
  },
};
