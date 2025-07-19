import { getDatabase } from '../mongodb'
import { Drone, CreateDroneData, UpdateDroneData } from '../models/Drone'
import { ObjectId } from 'mongodb'

export class DroneService {
  private static async getCollection() {
    const db = await getDatabase()
    return db.collection<Drone>('drones')
  }

  static async createDrone(droneData: CreateDroneData): Promise<Drone> {
    const collection = await this.getCollection()
    
    const newDrone: Omit<Drone, '_id'> = {
      name: droneData.name,
      model: droneData.model,
      status: 'available',
      batteryLevel: 100,
      location: droneData.location,
      maxPayload: droneData.maxPayload,
      range: droneData.range,
      speed: droneData.speed,
      operatorId: droneData.operatorId ? new ObjectId(droneData.operatorId) : undefined,
      flightHours: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await collection.insertOne(newDrone)
    const drone = await collection.findOne({ _id: result.insertedId })
    
    if (!drone) {
      throw new Error('Failed to create drone')
    }

    return { ...drone, id: drone._id.toString() }
  }

  static async getDroneById(id: string): Promise<Drone | null> {
    const collection = await this.getCollection()
    const drone = await collection.findOne({ _id: new ObjectId(id) })
    
    if (!drone) return null
    
    return { ...drone, id: drone._id.toString() }
  }

  static async updateDrone(id: string, updateData: UpdateDroneData): Promise<Drone | null> {
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

    return { ...result, id: result._id.toString() }
  }

  static async deleteDrone(id: string): Promise<boolean> {
    const collection = await this.getCollection()
    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  }

  static async getAllDrones(filters?: { 
    status?: string
    operatorId?: string
    isActive?: boolean 
  }): Promise<Drone[]> {
    const collection = await this.getCollection()
    const query: any = {}
    
    if (filters?.status) query.status = filters.status
    if (filters?.operatorId) query.operatorId = new ObjectId(filters.operatorId)
    if (filters?.isActive !== undefined) query.isActive = filters.isActive

    const drones = await collection.find(query).toArray()
    
    return drones.map(drone => ({ ...drone, id: drone._id.toString() }))
  }

  static async getAvailableDrones(): Promise<Drone[]> {
    return this.getAllDrones({ status: 'available', isActive: true })
  }

  static async assignDroneToOrder(droneId: string, orderId: string): Promise<boolean> {
    const collection = await this.getCollection()
    
    const result = await collection.updateOne(
      { _id: new ObjectId(droneId), status: 'available' },
      { 
        $set: { 
          status: 'in-transit',
          updatedAt: new Date()
        } 
      }
    )

    return result.modifiedCount > 0
  }

  static async releaseDrone(droneId: string): Promise<boolean> {
    const collection = await this.getCollection()
    
    const result = await collection.updateOne(
      { _id: new ObjectId(droneId) },
      { 
        $set: { 
          status: 'available',
          updatedAt: new Date()
        } 
      }
    )

    return result.modifiedCount > 0
  }

  static async updateDroneLocation(droneId: string, location: { lat: number; lng: number; address?: string }): Promise<boolean> {
    const collection = await this.getCollection()
    
    const result = await collection.updateOne(
      { _id: new ObjectId(droneId) },
      { 
        $set: { 
          location,
          updatedAt: new Date()
        } 
      }
    )

    return result.modifiedCount > 0
  }

  static async updateBatteryLevel(droneId: string, batteryLevel: number): Promise<boolean> {
    const collection = await this.getCollection()
    
    const result = await collection.updateOne(
      { _id: new ObjectId(droneId) },
      { 
        $set: { 
          batteryLevel,
          updatedAt: new Date()
        } 
      }
    )

    return result.modifiedCount > 0
  }
}