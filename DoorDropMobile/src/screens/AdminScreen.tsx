import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft, Package, ShoppingCart, TrendingUp, DollarSign, Plus, Eye, Edit, BarChart3,
  Clock, CheckCircle, AlertTriangle, Users, Star, ChevronRight, Boxes,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const stats = [
  { Icon: DollarSign, label: 'Revenue', value: '₹45,230', change: '+12%', positive: true },
  { Icon: ShoppingCart, label: 'Orders', value: '128', change: '+8%', positive: true },
  { Icon: Package, label: 'Products', value: '342', change: '+5', positive: true },
  { Icon: Users, label: 'Customers', value: '1.2K', change: '+15%', positive: true },
];

const recentOrders = [
  { id: '#DD-4521', customer: 'Priya M.', items: 3, total: 247, status: 'delivered', time: '2h ago' },
  { id: '#DD-4520', customer: 'Amit K.', items: 1, total: 1299, status: 'shipped', time: '4h ago' },
  { id: '#DD-4519', customer: 'Sneha R.', items: 5, total: 432, status: 'processing', time: '5h ago' },
  { id: '#DD-4518', customer: 'Vikram S.', items: 2, total: 165, status: 'pending', time: '6h ago' },
];

const topProducts = [
  { name: 'Amul Taza Milk', sold: 89, stock: 150, revenue: '₹2,403', img: '🥛' },
  { name: 'Wireless Earbuds Pro', sold: 24, stock: 12, revenue: '₹31,176', img: '🎧' },
  { name: 'Fresh Paneer', sold: 67, stock: 45, revenue: '₹5,360', img: '🧀' },
];

const productsList = [
  { name: 'Amul Taza Milk', price: 27, stock: 150, status: 'active', img: '🥛' },
  { name: 'Fresh Paneer', price: 80, stock: 45, status: 'active', img: '🧀' },
  { name: 'Brown Bread', price: 45, stock: 0, status: 'out', img: '🍞' },
  { name: 'Organic Eggs', price: 72, stock: 30, status: 'active', img: '🥚' },
  { name: 'Basmati Rice', price: 189, stock: 8, status: 'low', img: '🍚' },
  { name: 'Mustard Oil', price: 145, stock: 22, status: 'active', img: '🫒' },
];

type StatusKey = 'delivered' | 'shipped' | 'processing' | 'pending';
const statusConfig: Record<StatusKey, { Icon: React.ElementType; color: string; bgAlpha: string }> = {
  delivered: { Icon: CheckCircle, color: '#4ADE80', bgAlpha: '#4ADE8020' },
  shipped: { Icon: TrendingUp, color: '#60A5FA', bgAlpha: '#60A5FA20' },
  processing: { Icon: Clock, color: '#BF8A5E', bgAlpha: '#BF8A5E20' },
  pending: { Icon: AlertTriangle, color: '#FB923C', bgAlpha: '#FB923C20' },
};

// ── Animation helpers ─────────────────────────────────────────────────────────

const FadeInView = ({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: object }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 350, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 350, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>{children}</Animated.View>;
};

const ScaleInView = ({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: object }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 350, delay, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return <Animated.View style={[{ opacity, transform: [{ scale }] }, style]}>{children}</Animated.View>;
};

// ── Tab content components ────────────────────────────────────────────────────

