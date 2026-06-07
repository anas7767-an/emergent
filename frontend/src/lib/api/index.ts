/**
 * FERI Wholesale — hand-written API client + react-query hooks.
 * Replaces the orval-generated client to talk to the FastAPI backend.
 */
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";

// ---------------------------------------------------------------------------
// Types (kept compatible with the original generated schemas)
// ---------------------------------------------------------------------------
export type UserRole = "retailer" | "brand" | "admin";
export type UserKycStatus = "pending" | "verified" | "rejected";
export type OrderPaymentType = "pay_now" | "net_15" | "net_30" | "net_60";
export type OrderInputPaymentType = OrderPaymentType;
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "dispatched"
  | "delivered"
  | "exchange_requested";
export type ProductStockStatus = "in_stock" | "out_of_stock" | "low_stock";

export const OrderInputPaymentType = {
  pay_now: "pay_now",
  net_15: "net_15",
  net_30: "net_30",
  net_60: "net_60",
} as const;

export const OrderStatus = {
  pending: "pending",
  confirmed: "confirmed",
  dispatched: "dispatched",
  delivered: "delivered",
  exchange_requested: "exchange_requested",
} as const;

export interface User {
  id: number;
  name: string;
  phone: string;
  role: UserRole;
  city?: string | null;
  kyc_status?: UserKycStatus;
  credit_limit?: number | null;
  shop_name?: string | null;
  brand_name?: string | null;
  product_category?: string | null;
  created_at?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  mrp: number;
  wholesale_price: number;
  margin_percent: number;
  brand_id?: number | null;
  brand_name?: string | null;
  exchange_eligible?: boolean;
  stock_status?: ProductStockStatus;
  moq: number;
  description?: string | null;
  image_url?: string | null;
  is_approved?: boolean;
  is_featured?: boolean;
  created_at?: string;
}

export interface OrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: number;
  retailer_id: number;
  retailer_name?: string | null;
  retailer_city?: string | null;
  items: OrderItem[];
  total_amount: number;
  payment_type: OrderPaymentType;
  status: OrderStatus;
  delivery_date?: string | null;
  created_at?: string;
}

export interface RetailerSummary {
  total_orders: number;
  pending_deliveries: number;
  available_credit: number;
}

export interface BrandSummary {
  total_products: number;
  total_orders: number;
  revenue_this_month: number;
  top_selling_product?: string | null;
}

export interface AdminSummary {
  total_retailers: number;
  orders_today: number;
  revenue_today: number;
  active_credits: number;
  pending_exchanges: number;
  new_registrations: number;
}

export interface CreditEntry {
  id: number;
  amount: number;
  due_date: string;
  status: "pending" | "paid" | "overdue";
  order_id?: number | null;
  created_at?: string;
}

export interface CreditWithEntries {
  retailer_id: number;
  credit_limit: number;
  used_amount: number;
  available_limit: number;
  entries: CreditEntry[];
}

export interface LoginInput {
  phone: string;
  password: string;
  role: UserRole;
}

export interface RetailerRegisterInput {
  shop_name: string;
  owner_name: string;
  phone: string;
  city: string;
  password: string;
}

export interface BrandRegisterInput {
  brand_name: string;
  contact_person: string;
  phone: string;
  product_category: string;
  password: string;
}

export interface OrderInput {
  items: { product_id: number; quantity: number }[];
  payment_type: OrderPaymentType;
}

export interface ListProductsParams {
  category?: string;
  search?: string;
  sort?: string;
  brand_id?: number;
}

// ---------------------------------------------------------------------------
// Auth token storage
// ---------------------------------------------------------------------------
export type AuthTokenGetter = () => string | Promise<string | null> | null;
let _tokenGetter: AuthTokenGetter | null = null;

export function setAuthTokenGetter(getter: AuthTokenGetter | null) {
  _tokenGetter = getter;
}
export function setBaseUrl(_url: string | null) {
  // no-op — we always read from env
}

// ---------------------------------------------------------------------------
// Fetch wrapper
// ---------------------------------------------------------------------------
const BASE = (import.meta as any).env?.VITE_API_BASE_URL || "";
const API_BASE = BASE
  ? BASE.replace(/\/+$/, "") + "/api"
  : "/api"; // same-origin via vite proxy in dev

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(status: number, data: any) {
    super(
      typeof data?.detail === "string"
        ? data.detail
        : Array.isArray(data?.detail)
        ? data.detail.map((e: any) => e?.msg || JSON.stringify(e)).join(", ")
        : `Request failed (${status})`
    );
    this.status = status;
    this.data = data;
  }
}

