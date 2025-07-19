import { NextApiRequest, NextApiResponse } from 'next'
import { OrderService } from '../../src/lib/services/orderService'
import { AuthService } from '../../src/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

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

    // Only admins can view stats
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Insufficient permissions' })
    }

    const stats = await OrderService.getOrderStats()
    return res.status(200).json({ stats })
  } catch (error: any) {
    console.error('Order stats API error:', error)
    res.status(500).json({ message: error.message || 'Internal server error' })
  }
}