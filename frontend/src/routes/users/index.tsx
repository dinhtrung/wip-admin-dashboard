import { useMemo, useState } from "react";
import type { ColumnDef, SortingState, ColumnFiltersState } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Link } from "@tanstack/react-router";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { PageHeader } from "../../components/PageHeader";
import { useUserManagement } from "../../hooks/use-user-management";
import type { AdminUser } from "../../api/users";
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
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Alert, AlertDescription } from "../../components/ui/alert";

export function UsersPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  const {
    users,
    isLoading,
    error,
    setSearch,
    setFilter,
    setPage,
    page,
    pageSize,
    total,
    deleteUser,
    updateUser,
  } = useUserManagement();

  const columns: ColumnDef<AdminUser>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(e) => {
              table.toggleAllPageRowsSelected(e.target.checked);
              const ids = new Set<string>();
              if (e.target.checked) {
                table.getRowModel().rows.forEach((r) => ids.add(r.original.id));
              }
              setSelectedUsers(ids);
            }}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300"
            checked={row.getIsSelected()}
            onChange={(e) => {
              row.toggleSelected(e.target.checked);
              const newSet = new Set(selectedUsers);
              if (e.target.checked) newSet.add(row.original.id);
              else newSet.delete(row.original.id);
              setSelectedUsers(newSet);
            }}
          />
        ),
        enableSorting: false,
      },
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
              <AvatarFallback className="text-xs">
                {(row.original.first_name?.[0] || "") + (row.original.last_name?.[0] || row.original.email?.[0]?.toUpperCase() || "?")}
              </AvatarFallback>
            </Avatar>
            <div>
              <Link
                to="/users/$userId"
                params={{ userId: row.original.id }}
                className="text-sm font-medium hover:text-primary hover:underline"
              >
                {row.original.name || `${row.original.first_name} ${row.original.last_name}`.trim()}
              </Link>
              <p className="text-xs text-muted-foreground">{row.original.email}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <Badge
            variant={row.original.role === "admin" ? "default" : row.original.role === "editor" ? "secondary" : "outline"}
          >
            {row.original.role}
          </Badge>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.status === "active"
                ? "default"
                : row.original.status === "inactive"
                  ? "secondary"
                  : "destructive"
            }
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "updated_at",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 text-sm font-medium text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Updated
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {new Date(row.original.updated_at).toLocaleDateString()}
          </span>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link to="/users/$userId" params={{ userId: row.original.id }}>
                  <Edit className="mr-2 h-4 w-4" /> View details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => deleteUser(row.original.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [deleteUser, selectedUsers],
  );

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: { sorting, columnFilters, globalFilter },
    manualPagination: true,
    pageCount: Math.ceil(total / pageSize) || 1,
  });

  const handleSearch = (value: string) => {
    setGlobalFilter(value);
    setSearch(value);
  };

  const handleRoleFilter = (value: string) => {
    setFilter(value === "all" ? undefined : value, undefined);
  };

  const handleStatusFilter = (value: string) => {
    setFilter(undefined, value === "all" ? undefined : value);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage team members and their permissions."
        actions={
          <div className="flex gap-2">
            {selectedUsers.size > 0 && (
              <Button variant="outline" size="sm">
                {selectedUsers.size} selected
              </Button>
            )}
            <Link to="/users/bulk">
              <Button variant="outline">
                <UserPlus className="mr-2 h-4 w-4" /> Bulk Actions
              </Button>
            </Link>
            <Link to="/users/roles">
              <Button variant="outline">Roles</Button>
            </Link>
            <Link to="/users/activity">
              <Button variant="outline">Activity Log</Button>
            </Link>
          </div>
        }
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load users. Using cached data if available.</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={globalFilter ?? ""}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select onValueChange={handleRoleFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
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
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {page} of {Math.max(1, Math.ceil(total / pageSize))} ({total} total)
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setPage(1)} disabled={page <= 1}>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setPage(page - 1)} disabled={page <= 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage(page + 1)}
            disabled={page >= Math.ceil(total / pageSize)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage(Math.max(1, Math.ceil(total / pageSize)))}
            disabled={page >= Math.ceil(total / pageSize)}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
