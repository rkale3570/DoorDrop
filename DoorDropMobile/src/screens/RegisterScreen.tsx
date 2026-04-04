import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Eye, EyeOff, User, Phone, ChevronDown } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { UserRole } from '../api/types';
import { AuthStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<AuthStackParamList>;

const ROLES: { label: string; value: UserRole; emoji: string }[] = [
  { label: 'Customer', value: 'CUSTOMER', emoji: '🛍️' },
  { label: 'Store Owner (Kirana)', value: 'STORE_OWNER', emoji: '🏪' },
  { label: 'Marketplace Seller', value: 'SELLER', emoji: '📦' },
  { label: 'Delivery Agent', value: 'DELIVERY_AGENT', emoji: '🚴' },
];

const RegisterScreen = () => {
  const navigation = useNavigation<Nav>();
  const { register } = useAuth();
  const { colors } = useTheme();
  const s = makeStyles(colors);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('CUSTOMER');
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedRole = ROLES.find(r => r.value === role)!;

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await register({ name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim(), password, role });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        (err?.message === 'Network Error' ? 'Cannot connect to server. Check your connection.' : 'Registration failed. Please try again.');
      Alert.alert('Registration failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          {/* Brand */}
          <View style={s.brandBlock}>
            <LinearGradient colors={[...colors.gradientGold]} style={s.logoCircle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={[s.logoText, { color: colors.primaryForeground }]}>DD</Text>
            </LinearGradient>
            <Text style={[s.appName, { color: colors.foreground }]}>Create Account</Text>
            <Text style={[s.tagline, { color: colors.mutedForeground }]}>Join DoorDrop today</Text>
          </View>

          <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Name */}
            <View style={s.field}>
              <Text style={[s.label, { color: colors.mutedForeground }]}>Full Name</Text>
              <View style={[s.inputRow, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <User size={16} color={colors.mutedForeground} />
                <TextInput style={[s.input, { color: colors.foreground }]} placeholder="Rahul Sharma" placeholderTextColor={colors.mutedForeground} value={name} onChangeText={setName} />
              </View>
            </View>

            {/* Email */}
            <View style={s.field}>
              <Text style={[s.label, { color: colors.mutedForeground }]}>Email</Text>
              <View style={[s.inputRow, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <Mail size={16} color={colors.mutedForeground} />
                <TextInput style={[s.input, { color: colors.foreground }]} placeholder="you@example.com" placeholderTextColor={colors.mutedForeground} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
              </View>
            </View>

            {/* Phone */}
            <View style={s.field}>
              <Text style={[s.label, { color: colors.mutedForeground }]}>Mobile Number</Text>
              <View style={[s.inputRow, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <Phone size={16} color={colors.mutedForeground} />
                <Text style={[s.prefix, { color: colors.mutedForeground }]}>+91</Text>
                <TextInput style={[s.input, { color: colors.foreground }]} placeholder="9876543210" placeholderTextColor={colors.mutedForeground} value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={10} />
              </View>
            </View>

            {/* Password */}
            <View style={s.field}>
              <Text style={[s.label, { color: colors.mutedForeground }]}>Password</Text>
              <View style={[s.inputRow, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <Lock size={16} color={colors.mutedForeground} />
                <TextInput style={[s.input, { color: colors.foreground }]} placeholder="Min 8 characters" placeholderTextColor={colors.mutedForeground} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
                <TouchableOpacity onPress={() => setShowPassword(v => !v)}>
                  {showPassword ? <EyeOff size={16} color={colors.mutedForeground} /> : <Eye size={16} color={colors.mutedForeground} />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Role Picker */}
            <View style={s.field}>
              <Text style={[s.label, { color: colors.mutedForeground }]}>I am a...</Text>
              <TouchableOpacity onPress={() => setShowRolePicker(v => !v)} style={[s.inputRow, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <Text style={{ fontSize: 16 }}>{selectedRole.emoji}</Text>
                <Text style={[s.roleText, { color: colors.foreground }]}>{selectedRole.label}</Text>
                <ChevronDown size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
              {showRolePicker && (
                <View style={[s.dropdown, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                  {ROLES.map(r => (
                    <TouchableOpacity
                      key={r.value}
                      style={[s.dropdownItem, role === r.value && { backgroundColor: colors.primary + '20' }]}
                      onPress={() => { setRole(r.value); setShowRolePicker(false); }}
                    >
                      <Text style={{ fontSize: 16 }}>{r.emoji}</Text>
                      <Text style={[s.dropdownLabel, { color: role === r.value ? colors.primary : colors.foreground }]}>{r.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Register Button */}
            <LinearGradient colors={[...colors.gradientGold]} style={s.registerBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <TouchableOpacity style={s.registerBtnInner} onPress={handleRegister} disabled={loading}>
                {loading
                  ? <ActivityIndicator color={colors.primaryForeground} />
                  : <Text style={[s.registerBtnText, { color: colors.primaryForeground }]}>Create Account</Text>}
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Login link */}
          <View style={s.loginRow}>
            <Text style={[s.loginText, { color: colors.mutedForeground }]}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[s.loginLink, { color: colors.primary }]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const makeStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 32 },
  brandBlock: { alignItems: 'center', marginBottom: 28 },
  logoCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  logoText: { fontSize: 22, fontWeight: '800' },
  appName: { fontSize: 24, fontWeight: '700', fontStyle: 'italic' },
  tagline: { fontSize: 13, marginTop: 4 },
  card: { borderRadius: 20, borderWidth: 1, padding: 24, gap: 14 },
  field: { gap: 6 },
  label: { fontSize: 12, fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, height: 48 },
  input: { flex: 1, fontSize: 14, padding: 0 },
  prefix: { fontSize: 14, fontWeight: '600' },
  roleText: { flex: 1, fontSize: 14 },
  dropdown: { borderRadius: 12, borderWidth: 1, overflow: 'hidden', marginTop: 4 },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12 },
  dropdownLabel: { fontSize: 14, fontWeight: '500' },
  registerBtn: { borderRadius: 14, marginTop: 4 },
  registerBtnInner: { paddingVertical: 14, alignItems: 'center' },
  registerBtnText: { fontSize: 15, fontWeight: '700' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  loginText: { fontSize: 14 },
  loginLink: { fontSize: 14, fontWeight: '700' },
});

export default RegisterScreen;
