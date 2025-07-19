import { getDatabase } from '../mongodb'
import { User, CreateUserData, UpdateUserData } from '../models/User'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'

export class UserService {
  private static async getCollection() {
    const db = await getDatabase()
    return db.collection<User>('users')
  }

  static async createUser(userData: CreateUserData): Promise<User> {
    const collection = await this.getCollection()
    
    // Check if user already exists
    const existingUser = await collection.findOne({ email: userData.email })
    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12)

    const newUser: Omit<User, '_id'> = {
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: userData.role || 'customer',
      phone: userData.phone,
      company: userData.company,
      location: userData.location,
      isActive: true,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await collection.insertOne(newUser)
    const user = await collection.findOne({ _id: result.insertedId })
    
    if (!user) {
      throw new Error('Failed to create user')
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user
    return { ...userWithoutPassword, id: user._id.toString() }
  }

  static async getUserById(id: string): Promise<User | null> {
    const collection = await this.getCollection()
    const user = await collection.findOne({ _id: new ObjectId(id) })
    
    if (!user) return null
    
    const { password, ...userWithoutPassword } = user
    return { ...userWithoutPassword, id: user._id.toString() }
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const collection = await this.getCollection()
    const user = await collection.findOne({ email })
    
    if (!user) return null
    
    return user
  }

  static async updateUser(id: string, updateData: UpdateUserData): Promise<User | null> {
    const collection = await this.getCollection()
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...updateData, 
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    )

    if (!result) return null

    const { password, ...userWithoutPassword } = result
    return { ...userWithoutPassword, id: result._id.toString() }
  }

  static async deleteUser(id: string): Promise<boolean> {
    const collection = await this.getCollection()
    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  }

  static async getAllUsers(filters?: { role?: string; isActive?: boolean }): Promise<User[]> {
    const collection = await this.getCollection()
    const query: any = {}
    
    if (filters?.role) query.role = filters.role
    if (filters?.isActive !== undefined) query.isActive = filters.isActive

    const users = await collection.find(query).toArray()
    
    return users.map(user => {
      const { password, ...userWithoutPassword } = user
      return { ...userWithoutPassword, id: user._id.toString() }
    })
  }

  static async verifyPassword(email: string, password: string): Promise<User | null> {
    const collection = await this.getCollection()
    const user = await collection.findOne({ email })
    
    if (!user || !user.password) return null
    
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) return null

    const { password: _, ...userWithoutPassword } = user
    return { ...userWithoutPassword, id: user._id.toString() }
  }
}