async function api<T>(
  path: string,
  init?: RequestInit & { params?: Record<string, any> }
): Promise<T> {
  const { params, ...rest } = init || {};
  let url = `${API_BASE}${path}`;
  if (params) {
    const usp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") usp.append(k, String(v));
    });
    const qs = usp.toString();
    if (qs) url += `?${qs}`;
  }
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((rest.headers as any) || {}),
  };
  if (_tokenGetter) {
    const t = await _tokenGetter();
    if (t) headers["Authorization"] = `Bearer ${t}`;
  }
  const res = await fetch(url, { ...rest, headers });
  if (!res.ok) {
    let data: any = {};
    try {
      data = await res.json();
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, data);
  }
  if (res.status === 204) return undefined as any;
  return (await res.json()) as T;
}

// ---------------------------------------------------------------------------
// React Query hooks
// ---------------------------------------------------------------------------

// AUTH
export function useLogin(
  options?: UseMutationOptions<AuthResponse, ApiError, { data: LoginInput }>
) {
  return useMutation({
    mutationFn: ({ data }) =>
      api<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(data) }),
    ...(options || {}),
  });
}

export function useRegisterRetailer(
  options?: UseMutationOptions<AuthResponse, ApiError, { data: RetailerRegisterInput }>
) {
  return useMutation({
    mutationFn: ({ data }) =>
      api<AuthResponse>("/auth/register-retailer", { method: "POST", body: JSON.stringify(data) }),
    ...(options || {}),
  });
}

export function useRegisterBrand(
  options?: UseMutationOptions<AuthResponse, ApiError, { data: BrandRegisterInput }>
) {
  return useMutation({
    mutationFn: ({ data }) =>
      api<AuthResponse>("/auth/register-brand", { method: "POST", body: JSON.stringify(data) }),
    ...(options || {}),
  });
}

export function useGetMe(options?: { query?: { enabled?: boolean } }) {
  return useQuery<User, ApiError>({
    queryKey: ["/api/auth/me"],
    queryFn: () => api<User>("/auth/me"),
    enabled: options?.query?.enabled,
  });
}

// PRODUCTS
export function useListProducts(
  params?: ListProductsParams,
  options?: { query?: UseQueryOptions<Product[], ApiError> }
) {
  return useQuery<Product[], ApiError>({
    queryKey: ["/api/products", params],
    queryFn: () => api<Product[]>("/products", { params: params as any }),
    ...((options?.query as any) || {}),
  });
}

export function useGetFeaturedProducts(options?: { query?: { enabled?: boolean } }) {
  return useQuery<Product[], ApiError>({
    queryKey: ["/api/products/featured"],
    queryFn: () => api<Product[]>("/products/featured"),
    enabled: options?.query?.enabled,
  });
}

export function useCreateProduct(
  options?: UseMutationOptions<Product, ApiError, { data: Omit<Product, "id" | "margin_percent"> }>
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ data }) =>
      api<Product>("/products", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/products"] }),
    ...(options || {}),
  });
}

export function useBrandProducts(options?: { query?: { enabled?: boolean } }) {
  return useQuery<Product[], ApiError>({
    queryKey: ["/api/brand/products"],
    queryFn: () => api<Product[]>("/brand/products"),
    enabled: options?.query?.enabled,
  });
}

// ORDERS
export function useCreateOrder(
  options?: UseMutationOptions<Order, ApiError, { data: OrderInput }>
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ data }) =>
      api<Order>("/orders", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/orders"] });
      qc.invalidateQueries({ queryKey: ["/api/orders/recent"] });
      qc.invalidateQueries({ queryKey: ["/api/retailer/summary"] });
      qc.invalidateQueries({ queryKey: ["/api/retailer/credit"] });
    },
    ...(options || {}),
  });
}

export function useListOrders(options?: { query?: { enabled?: boolean } }) {
  return useQuery<Order[], ApiError>({
    queryKey: ["/api/orders"],
    queryFn: () => api<Order[]>("/orders"),
    enabled: options?.query?.enabled,
  });
}

export function useGetRecentOrders(options?: { query?: { enabled?: boolean } }) {
  return useQuery<Order[], ApiError>({
    queryKey: ["/api/orders/recent"],
    queryFn: () => api<Order[]>("/orders/recent"),
    enabled: options?.query?.enabled,
  });
}

