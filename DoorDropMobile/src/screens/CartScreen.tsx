import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft, Minus, Plus, Trash2, ShoppingBag, Clock, Truck, Percent,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const initialCartItems = [
  { id: 1, name: 'Amul Taza Milk', weight: '500ml', price: 27, qty: 2, img: '🥛', type: 'now', deliveryTime: '8 min' },
  { id: 2, name: 'Fresh Paneer', weight: '200g', price: 80, qty: 1, img: '🧀', type: 'now', deliveryTime: '10 min' },
  { id: 3, name: 'Wireless Earbuds Pro', weight: 'SoundWave', price: 1299, qty: 1, img: '🎧', type: 'shop', deliveryTime: '2 days' },
  { id: 4, name: 'Brown Bread', weight: '400g', price: 45, qty: 1, img: '🍞', type: 'now', deliveryTime: '8 min' },
];

type CartItem = typeof initialCartItems[0];

// ── FadeIn ─────────────────────────────────────────────────────────────────────

const FadeInView = ({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: object }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 350, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 350, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
};

// ── CartItemRow ────────────────────────────────────────────────────────────────

const CartItemRow = ({ item, index, onUpdate }: { item: CartItem; index: number; onUpdate: (id: number, d: number) => void }) => {
  const { colors } = useTheme();
  const s = makeStyles(colors);
  return (
    <FadeInView delay={index * 60}>
      <View style={[s.itemCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
        <View style={[s.itemImg, { backgroundColor: colors.surface }]}>
          <Text style={{ fontSize: 28 }}>{item.img}</Text>
        </View>
        <View style={s.itemInfo}>
          <Text style={[s.itemName, { color: colors.foreground }]} numberOfLines={1}>{item.name}</Text>
          <Text style={[s.itemWeight, { color: colors.mutedForeground }]}>{item.weight}</Text>
          <Text style={[s.itemPrice, { color: colors.foreground }]}>₹{item.price * item.qty}</Text>
        </View>
        <View style={s.qtyRow}>
          <TouchableOpacity onPress={() => onUpdate(item.id, -1)} style={[s.qtyBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {item.qty === 1
              ? <Trash2 size={12} color={colors.destructive} />
              : <Minus size={12} color={colors.foreground} />}
          </TouchableOpacity>
          <Text style={[s.qtyText, { color: colors.foreground }]}>{item.qty}</Text>
          <LinearGradient colors={[...colors.gradientGold]} style={s.qtyBtnAdd} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <TouchableOpacity onPress={() => onUpdate(item.id, 1)} style={s.qtyBtnInner}>
              <Plus size={12} color={colors.primaryForeground} />
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </FadeInView>
  );
};

// ── CartScreen ─────────────────────────────────────────────────────────────────

const CartScreen = () => {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const s = makeStyles(colors);
  const [items, setItems] = React.useState(initialCartItems);

  const updateQty = (id: number, delta: number) => {
    setItems((prev) =>
      prev.map((it) => it.id === id ? { ...it, qty: Math.max(0, it.qty + delta) } : it)
        .filter((it) => it.qty > 0)
    );
  };

  const nowItems = items.filter((i) => i.type === 'now');
  const shopItems = items.filter((i) => i.type === 'shop');
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryFee = nowItems.length > 0 ? 25 : 0;
  const discount = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee - discount;

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[s.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ArrowLeft size={16} color={colors.foreground} />
        </TouchableOpacity>
        <View>
          <Text style={[s.title, { color: colors.foreground }]}>My Cart</Text>
          <Text style={[s.subtitle, { color: colors.mutedForeground }]}>{items.length} items</Text>
        </View>
      </View>

      {items.length === 0 ? (
        <View style={s.emptyState}>
          <ShoppingBag size={64} color={colors.mutedForeground + '50'} />
          <Text style={[s.emptyTitle, { color: colors.foreground }]}>Cart is empty</Text>
          <Text style={[s.emptySub, { color: colors.mutedForeground }]}>Add items to get started</Text>
          <LinearGradient colors={[...colors.gradientGold]} style={s.shopBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <TouchableOpacity onPress={() => navigation.navigate('Home')}>
              <Text style={[s.shopBtnText, { color: colors.primaryForeground }]}>Start Shopping</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
          {/* DoorDrop Now Items */}
          {nowItems.length > 0 && (
            <View style={s.sectionBlock}>
              <View style={s.sectionHeader}>
                <Clock size={16} color={colors.primary} />
                <Text style={[s.sectionLabel, { color: colors.foreground }]}>DoorDrop Now</Text>
                <LinearGradient colors={[...colors.gradientGold]} style={s.badge} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={[s.badgeText, { color: colors.primaryForeground }]}>10 min delivery</Text>
                </LinearGradient>
              </View>
              {nowItems.map((item, i) => (
                <CartItemRow key={item.id} item={item} index={i} onUpdate={updateQty} />
              ))}
            </View>
          )}

          {/* DoorDrop Items */}
          {shopItems.length > 0 && (
            <View style={s.sectionBlock}>
              <View style={s.sectionHeader}>
                <Truck size={16} color={colors.primary} />
                <Text style={[s.sectionLabel, { color: colors.foreground }]}>DoorDrop</Text>
                <View style={[s.badgePlain, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[s.badgePlainText, { color: colors.mutedForeground }]}>Distance delivery</Text>
                </View>
              </View>
              {shopItems.map((item, i) => (
                <CartItemRow key={item.id} item={item} index={i} onUpdate={updateQty} />
              ))}
            </View>
          )}

          {/* Coupon */}
          <View style={[s.couponRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Percent size={20} color={colors.primary} />
            <TextInput
              placeholder="Enter coupon code"
              placeholderTextColor={colors.mutedForeground}
              style={[s.couponInput, { color: colors.foreground }]}
            />
            <TouchableOpacity>
              <Text style={[s.applyText, { color: colors.primary }]}>Apply</Text>
            </TouchableOpacity>
          </View>

          {/* Price Breakdown */}
          <View style={[s.priceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[s.priceCardTitle, { color: colors.foreground }]}>Price Details</Text>
            <View style={s.priceRow}>
              <Text style={[s.priceLabel, { color: colors.mutedForeground }]}>Subtotal</Text>
              <Text style={[s.priceValue, { color: colors.foreground }]}>₹{subtotal}</Text>
            </View>
            <View style={s.priceRow}>
              <Text style={[s.priceLabel, { color: colors.mutedForeground }]}>Delivery Fee</Text>
              <Text style={[s.priceValue, { color: colors.foreground }]}>₹{deliveryFee}</Text>
            </View>
            <View style={s.priceRow}>
              <Text style={[s.priceLabel, { color: colors.mutedForeground }]}>Discount (5%)</Text>
              <Text style={[s.priceValue, { color: '#4ADE80' }]}>-₹{discount}</Text>
            </View>
            <View style={[s.divider, { borderTopColor: colors.border }]} />
            <View style={s.priceRow}>
              <Text style={[s.totalLabel, { color: colors.foreground }]}>Total</Text>
              <Text style={[s.totalValue, { color: colors.primary }]}>₹{total}</Text>
            </View>
          </View>

          {/* Checkout */}
          <LinearGradient colors={[...colors.gradientGold]} style={s.checkoutBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <TouchableOpacity style={s.checkoutInner}>
              <Text style={[s.checkoutText, { color: colors.primaryForeground }]}>
                Proceed to Checkout — ₹{total}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 16 },
    backBtn: { width: 36, height: 36, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 20, fontWeight: '700', fontStyle: 'italic' },
    subtitle: { fontSize: 12 },
    scrollContent: { paddingHorizontal: 16, gap: 16, paddingBottom: 32 },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    emptyTitle: { fontSize: 18, fontWeight: '700', fontStyle: 'italic' },
    emptySub: { fontSize: 14 },
    shopBtn: { borderRadius: 12, marginTop: 8 },
    shopBtnText: { paddingHorizontal: 24, paddingVertical: 10, fontSize: 14, fontWeight: '600' },
    sectionBlock: { gap: 8 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    sectionLabel: { fontSize: 14, fontWeight: '600' },
    badge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
    badgeText: { fontSize: 10, fontWeight: '600' },
    badgePlain: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2 },
    badgePlainText: { fontSize: 10, fontWeight: '500' },
    itemCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16, borderWidth: 1, marginBottom: 8 },
    itemImg: { width: 56, height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 13, fontWeight: '600' },
    itemWeight: { fontSize: 11, marginTop: 1 },
    itemPrice: { fontSize: 13, fontWeight: '700', marginTop: 2 },
    qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    qtyBtn: { width: 28, height: 28, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    qtyBtnAdd: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    qtyBtnInner: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
    qtyText: { width: 24, textAlign: 'center', fontSize: 14, fontWeight: '600' },
    couponRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16, borderWidth: 1 },
    couponInput: { flex: 1, fontSize: 13, padding: 0 },
    applyText: { fontSize: 13, fontWeight: '600' },
    priceCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 10 },
    priceCardTitle: { fontSize: 14, fontWeight: '600' },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between' },
    priceLabel: { fontSize: 13 },
    priceValue: { fontSize: 13 },
    divider: { borderTopWidth: 1, marginVertical: 4 },
    totalLabel: { fontSize: 14, fontWeight: '700' },
    totalValue: { fontSize: 18, fontWeight: '700' },
    checkoutBtn: { borderRadius: 16 },
    checkoutInner: { paddingVertical: 14, alignItems: 'center' },
    checkoutText: { fontSize: 16, fontWeight: '600' },
  });

export default CartScreen;
