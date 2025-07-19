import { NextApiRequest, NextApiResponse } from 'next'
import { AuthService } from '../../src/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const result = await AuthService.login(email, password)
    
    if (!result) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    res.status(200).json(result)
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}