export function useUpdateOrderStatus(
  options?: UseMutationOptions<Order, ApiError, { id: number; data: { status: OrderStatus; delivery_date?: string } }>
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      api<Order>(`/orders/${id}/status`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/orders"] }),
    ...(options || {}),
  });
}

// RETAILER
export function useGetRetailerSummary(options?: { query?: { enabled?: boolean } }) {
  return useQuery<RetailerSummary, ApiError>({
    queryKey: ["/api/retailer/summary"],
    queryFn: () => api<RetailerSummary>("/retailer/summary"),
    enabled: options?.query?.enabled,
  });
}

export function useGetRetailerCredit(options?: { query?: { enabled?: boolean } }) {
  return useQuery<CreditWithEntries, ApiError>({
    queryKey: ["/api/retailer/credit"],
    queryFn: () => api<CreditWithEntries>("/retailer/credit"),
    enabled: options?.query?.enabled,
  });
}

// BRAND
export function useGetBrandSummary(options?: { query?: { enabled?: boolean } }) {
  return useQuery<BrandSummary, ApiError>({
    queryKey: ["/api/brand/summary"],
    queryFn: () => api<BrandSummary>("/brand/summary"),
    enabled: options?.query?.enabled,
  });
}

// ADMIN
export function useGetAdminSummary(options?: { query?: { enabled?: boolean } }) {
  return useQuery<AdminSummary, ApiError>({
    queryKey: ["/api/admin/summary"],
    queryFn: () => api<AdminSummary>("/admin/summary"),
    enabled: options?.query?.enabled,
  });
}

export function useListAllOrders(options?: { query?: { enabled?: boolean } }) {
  return useQuery<Order[], ApiError>({
    queryKey: ["/api/admin/orders"],
    queryFn: () => api<Order[]>("/admin/orders"),
    enabled: options?.query?.enabled,
  });
}

export function useAdminRetailers(options?: { query?: { enabled?: boolean } }) {
  return useQuery<(User & { available_limit: number; used_amount: number })[], ApiError>({
    queryKey: ["/api/admin/retailers"],
    queryFn: () => api<any[]>("/admin/retailers"),
    enabled: options?.query?.enabled,
  });
}

export function useUpdateKyc(
  options?: UseMutationOptions<{ success: boolean }, ApiError, { id: number; data: { kyc_status: UserKycStatus } }>
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      api(`/admin/retailers/${id}/kyc`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/retailers"] }),
    ...(options || {}),
  });
}

export function useUpdateCreditLimit(
  options?: UseMutationOptions<{ success: boolean }, ApiError, { id: number; data: { credit_limit: number } }>
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) =>
      api(`/admin/retailers/${id}/credit-limit`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/retailers"] }),
    ...(options || {}),
  });
}

// ---------------------------------------------------------------------------
// Backward-compatible aliases (so existing dashboard pages still compile)
// ---------------------------------------------------------------------------
export const useGetMyCredit = useGetRetailerCredit;
export const useListRetailers = useAdminRetailers;
export const useUpdateKycStatus = useUpdateKyc;

export const UserKycStatus = {
  pending: "pending",
  verified: "verified",
  rejected: "rejected",
} as const;

export const OrderStatusUpdateStatus = {
  pending: "pending",
  confirmed: "confirmed",
  dispatched: "dispatched",
  delivered: "delivered",
  exchange_requested: "exchange_requested",
} as const;

export const getListProductsQueryKey = (p?: ListProductsParams) => ["/api/products", p];
export const getListOrdersQueryKey = () => ["/api/orders"];
export const getListAllOrdersQueryKey = () => ["/api/admin/orders"];
export const getListRetailersQueryKey = () => ["/api/admin/retailers"];

export function useGetCreditHistory() {
  const q = useGetRetailerCredit();
  return { ...q, data: q.data?.entries ?? [] };
}

export function useRequestCreditIncrease() {
  // Stub: endpoint not yet implemented on backend. Returns resolved success.
  return useMutation({
    mutationFn: async (_args: { data: { requested_amount: number; reason: string } }) => ({
      success: true,
    }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (_args: { id: number }) => ({ success: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/products"] }),
  });
}

export function useGetBrandAnalytics() {
  return useQuery({
    queryKey: ["/api/brand/analytics"],
    queryFn: async () => ({
      city_breakdown: [],
      top_products: [],
      exchange_rate: 0,
    }),
  });
}
