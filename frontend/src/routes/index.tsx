import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import {
  Users,
  Activity,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export function DashboardPage() {
  const stats = [
    {
      title: "Total Revenue",
      value: "$45,231.89",
      change: "+20.1%",
      trend: "up",
      icon: DollarSign,
    },
    {
      title: "Active Users",
      value: "2,350",
      change: "+180.1%",
      trend: "up",
      icon: Users,
    },
    {
      title: "Sales",
      value: "12,234",
      change: "+19%",
      trend: "up",
      icon: ShoppingCart,
    },
    {
      title: "Conversion Rate",
      value: "3.24%",
      change: "-0.5%",
      trend: "down",
      icon: Activity,
    },
  ];

  const recentOrders = [
    {
      id: "#1234",
      customer: "Olivia Martin",
      email: "olivia.martin@email.com",
      status: "completed",
      amount: "$2,250.00",
    },
    {
      id: "#1235",
      customer: "Ava Johnson",
      email: "ava.johnson@email.com",
      status: "processing",
      amount: "$1,850.00",
    },
    {
      id: "#1236",
      customer: "Michael Johnson",
      email: "michael.johnson@email.com",
      status: "pending",
      amount: "$3,420.00",
    },
    {
      id: "#1237",
      customer: "Sarah Wilson",
      email: "sarah.wilson@email.com",
      status: "completed",
      amount: "$1,560.00",
    },
    {
      id: "#1238",
      customer: "James Brown",
      email: "james.brown@email.com",
      status: "cancelled",
      amount: "$890.00",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Your overview and analytics at a glance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 text-xs">
                {stat.trend === "up" ? (
                  <>
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                    <span className="text-emerald-500 font-medium">
                      {stat.change}
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3 w-3 text-red-500" />
                    <span className="text-red-500 font-medium">
                      {stat.change}
                    </span>
                  </>
                )}
                <span className="text-muted-foreground">
                  from last month
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[200px] flex items-end gap-2">
              {[
                { label: "Jan", value: 40 },
                { label: "Feb", value: 65 },
                { label: "Mar", value: 45 },
                { label: "Apr", value: 80 },
                { label: "May", value: 55 },
                { label: "Jun", value: 90 },
                { label: "Jul", value: 70 },
                { label: "Aug", value: 85 },
                { label: "Sep", value: 60 },
                { label: "Oct", value: 75 },
                { label: "Nov", value: 95 },
                { label: "Dec", value: 88 },
              ].map((month) => (
                <div
                  key={month.label}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className="w-full rounded-md bg-primary/20 transition-all hover:bg-primary/30"
                    style={{ height: `${month.value}%` }}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {month.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest 5 orders this month</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{order.customer}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.status === "completed"
                            ? "default"
                            : order.status === "processing"
                              ? "secondary"
                              : order.status === "pending"
                                ? "outline"
                                : "destructive"
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {order.amount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
