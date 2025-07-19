import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusCard } from "@/components/dashboard/StatusCard";
import { OrderStats } from "@/components/dashboard/OrderStats";
import { Map } from "@/components/dashboard/Map";
import { defaultStats } from "@/lib/data";
import { Package, Plane, Clock, TrendingUp, BarChart, CheckCircle, AlertCircle, ShoppingBag, Truck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(defaultStats);
  const [drones, setDrones] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch data based on user role
        const [dronesResponse, ordersResponse] = await Promise.all([
          user?.role !== 'customer' ? apiClient.getDrones() : Promise.resolve({ drones: [] }),
          apiClient.getOrders(user?.role === 'customer' ? { customerId: user.id } : {})
        ]);
        
        setDrones(dronesResponse.drones || []);
        setOrders(ordersResponse.orders || []);
        
        // Calculate stats from real data
        if (user?.role === 'admin') {
          const statsResponse = await apiClient.getOrderStats();
          setStats(prev => ({ ...prev, orderStats: statsResponse.stats }));
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Get display data
  const displayDrones = drones.slice(0, 3);
  const displayOrders = orders.filter((order: any) => 
    user?.role === "customer" 
      ? order.customerId === user.id 
      : order.status === "in-transit" || order.status === "assigned"
  );

  // Different welcome messages based on user role
  const welcomeMessages = {
    admin: "Welcome to your admin dashboard. Monitor all operations and performance metrics.",
    customer: "Track your orders and manage your delivery preferences.",
    operator: "Monitor drone fleet and manage delivery assignments.",
    staff: "View assigned deliveries and update delivery statuses."
  };

  // Content blocks for different user roles
  const renderAdminDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          title="Total Orders Today"
          value={stats.orderStats.today}
          icon={Package}
          trend={{ value: 12, isPositive: true }}
          iconColor="bg-primary"
          tooltipText="Number of orders placed today"
        />
        <StatusCard
          title="Active Drones"
          value={`${stats.droneStats.available + stats.droneStats.inTransit}/${stats.droneStats.total}`}
          icon={Plane}
          iconColor="bg-green-500"
          tooltipText="Available and in-transit drones"
        />
        <StatusCard
          title="Avg. Delivery Time"
          value={`${stats.deliveryPerformance.avgDeliveryTime} min`}
          icon={Clock}
          trend={{ value: 8, isPositive: false }}
          iconColor="bg-orange-500"
          tooltipText="Average time from order to delivery"
        />
        <StatusCard
          title="Today's Revenue"
          value={`$${stats.orderStats.totalRevenue.toFixed(2)}`}
          icon={TrendingUp}
          trend={{ value: 24, isPositive: true }}
          iconColor="bg-blue-500"
          tooltipText="Total revenue from completed orders today"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 order-2 lg:order-1">
          <Map className="h-[400px]" />
        </div>
        <div className="lg:col-span-1 order-1 lg:order-2">
          <OrderStats className="h-[400px]" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6 lg:col-span-2 order-2 lg:order-1">
          <h3 className="text-lg font-medium">Active Deliveries</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              <div className="col-span-full text-center py-8">Loading orders...</div>
            ) : displayOrders.length > 0 ? (
              displayOrders.map((order: any) => (
                <div key={order.id} className="p-4 border rounded-lg">
                  <h4 className="font-medium">Order #{order.trackingNumber}</h4>
                  <p className="text-sm text-muted-foreground">{order.status}</p>
                </div>
              ))
            ) : (
              <div className="col-span-full flex items-center justify-center h-40 bg-muted/20 rounded-lg border-2 border-dashed">
                <div className="flex flex-col items-center text-muted-foreground">
                  <Package className="h-8 w-8 mb-2" />
                  <p>No active deliveries</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-6 order-1 lg:order-2">
          <h3 className="text-lg font-medium">Active Drones</h3>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-4">Loading drones...</div>
            ) : displayDrones.length > 0 ? (
              displayDrones.map((drone: any) => (
                <div key={drone.id} className="p-4 border rounded-lg">
                  <h4 className="font-medium">{drone.name}</h4>
                  <p className="text-sm text-muted-foreground">{drone.status} - {drone.batteryLevel}%</p>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">No drones available</div>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatusCard
          title="On-Time Delivery Rate"
          value={`${stats.deliveryPerformance.onTimeDelivery}%`}
          icon={CheckCircle}
          trend={{ value: 3, isPositive: true }}
          iconColor="bg-green-500"
          tooltipText="Percentage of deliveries completed on time"
        />
        <StatusCard
          title="Customer Satisfaction"
          value={stats.deliveryPerformance.customerSatisfaction.toFixed(1)}
          description="out of 5.0"
          icon={TrendingUp}
          trend={{ value: 0.2, isPositive: true }}
          iconColor="bg-blue-500"
          tooltipText="Average customer rating"
        />
        <StatusCard
          title="Failed Deliveries"
          value={`${stats.deliveryPerformance.failedDeliveries}%`}
          icon={AlertCircle}
          trend={{ value: 1.5, isPositive: false }}
          iconColor="bg-destructive"
          tooltipText="Percentage of failed deliveries"
        />
        <StatusCard
          title="Performance Score"
          value="92.8"
          icon={BarChart}
          trend={{ value: 4.2, isPositive: true }}
          iconColor="bg-purple-500"
          tooltipText="Overall system performance score"
        />
      </div>
    </>
  );

  const renderCustomerDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatusCard
          title="Your Active Orders"
          value={displayOrders.length}
          icon={Package}
          iconColor="bg-primary"
          tooltipText="Number of your orders in progress"
        />
        <StatusCard
          title="Total Orders"
          value={orders.length}
          icon={ShoppingBag}
          iconColor="bg-orange-500"
          tooltipText="Total number of orders you've placed"
        />
        <StatusCard
          title="Completed Deliveries"
          value={orders.filter((order: any) => order.status === "delivered").length}
          icon={CheckCircle}
          iconColor="bg-green-500"
          tooltipText="Number of completed deliveries"
        />
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Track Your Orders</h3>
        <Map className="h-[300px] mb-6" />
        
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Your Orders</h3>
            <Button onClick={() => navigate("/orders")}>View All Orders</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              <div className="col-span-full text-center py-8">Loading orders...</div>
            ) : displayOrders.length > 0 ? (
              displayOrders.map((order: any) => (
                <div key={order.id} className="p-4 border rounded-lg">
                  <h4 className="font-medium">Order #{order.trackingNumber}</h4>
                  <p className="text-sm text-muted-foreground">{order.status}</p>
                </div>
              ))
            ) : (
              <div className="col-span-full flex items-center justify-center h-40 bg-muted/20 rounded-lg border-2 border-dashed">
                <div className="flex flex-col items-center text-muted-foreground">
                  <Package className="h-8 w-8 mb-2" />
                  <p>No active orders</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  const renderOperatorDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatusCard
          title="Active Drones"
          value={`${stats.droneStats.available + stats.droneStats.inTransit}/${stats.droneStats.total}`}
          icon={Plane}
          iconColor="bg-green-500"
          tooltipText="Available and in-transit drones"
        />
        <StatusCard
          title="Pending Assignments"
          value={stats.orderStats.pending}
          icon={Package}
          iconColor="bg-orange-500"
          tooltipText="Orders waiting for drone assignment"
        />
        <StatusCard
          title="Drones in Maintenance"
          value={stats.droneStats.maintenance}
          icon={Wrench}
          iconColor="bg-red-500"
          tooltipText="Drones currently in maintenance"
        />
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Fleet Overview</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Map className="h-[300px]" />
          </div>
          <div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Drone Status</h3>
              {loading ? (
                <div className="text-center py-4">Loading drones...</div>
              ) : drones.length > 0 ? (
                drones.map((drone: any) => (
                  <div key={drone.id} className="p-4 border rounded-lg">
                    <h4 className="font-medium">{drone.name}</h4>
                    <p className="text-sm text-muted-foreground">{drone.status} - {drone.batteryLevel}%</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">No drones available</div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Active Deliveries</h3>
            <Button onClick={() => navigate("/assignments")}>Manage Assignments</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              <div className="col-span-full text-center py-8">Loading orders...</div>
            ) : displayOrders.length > 0 ? (
              displayOrders.map((order: any) => (
                <div key={order.id} className="p-4 border rounded-lg">
                  <h4 className="font-medium">Order #{order.trackingNumber}</h4>
                  <p className="text-sm text-muted-foreground">{order.status}</p>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">No assigned orders</div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  const renderStaffDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatusCard
          title="Today's Deliveries"
          value={stats.orderStats.today}
          icon={Truck}
          iconColor="bg-primary"
          tooltipText="Number of deliveries scheduled for today"
        />
        <StatusCard
          title="Pending Pickups"
          value={stats.orderStats.pending}
          icon={Package}
          iconColor="bg-orange-500"
          tooltipText="Deliveries waiting for pickup"
        />
        <StatusCard
          title="Completed Today"
          value={2}
          icon={CheckCircle}
          iconColor="bg-green-500"
          tooltipText="Deliveries completed today"
        />
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Delivery Map</h3>
        <Map className="h-[300px] mb-6" />
        
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Your Assigned Deliveries</h3>
            <Button onClick={() => navigate("/deliveries")}>View All Deliveries</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              <div className="col-span-full text-center py-8">Loading deliveries...</div>
            ) : displayOrders.length > 0 ? (
              displayOrders.map((order: any) => (
                <div key={order.id} className="p-4 border rounded-lg">
                  <h4 className="font-medium">Order #{order.trackingNumber}</h4>
                  <p className="text-sm text-muted-foreground">{order.status}</p>
                </div>
              ))
            ) : (
              <div className="col-span-full flex items-center justify-center h-40 bg-muted/20 rounded-lg border-2 border-dashed">
                <div className="flex flex-col items-center text-muted-foreground">
                  <Package className="h-8 w-8 mb-2" />
                  <p>No assigned deliveries</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  // Render dashboard content based on user role
  const renderDashboardContent = () => {
    switch (user?.role) {
      case "admin":
        return renderAdminDashboard();
      case "customer":
        return renderCustomerDashboard();
      case "operator":
        return renderOperatorDashboard();
      case "staff":
        return renderStaffDashboard();
      default:
        return renderAdminDashboard();
    }
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            {welcomeMessages[user?.role || "admin"]}
          </p>
        </div>
        
        {renderDashboardContent()}
      </div>
    </DashboardLayout>
  );
}

// Missing component import
import { Wrench } from "lucide-react";