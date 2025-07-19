import { ObjectId } from 'mongodb'

export interface OrderItem {
  name: string
  quantity: number
  weight: number
  description?: string
}

export interface Location {
  address: string
  lat: number
  lng: number
  contactName?: string
  contactPhone?: string
  instructions?: string
}

export interface Order {
  _id?: ObjectId
  id?: string
  customerId: ObjectId | string
  customerName: string
  customerEmail: string
  customerPhone?: string
  status: 'pending' | 'confirmed' | 'assigned' | 'in-transit' | 'delivered' | 'cancelled' | 'failed'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  
  // Order details
  items: OrderItem[]
  totalWeight: number
  estimatedValue: number
  specialInstructions?: string
  
  // Locations
  pickupLocation: Location
  deliveryLocation: Location
  
  // Assignment
  droneId?: ObjectId | string
  droneName?: string
  operatorId?: ObjectId | string
  operatorName?: string
  deliveryStaffId?: ObjectId | string
  deliveryStaffName?: string
  
  // Timing
  requestedDeliveryTime?: Date
  estimatedDeliveryTime?: Date
  actualPickupTime?: Date
  actualDeliveryTime?: Date
  
  // Payment
  price: number
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
  paymentMethod?: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'cash'
  paymentId?: string
  
  // Tracking
  trackingNumber: string
  currentLocation?: {
    lat: number
    lng: number
    timestamp: Date
  }
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  cancelledAt?: Date
  cancellationReason?: string
}

export interface CreateOrderData {
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  items: OrderItem[]
  pickupLocation: Location
  deliveryLocation: Location
  requestedDeliveryTime?: Date
  specialInstructions?: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  paymentMethod?: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'cash'
}

export interface UpdateOrderData {
  status?: 'pending' | 'confirmed' | 'assigned' | 'in-transit' | 'delivered' | 'cancelled' | 'failed'
  droneId?: string
  operatorId?: string
  deliveryStaffId?: string
  estimatedDeliveryTime?: Date
  actualPickupTime?: Date
  actualDeliveryTime?: Date
  currentLocation?: {
    lat: number
    lng: number
    timestamp: Date
  }
  paymentStatus?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
  paymentId?: string
  cancellationReason?: string
}