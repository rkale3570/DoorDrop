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
  ArrowLeft, ChevronRight, Package, MapPin, Heart, CreditCard,
  HelpCircle, Settings, LogOut, Bell, Shield, Star, Gift,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const menuSections = [
  {
    title: 'My Activity',
    items: [
      { Icon: Package, label: 'My Orders', subtitle: 'Track & manage orders', badge: '2 active' },
      { Icon: Heart, label: 'Wishlist', subtitle: 'Saved items', badge: '12' },
      { Icon: Star, label: 'Reviews & Ratings', subtitle: 'Your feedback' },
      { Icon: Gift, label: 'Rewards & Coins', subtitle: '250 coins', badge: '₹25' },
    ],
  },
  {
    title: 'Account Settings',
    items: [
      { Icon: MapPin, label: 'Saved Addresses', subtitle: 'Home, Office & more' },
      { Icon: CreditCard, label: 'Payment Methods', subtitle: 'UPI, Cards, Wallets' },
      { Icon: Bell, label: 'Notifications', subtitle: 'Manage alerts' },
      { Icon: Shield, label: 'Privacy & Security', subtitle: 'Password, 2FA' },
    ],
  },
  {
    title: 'Support',
    items: [
      { Icon: HelpCircle, label: 'Help & Support', subtitle: 'FAQs, Chat with us' },
      { Icon: Settings, label: 'App Settings', subtitle: 'Language, Theme' },
    ],
  },
];

const FadeInView = ({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: object }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(-10)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 350, delay, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: 0, duration: 350, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[{ opacity, transform: [{ translateX }] }, style]}>
      {children}
    </Animated.View>
  );
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
  return (
    <Animated.View style={[{ opacity, transform: [{ scale }] }, style]}>
      {children}
    </Animated.View>
  );
};

const AccountScreen = () => {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const s = makeStyles(colors);

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[s.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ArrowLeft size={16} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[s.title, { color: colors.foreground }]}>My Account</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        {/* Profile Card */}
        <ScaleInView>
          <View style={[s.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <LinearGradient colors={[...colors.gradientGold]} style={s.avatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={[s.avatarText, { color: colors.primaryForeground }]}>R</Text>
            </LinearGradient>
            <View style={s.profileInfo}>
              <Text style={[s.profileName, { color: colors.foreground }]}>Rahul Sharma</Text>
              <Text style={[s.profileMeta, { color: colors.mutedForeground }]}>+91 98765 43210</Text>
              <Text style={[s.profileMeta, { color: colors.mutedForeground }]}>rahul@example.com</Text>
            </View>
            <TouchableOpacity style={[s.editBtn, { borderColor: colors.primary + '50' }]}>
              <Text style={[s.editBtnText, { color: colors.primary }]}>Edit</Text>
            </TouchableOpacity>
          </View>
        </ScaleInView>

        {/* Stats */}
        <View style={s.statsRow}>
          {[
            { value: '15', label: 'Orders' },
            { value: '250', label: 'Coins' },
            { value: '4.8', label: 'Rating' },
          ].map((stat, i) => (
            <ScaleInView key={stat.label} delay={i * 80} style={s.statCard}>
              <View style={[s.statCardInner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[s.statValue, { color: colors.primary }]}>{stat.value}</Text>
                <Text style={[s.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
              </View>
            </ScaleInView>
          ))}
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, si) => (
          <View key={section.title} style={s.menuSection}>
            <Text style={[s.menuSectionTitle, { color: colors.mutedForeground }]}>{section.title.toUpperCase()}</Text>
            <View style={[s.menuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {section.items.map((item, i) => (
                <FadeInView key={item.label} delay={(si * 4 + i) * 40}>
                  <TouchableOpacity
                    style={[
                      s.menuItem,
                      { borderBottomColor: colors.border },
                      i === section.items.length - 1 && { borderBottomWidth: 0 },
                    ]}
                  >
                    <View style={[s.menuIcon, { backgroundColor: colors.primary + '1A' }]}>
                      <item.Icon size={16} color={colors.primary} />
                    </View>
                    <View style={s.menuText}>
                      <Text style={[s.menuLabel, { color: colors.foreground }]}>{item.label}</Text>
                      <Text style={[s.menuSub, { color: colors.mutedForeground }]}>{item.subtitle}</Text>
                    </View>
                    {item.badge && (
                      <LinearGradient colors={[...colors.gradientGold]} style={s.menuBadge} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                        <Text style={[s.menuBadgeText, { color: colors.primaryForeground }]}>{item.badge}</Text>
                      </LinearGradient>
                    )}
                    <ChevronRight size={16} color={colors.mutedForeground} />
                  </TouchableOpacity>
                </FadeInView>
              ))}
            </View>
          </View>
        ))}

        {/* Seller CTA */}
        <FadeInView delay={300}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Admin')}
            style={[s.sellerCta, { borderColor: colors.primary + '50', backgroundColor: colors.primary + '0D' }]}
          >
            <LinearGradient colors={[...colors.gradientGold]} style={s.sellerIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Package size={20} color={colors.primaryForeground} />
            </LinearGradient>
            <View style={s.sellerText}>
              <Text style={[s.sellerTitle, { color: colors.foreground }]}>Become a Seller</Text>
              <Text style={[s.sellerSub, { color: colors.mutedForeground }]}>Start selling on DoorDrop</Text>
            </View>
            <ChevronRight size={16} color={colors.primary} />
          </TouchableOpacity>
        </FadeInView>

        {/* Logout */}
        <TouchableOpacity style={s.logoutBtn}>
          <LogOut size={16} color={colors.destructive} />
          <Text style={[s.logoutText, { color: colors.destructive }]}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 8 },
    backBtn: { width: 36, height: 36, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 20, fontWeight: '700', fontStyle: 'italic' },
    scrollContent: { paddingHorizontal: 16, gap: 16, paddingBottom: 32 },
    profileCard: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, borderRadius: 16, borderWidth: 1 },
    avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 22, fontWeight: '700', fontStyle: 'italic' },
    profileInfo: { flex: 1 },
    profileName: { fontSize: 15, fontWeight: '600' },
    profileMeta: { fontSize: 12, marginTop: 1 },
    editBtn: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
    editBtnText: { fontSize: 12, fontWeight: '600' },
    statsRow: { flexDirection: 'row', gap: 8 },
    statCard: { flex: 1 },
    statCardInner: { alignItems: 'center', paddingVertical: 12, borderRadius: 16, borderWidth: 1 },
    statValue: { fontSize: 18, fontWeight: '700' },
    statLabel: { fontSize: 11, marginTop: 2 },
    menuSection: { gap: 8 },
    menuSectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
    menuCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, gap: 12 },
    menuIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    menuText: { flex: 1 },
    menuLabel: { fontSize: 13, fontWeight: '500' },
    menuSub: { fontSize: 11, marginTop: 1 },
    menuBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
    menuBadgeText: { fontSize: 10, fontWeight: '700' },
    sellerCta: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 16, borderWidth: 1 },
    sellerIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    sellerText: { flex: 1 },
    sellerTitle: { fontSize: 14, fontWeight: '600' },
    sellerSub: { fontSize: 11, marginTop: 1 },
    logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12 },
    logoutText: { fontSize: 14, fontWeight: '500' },
  });

export default AccountScreen;
