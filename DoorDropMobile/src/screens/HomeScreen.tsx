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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Search, MapPin, ShoppingCart, User, Zap, Package,
  Clock, Star, ChevronRight, Bell, Sun, Moon,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useCart } from '../context/CartContext';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAX_WIDTH = Math.min(SCREEN_WIDTH, 430);

// ── Data ─────────────────────────────────────────────────────────────────────

const categories = [
  { icon: '🥛', label: 'Dairy' },
  { icon: '🍎', label: 'Fruits' },
  { icon: '🥬', label: 'Veggies' },
  { icon: '🍞', label: 'Bakery' },
  { icon: '🧴', label: 'Personal' },
  { icon: '🧹', label: 'Cleaning' },
  { icon: '🍼', label: 'Baby' },
  { icon: '💊', label: 'Pharma' },
];

const quickProducts = [
  { productId: 1, storeId: 1, name: 'Amul Taza Milk', weight: '500ml', price: 27, oldPrice: 30, img: '🥛', rating: 4.5, deliveryTime: '8 min' },
  { productId: 2, storeId: 1, name: 'Fresh Paneer', weight: '200g', price: 80, oldPrice: 95, img: '🧀', rating: 4.3, deliveryTime: '10 min' },
  { productId: 3, storeId: 1, name: 'Brown Bread', weight: '400g', price: 45, oldPrice: 50, img: '🍞', rating: 4.6, deliveryTime: '8 min' },
  { productId: 4, storeId: 1, name: 'Organic Eggs', weight: '6 pcs', price: 72, oldPrice: 85, img: '🥚', rating: 4.7, deliveryTime: '12 min' },
];

const trendingProducts = [
  { name: 'Wireless Earbuds Pro', brand: 'SoundWave', price: 1299, oldPrice: 2499, img: '🎧', rating: 4.4, delivery: '2 days' },
  { name: 'Cotton Kurta Set', brand: 'EthnicWear', price: 899, oldPrice: 1599, img: '👕', rating: 4.6, delivery: '3 days' },
  { name: 'Ceramic Plant Pot', brand: 'GreenHome', price: 349, oldPrice: 599, img: '🪴', rating: 4.2, delivery: '4 days' },
  { name: 'Steel Water Bottle', brand: 'HydroPure', price: 499, oldPrice: 799, img: '🍶', rating: 4.8, delivery: '2 days' },
];

const localStores = [
  { name: 'Sharma General Store', distance: '0.5 km', rating: 4.6, deliveryTime: '10 min', items: 342 },
  { name: 'Fresh Mart Kirana', distance: '0.8 km', rating: 4.4, deliveryTime: '12 min', items: 256 },
  { name: 'Gupta Provision Store', distance: '1.2 km', rating: 4.7, deliveryTime: '15 min', items: 518 },
];

const shopCategories = [
  { icon: '📱', label: 'Electronics' },
  { icon: '👗', label: 'Fashion' },
  { icon: '🏠', label: 'Home' },
  { icon: '📚', label: 'Books' },
  { icon: '⌚', label: 'Watches' },
  { icon: '🎮', label: 'Gaming' },
  { icon: '🧸', label: 'Toys' },
  { icon: '🎨', label: 'Crafts' },
];

const flashDeals = [
  { label: 'Up to 60% Off', subtitle: 'Electronics', bg: '🔌' },
  { label: 'Buy 2 Get 1 Free', subtitle: 'Fashion', bg: '👔' },
  { label: 'Flat ₹200 Off', subtitle: 'Home Decor', bg: '🪑' },
];

// ── FadeIn helper ─────────────────────────────────────────────────────────────