const OverviewTab = () => {
  const { colors } = useTheme();
  const s = makeStyles(colors);

  return (
    <>
      {/* Stats Grid */}
      <View style={s.statsGrid}>
        {stats.map((stat, i) => (
          <ScaleInView key={stat.label} delay={i * 60} style={s.statCardWrap}>
            <View style={[s.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={s.statTop}>
                <View style={[s.statIcon, { backgroundColor: colors.primary + '1A' }]}>
                  <stat.Icon size={16} color={colors.primary} />
                </View>
                <Text style={[s.statChange, { color: colors.green }]}>{stat.change}</Text>
              </View>
              <Text style={[s.statValue, { color: colors.foreground }]}>{stat.value}</Text>
              <Text style={[s.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
            </View>
          </ScaleInView>
        ))}
      </View>

      {/* Quick Actions */}
      <View>
        <Text style={[s.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
        <View style={s.quickActions}>
          {[
            { Icon: Plus, label: 'Add Product' },
            { Icon: BarChart3, label: 'Analytics' },
            { Icon: Boxes, label: 'Inventory' },
          ].map((action, i) => (
            <FadeInView key={action.label} delay={300 + i * 60} style={s.quickActionWrap}>
              <TouchableOpacity style={[s.quickAction, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <action.Icon size={20} color={colors.primary} />
                <Text style={[s.quickActionLabel, { color: colors.mutedForeground }]}>{action.label}</Text>
              </TouchableOpacity>
            </FadeInView>
          ))}
        </View>
      </View>

      {/* Recent Orders */}
      <View>
        <View style={s.rowBetween}>
          <Text style={[s.sectionTitle, { color: colors.foreground }]}>Recent Orders</Text>
          <TouchableOpacity><Text style={[s.linkText, { color: colors.primary }]}>View All</Text></TouchableOpacity>
        </View>
        {recentOrders.slice(0, 3).map((order, i) => {
          const sc = statusConfig[order.status as StatusKey];
          return (
            <FadeInView key={order.id} delay={400 + i * 60}>
              <View style={[s.orderCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[s.orderIcon, { backgroundColor: sc.bgAlpha }]}>
                  <sc.Icon size={16} color={sc.color} />
                </View>
                <View style={s.orderInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={[s.orderId, { color: colors.foreground }]}>{order.id}</Text>
                    <Text style={[s.orderTime, { color: colors.mutedForeground }]}>{order.time}</Text>
                  </View>
                  <Text style={[s.orderMeta, { color: colors.mutedForeground }]}>{order.customer} · {order.items} items</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[s.orderTotal, { color: colors.foreground }]}>₹{order.total}</Text>
                  <Text style={[s.orderStatus, { color: sc.color }]}>{order.status}</Text>
                </View>
              </View>
            </FadeInView>
          );
        })}
      </View>

      {/* Top Products */}
      <View>
        <Text style={[s.sectionTitle, { color: colors.foreground }]}>Top Products</Text>
        {topProducts.map((p, i) => (
          <FadeInView key={p.name} delay={500 + i * 60}>
            <View style={[s.topProductCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[s.productImg, { backgroundColor: colors.surfaceElevated }]}>
                <Text style={{ fontSize: 22 }}>{p.img}</Text>
              </View>
              <View style={s.productInfo}>
                <Text style={[s.productName, { color: colors.foreground }]} numberOfLines={1}>{p.name}</Text>
                <Text style={[s.productMeta, { color: colors.mutedForeground }]}>{p.sold} sold · {p.stock} in stock</Text>
              </View>
              <Text style={[s.productRevenue, { color: colors.primary }]}>{p.revenue}</Text>
            </View>
          </FadeInView>
        ))}
      </View>
    </>
  );
};

const ProductsTab = () => {
  const { colors } = useTheme();
  const s = makeStyles(colors);

  return (
    <>
      <FadeInView>
        <LinearGradient colors={[...colors.gradientGold]} style={s.addBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <TouchableOpacity style={s.addBtnInner}>
            <Plus size={16} color={colors.primaryForeground} />
            <Text style={[s.addBtnText, { color: colors.primaryForeground }]}>Add New Product</Text>
          </TouchableOpacity>
        </LinearGradient>
      </FadeInView>

      {productsList.map((p, i) => (
        <FadeInView key={p.name} delay={i * 50}>
          <View style={[s.productRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[s.productImg, { backgroundColor: colors.surfaceElevated }]}>
              <Text style={{ fontSize: 22 }}>{p.img}</Text>
            </View>
            <View style={s.productInfo}>
              <Text style={[s.productName, { color: colors.foreground }]} numberOfLines={1}>{p.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
                <Text style={[s.productPrice, { color: colors.foreground }]}>₹{p.price}</Text>
                <View style={[
                  s.stockBadge,
                  {
                    backgroundColor: p.status === 'active' ? '#4ADE8015' : p.status === 'low' ? '#FB923C15' : colors.destructive + '15',
                  },
                ]}>
                  <Text style={[
                    s.stockText,
                    { color: p.status === 'active' ? '#4ADE80' : p.status === 'low' ? '#FB923C' : colors.destructive },
                  ]}>
                    {p.status === 'out' ? 'Out of stock' : p.status === 'low' ? `${p.stock} left` : `${p.stock} in stock`}
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
        </FadeInView>
      ))}
    </>
  );
};

const OrdersTab = () => {
  const { colors } = useTheme();
  const s = makeStyles(colors);

  return (
    <>
      {recentOrders.map((order, i) => {
        const sc = statusConfig[order.status as StatusKey];
        return (
          <FadeInView key={order.id} delay={i * 50}>
            <View style={[s.fullOrderCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={s.fullOrderTop}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={[s.orderId, { color: colors.foreground }]}>{order.id}</Text>
                  <View style={[s.statusBadge, { backgroundColor: sc.bgAlpha }]}>
                    <Text style={[s.statusText, { color: sc.color }]}>{order.status}</Text>
                  </View>
                </View>
                <Text style={[s.orderTime, { color: colors.mutedForeground }]}>{order.time}</Text>
              </View>
              <View style={s.fullOrderBottom}>
                <View>
                  <Text style={[s.orderCustomer, { color: colors.foreground }]}>{order.customer}</Text>
                  <Text style={[s.orderMeta, { color: colors.mutedForeground }]}>{order.items} items</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[s.orderTotalLg, { color: colors.foreground }]}>₹{order.total}</Text>
                  <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[s.detailsText, { color: colors.primary }]}>Details</Text>
                    <ChevronRight size={12} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </FadeInView>
        );
      })}
    </>
  );
};

// ── AdminScreen ───────────────────────────────────────────────────────────────

const AdminScreen = () => {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const s = makeStyles(colors);
  const [activeTab, setActiveTab] = React.useState<'overview' | 'products' | 'orders'>('overview');

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[s.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ArrowLeft size={16} color={colors.foreground} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[s.title, { color: colors.foreground }]}>Seller Dashboard</Text>
            <Text style={[s.storeName, { color: colors.mutedForeground }]}>Sharma General Store</Text>
          </View>
          <LinearGradient colors={[...colors.gradientGold]} style={s.sellerAvatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={[s.sellerAvatarText, { color: colors.primaryForeground }]}>S</Text>
          </LinearGradient>
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'products' && <ProductsTab />}
        {activeTab === 'orders' && <OrdersTab />}
      </ScrollView>
    </SafeAreaView>
  );
};

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 16, paddingBottom: 12 },
    headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    backBtn: { width: 36, height: 36, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 20, fontWeight: '700', fontStyle: 'italic' },
    storeName: { fontSize: 12, marginTop: 1 },
    sellerAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
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
    statCardWrap: { width: '48%' },
    statCard: { padding: 14, borderRadius: 16, borderWidth: 1 },
    statTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    statIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    statChange: { fontSize: 10, fontWeight: '700' },
    statValue: { fontSize: 18, fontWeight: '700' },
    statLabel: { fontSize: 11, marginTop: 2 },
    sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
    rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    linkText: { fontSize: 12, fontWeight: '600' },
    quickActions: { flexDirection: 'row', gap: 8 },
    quickActionWrap: { flex: 1 },
    quickAction: { alignItems: 'center', paddingVertical: 12, borderRadius: 16, borderWidth: 1, gap: 4 },
    quickActionLabel: { fontSize: 11, fontWeight: '500' },
    orderCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16, borderWidth: 1, marginBottom: 8 },
    orderIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    orderInfo: { flex: 1 },
    orderId: { fontSize: 13, fontWeight: '700' },
    orderTime: { fontSize: 10 },
    orderMeta: { fontSize: 11, marginTop: 2 },
    orderTotal: { fontSize: 14, fontWeight: '700' },
    orderStatus: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize', marginTop: 2 },
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
    fullOrderCard: { padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 8 },
    fullOrderTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    fullOrderBottom: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
    statusBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
    statusText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
    orderCustomer: { fontSize: 14 },
    orderTotalLg: { fontSize: 16, fontWeight: '700' },
    detailsText: { fontSize: 11, fontWeight: '600' },
    green: { color: '#4ADE80' },
  });

export default AdminScreen;
