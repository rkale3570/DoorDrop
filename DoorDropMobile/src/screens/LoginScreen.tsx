import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { AuthStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<AuthStackParamList>;

const LoginScreen = () => {
  const navigation = useNavigation<Nav>();
  const { login } = useAuth();
  const { colors } = useTheme();
  const s = makeStyles(colors);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      // Navigation is handled automatically by AppNavigator role-based routing
    } catch (err: any) {
      const msg = err?.response?.data?.message || (err?.message === 'Network Error' ? 'Cannot connect to server. Check your connection.' : 'Invalid credentials. Please try again.');
      Alert.alert('Login failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          {/* Logo / Brand */}
          <View style={s.brandBlock}>
            <LinearGradient colors={[...colors.gradientGold]} style={s.logoCircle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={[s.logoText, { color: colors.primaryForeground }]}>DD</Text>
            </LinearGradient>
            <Text style={[s.appName, { color: colors.foreground }]}>DoorDrop</Text>
            <Text style={[s.tagline, { color: colors.mutedForeground }]}>Hyperlocal delivery, delivered fast</Text>
          </View>

          {/* Card */}
          <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[s.cardTitle, { color: colors.foreground }]}>Welcome back</Text>
            <Text style={[s.cardSub, { color: colors.mutedForeground }]}>Sign in to continue</Text>

            {/* Email */}
            <View style={s.field}>
              <Text style={[s.label, { color: colors.mutedForeground }]}>Email</Text>
              <View style={[s.inputRow, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <Mail size={16} color={colors.mutedForeground} />
                <TextInput
                  style={[s.input, { color: colors.foreground }]}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.mutedForeground}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password */}
            <View style={s.field}>
              <Text style={[s.label, { color: colors.mutedForeground }]}>Password</Text>
              <View style={[s.inputRow, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <Lock size={16} color={colors.mutedForeground} />
                <TextInput
                  style={[s.input, { color: colors.foreground }]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.mutedForeground}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(v => !v)}>
                  {showPassword
                    ? <EyeOff size={16} color={colors.mutedForeground} />
                    : <Eye size={16} color={colors.mutedForeground} />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <LinearGradient colors={[...colors.gradientGold]} style={s.loginBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <TouchableOpacity style={s.loginBtnInner} onPress={handleLogin} disabled={loading}>
                {loading
                  ? <ActivityIndicator color={colors.primaryForeground} />
                  : <Text style={[s.loginBtnText, { color: colors.primaryForeground }]}>Sign In</Text>}
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Register link */}
          <View style={s.registerRow}>
            <Text style={[s.registerText, { color: colors.mutedForeground }]}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[s.registerLink, { color: colors.primary }]}>Sign Up</Text>
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
  brandBlock: { alignItems: 'center', marginBottom: 32 },
  logoCircle: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  logoText: { fontSize: 26, fontWeight: '800' },
  appName: { fontSize: 28, fontWeight: '800', fontStyle: 'italic' },
  tagline: { fontSize: 13, marginTop: 4 },
  card: { borderRadius: 20, borderWidth: 1, padding: 24, gap: 16 },
  cardTitle: { fontSize: 22, fontWeight: '700' },
  cardSub: { fontSize: 13, marginTop: -8 },
  field: { gap: 6 },
  label: { fontSize: 12, fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, height: 48 },
  input: { flex: 1, fontSize: 14, padding: 0 },
  loginBtn: { borderRadius: 14, marginTop: 4 },
  loginBtnInner: { paddingVertical: 14, alignItems: 'center' },
  loginBtnText: { fontSize: 15, fontWeight: '700' },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  registerText: { fontSize: 14 },
  registerLink: { fontSize: 14, fontWeight: '700' },
});

export default LoginScreen;
