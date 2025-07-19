import { ObjectId } from 'mongodb'

export interface User {
  _id?: ObjectId
  id?: string
  name: string
  email: string
  password?: string
  role: 'admin' | 'customer' | 'operator' | 'staff'
  avatar?: string
  phone?: string
  company?: string
  location?: string
  isActive: boolean
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserData {
  name: string
  email: string
  password: string
  role?: 'admin' | 'customer' | 'operator' | 'staff'
  phone?: string
  company?: string
  location?: string
}

export interface UpdateUserData {
  name?: string
  email?: string
  phone?: string
  company?: string
  location?: string
  avatar?: string
  role?: 'admin' | 'customer' | 'operator' | 'staff'
  isActive?: boolean
  emailVerified?: boolean
}