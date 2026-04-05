import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft, ChevronRight, Package, MapPin, User,
  HelpCircle, LogOut,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const menuSections = [
  {
    title: 'My Activity',
    items: [
      { Icon: Package, label: 'Your Orders', subtitle: 'Track & manage orders', badge: null },
      { Icon: MapPin, label: 'Addresses', subtitle: 'Home, Office & more', badge: null },
      { Icon: User, label: 'Profile', subtitle: 'Edit your details', badge: null },
    ],
  },
  {
    title: 'Support',
    items: [
      { Icon: HelpCircle, label: 'Help & Support', subtitle: 'FAQs, Chat with us', badge: null },
    ],
  },
];

const AccountScreen = () => {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const s = makeStyles(colors);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          try {
            await logout();
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

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
        <View style={[s.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <LinearGradient colors={[...colors.gradientGold]} style={s.avatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={[s.avatarText, { color: colors.primaryForeground }]}>{initials}</Text>
            </LinearGradient>
            <View style={s.profileInfo}>
              <Text style={[s.profileName, { color: colors.foreground }]}>{user?.name ?? '—'}</Text>
              <Text style={[s.profileMeta, { color: colors.mutedForeground }]}>{user?.email ?? '—'}</Text>
              <Text style={[s.profileMeta, { color: colors.mutedForeground }]}>{user?.role ?? '—'}</Text>
            </View>
            <TouchableOpacity style={[s.editBtn, { borderColor: colors.primary + '50' }]}>
              <Text style={[s.editBtnText, { color: colors.primary }]}>Edit</Text>
            </TouchableOpacity>
          </View>

        {/* Menu Sections */}
        {menuSections.map((section, si) => (
          <View key={section.title} style={s.menuSection}>
            <Text style={[s.menuSectionTitle, { color: colors.mutedForeground }]}>{section.title.toUpperCase()}</Text>
            <View style={[s.menuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {section.items.map((item, i) => (
                <TouchableOpacity
                  key={item.label}
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
                  <ChevronRight size={16} color={colors.mutedForeground} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} disabled={loggingOut}>
          <LogOut size={16} color={colors.destructive} />
          <Text style={[s.logoutText, { color: colors.destructive }]}>
            {loggingOut ? 'Logging out...' : 'Log Out'}
          </Text>
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
    menuSection: { gap: 8 },
    menuSectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
    menuCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, gap: 12 },
    menuIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    menuText: { flex: 1 },
    menuLabel: { fontSize: 13, fontWeight: '500' },
    menuSub: { fontSize: 11, marginTop: 1 },
    logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12 },
    logoutText: { fontSize: 14, fontWeight: '500' },
  });

export default AccountScreen;