const FadeInView = ({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: object;
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
};

// ── DoorDropNow ───────────────────────────────────────────────────────────────

const DoorDropNow = () => {
  const { colors } = useTheme();
  const { addToCart } = useCart();
  const s = makeStyles(colors);
  const colW = (MAX_WIDTH - 32 - 9) / 4;
  const prodW = (MAX_WIDTH - 32 - 12) / 2;

  const handleAddToCart = async (productId: number, storeId: number) => {
    try {
      await addToCart({ productId, storeId, quantity: 1 });
    } catch {
      Alert.alert('Error', 'Could not add item to cart.');
    }
  };

  return (
    <View style={s.section}>
      {/* Banner */}
      <FadeInView>
        <LinearGradient colors={[...colors.gradientGold]} style={s.banner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={s.bannerRow}>
            <Zap size={20} color={colors.primaryForeground} />
            <Text style={[s.bannerTitle, { color: colors.primaryForeground }]}>DELIVERY IN 10 MINUTES</Text>
          </View>
          <Text style={[s.bannerSub, { color: colors.primaryForeground + 'CC' }]}>
            Groceries, essentials & more from stores near you
          </Text>
        </LinearGradient>
      </FadeInView>

      {/* Categories */}
      <View>
        <Text style={[s.sectionTitle, { color: colors.foreground }]}>Shop by Category</Text>
        <View style={s.grid4}>
          {categories.map((cat, i) => (
            <FadeInView key={cat.label} delay={i * 80} style={{ width: colW }}>
              <TouchableOpacity style={[s.catCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={s.catIcon}>{cat.icon}</Text>
                <Text style={[s.catLabel, { color: colors.mutedForeground }]}>{cat.label}</Text>
              </TouchableOpacity>
            </FadeInView>
          ))}
        </View>
      </View>

      {/* Nearby Stores */}
      <View>
        <View style={s.rowBetween}>
          <Text style={[s.sectionTitle, { color: colors.foreground }]}>Nearby Stores</Text>
          <TouchableOpacity><Text style={[s.linkText, { color: colors.primary }]}>View All</Text></TouchableOpacity>
        </View>
        {localStores.map((store, i) => (
          <FadeInView key={store.name} delay={i * 80}>
            <TouchableOpacity style={[s.storeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <LinearGradient colors={[...colors.gradientGold]} style={s.storeAvatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Text style={[s.storeAvatarText, { color: colors.primaryForeground }]}>{store.name[0]}</Text>
              </LinearGradient>
              <View style={s.storeInfo}>
                <Text style={[s.storeName, { color: colors.foreground }]} numberOfLines={1}>{store.name}</Text>
                <View style={s.storeMetaRow}>
                  <Star size={11} color={colors.primary} fill={colors.primary} />
                  <Text style={[s.storeMeta, { color: colors.primary }]}> {store.rating}</Text>
                  <Text style={[s.storeMeta, { color: colors.mutedForeground }]}> · {store.distance}</Text>
                  <Text style={[s.storeMeta, { color: colors.mutedForeground }]}> · {store.items} items</Text>
                </View>
              </View>
              <View style={s.storeRight}>
                <Clock size={11} color={colors.primary} />
                <Text style={[s.storeMeta, { color: colors.primary, marginLeft: 2 }]}>{store.deliveryTime}</Text>
              </View>
            </TouchableOpacity>
          </FadeInView>
        ))}
      </View>

      {/* Quick Picks */}
      <View>
        <View style={s.rowBetween}>
          <Text style={[s.sectionTitle, { color: colors.foreground }]}>Quick Picks</Text>
          <TouchableOpacity><Text style={[s.linkText, { color: colors.primary }]}>See All</Text></TouchableOpacity>
        </View>
        <View style={s.grid2}>
          {quickProducts.map((product, i) => (
            <FadeInView key={product.name} delay={i * 80} style={{ width: prodW }}>
              <View style={[s.productCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[s.productImgBox, { backgroundColor: colors.surfaceElevated }]}>
                  <Text style={s.productImg}>{product.img}</Text>
                </View>
                <View style={s.productBody}>
                  <View style={s.deliveryRow}>
                    <Clock size={10} color={colors.primary} />
                    <Text style={[s.deliveryText, { color: colors.primary }]}> {product.deliveryTime}</Text>
                  </View>
                  <Text style={[s.productName, { color: colors.foreground }]} numberOfLines={1}>{product.name}</Text>
                  <Text style={[s.productWeight, { color: colors.mutedForeground }]}>{product.weight}</Text>
                  <View style={s.priceRow}>
                    <View>
                      <Text style={[s.price, { color: colors.foreground }]}>₹{product.price}</Text>
                      <Text style={[s.oldPrice, { color: colors.mutedForeground }]}>₹{product.oldPrice}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleAddToCart(product.productId, product.storeId)}>
                      <LinearGradient colors={[...colors.gradientGold]} style={s.addBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                        <Text style={[s.addBtnText, { color: colors.primaryForeground }]}>+</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </FadeInView>
          ))}
        </View>
      </View>
    </View>
  );
};

// ── DoorDropShop ──────────────────────────────────────────────────────────────

const DoorDropShop = () => {
  const { colors } = useTheme();
  const s = makeStyles(colors);
  const colW = (MAX_WIDTH - 32 - 9) / 4;
  const prodW = (MAX_WIDTH - 32 - 12) / 2;

  return (
    <View style={s.section}>
      {/* Banner */}
      <FadeInView>
        <View style={[s.banner, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
          <View style={s.bannerRow}>
            <Package size={20} color={colors.primary} />
            <Text style={[s.bannerTitle, { color: colors.foreground }]}>SHOP FROM LOCAL BUSINESSES</Text>
          </View>
          <Text style={[s.bannerSub, { color: colors.mutedForeground }]}>
            Electronics, fashion, home decor & more — delivered based on distance
          </Text>
        </View>
      </FadeInView>

      {/* Categories */}
      <View>
        <Text style={[s.sectionTitle, { color: colors.foreground }]}>Browse Categories</Text>
        <View style={s.grid4}>
          {shopCategories.map((cat, i) => (
            <FadeInView key={cat.label} delay={i * 80} style={{ width: colW }}>
              <TouchableOpacity style={[s.catCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={s.catIcon}>{cat.icon}</Text>
                <Text style={[s.catLabel, { color: colors.mutedForeground }]}>{cat.label}</Text>
              </TouchableOpacity>
            </FadeInView>
          ))}
        </View>
      </View>

      {/* Trending */}
      <View>
        <View style={s.rowBetween}>
          <Text style={[s.sectionTitle, { color: colors.foreground }]}>Trending Now</Text>
          <TouchableOpacity><Text style={[s.linkText, { color: colors.primary }]}>See All</Text></TouchableOpacity>
        </View>
        <View style={s.grid2}>
          {trendingProducts.map((product, i) => (
            <FadeInView key={product.name} delay={i * 80} style={{ width: prodW }}>
              <View style={[s.productCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[s.trendImgBox, { backgroundColor: colors.surfaceElevated }]}>
                  <Text style={s.trendImg}>{product.img}</Text>
                </View>
                <View style={s.productBody}>
                  <Text style={[s.brandText, { color: colors.primary }]}>{product.brand}</Text>
                  <Text style={[s.productName, { color: colors.foreground }]} numberOfLines={1}>{product.name}</Text>
                  <View style={s.deliveryRow}>
                    <Star size={10} color={colors.primary} fill={colors.primary} />
                    <Text style={[s.storeMeta, { color: colors.mutedForeground }]}> {product.rating} · {product.delivery}</Text>
                  </View>
                  <View style={s.priceRow}>
                    <View>
                      <Text style={[s.price, { color: colors.foreground }]}>₹{product.price}</Text>
                      <Text style={[s.oldPrice, { color: colors.mutedForeground }]}>₹{product.oldPrice}</Text>
                    </View>
                    <LinearGradient colors={[...colors.gradientGold]} style={s.addBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                      <Text style={[s.addBtnText, { color: colors.primaryForeground }]}>+</Text>
                    </LinearGradient>
                  </View>
                </View>
              </View>
            </FadeInView>
          ))}
        </View>
      </View>

      {/* Flash Deals */}
      <View>
        <Text style={[s.sectionTitle, { color: colors.foreground }]}>⚡ Flash Deals</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
          {flashDeals.map((deal, i) => (
            <FadeInView key={deal.label} delay={i * 80}>
              <View style={[s.dealCard, { backgroundColor: colors.surface, borderColor: colors.primary + '50' }]}>
                <Text style={{ fontSize: 28 }}>{deal.bg}</Text>
                <Text style={[s.dealLabel, { color: colors.primary }]}>{deal.label}</Text>
                <Text style={[s.dealSub, { color: colors.mutedForeground }]}>{deal.subtitle}</Text>
              </View>
            </FadeInView>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

// ── HomeScreen ────────────────────────────────────────────────────────────────

const HomeScreen = () => {
  const [activeTab, setActiveTab] = React.useState<'now' | 'shop'>('now');
  const navigation = useNavigation<Nav>();
  const { theme, toggleTheme, colors } = useTheme();
  const { itemCount } = useCart();
  const s = makeStyles(colors);

  const navItems = [
    { icon: <Zap size={20} color={activeTab === 'now' ? colors.primary : colors.mutedForeground} />, label: 'Home', route: null as null },
    { icon: <Search size={20} color={colors.mutedForeground} />, label: 'Explore', route: null as null },
    { icon: <ShoppingCart size={20} color={colors.mutedForeground} />, label: 'Cart', route: 'Cart' as const, badge: itemCount > 0 ? itemCount : null },
    { icon: <User size={20} color={colors.mutedForeground} />, label: 'Account', route: 'Account' as const },
  ];

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerTop}>
          <View style={s.locationRow}>
            <MapPin size={14} color={colors.primary} />
            <View style={{ marginLeft: 6 }}>
              <Text style={[s.deliverLabel, { color: colors.mutedForeground }]}>Deliver to</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[s.locationText, { color: colors.foreground }]}>Home — Sector 22, Gurugram</Text>
                <ChevronRight size={12} color={colors.mutedForeground} />
              </View>
            </View>
          </View>
          <View style={s.headerActions}>
            <TouchableOpacity onPress={toggleTheme} style={[s.iconBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
              {theme === 'dark'
                ? <Sun size={16} color={colors.primary} />
                : <Moon size={16} color={colors.primary} />}
            </TouchableOpacity>
            <TouchableOpacity style={{ position: 'relative' }}>
              <Bell size={20} color={colors.mutedForeground} />
              <View style={[s.notifDot, { backgroundColor: colors.primary }]} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.iconBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
              onPress={() => navigation.navigate('Account')}
            >
              <User size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View style={[s.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Search size={16} color={colors.mutedForeground} />
          <TextInput
            placeholder="Search for groceries, electronics & more..."
            placeholderTextColor={colors.mutedForeground}
            style={[s.searchInput, { color: colors.foreground }]}
          />
        </View>
      </View>

      {/* Tab Switcher */}
      <View style={s.tabContainer}>
        <View style={[s.tabWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity onPress={() => setActiveTab('now')} style={s.tabBtn}>
            {activeTab === 'now' ? (
              <LinearGradient colors={[...colors.gradientGold]} style={s.tabBtnActive} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Zap size={16} color={colors.primaryForeground} />
                <Text style={[s.tabTextActive, { color: colors.primaryForeground }]}>DoorDrop Now</Text>
              </LinearGradient>
            ) : (
              <View style={s.tabBtnInactive}>
                <Zap size={16} color={colors.mutedForeground} />
                <Text style={[s.tabText, { color: colors.mutedForeground }]}>DoorDrop Now</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('shop')} style={s.tabBtn}>
            {activeTab === 'shop' ? (
              <LinearGradient colors={[...colors.gradientGold]} style={s.tabBtnActive} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Package size={16} color={colors.primaryForeground} />
                <Text style={[s.tabTextActive, { color: colors.primaryForeground }]}>DoorDrop</Text>
              </LinearGradient>
            ) : (
              <View style={s.tabBtnInactive}>
                <Package size={16} color={colors.mutedForeground} />
                <Text style={[s.tabText, { color: colors.mutedForeground }]}>DoorDrop</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable content */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 90 }}>
        {activeTab === 'now' ? <DoorDropNow /> : <DoorDropShop />}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[s.bottomNav, { backgroundColor: colors.card + 'F5', borderTopColor: colors.border }]}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={s.navItem}
            onPress={() => item.route && navigation.navigate(item.route)}
          >
            {item.icon}
            <Text style={[s.navLabel, { color: item.label === 'Home' ? colors.primary : colors.mutedForeground }]}>
              {item.label}
            </Text>
            {item.badge ? (
              <LinearGradient colors={[...colors.gradientGold]} style={s.badge} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Text style={[s.badgeText, { color: colors.primaryForeground }]}>{item.badge}</Text>
              </LinearGradient>
            ) : null}
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 16, paddingBottom: 12 },
    headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    locationRow: { flexDirection: 'row', alignItems: 'center' },
    deliverLabel: { fontSize: 11 },
    locationText: { fontSize: 13, fontWeight: '600', marginRight: 2 },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    iconBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    notifDot: { position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: 4 },
    searchBar: { flexDirection: 'row', alignItems: 'center', height: 40, borderRadius: 12, borderWidth: 1, paddingHorizontal: 10, gap: 8 },
    searchInput: { flex: 1, fontSize: 13, padding: 0 },
    tabContainer: { paddingHorizontal: 16, marginBottom: 16 },
    tabWrapper: { flexDirection: 'row', borderRadius: 18, padding: 4, borderWidth: 1 },
    tabBtn: { flex: 1 },
    tabBtnActive: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 14 },
    tabBtnInactive: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 14 },
    tabTextActive: { fontSize: 13, fontWeight: '700' },
    tabText: { fontSize: 13, fontWeight: '600' },
    // Content sections
    section: { paddingHorizontal: 16, gap: 24 },
    sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12, fontStyle: 'italic' },
    rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    linkText: { fontSize: 12, fontWeight: '600' },
    // Banner
    banner: { borderRadius: 16, padding: 16, marginBottom: 0 },
    bannerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    bannerTitle: { fontSize: 13, fontWeight: '700' },
    bannerSub: { fontSize: 12 },
    // Categories
    grid4: { flexDirection: 'row', flexWrap: 'wrap', gap: 3 },
    catCard: { alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4, borderRadius: 16, borderWidth: 1, marginBottom: 3 },
    catIcon: { fontSize: 22 },
    catLabel: { fontSize: 10, fontWeight: '500', marginTop: 4 },
    // Stores
    storeCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, borderWidth: 1, marginBottom: 8 },
    storeAvatar: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    storeAvatarText: { fontSize: 18, fontWeight: '700' },
    storeInfo: { flex: 1, marginLeft: 12 },
    storeName: { fontSize: 13, fontWeight: '600' },
    storeMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    storeMeta: { fontSize: 11 },
    storeRight: { flexDirection: 'row', alignItems: 'center' },
    // Products
    grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    productCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 0 },
    productImgBox: { height: 96, alignItems: 'center', justifyContent: 'center' },
    trendImgBox: { height: 112, alignItems: 'center', justifyContent: 'center' },
    productImg: { fontSize: 36 },
    trendImg: { fontSize: 44 },
    productBody: { padding: 10, gap: 2 },
    deliveryRow: { flexDirection: 'row', alignItems: 'center' },
    deliveryText: { fontSize: 10, fontWeight: '600' },
    productName: { fontSize: 13, fontWeight: '600' },
    productWeight: { fontSize: 11 },
    brandText: { fontSize: 11, fontWeight: '600' },
    priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
    price: { fontSize: 13, fontWeight: '700' },
    oldPrice: { fontSize: 11, textDecorationLine: 'line-through' },
    addBtn: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    addBtnText: { fontSize: 18, fontWeight: '700', lineHeight: 22 },
    // Flash deals
    dealCard: { width: 200, borderRadius: 16, borderWidth: 1, padding: 16, flexShrink: 0 },
    dealLabel: { fontSize: 13, fontWeight: '700', marginTop: 8 },
    dealSub: { fontSize: 12 },
    // Bottom nav
    bottomNav: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      borderTopWidth: 1,
      paddingTop: 8,
      paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    },
    navItem: { alignItems: 'center', gap: 2, position: 'relative' },
    navLabel: { fontSize: 10 },
    badge: { position: 'absolute', top: -4, right: -8, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    badgeText: { fontSize: 9, fontWeight: '700' },
  });

export default HomeScreen;
