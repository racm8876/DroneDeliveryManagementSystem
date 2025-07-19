import jwt from 'jsonwebtoken'
import { UserService } from './services/userService'
import { User } from './models/User'

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key'

export interface AuthTokenPayload {
  userId: string
  email: string
  role: string
}

export class AuthService {
  static generateToken(user: User): string {
    const payload: AuthTokenPayload = {
      userId: user.id || user._id?.toString() || '',
      email: user.email,
      role: user.role
    }
    
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
  }

  static verifyToken(token: string): AuthTokenPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as AuthTokenPayload
    } catch (error) {
      return null
    }
  }

  static async login(email: string, password: string): Promise<{ user: User; token: string } | null> {
    const user = await UserService.verifyPassword(email, password)
    if (!user) return null

    const token = this.generateToken(user)
    return { user, token }
  }

  static async register(userData: {
    name: string
    email: string
    password: string
    role?: 'admin' | 'customer' | 'operator' | 'staff'
  }): Promise<{ user: User; token: string }> {
    const user = await UserService.createUser(userData)
    const token = this.generateToken(user)
    return { user, token }
  }

  static async getCurrentUser(token: string): Promise<User | null> {
    const payload = this.verifyToken(token)
    if (!payload) return null

    return UserService.getUserById(payload.userId)
  }
}