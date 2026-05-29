import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import UsersApi from "../api/users";
import type { AdminUser, UserSearchParams, ActivityLogEntry, ActivitySearchParams, UserRole, PaginatedResponse } from "../api/users";

/**
 * Hook for user list management with search, filter, pagination
 */
export function useUserManagement() {
  const queryClient = useQueryClient();
  const [params, setParams] = useState<UserSearchParams>({
    page: 1,
    page_size: 20,
    sort_order: "desc",
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["users", params],
    queryFn: () => UsersApi.listUsers(params),
  });

  const updateUser = useMutation({
    mutationFn: ({ id, data: updateData }: { id: string; data: Partial<AdminUser> }) =>
      UsersApi.updateUser(id, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) => UsersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const bulkUpdate = useMutation({
    mutationFn: ({ ids, data: bulkData }: { ids: string[]; data: Partial<AdminUser> }) =>
      UsersApi.bulkUpdateUsers(ids, bulkData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const bulkDelete = useMutation({
    mutationFn: (ids: string[]) => UsersApi.bulkDeleteUsers(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const setSearch = useCallback((search: string) => {
    setParams((p) => ({ ...p, search: search || undefined, page: 1 }));
  }, []);

  const setFilter = useCallback((role?: string, status?: string) => {
    setParams((p) => ({ ...p, role, status, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setParams((p) => ({ ...p, page }));
  }, []);

  const setSort = useCallback((sort_by: string, sort_order: "asc" | "desc" = "desc") => {
    setParams((p) => ({ ...p, sort_by, sort_order }));
  }, []);

  return {
    users: data?.data || [],
    total: data?.total || 0,
    page: params.page || 1,
    pageSize: params.page_size || 20,
    isLoading,
    error,
    params,
    setParams,
    setSearch,
    setFilter,
    setPage,
    setSort,
    updateUser: updateUser.mutateAsync,
    deleteUser: deleteUser.mutateAsync,
    bulkUpdate: bulkUpdate.mutateAsync,
    bulkDelete: bulkDelete.mutateAsync,
    isUpdating: updateUser.isPending || bulkUpdate.isPending,
    isDeleting: deleteUser.isPending || bulkDelete.isPending,
  };
}

/**
 * Hook for a single user detail
 */
export function useUserDetail(id: string) {
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["user", id],
    queryFn: () => UsersApi.getUser(id),
    enabled: !!id,
  });

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ["user-sessions", id],
    queryFn: () => UsersApi.getUserSessions(id),
    enabled: !!id,
  });

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ["user-activity", id],
    queryFn: () =>
      UsersApi.listActivity({ user_id: id, page_size: 10 }),
    enabled: !!id,
  });

  const updateUser = useMutation({
    mutationFn: (data: Partial<AdminUser>) => UsersApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", id] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  return {
    user,
    sessions,
    activity: activity?.data || [],
    isLoading,
    error,
    updateUser: updateUser.mutateAsync,
    isUpdating: updateUser.isPending,
  };
}

/**
 * Hook for activity log with search and filter
 */
export function useActivityLog() {
  const [params, setParams] = useState<ActivitySearchParams>({
    page: 1,
    page_size: 20,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["activity", params],
    queryFn: () => UsersApi.listActivity(params),
  });

  const setCategory = useCallback((category?: string) => {
    setParams((p) => ({ ...p, category, page: 1 }));
  }, []);

  const setDateRange = useCallback((from?: string, to?: string) => {
    setParams((p) => ({ ...p, from_date: from, to_date: to, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setParams((p) => ({ ...p, page }));
  }, []);

  const setSuspicious = useCallback((suspicious?: boolean) => {
    setParams((p) => ({ ...p, suspicious, page: 1 }));
  }, []);

  return {
    entries: data?.data || [],
    total: data?.total || 0,
    page: params.page || 1,
    pageSize: params.page_size || 20,
    isLoading,
    error,
    params,
    setParams,
    setCategory,
    setDateRange,
    setPage,
    setSuspicious,
  };
}

/**
 * Hook for role management
 */
export function useRoles() {
  const queryClient = useQueryClient();

  const { data: roles, isLoading, error } = useQuery({
    queryKey: ["roles"],
    queryFn: () => UsersApi.listRoles(),
  });

  const upsertRole = useMutation({
    mutationFn: (data: Partial<UserRole>) => UsersApi.upsertRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });

  const deleteRole = useMutation({
    mutationFn: (id: string) => UsersApi.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });

  return {
    roles: roles || [],
    isLoading,
    error,
    upsertRole: upsertRole.mutateAsync,
    deleteRole: deleteRole.mutateAsync,
    isMutating: upsertRole.isPending || deleteRole.isPending,
  };
}
