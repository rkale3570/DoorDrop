import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, Truck } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useCart } from '../context/CartContext';
import { CartItemResponse } from '../api/types';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// ── Cart Item Row ──────────────────────────────────────────────────────────────

const CartItemRow = ({ item, onUpdate, onRemove }: {
  item: CartItemResponse;
  onUpdate: (id: number, qty: number) => void;
  onRemove: (id: number) => void;
}) => {
  const { colors } = useTheme();
  const s = makeStyles(colors);

  const handleDecrement = () => {
    if (item.quantity === 1) {
      Alert.alert('Remove item', `Remove ${item.productName} from cart?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => onRemove(item.id) },
      ]);
    } else {
      onUpdate(item.id, item.quantity - 1);
    }
  };

  return (
    <View style={[s.itemCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
      <View style={[s.itemImg, { backgroundColor: colors.surface }]}>
        <Text style={{ fontSize: 28 }}>🛍️</Text>
      </View>
      <View style={s.itemInfo}>
        <Text style={[s.itemName, { color: colors.foreground }]} numberOfLines={1}>{item.productName}</Text>
        <Text style={[s.itemWeight, { color: colors.mutedForeground }]}>{item.unit} · {item.storeName}</Text>
        <Text style={[s.itemPrice, { color: colors.foreground }]}>₹{Number(item.totalPrice).toFixed(0)}</Text>
      </View>
      <View style={s.qtyRow}>
        <TouchableOpacity
          onPress={handleDecrement}
          style={[s.qtyBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          {item.quantity === 1
            ? <Trash2 size={12} color={colors.destructive} />
            : <Minus size={12} color={colors.foreground} />}
        </TouchableOpacity>
        <Text style={[s.qtyText, { color: colors.foreground }]}>{item.quantity}</Text>
        <LinearGradient colors={[...colors.gradientGold]} style={s.qtyBtnAdd} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <TouchableOpacity onPress={() => onUpdate(item.id, item.quantity + 1)} style={s.qtyBtnInner}>
            <Plus size={12} color={colors.primaryForeground} />
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
  );
};

// ── CartScreen ─────────────────────────────────────────────────────────────────

const CartScreen = () => {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const s = makeStyles(colors);
  const { cart, loading, fetchCart, updateQty, removeItem, clearCart } = useCart();

  useEffect(() => { fetchCart(); }, []);

  const handleUpdate = async (itemId: number, qty: number) => {
    try { await updateQty(itemId, qty); } catch {
      Alert.alert('Error', 'Could not update quantity.');
    }
  };

  const handleRemove = async (itemId: number) => {
    try { await removeItem(itemId); } catch {
      Alert.alert('Error', 'Could not remove item.');
    }
  };

  const handleClear = () => {
    Alert.alert('Clear cart', 'Remove all items from cart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => clearCart() },
    ]);
  };

  const items = cart?.items ?? [];
  const subtotal = Number(cart?.subtotal ?? 0);
  const deliveryFee = items.length > 0 ? 25 : 0;
  const total = subtotal + deliveryFee;

  // Group by store name
  const byStore = cart?.itemsByStore ?? {};

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[s.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <ArrowLeft size={16} color={colors.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[s.title, { color: colors.foreground }]}>My Cart</Text>
          <Text style={[s.subtitle, { color: colors.mutedForeground }]}>{items.length} items</Text>
        </View>
        {items.length > 0 && (
          <TouchableOpacity onPress={handleClear}>
            <Text style={[s.clearText, { color: colors.destructive }]}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && items.length === 0 ? (
        <View style={s.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : items.length === 0 ? (
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scrollContent}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchCart} />}
        >
          {/* Items grouped by store */}
          {Object.entries(byStore).map(([storeName, storeItems]) => (
            <View key={storeName} style={s.sectionBlock}>
              <View style={s.sectionHeader}>
                <Truck size={16} color={colors.primary} />
                <Text style={[s.sectionLabel, { color: colors.foreground }]}>{storeName}</Text>
              </View>
              {storeItems.map(item => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onUpdate={handleUpdate}
                  onRemove={handleRemove}
                />
              ))}
            </View>
          ))}

          {/* Price Breakdown */}
          <View style={[s.priceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[s.priceCardTitle, { color: colors.foreground }]}>Price Details</Text>
            <View style={s.priceRow}>
              <Text style={[s.priceLabel, { color: colors.mutedForeground }]}>Subtotal</Text>
              <Text style={[s.priceValue, { color: colors.foreground }]}>₹{subtotal.toFixed(0)}</Text>
            </View>
            <View style={s.priceRow}>
              <Text style={[s.priceLabel, { color: colors.mutedForeground }]}>Delivery Fee</Text>
              <Text style={[s.priceValue, { color: colors.foreground }]}>₹{deliveryFee}</Text>
            </View>
            <View style={[s.divider, { borderTopColor: colors.border }]} />
            <View style={s.priceRow}>
              <Text style={[s.totalLabel, { color: colors.foreground }]}>Total</Text>
              <Text style={[s.totalValue, { color: colors.primary }]}>₹{total.toFixed(0)}</Text>
            </View>
          </View>

          {/* Checkout */}
          <LinearGradient colors={[...colors.gradientGold]} style={s.checkoutBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <TouchableOpacity style={s.checkoutInner}>
              <Text style={[s.checkoutText, { color: colors.primaryForeground }]}>
                Proceed to Checkout — ₹{total.toFixed(0)}
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
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 16 },
    backBtn: { width: 36, height: 36, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 20, fontWeight: '700', fontStyle: 'italic' },
    subtitle: { fontSize: 12 },
    clearText: { fontSize: 13, fontWeight: '600' },
    scrollContent: { paddingHorizontal: 16, gap: 16, paddingBottom: 32 },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    emptyTitle: { fontSize: 18, fontWeight: '700', fontStyle: 'italic' },
    emptySub: { fontSize: 14 },
    shopBtn: { borderRadius: 12, marginTop: 8 },
    shopBtnText: { paddingHorizontal: 24, paddingVertical: 10, fontSize: 14, fontWeight: '600' },
    sectionBlock: { gap: 8 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    sectionLabel: { fontSize: 14, fontWeight: '600' },
    itemCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16, borderWidth: 1, marginBottom: 8 },
    itemImg: { width: 56, height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 13, fontWeight: '600' },
    itemWeight: { fontSize: 11, marginTop: 1 },
    itemPrice: { fontSize: 13, fontWeight: '700', marginTop: 2 },
    qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    qtyBtn: { width: 28, height: 28, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    qtyBtnAdd: { width: 28, height: 28, borderRadius: 8 },
    qtyBtnInner: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
    qtyText: { width: 24, textAlign: 'center', fontSize: 14, fontWeight: '600' },
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
