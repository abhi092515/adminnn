"use client";

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Eye, AlertCircle } from 'lucide-react';

// --- Type Definitions for API Data ---

interface PopulatedProduct {
  _id: string;
  title: string;
  author: string;
  image1: string;
}

interface PopulatedAddress {
  _id: string;
  name: string;
  mobile: string;
  address: string;
}

interface ApiOrder {
  _id: string;
  order_id: string;
  product_id: PopulatedProduct;
  address_id: PopulatedAddress;
  total_quantity: number;
  price_per_quantity: number; // Needed for Order Value
  total_price: number;
  shipping_charge: number;
  payment_status: 'success' | 'pending' | 'failed' | 'abort';
  order_status: string;
  createdAt: string;
  updatedAt: string;
}

// Reusable component for the orders table
const OrderTable = ({ orders }: { orders: any[] }) => (
  <Table>
    <TableHeader>
      <TableRow>
        {/* All desired columns are now here */}
        <TableHead>Name</TableHead>
        <TableHead>Phone</TableHead>
        <TableHead>Address</TableHead>
        <TableHead>Image</TableHead>
        <TableHead>Book</TableHead>
        <TableHead>Quantity</TableHead>
        <TableHead>Order Value</TableHead>
        <TableHead>Shipping Charge</TableHead>
        <TableHead>Total Amount</TableHead>
        <TableHead>Payment Status</TableHead>
        <TableHead>Order Id</TableHead>
        <TableHead>Total Item per order</TableHead>
        <TableHead>Order Date</TableHead>
        <TableHead>Updated Date</TableHead>
        <TableHead>Action</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {orders.map((order) => (
        <TableRow key={order.order_id}>
          {/* All corresponding data cells are now here */}
          <TableCell className="font-medium">{order.customerName}</TableCell>
          <TableCell>{order.phone}</TableCell>
          <TableCell>{order.address}</TableCell>
          <TableCell><img src={order.bookImage} alt={order.bookName} className="h-16 w-12 object-cover rounded" /></TableCell>
          <TableCell>{order.bookName}</TableCell>
          <TableCell>{order.quantity}</TableCell>
          <TableCell>₹{order.orderValue.toFixed(2)}</TableCell>
          <TableCell>₹{order.shippingCharge.toFixed(2)}</TableCell>
          <TableCell>₹{order.totalAmount.toFixed(2)}</TableCell>
          <TableCell>
            <Badge variant={
              order.paymentStatus === 'success' ? 'default' : 
              order.paymentStatus === 'pending' ? 'secondary' : 'destructive'
            }>
              {order.paymentStatus}
            </Badge>
          </TableCell>
          <TableCell>{order.order_id}</TableCell>
          <TableCell>{order.totalItems}</TableCell>
          <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
          <TableCell>{new Date(order.updatedDate).toLocaleDateString()}</TableCell>
          <TableCell>
            <Button variant="outline" size="icon">
              <Eye className="h-4 w-4" />
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);


const getOrdersByUserId = async (userId: string): Promise<ApiOrder[]> => {
    if (!userId) return [];
    const response = await fetch(`http://localhost:5099/api/orders/user/${userId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch orders');
    }
    return response.json();
};


export default function OrderManagementPage() {
  const DUMMY_USER_ID = "68667bb472c103b20fecdfa5";

  const { data: rawOrders = [], isLoading, error } = useQuery<ApiOrder[]>({
    queryKey: ['orders', DUMMY_USER_ID],
    queryFn: () => getOrdersByUserId(DUMMY_USER_ID),
  });

  // Updated the transformation logic to include all necessary fields
  const transformedOrders = useMemo(() => {
    return rawOrders.map(order => ({
      // ... keep original fields
      ...order,
      // Map API fields to table fields
      customerName: order.address_id.name,
      phone: order.address_id.mobile,
      address: order.address_id.address,
      bookImage: order.product_id.image1 || 'https://via.placeholder.com/40x60.png?text=N/A',
      bookName: order.product_id.title,
      quantity: order.total_quantity,
      orderValue: order.price_per_quantity * order.total_quantity, // Calculate order value
      shippingCharge: order.shipping_charge,
      totalAmount: order.total_price,
      paymentStatus: order.payment_status,
      totalItems: order.total_quantity,
      orderDate: order.createdAt,
      updatedDate: order.updatedAt,
    }));
  }, [rawOrders]);

  const unShippedOrders = transformedOrders.filter(o => o.order_status === 'Un-Shipped');
  const shippedOrders = transformedOrders.filter(o => o.order_status === 'Shipped');
  const dispatchedOrders = transformedOrders.filter(o => o.order_status === 'Dispatched');
  const deliveredOrders = transformedOrders.filter(o => o.order_status === 'Delivered');
  const unShippedSuccess = unShippedOrders.filter(o => o.payment_status === 'success');
  const unShippedPending = unShippedOrders.filter(o => o.payment_status === 'pending');

  if (isLoading) return <div>Loading orders...</div>;
  if (error) return <div className="text-red-500"><AlertCircle className="inline mr-2" />Error fetching orders: {error.message}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">All Orders</h1>
      
      {/* Filter Panel */}
      <div className="p-6 bg-white rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input placeholder="Phone" />
          <Input type="date" />
          <Input type="date" />
          <Select>
            <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="abort">Abort</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline">Reset</Button>
          <Button>Submit</Button>
        </div>
      </div>
      
      {/* Tabs for Order Status */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All({transformedOrders.length})</TabsTrigger>
          <TabsTrigger value="unshipped">Un-Shipped({unShippedOrders.length})</TabsTrigger>
          <TabsTrigger value="shipped">Shipped({shippedOrders.length})</TabsTrigger>
          <TabsTrigger value="dispatched">Dispatched({dispatchedOrders.length})</TabsTrigger>
          <TabsTrigger value="delivered">Delivered({deliveredOrders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="p-4 bg-white rounded-lg shadow">
          <OrderTable orders={transformedOrders} />
        </TabsContent>
        <TabsContent value="unshipped" className="p-4 bg-white rounded-lg shadow">
          <Tabs defaultValue="success">
            <TabsList>
              <TabsTrigger value="success">Success({unShippedSuccess.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending({unShippedPending.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="success"><OrderTable orders={unShippedSuccess} /></TabsContent>
            <TabsContent value="pending"><OrderTable orders={unShippedPending} /></TabsContent>
          </Tabs>
        </TabsContent>
        <TabsContent value="shipped" className="p-4 bg-white rounded-lg shadow">
          <OrderTable orders={shippedOrders} />
        </TabsContent>
        <TabsContent value="dispatched" className="p-4 bg-white rounded-lg shadow">
          <OrderTable orders={dispatchedOrders} />
        </TabsContent>
        <TabsContent value="delivered" className="p-4 bg-white rounded-lg shadow">
          <OrderTable orders={deliveredOrders} />
        </TabsContent>
      </Tabs>
    </div>
  );
}