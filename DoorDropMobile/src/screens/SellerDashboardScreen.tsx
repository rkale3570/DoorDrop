import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated, ActivityIndicator, Alert, RefreshControl,
  Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Package, TrendingUp, Plus, Edit,
  CheckCircle, Clock, Truck, LogOut, X,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import {
  MarketplaceProductResponse, MarketplaceProductRequest,
  SellerOrderGroupResponse, SellerProfileResponse, SellerOrderStatus,
} from '../api/types';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// ── Animation helper ──────────────────────────────────────────────────────────

const FadeIn = ({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: object }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 350, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 350, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>{children}</Animated.View>;
};

// ── Status helpers ────────────────────────────────────────────────────────────

type StatusCfg = { icon: React.ElementType; color: string; bgAlpha: string; next?: SellerOrderStatus; nextLabel?: string };

const statusMap: Record<string, StatusCfg> = {
  PENDING:          { icon: Clock,         color: '#FB923C', bgAlpha: '#FB923C20', next: 'CONFIRMED',        nextLabel: 'Confirm' },
  CONFIRMED:        { icon: CheckCircle,   color: '#4ADE80', bgAlpha: '#4ADE8020', next: 'PROCESSING',       nextLabel: 'Start Processing' },
  PROCESSING:       { icon: Package,       color: '#60A5FA', bgAlpha: '#60A5FA20', next: 'SHIPPED',          nextLabel: 'Mark Shipped' },
  SHIPPED:          { icon: Truck,         color: '#A78BFA', bgAlpha: '#A78BFA20', next: 'OUT_FOR_DELIVERY', nextLabel: 'Out for Delivery' },
  OUT_FOR_DELIVERY: { icon: TrendingUp,    color: '#F59E0B', bgAlpha: '#F59E0B20', next: 'DELIVERED',        nextLabel: 'Mark Delivered' },
  DELIVERED:        { icon: CheckCircle,   color: '#4ADE80', bgAlpha: '#4ADE8020' },
};

// ── SellerDashboardScreen ─────────────────────────────────────────────────────

