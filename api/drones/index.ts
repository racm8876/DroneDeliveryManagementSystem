import { NextApiRequest, NextApiResponse } from 'next'
import { DroneService } from '../../src/lib/services/droneService'
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
        const { status, operatorId, isActive } = req.query
        const filters: any = {}
        
        if (status) filters.status = status
        if (operatorId) filters.operatorId = operatorId
        if (isActive !== undefined) filters.isActive = isActive === 'true'

        const drones = await DroneService.getAllDrones(filters)
        return res.status(200).json({ drones })

      case 'POST':
        // Only admins and operators can create drones
        if (!['admin', 'operator'].includes(user.role)) {
          return res.status(403).json({ message: 'Insufficient permissions' })
        }

        const droneData = req.body
        const newDrone = await DroneService.createDrone(droneData)
        return res.status(201).json({ drone: newDrone })

      default:
        return res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error: any) {
    console.error('Drones API error:', error)
    res.status(500).json({ message: error.message || 'Internal server error' })
  }
}