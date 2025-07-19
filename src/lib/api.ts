// API client for frontend
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    this.token = localStorage.getItem('auth-token')
  }

  setToken(token: string) {
    this.token = token
    localStorage.setItem('auth-token', token)
  }

  clearToken() {
    this.token = null
    localStorage.removeItem('auth-token')
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: {
    name: string
    email: string
    password: string
    role?: string
  }) {
    return this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async getCurrentUser() {
    return this.request<{ user: any }>('/auth/me')
  }

  // User endpoints
  async getUsers(filters?: any) {
    const params = new URLSearchParams(filters)
    return this.request<{ users: any[] }>(`/users?${params}`)
  }

  async updateUser(id: string, userData: any) {
    return this.request<{ user: any }>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  }

  // Drone endpoints
  async getDrones(filters?: any) {
    const params = new URLSearchParams(filters)
    return this.request<{ drones: any[] }>(`/drones?${params}`)
  }

  async createDrone(droneData: any) {
    return this.request<{ drone: any }>('/drones', {
      method: 'POST',
      body: JSON.stringify(droneData),
    })
  }

  async updateDrone(id: string, droneData: any) {
    return this.request<{ drone: any }>(`/drones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(droneData),
    })
  }

  async deleteDrone(id: string) {
    return this.request<{ success: boolean }>(`/drones/${id}`, {
      method: 'DELETE',
    })
  }

  // Order endpoints
  async getOrders(filters?: any) {
    const params = new URLSearchParams(filters)
    return this.request<{ orders: any[] }>(`/orders?${params}`)
  }

  async createOrder(orderData: any) {
    return this.request<{ order: any }>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    })
  }

  async updateOrder(id: string, orderData: any) {
    return this.request<{ order: any }>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    })
  }

  async getOrderByTracking(trackingNumber: string) {
    return this.request<{ order: any }>(`/orders/track/${trackingNumber}`)
  }

  async getOrderStats() {
    return this.request<{ stats: any }>('/orders/stats')
  }

  // Assignment endpoints
  async assignDroneToOrder(orderId: string, droneId: string) {
    return this.request<{ success: boolean }>(`/orders/${orderId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ droneId }),
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)