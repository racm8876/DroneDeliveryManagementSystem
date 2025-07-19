import { NextApiRequest, NextApiResponse } from 'next'
import { AuthService } from '../../src/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const token = authHeader.substring(7)
    const user = await AuthService.getCurrentUser(token)
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' })
    }

    res.status(200).json({ user })
  } catch (error) {
    console.error('Get current user error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}