import { ObjectId } from 'mongodb'

export interface Drone {
  _id?: ObjectId
  id?: string
  name: string
  model: string
  status: 'available' | 'in-transit' | 'charging' | 'maintenance' | 'offline'
  batteryLevel: number
  location: {
    lat: number
    lng: number
    address?: string
  }
  maxPayload: number // in kg
  range: number // in km
  speed: number // in km/h
  operatorId?: ObjectId | string
  lastMaintenance?: Date
  nextMaintenance?: Date
  flightHours: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateDroneData {
  name: string
  model: string
  maxPayload: number
  range: number
  speed: number
  location: {
    lat: number
    lng: number
    address?: string
  }
  operatorId?: string
}

export interface UpdateDroneData {
  name?: string
  model?: string
  status?: 'available' | 'in-transit' | 'charging' | 'maintenance' | 'offline'
  batteryLevel?: number
  location?: {
    lat: number
    lng: number
    address?: string
  }
  maxPayload?: number
  range?: number
  speed?: number
  operatorId?: string
  lastMaintenance?: Date
  nextMaintenance?: Date
  flightHours?: number
  isActive?: boolean
}