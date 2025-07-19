import { NextApiRequest, NextApiResponse } from 'next'
import { OrderService } from '../../src/lib/services/orderService'
import { AuthService } from '../../src/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verify authentication
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const token = authHeader.substring(7)
    const user = await AuthService.getCurrentUser(token)
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' })
    }

    switch (req.method) {
      case 'GET':
        const { status, customerId, operatorId, droneId } = req.query
        const filters: any = {}
        
        // Customers can only see their own orders
        if (user.role === 'customer') {
          filters.customerId = user.id
        } else {
          if (customerId) filters.customerId = customerId
          if (operatorId) filters.operatorId = operatorId
          if (droneId) filters.droneId = droneId
        }
        
        if (status) filters.status = status

        const orders = await OrderService.getAllOrders(filters)
        return res.status(200).json({ orders })

      case 'POST':
        const orderData = req.body
        
        // Set customer info from authenticated user if customer role
        if (user.role === 'customer') {
          orderData.customerId = user.id
          orderData.customerName = user.name
          orderData.customerEmail = user.email
        }

        const newOrder = await OrderService.createOrder(orderData)
        return res.status(201).json({ order: newOrder })

      default:
        return res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error: any) {
    console.error('Orders API error:', error)
    res.status(500).json({ message: error.message || 'Internal server error' })
  }
}