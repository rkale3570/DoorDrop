// ── Enums (mirrors backend) ───────────────────────────────────────────────────

export type UserRole = 'CUSTOMER' | 'STORE_OWNER' | 'SELLER' | 'DELIVERY_AGENT' | 'ADMIN';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY_FOR_PICKUP' | 'PICKED_UP' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
export type OrderType = 'DOORDROP_NOW' | 'MARKETPLACE';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'COD_PENDING';
export type DeliveryStatus = 'ASSIGNED' | 'HEADING_TO_STORE' | 'PICKED_UP' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
export type StoreOrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY_FOR_PICKUP' | 'PICKED_UP';
export type SellerOrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED';

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: number;
  name: string;
  email: string;
  role: UserRole;
}

// ── Stores ────────────────────────────────────────────────────────────────────

export interface NearbyStoreResponse {
  id: number;
  name: string;
  ownerName: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  deliveryRadiusKm: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  distanceKm: number;
  isApproved: boolean;
}

// ── Products (Kirana) ─────────────────────────────────────────────────────────

export interface StoreWithStockResponse {
  storeId: number;
  storeName: string;
  distanceKm: number;
  price: number;
  stockQty: number;
  isNearestStore: boolean;
}

export interface ProductSearchResponse {
  id: number;
  name: string;
  description: string;
  sku: string;
  categoryName: string;
  productType: OrderType;
  basePrice: number;
  mrp: number;
  imageUrl: string;
  unit: string;
  averageRating: number;
  totalReviews: number;
  availableStores: StoreWithStockResponse[];
}

export interface StoreInventoryResponse {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  categoryName: string;
  price: number;
  mrp: number;
  stockQty: number;
  unit: string;
  imageUrl: string;
  isAvailable: boolean;
}

// ── Cart ──────────────────────────────────────────────────────────────────────

export interface CartItemResponse {
  id: number;
  productId: number;
  productName: string;
  imageUrl: string;
  unit: string;
  storeId: number;
  storeName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CartResponse {
  id: number;
  userId: number;
  items: CartItemResponse[];
  itemsByStore: Record<string, CartItemResponse[]>;
  totalItems: number;
  subtotal: number;
  updatedAt: string;
}

export interface AddToCartRequest {
  productId: number;
  storeId: number;
  quantity: number;
}

export interface AddMarketplaceItemToCartRequest {
  productId: number;
  quantity: number;
}

// ── Orders ────────────────────────────────────────────────────────────────────

export interface PlaceOrderRequest {
  addressId?: number;
  notes?: string;
}

export interface OrderItemResponse {
  id: number;
  productId: number;
  productName: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface StoreOrderGroupResponse {
  id: number;
  storeId: number;
  storeName: string;
  status: StoreOrderStatus;
  items: OrderItemResponse[];
  subtotal: number;
}

export interface SellerOrderGroupResponse {
  id: number;
  sellerId: number;
  sellerBusinessName: string;
  status: SellerOrderStatus;
  trackingId?: string;
  items: OrderItemResponse[];
  subtotal: number;
  shippingFee: number;
}

export interface OrderResponse {
  id: number;
  orderNumber: string;
  userId: number;
  userName: string;
  orderType: OrderType;
  status: OrderStatus;
  deliveryStreet: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryPincode: string;
  storeGroups: StoreOrderGroupResponse[];
  sellerGroups: SellerOrderGroupResponse[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  totalAmount: number;
  estimatedDeliveryTime: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateStoreOrderStatusRequest {
  status: StoreOrderStatus;
}

export interface UpdateSellerOrderStatusRequest {
  status: SellerOrderStatus;
  trackingId?: string;
}

// ── Payments ──────────────────────────────────────────────────────────────────

export interface PaymentOrderResponse {
  orderId: number;
  orderNumber: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  razorpayKeyId: string;
  description: string;
}

export interface PaymentVerificationRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  orderId: number;
}

export interface PaymentStatusResponse {
  orderId: number;
  orderNumber: string;
  paymentStatus: PaymentStatus;
  amount: number;
  paidAt?: string;
}

// ── Marketplace Products ──────────────────────────────────────────────────────

export interface ShippingEstimateResponse {
  estimatedDays: number;
  shippingFee: number;
  distanceKm: number;
}

export interface MarketplaceProductResponse {
  id: number;
  name: string;
  description: string;
  sku: string;
  categoryName: string;
  productType: OrderType;
  basePrice: number;
  mrp: number;
  imageUrl: string;
  unit: string;
  weightKg: number;
  averageRating: number;
  totalReviews: number;
  isActive: boolean;
  sellerId: number;
  sellerBusinessName: string;
  sellerCity: string;
  sellerRating: number;
  sellerVerified: boolean;
  shippingEstimate?: ShippingEstimateResponse;
}

// ── Store Onboarding ──────────────────────────────────────────────────────────

export interface StoreOnboardingRequest {
  name: string;
  ownerName: string;
  phone: string;
  email?: string;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude: number;
  longitude: number;
  deliveryRadiusKm?: number;
  openTime?: string;
  closeTime?: string;
}

export interface CreateProductWithInventoryRequest {
  name: string;
  description?: string;
  sku?: string;
  categoryId?: number;
  mrp?: number;
  imageUrl?: string;
  unit: string;
  weightKg?: number;
  quantity: number;
  price: number;
  lowStockThreshold?: number;
}

export interface MarketplaceProductRequest {
  name: string;
  description?: string;
  sku?: string;
  categoryId?: number;
  basePrice: number;
  mrp?: number;
  imageUrl?: string;
  unit: string;
  weightKg: number;
}

// ── Seller ────────────────────────────────────────────────────────────────────

export interface SellerProfileResponse {
  id: number;
  userId: number;
  businessName: string;
  gstNumber?: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  averageRating: number;
  totalReviews: number;
  isVerified: boolean;
  isActive: boolean;
}

export interface SellerOnboardingRequest {
  businessName: string;
  gstNumber?: string;
  phone?: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
}

// ── Live Tracking ─────────────────────────────────────────────────────────────

export interface LiveTrackingResponse {
  orderId: number;
  orderNumber: string;
  deliveryStatus: DeliveryStatus;
  agentName: string;
  agentPhone: string;
  agentLatitude: number;
  agentLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
  distanceRemainingKm: number;
  estimatedMinutes: number;
}

export interface AgentLocationUpdateRequest {
  latitude: number;
  longitude: number;
}
