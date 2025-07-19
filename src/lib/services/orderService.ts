import { getDatabase } from '../mongodb'
import { Order, CreateOrderData, UpdateOrderData } from '../models/Order'
import { ObjectId } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'

export class OrderService {
  private static async getCollection() {
    const db = await getDatabase()
    return db.collection<Order>('orders')
  }

  static async createOrder(orderData: CreateOrderData): Promise<Order> {
    const collection = await this.getCollection()
    
    // Calculate total weight and price
    const totalWeight = orderData.items.reduce((sum, item) => sum + (item.weight * item.quantity), 0)
    const basePrice = 15.99 // Base delivery fee
    const weightPrice = totalWeight * 2.50 // Price per kg
    const distancePrice = 5.00 // Simplified distance pricing
    const price = basePrice + weightPrice + distancePrice

    const newOrder: Omit<Order, '_id'> = {
      customerId: new ObjectId(orderData.customerId),
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      status: 'pending',
      priority: orderData.priority || 'normal',
      items: orderData.items,
      totalWeight,
      estimatedValue: orderData.items.reduce((sum, item) => sum + (item.quantity * 10), 0), // Simplified value calculation
      specialInstructions: orderData.specialInstructions,
      pickupLocation: orderData.pickupLocation,
      deliveryLocation: orderData.deliveryLocation,
      requestedDeliveryTime: orderData.requestedDeliveryTime,
      price,
      paymentStatus: 'pending',
      paymentMethod: orderData.paymentMethod,
      trackingNumber: `DF${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await collection.insertOne(newOrder)
    const order = await collection.findOne({ _id: result.insertedId })
    
    if (!order) {
      throw new Error('Failed to create order')
    }

    return { ...order, id: order._id.toString() }
  }

  static async getOrderById(id: string): Promise<Order | null> {
    const collection = await this.getCollection()
    const order = await collection.findOne({ _id: new ObjectId(id) })
    
    if (!order) return null
    
    return { ...order, id: order._id.toString() }
  }

  static async getOrderByTrackingNumber(trackingNumber: string): Promise<Order | null> {
    const collection = await this.getCollection()
    const order = await collection.findOne({ trackingNumber })
    
    if (!order) return null
    
    return { ...order, id: order._id.toString() }
  }

  static async updateOrder(id: string, updateData: UpdateOrderData): Promise<Order | null> {
    const collection = await this.getCollection()
    
    const updateFields: any = { ...updateData, updatedAt: new Date() }
    
    // Convert string IDs to ObjectIds where necessary
    if (updateData.droneId) updateFields.droneId = new ObjectId(updateData.droneId)
    if (updateData.operatorId) updateFields.operatorId = new ObjectId(updateData.operatorId)
    if (updateData.deliveryStaffId) updateFields.deliveryStaffId = new ObjectId(updateData.deliveryStaffId)
    
    // Set completion time if status is delivered
    if (updateData.status === 'delivered') {
      updateFields.completedAt = new Date()
      updateFields.actualDeliveryTime = updateData.actualDeliveryTime || new Date()
    }
    
    // Set cancellation time if status is cancelled
    if (updateData.status === 'cancelled') {
      updateFields.cancelledAt = new Date()
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateFields },
      { returnDocument: 'after' }
    )

    if (!result) return null

    return { ...result, id: result._id.toString() }
  }

  static async deleteOrder(id: string): Promise<boolean> {
    const collection = await this.getCollection()
    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  }

  static async getAllOrders(filters?: { 
    customerId?: string
    status?: string
    operatorId?: string
    droneId?: string
    dateFrom?: Date
    dateTo?: Date
  }): Promise<Order[]> {
    const collection = await this.getCollection()
    const query: any = {}
    
    if (filters?.customerId) query.customerId = new ObjectId(filters.customerId)
    if (filters?.status) query.status = filters.status
    if (filters?.operatorId) query.operatorId = new ObjectId(filters.operatorId)
    if (filters?.droneId) query.droneId = new ObjectId(filters.droneId)
    
    if (filters?.dateFrom || filters?.dateTo) {
      query.createdAt = {}
      if (filters.dateFrom) query.createdAt.$gte = filters.dateFrom
      if (filters.dateTo) query.createdAt.$lte = filters.dateTo
    }

    const orders = await collection.find(query).sort({ createdAt: -1 }).toArray()
    
    return orders.map(order => ({ ...order, id: order._id.toString() }))
  }

  static async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    return this.getAllOrders({ customerId })
  }

  static async getActiveOrders(): Promise<Order[]> {
    const collection = await this.getCollection()
    const orders = await collection.find({ 
      status: { $in: ['confirmed', 'assigned', 'in-transit'] } 
    }).sort({ createdAt: -1 }).toArray()
    
    return orders.map(order => ({ ...order, id: order._id.toString() }))
  }

  static async assignDroneToOrder(orderId: string, droneId: string, operatorId: string): Promise<boolean> {
    const collection = await this.getCollection()
    
    const result = await collection.updateOne(
      { _id: new ObjectId(orderId), status: { $in: ['pending', 'confirmed'] } },
      { 
        $set: { 
          droneId: new ObjectId(droneId),
          operatorId: new ObjectId(operatorId),
          status: 'assigned',
          updatedAt: new Date()
        } 
      }
    )

    return result.modifiedCount > 0
  }

  static async updateOrderLocation(orderId: string, location: { lat: number; lng: number }): Promise<boolean> {
    const collection = await this.getCollection()
    
    const result = await collection.updateOne(
      { _id: new ObjectId(orderId) },
      { 
        $set: { 
          currentLocation: {
            ...location,
            timestamp: new Date()
          },
          updatedAt: new Date()
        } 
      }
    )

    return result.modifiedCount > 0
  }

  static async getOrderStats(): Promise<{
    total: number
    pending: number
    inTransit: number
    delivered: number
    cancelled: number
    todayRevenue: number
  }> {
    const collection = await this.getCollection()
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [totalCount, statusCounts, revenueResult] = await Promise.all([
      collection.countDocuments(),
      collection.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]).toArray(),
      collection.aggregate([
        {
          $match: {
            createdAt: { $gte: today, $lt: tomorrow },
            paymentStatus: 'completed'
          }
        },
        { $group: { _id: null, total: { $sum: '$price' } } }
      ]).toArray()
    ])

    const stats = {
      total: totalCount,
      pending: 0,
      inTransit: 0,
      delivered: 0,
      cancelled: 0,
      todayRevenue: revenueResult[0]?.total || 0
    }

    statusCounts.forEach((item: any) => {
      switch (item._id) {
        case 'pending':
        case 'confirmed':
          stats.pending += item.count
          break
        case 'assigned':
        case 'in-transit':
          stats.inTransit += item.count
          break
        case 'delivered':
          stats.delivered += item.count
          break
        case 'cancelled':
        case 'failed':
          stats.cancelled += item.count
          break
      }
    })

    return stats
  }
}