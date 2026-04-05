import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Package, ShoppingCart, TrendingUp, DollarSign, Plus, Eye, Edit, BarChart3,
  Clock, CheckCircle, AlertTriangle, ChevronRight, Boxes, X, Truck,
} from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import apiClient from '../api/apiClient';
import {
  NearbyStoreResponse,
  StoreInventoryResponse,
  CreateProductWithInventoryRequest,
  StoreOrderGroupResponse,
  UpdateStoreOrderStatusRequest,
  StoreOrderStatus,
} from '../api/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type StoreStatusKey = StoreOrderStatus;
const storeStatusConfig: Record<StoreStatusKey, { Icon: React.ElementType; color: string; bgAlpha: string; next?: StoreOrderStatus; nextLabel?: string }> = {
  PENDING:          { Icon: AlertTriangle, color: '#FB923C', bgAlpha: '#FB923C20', next: 'CONFIRMED',        nextLabel: 'Confirm' },
  CONFIRMED:        { Icon: CheckCircle,   color: '#4ADE80', bgAlpha: '#4ADE8020', next: 'PREPARING',        nextLabel: 'Start Preparing' },
  PREPARING:        { Icon: Clock,         color: '#60A5FA', bgAlpha: '#60A5FA20', next: 'READY_FOR_PICKUP', nextLabel: 'Ready for Pickup' },
  READY_FOR_PICKUP: { Icon: Boxes,         color: '#A78BFA', bgAlpha: '#A78BFA20', next: 'PICKED_UP',        nextLabel: 'Picked Up' },
  PICKED_UP:        { Icon: Truck,         color: '#4ADE80', bgAlpha: '#4ADE8020' },
};

// ── Tab content ───────────────────────────────────────────────────────────────