const SellerDashboardScreen = () => {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const s = makeStyles(colors);

  const [activeTab, setActiveTab] = useState<'orders' | 'listings' | 'profile'>('orders');
  const [orders, setOrders] = useState<SellerOrderGroupResponse[]>([]);
  const [products, setProducts] = useState<MarketplaceProductResponse[]>([]);
  const [profile, setProfile] = useState<SellerProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ── Add Product modal ──────────────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', basePrice: '', mrp: '', unit: '', weightKg: '',
  });

  const resetForm = () => setForm({ name: '', description: '', basePrice: '', mrp: '', unit: '', weightKg: '' });

  const handleAddProduct = async () => {
    if (!form.name.trim()) { Alert.alert('Validation', 'Product name is required.'); return; }
    if (!form.basePrice || isNaN(Number(form.basePrice)) || Number(form.basePrice) <= 0) {
      Alert.alert('Validation', 'Enter a valid base price.'); return;
    }
    if (!form.unit.trim()) { Alert.alert('Validation', 'Unit is required (e.g. piece, kg, litre).'); return; }
    if (!form.weightKg || isNaN(Number(form.weightKg)) || Number(form.weightKg) <= 0) {
      Alert.alert('Validation', 'Enter a valid weight in kg.'); return;
    }

    const payload: MarketplaceProductRequest = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      basePrice: Number(form.basePrice),
      mrp: form.mrp ? Number(form.mrp) : undefined,
      unit: form.unit.trim(),
      weightKg: Number(form.weightKg),
    };

    try {
      setSubmitting(true);
      const { data } = await apiClient.post<MarketplaceProductResponse>('/api/marketplace/products', payload);
      setProducts(prev => [data, ...prev]);
      setShowModal(false);
      resetForm();
      Alert.alert('Success', `"${data.name}" has been listed.`);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Could not add product. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const fetchData = async () => {
    try {
      const [ordersRes, productsRes, profileRes] = await Promise.all([
        apiClient.get<SellerOrderGroupResponse[]>('/api/marketplace/orders/incoming'),
        apiClient.get<MarketplaceProductResponse[]>('/api/marketplace/products/my-listings'),
        apiClient.get<SellerProfileResponse>('/api/seller/me'),
      ]);
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
      setProfile(profileRes.data);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        // First-time seller — redirect to setup
        navigation.replace('ShopSetup');
        return;
      }
      Alert.alert('Error', 'Could not load data. Pull down to refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const advanceStatus = async (groupId: number, nextStatus: SellerOrderStatus) => {
    try {
      await apiClient.patch(`/api/marketplace/orders/groups/${groupId}/status`, { status: nextStatus });
      setOrders(prev => prev.map(o => o.id === groupId ? { ...o, status: nextStatus } : o));
    } catch {
      Alert.alert('Error', 'Could not update order status.');
    }
  };

  if (loading) {
    return (
      <View style={[s.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <TouchableOpacity onPress={() => navigation.navigate('Account')}>
            <LinearGradient colors={[...colors.gradientGold]} style={s.avatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={[s.avatarText, { color: colors.primaryForeground }]}>
                {user?.name?.[0]?.toUpperCase() ?? 'S'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          <View>
            <Text style={[s.headerTitle, { color: colors.foreground }]}>Seller Dashboard</Text>
            <Text style={[s.headerSub, { color: colors.mutedForeground }]}>
              {profile?.businessName ?? user?.name}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={logout} style={s.logoutBtn}>
          <LogOut size={18} color={colors.destructive} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[s.tabBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {(['orders', 'listings', 'profile'] as const).map(tab => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={s.tabItem}>
            {activeTab === tab ? (
              <LinearGradient colors={[...colors.gradientGold]} style={s.tabActive} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Text style={[s.tabTextActive, { color: colors.primaryForeground }]}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</Text>
              </LinearGradient>
            ) : (
              <View style={s.tabInactive}>
                <Text style={[s.tabText, { color: colors.mutedForeground }]}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* ── Orders tab ── */}
        {activeTab === 'orders' && (
          orders.length === 0
            ? <EmptyState icon="📦" text="No incoming orders yet" colors={colors} />
            : orders.map((order, i) => {
                const sc = statusMap[order.status] ?? statusMap.PENDING;
                return (
                  <FadeIn key={order.id} delay={i * 60}>
                    <View style={[s.orderCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <View style={s.orderTop}>
                        <View style={[s.statusIcon, { backgroundColor: sc.bgAlpha }]}>
                          <sc.icon size={16} color={sc.color} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[s.orderId, { color: colors.foreground }]}>Order #{order.id}</Text>
                          <Text style={[s.orderBiz, { color: colors.mutedForeground }]}>{order.sellerBusinessName}</Text>
                        </View>
                        <View style={[s.statusBadge, { backgroundColor: sc.bgAlpha }]}>
                          <Text style={[s.statusText, { color: sc.color }]}>{order.status.replace(/_/g, ' ')}</Text>
                        </View>
                      </View>

                      {/* Items */}
                      {order.items.map(item => (
                        <View key={item.id} style={s.orderItemRow}>
                          <Text style={[s.orderItemName, { color: colors.foreground }]}>{item.productName}</Text>
                          <Text style={[s.orderItemMeta, { color: colors.mutedForeground }]}>
                            x{item.quantity}  ₹{item.totalPrice}
                          </Text>
                        </View>
                      ))}

                      <View style={[s.divider, { borderTopColor: colors.border }]} />
                      <View style={s.orderFooter}>
                        <Text style={[s.orderTotal, { color: colors.primary }]}>
                          ₹{order.subtotal} + ₹{order.shippingFee} shipping
                        </Text>
                        {sc.next && (
                          <LinearGradient colors={[...colors.gradientGold]} style={s.advanceBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                            <TouchableOpacity style={s.advanceBtnInner} onPress={() => advanceStatus(order.id, sc.next!)}>
                              <Text style={[s.advanceBtnText, { color: colors.primaryForeground }]}>{sc.nextLabel}</Text>
                            </TouchableOpacity>
                          </LinearGradient>
                        )}
                      </View>
                    </View>
                  </FadeIn>
                );
              })
        )}

        {/* ── Listings tab ── */}
        {activeTab === 'listings' && (
          <>
            <FadeIn>
              <LinearGradient colors={[...colors.gradientGold]} style={s.addBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <TouchableOpacity style={s.addBtnInner} onPress={() => setShowModal(true)}>
                  <Plus size={16} color={colors.primaryForeground} />
                  <Text style={[s.addBtnText, { color: colors.primaryForeground }]}>Add New Product</Text>
                </TouchableOpacity>
              </LinearGradient>
            </FadeIn>

            {products.length === 0
              ? <EmptyState icon="🛍️" text="No products listed yet" colors={colors} />
              : products.map((p, i) => (
                  <FadeIn key={p.id} delay={i * 50}>
                    <View style={[s.productCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <View style={s.productInfo}>
                        <Text style={[s.productName, { color: colors.foreground }]} numberOfLines={1}>{p.name}</Text>
                        <Text style={[s.productMeta, { color: colors.mutedForeground }]}>{p.categoryName} · {p.unit}</Text>
                        <View style={s.priceRow}>
                          <Text style={[s.price, { color: colors.foreground }]}>₹{p.basePrice}</Text>
                          {p.mrp > p.basePrice && (
                            <Text style={[s.mrp, { color: colors.mutedForeground }]}>₹{p.mrp}</Text>
                          )}
                          <View style={[s.activeBadge, { backgroundColor: p.isActive ? '#4ADE8020' : colors.destructive + '20' }]}>
                            <Text style={[s.activeBadgeText, { color: p.isActive ? '#4ADE80' : colors.destructive }]}>
                              {p.isActive ? 'Active' : 'Inactive'}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <TouchableOpacity style={[s.editBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                        <Edit size={14} color={colors.mutedForeground} />
                      </TouchableOpacity>
                    </View>
                  </FadeIn>
                ))
            }
          </>
        )}

        {/* ── Profile tab ── */}
        {activeTab === 'profile' && (
          profile
            ? <FadeIn>
                <View style={[s.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[s.profileTitle, { color: colors.foreground }]}>{profile.businessName}</Text>
                  {profile.gstNumber && <Text style={[s.profileMeta, { color: colors.mutedForeground }]}>GST: {profile.gstNumber}</Text>}
                  <Text style={[s.profileMeta, { color: colors.mutedForeground }]}>{profile.phone}</Text>
                  <Text style={[s.profileMeta, { color: colors.mutedForeground }]}>{profile.email}</Text>
                  <Text style={[s.profileMeta, { color: colors.mutedForeground }]}>{profile.street}, {profile.city}, {profile.state} - {profile.pincode}</Text>
                  <View style={s.profileStats}>
                    <View style={s.profileStat}>
                      <Text style={[s.profileStatVal, { color: colors.primary }]}>{profile.averageRating.toFixed(1)}</Text>
                      <Text style={[s.profileStatLabel, { color: colors.mutedForeground }]}>Rating</Text>
                    </View>
                    <View style={s.profileStat}>
                      <Text style={[s.profileStatVal, { color: colors.primary }]}>{profile.totalReviews}</Text>
                      <Text style={[s.profileStatLabel, { color: colors.mutedForeground }]}>Reviews</Text>
                    </View>
                    <View style={s.profileStat}>
                      <Text style={[s.profileStatVal, { color: profile.isVerified ? '#4ADE80' : '#FB923C' }]}>
                        {profile.isVerified ? '✓' : '⏳'}
                      </Text>
                      <Text style={[s.profileStatLabel, { color: colors.mutedForeground }]}>Verified</Text>
                    </View>
                  </View>
                </View>
              </FadeIn>
            : <EmptyState icon="👤" text="Complete your seller profile to start selling" colors={colors}>
                <LinearGradient colors={[...colors.gradientGold]} style={{ borderRadius: 12, marginTop: 12 }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <TouchableOpacity style={{ paddingHorizontal: 24, paddingVertical: 10 }}>
                    <Text style={{ color: colors.primaryForeground, fontWeight: '700' }}>Set Up Profile</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </EmptyState>
        )}
      </ScrollView>

      {/* ── Add Product Modal ────────────────────────────────────────────── */}
      <Modal visible={showModal} animationType="slide" onRequestClose={() => setShowModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: colors.background }}>
          {/* Modal Header */}
          <View style={[s.modalHeader, { borderBottomColor: colors.border, paddingTop: Platform.OS === 'android' ? 40 : 16 }]}>
            <Text style={[s.modalTitle, { color: colors.foreground }]}>New Product Listing</Text>
            <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}>
              <X size={20} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={s.modalContent} keyboardShouldPersistTaps="handled">
            {/* Name */}
            <View style={s.fieldGroup}>
              <Text style={[s.fieldLabel, { color: colors.foreground }]}>Product Name <Text style={{ color: colors.destructive }}>*</Text></Text>
              <TextInput
                style={[s.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                placeholder="e.g. Wireless Earbuds Pro"
                placeholderTextColor={colors.mutedForeground}
                value={form.name}
                onChangeText={v => setForm(f => ({ ...f, name: v }))}
              />
            </View>

            {/* Description */}
            <View style={s.fieldGroup}>
              <Text style={[s.fieldLabel, { color: colors.foreground }]}>Description</Text>
              <TextInput
                style={[s.input, s.inputMultiline, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                placeholder="Brief product description..."
                placeholderTextColor={colors.mutedForeground}
                value={form.description}
                onChangeText={v => setForm(f => ({ ...f, description: v }))}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Price row */}
            <View style={s.fieldRow}>
              <View style={[s.fieldGroup, { flex: 1 }]}>
                <Text style={[s.fieldLabel, { color: colors.foreground }]}>Base Price (₹) <Text style={{ color: colors.destructive }}>*</Text></Text>
                <TextInput
                  style={[s.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                  placeholder="0"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="decimal-pad"
                  value={form.basePrice}
                  onChangeText={v => setForm(f => ({ ...f, basePrice: v }))}
                />
              </View>
              <View style={[s.fieldGroup, { flex: 1 }]}>
                <Text style={[s.fieldLabel, { color: colors.foreground }]}>MRP (₹)</Text>
                <TextInput
                  style={[s.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                  placeholder="0"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="decimal-pad"
                  value={form.mrp}
                  onChangeText={v => setForm(f => ({ ...f, mrp: v }))}
                />
              </View>
            </View>

            {/* Unit & Weight row */}
            <View style={s.fieldRow}>
              <View style={[s.fieldGroup, { flex: 1 }]}>
                <Text style={[s.fieldLabel, { color: colors.foreground }]}>Unit <Text style={{ color: colors.destructive }}>*</Text></Text>
                <TextInput
                  style={[s.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                  placeholder="piece, kg, litre…"
                  placeholderTextColor={colors.mutedForeground}
                  value={form.unit}
                  onChangeText={v => setForm(f => ({ ...f, unit: v }))}
                />
              </View>
              <View style={[s.fieldGroup, { flex: 1 }]}>
                <Text style={[s.fieldLabel, { color: colors.foreground }]}>Weight (kg) <Text style={{ color: colors.destructive }}>*</Text></Text>
                <TextInput
                  style={[s.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                  placeholder="0.5"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="decimal-pad"
                  value={form.weightKg}
                  onChangeText={v => setForm(f => ({ ...f, weightKg: v }))}
                />
              </View>
            </View>

            {/* Submit */}
            <LinearGradient colors={[...colors.gradientGold]} style={[s.addBtn, { marginTop: 8 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <TouchableOpacity style={s.addBtnInner} onPress={handleAddProduct} disabled={submitting}>
                {submitting
                  ? <ActivityIndicator color={colors.primaryForeground} />
                  : <>
                      <Plus size={16} color={colors.primaryForeground} />
                      <Text style={[s.addBtnText, { color: colors.primaryForeground }]}>List Product</Text>
                    </>
                }
              </TouchableOpacity>
            </LinearGradient>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

// ── Empty state helper ────────────────────────────────────────────────────────

const EmptyState = ({ icon, text, colors, children }: { icon: string; text: string; colors: any; children?: React.ReactNode }) => (
  <View style={{ alignItems: 'center', paddingVertical: 48, gap: 8 }}>
    <Text style={{ fontSize: 40 }}>{icon}</Text>
    <Text style={{ fontSize: 15, color: colors.mutedForeground }}>{text}</Text>
    {children}
  </View>
);

const makeStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '700' },
  headerTitle: { fontSize: 18, fontWeight: '700', fontStyle: 'italic' },
  headerSub: { fontSize: 12, marginTop: 1 },
  logoutBtn: { padding: 8 },
  tabBar: { flexDirection: 'row', marginHorizontal: 16, borderRadius: 16, padding: 4, borderWidth: 1, marginBottom: 8 },
  tabItem: { flex: 1 },
  tabActive: { borderRadius: 12, paddingVertical: 8, alignItems: 'center' },
  tabInactive: { paddingVertical: 8, alignItems: 'center' },
  tabTextActive: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  tabText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  content: { paddingHorizontal: 16, gap: 12, paddingBottom: 32 },
  // Orders
  orderCard: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 10 },
  orderTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  orderId: { fontSize: 14, fontWeight: '700' },
  orderBiz: { fontSize: 12, marginTop: 1 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  orderItemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  orderItemName: { fontSize: 13 },
  orderItemMeta: { fontSize: 12 },
  divider: { borderTopWidth: 1 },
  orderFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  orderTotal: { fontSize: 13, fontWeight: '700' },
  advanceBtn: { borderRadius: 10 },
  advanceBtnInner: { paddingHorizontal: 14, paddingVertical: 7 },
  advanceBtnText: { fontSize: 12, fontWeight: '700' },
  // Listings
  addBtn: { borderRadius: 14 },
  addBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13 },
  addBtnText: { fontSize: 14, fontWeight: '700' },
  productCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, borderWidth: 1 },
  productInfo: { flex: 1, gap: 3 },
  productName: { fontSize: 14, fontWeight: '600' },
  productMeta: { fontSize: 11 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  price: { fontSize: 14, fontWeight: '700' },
  mrp: { fontSize: 11, textDecorationLine: 'line-through' },
  activeBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  activeBadgeText: { fontSize: 10, fontWeight: '600' },
  editBtn: { width: 34, height: 34, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  // Modal
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 17, fontWeight: '700', fontStyle: 'italic' },
  modalContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40, gap: 16 },
  fieldGroup: { gap: 6 },
  fieldRow: { flexDirection: 'row', gap: 12 },
  fieldLabel: { fontSize: 13, fontWeight: '600' },
  input: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  inputMultiline: { paddingTop: 10, minHeight: 80 },
  // Profile
  profileCard: { borderRadius: 16, borderWidth: 1, padding: 20, gap: 8 },
  profileTitle: { fontSize: 18, fontWeight: '700' },
  profileMeta: { fontSize: 13 },
  profileStats: { flexDirection: 'row', gap: 16, marginTop: 8 },
  profileStat: { alignItems: 'center', gap: 2 },
  profileStatVal: { fontSize: 20, fontWeight: '700' },
  profileStatLabel: { fontSize: 11 },
});

export default SellerDashboardScreen;
