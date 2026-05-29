import { useState, useMemo } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  type ColumnFiltersState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { PageHeader } from "../../components/PageHeader";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "editor";
  status: "active" | "inactive" | "suspended";
  joined: string;
  avatar?: string;
}

const data: User[] = [
  { id: "1", name: "Olivia Martin", email: "olivia.martin@email.com", role: "admin", status: "active", joined: "Jan 12, 2024" },
  { id: "2", name: "Ava Johnson", email: "ava.johnson@email.com", role: "user", status: "active", joined: "Feb 3, 2024" },
  { id: "3", name: "Michael Johnson", email: "michael.johnson@email.com", role: "editor", status: "inactive", joined: "Mar 15, 2024" },
  { id: "4", name: "Sarah Wilson", email: "sarah.wilson@email.com", role: "user", status: "active", joined: "Apr 22, 2024" },
  { id: "5", name: "James Brown", email: "james.brown@email.com", role: "user", status: "suspended", joined: "May 8, 2024" },
  { id: "6", name: "Emma Davis", email: "emma.davis@email.com", role: "editor", status: "active", joined: "Jun 19, 2024" },
  { id: "7", name: "William Taylor", email: "william.taylor@email.com", role: "user", status: "inactive", joined: "Jul 5, 2024" },
  { id: "8", name: "Sophia Anderson", email: "sophia.anderson@email.com", role: "admin", status: "active", joined: "Aug 14, 2024" },
];

export function UsersPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns: ColumnDef<User>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 text-sm font-medium text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={row.original.avatar} alt={row.original.name} />
              <AvatarFallback className="text-xs">
                {row.original.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{row.original.name}</p>
              <p className="text-xs text-muted-foreground">{row.original.email}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <Badge variant={row.original.role === "admin" ? "default" : row.original.role === "editor" ? "secondary" : "outline"}>
            {row.original.role}
          </Badge>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.status === "active" ? "default" : row.original.status === "inactive" ? "secondary" : "destructive"}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "joined",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 text-sm font-medium text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Joined
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
      },
      {
        id: "actions",
        cell: () => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: { sorting, columnFilters, globalFilter },
    initialState: { pagination: { pageSize: 5 } },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage your team members and their permissions."
        actions={
          <Button>
            <UserPlus className="mr-2 h-4 w-4" /> Add User
          </Button>
        }
      />

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">No results.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