const OverviewTab = ({
  onAddProduct,
  inventory,
  orders,
}: {
  onAddProduct: () => void;
  inventory: StoreInventoryResponse[];
  orders: StoreOrderGroupResponse[];
}) => {
  const { colors } = useTheme();
  const s = makeStyles(colors);

  const revenue = orders
    .filter(o => o.status === 'PICKED_UP')
    .reduce((sum, o) => sum + o.subtotal, 0);

  const statsData = [
    { Icon: DollarSign, label: 'Revenue', value: `₹${revenue.toLocaleString('en-IN')}` },
    { Icon: ShoppingCart, label: 'Orders', value: String(orders.length) },
    { Icon: Package, label: 'Products', value: String(inventory.length) },
    { Icon: Boxes, label: 'Available', value: String(inventory.filter(i => i.isAvailable).length) },
  ];

  const pending = orders.filter(o => o.status === 'PENDING').length;
  const preparing = orders.filter(o => o.status === 'PREPARING').length;
  const lowStock = inventory.filter(i => i.stockQty > 0 && i.stockQty <= 5).length;

  return (
    <>
      {/* Stats Grid */}
      <View style={s.statsGrid}>
        {statsData.map((stat) => (
          <View key={stat.label} style={[s.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[s.statIcon, { backgroundColor: colors.primary + '1A' }]}>
              <stat.Icon size={16} color={colors.primary} />
            </View>
            <Text style={[s.statValue, { color: colors.foreground }]}>{stat.value}</Text>
            <Text style={[s.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Alert badges */}
      {(pending > 0 || lowStock > 0) && (
        <View style={s.alertsRow}>
          {pending > 0 && (
            <View style={[s.alertBadge, { backgroundColor: '#FB923C20' }]}>
              <AlertTriangle size={12} color="#FB923C" />
              <Text style={[s.alertText, { color: '#FB923C' }]}>{pending} pending order{pending > 1 ? 's' : ''}</Text>
            </View>
          )}
          {preparing > 0 && (
            <View style={[s.alertBadge, { backgroundColor: '#60A5FA20' }]}>
              <Clock size={12} color="#60A5FA" />
              <Text style={[s.alertText, { color: '#60A5FA' }]}>{preparing} preparing</Text>
            </View>
          )}
          {lowStock > 0 && (
            <View style={[s.alertBadge, { backgroundColor: colors.destructive + '20' }]}>
              <Package size={12} color={colors.destructive} />
              <Text style={[s.alertText, { color: colors.destructive }]}>{lowStock} low stock</Text>
            </View>
          )}
        </View>
      )}

      {/* Quick Actions */}
      <View>
        <Text style={[s.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
        <View style={s.quickActions}>
          {[
            { Icon: Plus, label: 'Add Product', onPress: onAddProduct },
            { Icon: BarChart3, label: 'Analytics', onPress: () => {} },
            { Icon: Boxes, label: 'Inventory', onPress: () => {} },
          ].map((action) => (
            <TouchableOpacity key={action.label} onPress={action.onPress} style={[s.quickAction, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <action.Icon size={20} color={colors.primary} />
              <Text style={[s.quickActionLabel, { color: colors.mutedForeground }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Orders */}
      <View>
        <Text style={[s.sectionTitle, { color: colors.foreground }]}>Recent Orders</Text>
        {orders.length === 0
          ? <EmptyState icon="📋" text="No orders yet" colors={colors} />
          : orders.slice(0, 3).map((order) => {
              const sc = storeStatusConfig[order.status] ?? storeStatusConfig.PENDING;
              return (
                <View key={order.id} style={[s.orderCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={[s.orderIcon, { backgroundColor: sc.bgAlpha }]}>
                    <sc.Icon size={16} color={sc.color} />
                  </View>
                  <View style={s.orderInfo}>
                    <Text style={[s.orderId, { color: colors.foreground }]}>Order #{order.id}</Text>
                    <Text style={[s.orderMeta, { color: colors.mutedForeground }]}>{order.items.length} item{order.items.length > 1 ? 's' : ''}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[s.orderTotal, { color: colors.foreground }]}>₹{order.subtotal}</Text>
                    <Text style={[s.orderStatus, { color: sc.color }]}>{order.status.replace(/_/g, ' ')}</Text>
                  </View>
                </View>
              );
            })
        }
      </View>

      {/* Top Products from inventory */}
      {inventory.length > 0 && (
        <View>
          <Text style={[s.sectionTitle, { color: colors.foreground }]}>Inventory Snapshot</Text>
          {inventory.slice(0, 3).map((p) => (
            <View key={p.id} style={[s.topProductCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[s.productImg, { backgroundColor: colors.surfaceElevated }]}>
                <Package size={20} color={colors.mutedForeground} />
              </View>
              <View style={s.productInfo}>
                <Text style={[s.productName, { color: colors.foreground }]} numberOfLines={1}>{p.productName}</Text>
                <Text style={[s.productMeta, { color: colors.mutedForeground }]}>{p.stockQty} in stock · {p.unit}</Text>
              </View>
              <Text style={[s.productRevenue, { color: colors.primary }]}>₹{p.price}</Text>
            </View>
          ))}
        </View>
      )}
    </>
  );
};

const ProductsTab = ({
  onAddProduct,
  inventory,
  loading,
}: {
  onAddProduct: () => void;
  inventory: StoreInventoryResponse[];
  loading: boolean;
}) => {
  const { colors } = useTheme();
  const s = makeStyles(colors);

  return (
    <>
      <LinearGradient colors={[...colors.gradientGold]} style={s.addBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <TouchableOpacity style={s.addBtnInner} onPress={onAddProduct}>
          <Plus size={16} color={colors.primaryForeground} />
          <Text style={[s.addBtnText, { color: colors.primaryForeground }]}>Add New Product</Text>
        </TouchableOpacity>
      </LinearGradient>

      {loading
        ? <ActivityIndicator style={{ marginTop: 24 }} color={colors.primary} />
        : inventory.length === 0
          ? <EmptyState icon="📦" text="No products yet. Add your first product!" colors={colors} />
          : inventory.map((p) => (
              <View key={p.id} style={[s.productRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[s.productImg, { backgroundColor: colors.surfaceElevated }]}>
                  <Package size={18} color={colors.mutedForeground} />
                </View>
                <View style={s.productInfo}>
                  <Text style={[s.productName, { color: colors.foreground }]} numberOfLines={1}>{p.productName}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
                    <Text style={[s.productPrice, { color: colors.foreground }]}>₹{p.price}</Text>
                    <View style={[
                      s.stockBadge,
                      {
                        backgroundColor: p.stockQty === 0
                          ? colors.destructive + '15'
                          : p.stockQty <= 5 ? '#FB923C15' : '#4ADE8015',
                      },
                    ]}>
                      <Text style={[
                        s.stockText,
                        { color: p.stockQty === 0 ? colors.destructive : p.stockQty <= 5 ? '#FB923C' : '#4ADE80' },
                      ]}>
                        {p.stockQty === 0 ? 'Out of stock' : p.stockQty <= 5 ? `${p.stockQty} left` : `${p.stockQty} in stock`}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={s.productActions}>
                  <TouchableOpacity style={[s.actionBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                    <Eye size={14} color={colors.mutedForeground} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.actionBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                    <Edit size={14} color={colors.mutedForeground} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
      }
    </>
  );
};

const OrdersTab = ({
  orders,
  loading,
  onAdvanceStatus,
}: {
  orders: StoreOrderGroupResponse[];
  loading: boolean;
  onAdvanceStatus: (groupId: number, nextStatus: StoreOrderStatus) => void;
}) => {
  const { colors } = useTheme();
  const s = makeStyles(colors);

  if (loading) return <ActivityIndicator style={{ marginTop: 24 }} color={colors.primary} />;
  if (orders.length === 0) return <EmptyState icon="🛒" text="No orders yet" colors={colors} />;

  return (
    <>
      {orders.map((order) => {
        const sc = storeStatusConfig[order.status] ?? storeStatusConfig.PENDING;
        return (
          <View key={order.id} style={[s.fullOrderCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={s.fullOrderTop}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[s.orderId, { color: colors.foreground }]}>Order #{order.id}</Text>
                <View style={[s.statusBadge, { backgroundColor: sc.bgAlpha }]}>
                  <Text style={[s.statusText, { color: sc.color }]}>{order.status.replace(/_/g, ' ')}</Text>
                </View>
              </View>
            </View>
            {/* Items */}
            {order.items.map(item => (
              <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 }}>
                <Text style={[{ fontSize: 12 }, { color: colors.foreground }]}>{item.productName}</Text>
                <Text style={[{ fontSize: 12 }, { color: colors.mutedForeground }]}>x{item.quantity}  ₹{item.totalPrice}</Text>
              </View>
            ))}
            <View style={[{ borderTopWidth: 1, marginTop: 6, paddingTop: 8 }, { borderTopColor: colors.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={[s.orderTotalLg, { color: colors.foreground }]}>₹{order.subtotal}</Text>
                {sc.next && (
                  <LinearGradient colors={[...colors.gradientGold]} style={{ borderRadius: 10 }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <TouchableOpacity
                      style={{ paddingHorizontal: 14, paddingVertical: 7 }}
                      onPress={() => onAdvanceStatus(order.id, sc.next!)}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primaryForeground }}>{sc.nextLabel}</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                )}
              </View>
            </View>
          </View>
        );
      })}
    </>
  );
};

// ── Empty state helper ────────────────────────────────────────────────────────

const EmptyState = ({ icon, text, colors }: { icon: string; text: string; colors: any }) => (
  <View style={{ alignItems: 'center', paddingVertical: 48, gap: 8 }}>
    <Text style={{ fontSize: 40 }}>{icon}</Text>
    <Text style={{ fontSize: 15, color: colors.mutedForeground }}>{text}</Text>
  </View>
);

// ── AdminScreen ───────────────────────────────────────────────────────────────

const AdminScreen = () => {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const { user } = useAuth();
  const s = makeStyles(colors);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders'>('overview');

  // ── Store info ─────────────────────────────────────────────────────────────
  const [myStore, setMyStore] = useState<NearbyStoreResponse | null>(null);
  const [inventory, setInventory] = useState<StoreInventoryResponse[]>([]);
  const [storeOrders, setStoreOrders] = useState<StoreOrderGroupResponse[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStoreData = async (store: NearbyStoreResponse) => {
    try {
      setDataLoading(true);
      const [invRes, ordersRes] = await Promise.all([
        apiClient.get<StoreInventoryResponse[]>(`/api/stores/${store.id}/inventory`),
        apiClient.get<StoreOrderGroupResponse[]>(`/api/stores/${store.id}/orders`),
      ]);
      setInventory(invRes.data);
      setStoreOrders(ordersRes.data);
    } catch {
      // Fail silently — tabs show empty states
    } finally {
      setDataLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      apiClient.get<NearbyStoreResponse>('/api/stores/my')
        .then(r => {
          if (!r.data.isApproved) {
            navigation.replace('PendingApproval');
            return;
          }
          setMyStore(r.data);
          fetchStoreData(r.data);
        })
        .catch(err => {
          const status = err?.response?.status;
          // 404 = no store yet; 409 = legacy RuntimeException fallback
          if (status === 404 || status === 409) {
            navigation.replace('ShopSetup');
          }
        });
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    if (myStore) fetchStoreData(myStore);
  };

  const advanceOrderStatus = async (groupId: number, nextStatus: StoreOrderStatus) => {
    try {
      const payload: UpdateStoreOrderStatusRequest = { status: nextStatus };
      await apiClient.patch(`/api/stores/orders/${groupId}/status`, payload);
      setStoreOrders(prev => prev.map(o => o.id === groupId ? { ...o, status: nextStatus } : o));
    } catch {
      Alert.alert('Error', 'Could not update order status.');
    }
  };

  // ── Add Product modal ──────────────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', price: '', mrp: '', unit: '', quantity: '', weightKg: '',
  });

  const resetForm = () => setForm({ name: '', description: '', price: '', mrp: '', unit: '', quantity: '', weightKg: '' });

  const openModal = () => {
    if (!myStore) {
      Alert.alert('Store not found', 'Your store profile is not set up yet. Please contact support.');
      return;
    }
    setShowModal(true);
  };

  const handleAddProduct = async () => {
    if (!form.name.trim()) { Alert.alert('Validation', 'Product name is required.'); return; }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) {
      Alert.alert('Validation', 'Enter a valid selling price.'); return;
    }
    if (!form.unit.trim()) { Alert.alert('Validation', 'Unit is required (e.g. piece, kg, litre).'); return; }
    if (!form.quantity || isNaN(Number(form.quantity)) || Number(form.quantity) < 0) {
      Alert.alert('Validation', 'Enter a valid stock quantity.'); return;
    }

    const payload: CreateProductWithInventoryRequest = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      unit: form.unit.trim(),
      price: Number(form.price),
      mrp: form.mrp ? Number(form.mrp) : undefined,
      quantity: Math.floor(Number(form.quantity)),
      weightKg: form.weightKg ? Number(form.weightKg) : undefined,
    };

    try {
      setSubmitting(true);
      const { data } = await apiClient.post<StoreInventoryResponse>(
        `/api/stores/${myStore!.id}/inventory/with-product`,
        payload
      );
      setInventory(prev => [data, ...prev]);
      setShowModal(false);
      resetForm();
      Alert.alert('Success', `"${payload.name}" has been added to your inventory.`);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Could not add product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'S';

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={[s.title, { color: colors.foreground }]}>Store Dashboard</Text>
            <Text style={[s.storeName, { color: colors.mutedForeground }]}>{myStore?.name ?? 'Loading...'}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Account')}>
            <LinearGradient colors={[...colors.gradientGold]} style={s.sellerAvatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={[s.sellerAvatarText, { color: colors.primaryForeground }]}>{initials}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={[s.tabWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {(['overview', 'products', 'orders'] as const).map((tab) => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={s.tabBtn}>
              {activeTab === tab ? (
                <LinearGradient colors={[...colors.gradientGold]} style={s.tabActive} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={[s.tabTextActive, { color: colors.primaryForeground }]}>{tab}</Text>
                </LinearGradient>
              ) : (
                <View style={s.tabInactive}>
                  <Text style={[s.tabText, { color: colors.mutedForeground }]}>{tab}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {activeTab === 'overview' && (
          <OverviewTab
            onAddProduct={openModal}
            inventory={inventory}
            orders={storeOrders}
          />
        )}
        {activeTab === 'products' && (
          <ProductsTab
            onAddProduct={openModal}
            inventory={inventory}
            loading={dataLoading}
          />
        )}
        {activeTab === 'orders' && (
          <OrdersTab
            orders={storeOrders}
            loading={dataLoading}
            onAdvanceStatus={advanceOrderStatus}
          />
        )}
      </ScrollView>

      {/* ── Add Product Modal ──────────────────────────────────────────────── */}
      <Modal visible={showModal} animationType="slide" onRequestClose={() => setShowModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={[s.modalHeader, { borderBottomColor: colors.border, paddingTop: Platform.OS === 'android' ? 40 : 16 }]}>
            <Text style={[s.modalTitle, { color: colors.foreground }]}>Add Product to Store</Text>
            <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}>
              <X size={20} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={s.modalContent} keyboardShouldPersistTaps="handled">
            <View style={s.fieldGroup}>
              <Text style={[s.fieldLabel, { color: colors.foreground }]}>Product Name <Text style={{ color: colors.destructive }}>*</Text></Text>
              <TextInput
                style={[s.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                placeholder="e.g. Amul Taza Milk"
                placeholderTextColor={colors.mutedForeground}
                value={form.name}
                onChangeText={v => setForm(f => ({ ...f, name: v }))}
              />
            </View>

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

            <View style={s.fieldRow}>
              <View style={[s.fieldGroup, { flex: 1 }]}>
                <Text style={[s.fieldLabel, { color: colors.foreground }]}>Selling Price (₹) <Text style={{ color: colors.destructive }}>*</Text></Text>
                <TextInput
                  style={[s.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                  placeholder="0"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="decimal-pad"
                  value={form.price}
                  onChangeText={v => setForm(f => ({ ...f, price: v }))}
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
                <Text style={[s.fieldLabel, { color: colors.foreground }]}>Stock Qty <Text style={{ color: colors.destructive }}>*</Text></Text>
                <TextInput
                  style={[s.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                  placeholder="0"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="number-pad"
                  value={form.quantity}
                  onChangeText={v => setForm(f => ({ ...f, quantity: v }))}
                />
              </View>
            </View>

            <View style={s.fieldGroup}>
              <Text style={[s.fieldLabel, { color: colors.foreground }]}>Weight (kg) — for shipping</Text>
              <TextInput
                style={[s.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                placeholder="e.g. 0.5"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="decimal-pad"
                value={form.weightKg}
                onChangeText={v => setForm(f => ({ ...f, weightKg: v }))}
              />
            </View>

            <LinearGradient colors={[...colors.gradientGold]} style={[s.addBtn, { marginTop: 8 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <TouchableOpacity style={s.addBtnInner} onPress={handleAddProduct} disabled={submitting}>
                {submitting
                  ? <ActivityIndicator color={colors.primaryForeground} />
                  : <>
                      <Plus size={16} color={colors.primaryForeground} />
                      <Text style={[s.addBtnText, { color: colors.primaryForeground }]}>Add to Inventory</Text>
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

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 16, paddingBottom: 12 },
    headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    title: { fontSize: 20, fontWeight: '700', fontStyle: 'italic' },
    storeName: { fontSize: 12, marginTop: 1 },
    sellerAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    sellerAvatarText: { fontSize: 14, fontWeight: '700' },
    tabWrapper: { flexDirection: 'row', borderRadius: 16, padding: 4, borderWidth: 1 },
    tabBtn: { flex: 1 },
    tabActive: { paddingVertical: 8, borderRadius: 12, alignItems: 'center' },
    tabInactive: { paddingVertical: 8, borderRadius: 12, alignItems: 'center' },
    tabTextActive: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
    tabText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
    scrollContent: { paddingHorizontal: 16, gap: 16, paddingBottom: 32 },
    // Overview
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    statCard: { width: '48%', padding: 14, borderRadius: 16, borderWidth: 1, gap: 4 },
    statIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    statValue: { fontSize: 18, fontWeight: '700' },
    statLabel: { fontSize: 11, marginTop: 2 },
    alertsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    alertBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
    alertText: { fontSize: 11, fontWeight: '600' },
    sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
    rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    quickActions: { flexDirection: 'row', gap: 8 },
    quickAction: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 16, borderWidth: 1, gap: 4 },
    quickActionLabel: { fontSize: 11, fontWeight: '500' },
    orderCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16, borderWidth: 1, marginBottom: 8 },
    orderIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    orderInfo: { flex: 1 },
    orderId: { fontSize: 13, fontWeight: '700' },
    orderMeta: { fontSize: 11, marginTop: 2 },
    orderTotal: { fontSize: 14, fontWeight: '700' },
    orderStatus: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', marginTop: 2 },
    topProductCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16, borderWidth: 1, marginBottom: 8 },
    productImg: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    productInfo: { flex: 1 },
    productName: { fontSize: 13, fontWeight: '600' },
    productMeta: { fontSize: 11, marginTop: 2 },
    productRevenue: { fontSize: 14, fontWeight: '700' },
    // Products tab
    addBtn: { borderRadius: 16 },
    addBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
    addBtnText: { fontSize: 14, fontWeight: '600' },
    productRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16, borderWidth: 1, marginBottom: 8 },
    productPrice: { fontSize: 14, fontWeight: '700' },
    stockBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
    stockText: { fontSize: 10, fontWeight: '600' },
    productActions: { flexDirection: 'row', gap: 6 },
    actionBtn: { width: 32, height: 32, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    // Orders tab
    fullOrderCard: { padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 8, gap: 6 },
    fullOrderTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
    statusBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
    statusText: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
    orderTotalLg: { fontSize: 16, fontWeight: '700' },
    // Modal
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
    modalTitle: { fontSize: 17, fontWeight: '700', fontStyle: 'italic' },
    modalContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40, gap: 16 },
    fieldGroup: { gap: 6 },
    fieldRow: { flexDirection: 'row', gap: 12 },
    fieldLabel: { fontSize: 13, fontWeight: '600' },
    input: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
    inputMultiline: { paddingTop: 10, minHeight: 80 },
  });

export default AdminScreen;
