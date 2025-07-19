import { NextApiRequest, NextApiResponse } from 'next'
import { AuthService } from '../../src/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { name, email, password, role } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' })
    }

    const result = await AuthService.register({ name, email, password, role })
    
    res.status(201).json(result)
  } catch (error: any) {
    console.error('Registration error:', error)
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({ message: error.message })
    }
    
    res.status(500).json({ message: 'Internal server error' })
  }
}