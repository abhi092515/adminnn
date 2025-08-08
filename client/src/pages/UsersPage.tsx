"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, User, History, Edit, BarChart, Lock, Unlock } from 'lucide-react';

// --- Types and Dummy Data ---

interface User {
  id: string;
  email: string;
  phone: string;
  state: string;
  city: string;
  paymentStatus: 'Success' | 'Failed' | 'Aborted' | 'Initiated' | 'Cancelled' | 'Not Initiated';
  coupon: string | null;
  totalAmount: number;
  testStatus: string;
  signupDate: string;
  isLoginAllowed: boolean;
}

const dummyUsers: User[] = [
  { id: 'usr1', email: 'jitendra6499ssm@gmail.com', phone: '8294358752', state: 'Haryana', city: 'Gurugram', paymentStatus: 'Success', coupon: 'SUMMER25', totalAmount: 298, testStatus: 'Hot(102)', signupDate: '2024-10-26 15:20:03', isLoginAllowed: true },
  { id: 'usr2', email: 'priya.patel@example.com', phone: '9876543211', state: 'Maharashtra', city: 'Mumbai', paymentStatus: 'Failed', coupon: null, totalAmount: 0, testStatus: 'Cold(5)', signupDate: '2024-10-25 11:45:10', isLoginAllowed: true },
  { id: 'usr3', email: 'amit.kumar@example.com', phone: '8765432112', state: 'Delhi', city: 'New Delhi', paymentStatus: 'Initiated', coupon: 'NEWUSER', totalAmount: 499, testStatus: 'Warm(45)', signupDate: '2024-10-24 09:30:00', isLoginAllowed: false },
  { id: 'usr4', email: 'sunita.sharma@example.com', phone: '7654321123', state: 'Karnataka', city: 'Bengaluru', paymentStatus: 'Cancelled', coupon: null, totalAmount: 0, testStatus: 'Cold(12)', signupDate: '2024-10-23 18:00:50', isLoginAllowed: true },
];

const indianStates = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Others"];

// --- Sub-Components ---

const FilterPanel = () => (
  <Card>
    <CardContent className="pt-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Basic Search */}
        <div className="space-y-2">
          <CardTitle className="text-md">Basic Search</CardTitle>
          <Input placeholder="Phone" />
          <p className="text-center text-xs text-muted-foreground">OR</p>
          <Input placeholder="Email" />
        </div>
        {/* Transactions Search */}
        <div className="space-y-2">
          <CardTitle className="text-md">Transactions Search</CardTitle>
          <Select><SelectTrigger><SelectValue placeholder="Payment Via" /></SelectTrigger><SelectContent><SelectItem value="mobile">Mobile</SelectItem><SelectItem value="website">Website</SelectItem><SelectItem value="manual">Manually Updated</SelectItem></SelectContent></Select>
          <Select><SelectTrigger><SelectValue placeholder="Payment Status" /></SelectTrigger><SelectContent><SelectItem value="success">Success</SelectItem><SelectItem value="failed">Failed</SelectItem><SelectItem value="aborted">Aborted</SelectItem><SelectItem value="initiated">Initiated</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem></SelectContent></Select>
          <Select><SelectTrigger><SelectValue placeholder="Subscription" /></SelectTrigger><SelectContent><SelectItem value="dummy1">Dummy Sub 1</SelectItem></SelectContent></Select>
          <Input placeholder="Coupon" />
        </div>
        {/* Engagement Search */}
        <div className="space-y-2">
          <CardTitle className="text-md">Engagement Search</CardTitle>
          <Select><SelectTrigger><SelectValue placeholder="Series" /></SelectTrigger><SelectContent><SelectItem value="dummy1">Dummy Series 1</SelectItem></SelectContent></Select>
        </div>
        {/* Additional Search */}
        <div className="space-y-2">
          <CardTitle className="text-md">Additional Search</CardTitle>
          <Input type="date" placeholder="From Date" />
          <Input type="date" placeholder="To Date" />
          <Select><SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger><SelectContent>{indianStates.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}</SelectContent></Select>
        </div>
      </div>
      <div className="flex justify-end items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="show-limit" className="text-sm">Show Limit</label>
          <Select defaultValue="10"><SelectTrigger id="show-limit" className="w-24"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="10">10</SelectItem><SelectItem value="25">25</SelectItem><SelectItem value="50">50</SelectItem></SelectContent></Select>
        </div>
        <Button variant="outline">Reset</Button>
        <Button>Submit</Button>
      </div>
    </CardContent>
  </Card>
);

const UsersTable = ({ users }: { users: User[] }) => {
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

    const handleSelectAll = (checked: boolean | 'indeterminate') => {
        if (checked === true) {
            setSelectedRows(new Set(users.map(u => u.id)));
        } else {
            setSelectedRows(new Set());
        }
    };
    
    const handleSelectRow = (id: string, isSelected: boolean) => {
        const newSet = new Set(selectedRows);
        if (isSelected) {
            newSet.add(id);
        } else {
            newSet.delete(id);
        }
        setSelectedRows(newSet);
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-12"><Checkbox onCheckedChange={handleSelectAll} checked={selectedRows.size === users.length ? true : selectedRows.size > 0 ? 'indeterminate' : false} /></TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>State & City</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Coupon</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Test Status</TableHead>
                    <TableHead>Signup Date</TableHead>
                    <TableHead>Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell><Checkbox onCheckedChange={(checked) => handleSelectRow(user.id, checked as boolean)} checked={selectedRows.has(user.id)} /></TableCell>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>{user.city}, {user.state}</TableCell>
                        <TableCell>{user.paymentStatus}</TableCell>
                        <TableCell>{user.coupon || 'N/A'}</TableCell>
                        <TableCell>₹{user.totalAmount}</TableCell>
                        <TableCell>{user.testStatus}</TableCell>
                        <TableCell>{user.signupDate}</TableCell>
                        <TableCell>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                    <DropdownMenuItem><User className="mr-2 h-4 w-4" /> Dashboard</DropdownMenuItem>
                                    <DropdownMenuItem><History className="mr-2 h-4 w-4" /> Order History</DropdownMenuItem>
                                    <DropdownMenuItem><BarChart className="mr-2 h-4 w-4" /> Assign More Subscription</DropdownMenuItem>
                                    <DropdownMenuItem>
                                        {user.isLoginAllowed ? <><Unlock className="mr-2 h-4 w-4" /> Block Login</> : <><Lock className="mr-2 h-4 w-4" /> Allow Login</>}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};


export default function UsersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Users</h1>
      <FilterPanel />
      <Card>
        <CardContent className="p-0">
          <UsersTable users={dummyUsers} />
        </CardContent>
      </Card>
    </div>
  );
}