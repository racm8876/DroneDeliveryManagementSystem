
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/dashboard/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { mockOrders, Order } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { DeliverySummary } from "@/components/dashboard/DeliverySummary";
import { 
  CalendarClock, Package, CheckCircle, Clock, AlertTriangle, 
  LocateFixed, Plus, Search, Filter, CalendarDays
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function OrderManagement() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  
  // Filter orders for current user if customer
  const userOrders = user?.role === "customer" 
    ? mockOrders.filter(order => order.customerId === user.id)
    : mockOrders;
  
  // Filter orders based on search and status
  const filteredOrders = userOrders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus ? order.status === filterStatus : true;
    return matchesSearch && matchesStatus;
  });

  // Define columns for the data table
  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "id",
      header: "Order ID",
      cell: ({ row }) => <div className="font-medium">#{row.getValue("id")}</div>,
    },
    {
      accessorKey: "customerName",
      header: "Customer",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const statusConfig = {
          pending: { color: "bg-orange-500/15 text-orange-600 border-orange-200", icon: Clock },
          processing: { color: "bg-blue-500/15 text-blue-600 border-blue-200", icon: Package },
          "in-transit": { color: "bg-indigo-500/15 text-indigo-600 border-indigo-200", icon: LocateFixed },
          delivered: { color: "bg-green-500/15 text-green-600 border-green-200", icon: CheckCircle },
          cancelled: { color: "bg-red-500/15 text-red-600 border-red-200", icon: AlertTriangle },
        };
        
        const config = statusConfig[status as keyof typeof statusConfig];
        const StatusIcon = config?.icon || Clock;
        
        return (
          <Badge variant="outline" className={config?.color}>
            <StatusIcon className="h-3 w-3 mr-1" />
            <span className="capitalize">{status}</span>
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt") as string);
        return date.toLocaleString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          hour: 'numeric', 
          minute: 'numeric',
          hour12: true
        });
      },
    },
    {
      accessorKey: "totalWeight",
      header: "Weight",
      cell: ({ row }) => `${row.getValue("totalWeight")} kg`,
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => `$${(row.getValue("price") as number).toFixed(2)}`,
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment",
      cell: ({ row }) => {
        const status = row.getValue("paymentStatus") as string;
        return (
          <span className={`capitalize ${status === "completed" ? "text-green-600" : status === "pending" ? "text-orange-600" : "text-red-600"}`}>
            {status}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm">
          View Details
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Order Management</h2>
            <p className="text-muted-foreground mt-1">
              {user?.role === "customer" 
                ? "Track and manage your orders" 
                : "View and manage all customer orders"}
            </p>
          </div>
          {user?.role === "customer" && (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Order
            </Button>
          )}
        </div>

        <Tabs defaultValue="list">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <TabsList>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
            </TabsList>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search orders..."
                  className="pl-9 w-full sm:w-[200px] lg:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select 
                onValueChange={(value) => setFilterStatus(value === "all" ? null : value)}
                defaultValue="all"
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="in-transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="list" className="pt-4">
            <DataTable 
              columns={columns} 
              data={filteredOrders} 
              searchPlaceholder="Filter orders..."
            />
          </TabsContent>
          
          <TabsContent value="grid" className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrders.map(order => (
                <DeliverySummary key={order.id} order={order} />
              ))}
              {filteredOrders.length === 0 && (
                <div className="col-span-full flex items-center justify-center h-40 bg-muted/20 rounded-lg border-2 border-dashed">
                  <div className="flex flex-col items-center text-muted-foreground">
                    <Package className="h-8 w-8 mb-2" />
                    <p>No orders found</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
