import { apiClient, type ApiError } from "./client";
import { config } from "../config";

const API_BASE = config.apiBaseUrl;

/**
 * Types for user management
 */
export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  name: string;
  role: "admin" | "user" | "editor";
  status: "active" | "inactive" | "suspended";
  joined: string;
  avatar?: string;
  identities?: string[];
  metadata?: Record<string, unknown>;
  updated_at: string;
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
  user_count?: number;
}

export interface ActivityLogEntry {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  category: ActivityCategory;
  details: Record<string, unknown>;
  ip_address: string;
  user_agent: string;
  created_at: string;
  suspicious: boolean;
}

export type ActivityCategory =
  | "login"
  | "logout"
  | "profile_update"
  | "password_change"
  | "role_change"
  | "admin_action"
  | "api_access"
  | "verification"
  | "recovery"
  | "other";

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface UserSearchParams {
  search?: string;
  role?: string;
  status?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  page?: number;
  page_size?: number;
}

export interface ActivitySearchParams {
  user_id?: string;
  category?: string;
  from_date?: string;
  to_date?: string;
  suspicious?: boolean;
  page?: number;
  page_size?: number;
}

/**
 * Users API — interacts with PostgREST backend via nginx/oathkeeper
 */
const UsersApi = {
  /**
   * List users with pagination, search, and filters
   */
  async listUsers(params: UserSearchParams = {}): Promise<PaginatedResponse<AdminUser>> {
    const query = new URLSearchParams();

    if (params.page) query.set("offset", String((params.page - 1) * (params.page_size || 20)));
    if (params.page_size) query.set("limit", String(params.page_size));

    const order = params.sort_order || "desc";
    query.set("order", `created_at.${order}`);

    if (params.search) query.set("search", params.search);
    if (params.role) query.set("role", `eq.${params.role}`);
    if (params.status) query.set("status", `eq.${params.status}`);

    // Also request count for pagination
    query.set("select", "*,total:count()");

    const qs = query.toString() ? `?${query.toString()}` : "";
    return apiClient.get<PaginatedResponse<AdminUser>>(`${API_BASE}/users${qs}`);
  },

  /**
   * Get a single user by ID
   */
  async getUser(id: string): Promise<AdminUser> {
    return apiClient.get<AdminUser>(`${API_BASE}/users?id=eq.${encodeURIComponent(id)}`);
  },

  /**
   * Update user fields (role, status, metadata)
   */
  async updateUser(id: string, data: Partial<Pick<AdminUser, "role" | "status" | "metadata">>): Promise<AdminUser> {
    return apiClient.patch<AdminUser>(`${API_BASE}/users?id=eq.${encodeURIComponent(id)}`, data);
  },

  /**
   * Delete/deactivate a user
   */
  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`${API_BASE}/users?id=eq.${encodeURIComponent(id)}`);
  },

  /**
   * Bulk update users
   */
  async bulkUpdateUsers(ids: string[], data: Partial<Pick<AdminUser, "role" | "status">>): Promise<void> {
    await apiClient.patch(`${API_BASE}/users?id=in.(${ids.join(",")})`, data);
  },

  /**
   * Bulk delete users
   */
  async bulkDeleteUsers(ids: string[]): Promise<void> {
    await apiClient.delete(`${API_BASE}/users?id=in.(${ids.join(",")})`);
  },

  /**
   * List roles
   */
  async listRoles(): Promise<UserRole[]> {
    return apiClient.get<UserRole[]>(`${API_BASE}/roles?order=name.asc`);
  },

  /**
   * Create/update a role
   */
  async upsertRole(data: Partial<UserRole>): Promise<UserRole> {
    return apiClient.post<UserRole>(`${API_BASE}/roles`, data);
  },

  /**
   * Delete a role
   */
  async deleteRole(id: string): Promise<void> {
    await apiClient.delete(`${API_BASE}/roles?id=eq.${encodeURIComponent(id)}`);
  },

  /**
   * List activity log entries
   */
  async listActivity(params: ActivitySearchParams = {}): Promise<PaginatedResponse<ActivityLogEntry>> {
    const query = new URLSearchParams();

    if (params.page) query.set("offset", String((params.page - 1) * (params.page_size || 20)));
    if (params.page_size) query.set("limit", String(params.page_size));
    query.set("order", "created_at.desc");

    if (params.user_id) query.set("user_id", `eq.${params.user_id}`);
    if (params.category) query.set("category", `eq.${params.category}`);
    if (params.from_date) query.set("created_at", `gte.${params.from_date}`);
    if (params.to_date) query.set("created_at", `lte.${params.to_date}`);
    if (params.suspicious !== undefined) query.set("suspicious", `is.${params.suspicious}`);

    query.set("select", "*,total:count()");

    const qs = query.toString() ? `?${query.toString()}` : "";
    return apiClient.get<PaginatedResponse<ActivityLogEntry>>(`${API_BASE}/audit_logs${qs}`);
  },

  /**
   * Get a session summary for a user (login history, devices)
   */
  async getUserSessions(id: string): Promise<Array<{
    id: string;
    ip_address: string;
    user_agent: string;
    location: string;
    created_at: string;
    expires_at: string;
    active: boolean;
  }>> {
    return apiClient.get(`${API_BASE}/user_sessions?user_id=eq.${encodeURIComponent(id)}&order=created_at.desc&limit=20`);
  },
};

export default UsersApi;
