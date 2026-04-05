import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Store, Briefcase, MapPin, Phone, Mail, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import { StoreOnboardingRequest, SellerOnboardingRequest } from '../api/types';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// ── Field helper ──────────────────────────────────────────────────────────────

const Field = ({
  label, value, onChangeText, placeholder, keyboardType = 'default',
  required = false, colors, multiline = false,
}: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder: string; keyboardType?: any; required?: boolean;
  colors: any; multiline?: boolean;
}) => (
  <View style={{ gap: 6 }}>
    <Text style={{ fontSize: 13, fontWeight: '600', color: colors.foreground }}>
      {label}{required && <Text style={{ color: colors.destructive }}> *</Text>}
    </Text>
    <TextInput
      style={[
        styles.input,
        { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground },
        multiline && styles.inputMulti,
      ]}
      placeholder={placeholder}
      placeholderTextColor={colors.mutedForeground}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      multiline={multiline}
      numberOfLines={multiline ? 3 : 1}
      textAlignVertical={multiline ? 'top' : 'center'}
    />
  </View>
);

// ── ShopSetupScreen ───────────────────────────────────────────────────────────

const ShopSetupScreen = () => {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const { user } = useAuth();
  const isStoreOwner = user?.role === 'STORE_OWNER';

  const [submitting, setSubmitting] = useState(false);

  // ── STORE OWNER form ──────────────────────────────────────────────────────
  const [storeForm, setStoreForm] = useState({
    name: '', ownerName: user?.name ?? '', phone: '', email: user?.email ?? '',
    street: '', city: '', state: '', pincode: '',
    latitude: '', longitude: '', deliveryRadiusKm: '3',
    openTime: '09:00', closeTime: '22:00',
  });

  // ── SELLER form ───────────────────────────────────────────────────────────
  const [sellerForm, setSellerForm] = useState({
    businessName: '', gstNumber: '', street: '', city: '', state: '', pincode: '',
    latitude: '', longitude: '',
  });

  const sf = <K extends keyof typeof storeForm>(k: K) =>
    (v: string) => setStoreForm(f => ({ ...f, [k]: v }));

  const sel = <K extends keyof typeof sellerForm>(k: K) =>
    (v: string) => setSellerForm(f => ({ ...f, [k]: v }));

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (isStoreOwner) {
      // Validate required fields
      if (!storeForm.name.trim()) { Alert.alert('Validation', 'Store name is required.'); return; }
      if (!storeForm.ownerName.trim()) { Alert.alert('Validation', 'Owner name is required.'); return; }
      if (!storeForm.phone.trim()) { Alert.alert('Validation', 'Phone number is required.'); return; }
      if (!storeForm.latitude || isNaN(Number(storeForm.latitude))) {
        Alert.alert('Validation', 'Valid latitude is required.'); return;
      }
      if (!storeForm.longitude || isNaN(Number(storeForm.longitude))) {
        Alert.alert('Validation', 'Valid longitude is required.'); return;
      }

      const payload: StoreOnboardingRequest = {
        name: storeForm.name.trim(),
        ownerName: storeForm.ownerName.trim(),
        phone: storeForm.phone.trim(),
        email: storeForm.email.trim() || undefined,
        street: storeForm.street.trim() || undefined,
        city: storeForm.city.trim() || undefined,
        state: storeForm.state.trim() || undefined,
        pincode: storeForm.pincode.trim() || undefined,
        latitude: Number(storeForm.latitude),
        longitude: Number(storeForm.longitude),
        deliveryRadiusKm: storeForm.deliveryRadiusKm ? Number(storeForm.deliveryRadiusKm) : 3,
        openTime: storeForm.openTime.trim() || undefined,
        closeTime: storeForm.closeTime.trim() || undefined,
      };

      try {
        setSubmitting(true);
        await apiClient.post('/api/stores/register', payload);
        Alert.alert(
          'Store Submitted!',
          'Your store details have been submitted. We\'ll review and approve your store within 24–48 hours.',
          [{ text: 'OK', onPress: () => navigation.replace('PendingApproval') }]
        );
      } catch (err: any) {
        const status = err?.response?.status;

        // 409 = store already exists (previous attempt saved but response failed, or duplicate tap)
        // In both cases the store is in DB — take them to the pending screen
        if (status === 409) {
          navigation.replace('PendingApproval');
          return;
        }

        // Any other server error: store MAY have been saved — verify before showing error
        if (status && status >= 500) {
          try {
            await apiClient.get('/api/stores/my');
            // Store exists despite the error — go to pending approval
            navigation.replace('PendingApproval');
            return;
          } catch {
            // Store was not saved — fall through to show error
          }
        }

        Alert.alert('Error', err?.response?.data?.message ?? 'Could not create store. Please try again.');
      } finally {
        setSubmitting(false);
      }
    } else {
      // SELLER
      if (!sellerForm.businessName.trim()) { Alert.alert('Validation', 'Business name is required.'); return; }
      if (!sellerForm.street.trim()) { Alert.alert('Validation', 'Street address is required.'); return; }
      if (!sellerForm.city.trim()) { Alert.alert('Validation', 'City is required.'); return; }
      if (!sellerForm.state.trim()) { Alert.alert('Validation', 'State is required.'); return; }
      if (!sellerForm.pincode.trim()) { Alert.alert('Validation', 'Pincode is required.'); return; }

      const payload: SellerOnboardingRequest = {
        businessName: sellerForm.businessName.trim(),
        street: sellerForm.street.trim(),
        city: sellerForm.city.trim(),
        state: sellerForm.state.trim(),
        pincode: sellerForm.pincode.trim(),
        latitude: sellerForm.latitude ? Number(sellerForm.latitude) : undefined,
        longitude: sellerForm.longitude ? Number(sellerForm.longitude) : undefined,
      };

      try {
        setSubmitting(true);
        await apiClient.post('/api/seller/onboard', payload);
        Alert.alert('Welcome!', 'Your seller profile has been created.', [
          { text: 'Go to Dashboard', onPress: () => navigation.replace('SellerDashboard') },
        ]);
      } catch (err: any) {
        Alert.alert('Error', err?.response?.data?.message ?? 'Could not set up profile. Please try again.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <LinearGradient colors={[...colors.gradientGold]} style={styles.heroBanner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            {isStoreOwner
              ? <Store size={36} color={colors.primaryForeground} />
              : <Briefcase size={36} color={colors.primaryForeground} />}
            <Text style={[styles.heroTitle, { color: colors.primaryForeground }]}>
              {isStoreOwner ? 'Set Up Your Store' : 'Set Up Your Seller Profile'}
            </Text>
            <Text style={[styles.heroSub, { color: colors.primaryForeground + 'CC' }]}>
              {isStoreOwner
                ? 'Register your kirana store to start receiving orders'
                : 'Create your seller profile to list products on the marketplace'}
            </Text>
          </LinearGradient>

          {/* Form */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {isStoreOwner ? (
              <>
                {/* Store Details */}
                <SectionHeader icon={<Store size={14} color={colors.primary} />} label="Store Details" colors={colors} />
                <Field label="Store Name" value={storeForm.name} onChangeText={sf('name')} placeholder="e.g. Sharma General Store" required colors={colors} />
                <Field label="Owner Name" value={storeForm.ownerName} onChangeText={sf('ownerName')} placeholder="Full name" required colors={colors} />
                <Field label="Phone Number" value={storeForm.phone} onChangeText={sf('phone')} placeholder="10-digit mobile number" keyboardType="phone-pad" required colors={colors} />
                <Field label="Email" value={storeForm.email} onChangeText={sf('email')} placeholder="store@example.com" keyboardType="email-address" colors={colors} />

                {/* Address */}
                <SectionHeader icon={<MapPin size={14} color={colors.primary} />} label="Store Address" colors={colors} />
                <Field label="Street" value={storeForm.street} onChangeText={sf('street')} placeholder="Street / Area" colors={colors} />
                <View style={styles.rowFields}>
                  <View style={{ flex: 1 }}>
                    <Field label="City" value={storeForm.city} onChangeText={sf('city')} placeholder="City" colors={colors} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Field label="State" value={storeForm.state} onChangeText={sf('state')} placeholder="State" colors={colors} />
                  </View>
                </View>
                <Field label="Pincode" value={storeForm.pincode} onChangeText={sf('pincode')} placeholder="6-digit pincode" keyboardType="number-pad" colors={colors} />

                {/* Location */}
                <SectionHeader icon={<MapPin size={14} color={colors.primary} />} label="GPS Location" colors={colors} />
                <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                  Open Google Maps, long-press your store location, and copy the coordinates shown.
                </Text>
                <View style={styles.rowFields}>
                  <View style={{ flex: 1 }}>
                    <Field label="Latitude" value={storeForm.latitude} onChangeText={sf('latitude')} placeholder="e.g. 28.6139" keyboardType="decimal-pad" required colors={colors} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Field label="Longitude" value={storeForm.longitude} onChangeText={sf('longitude')} placeholder="e.g. 77.2090" keyboardType="decimal-pad" required colors={colors} />
                  </View>
                </View>

                {/* Store Hours */}
                <SectionHeader icon={<Phone size={14} color={colors.primary} />} label="Business Hours" colors={colors} />
                <View style={styles.rowFields}>
                  <View style={{ flex: 1 }}>
                    <Field label="Open Time" value={storeForm.openTime} onChangeText={sf('openTime')} placeholder="09:00" colors={colors} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Field label="Close Time" value={storeForm.closeTime} onChangeText={sf('closeTime')} placeholder="22:00" colors={colors} />
                  </View>
                </View>
                <Field label="Delivery Radius (km)" value={storeForm.deliveryRadiusKm} onChangeText={sf('deliveryRadiusKm')} placeholder="3" keyboardType="decimal-pad" colors={colors} />
              </>
            ) : (
              <>
                {/* Business Details */}
                <SectionHeader icon={<Briefcase size={14} color={colors.primary} />} label="Business Details" colors={colors} />
                <Field label="Business Name" value={sellerForm.businessName} onChangeText={sel('businessName')} placeholder="Your brand / shop name" required colors={colors} />
                <Field label="GST Number" value={sellerForm.gstNumber} onChangeText={sel('gstNumber')} placeholder="Optional — 15-digit GST" colors={colors} />

                {/* Address */}
                <SectionHeader icon={<MapPin size={14} color={colors.primary} />} label="Business Address" colors={colors} />
                <Field label="Street" value={sellerForm.street} onChangeText={sel('street')} placeholder="Street / Area" required colors={colors} />
                <View style={styles.rowFields}>
                  <View style={{ flex: 1 }}>
                    <Field label="City" value={sellerForm.city} onChangeText={sel('city')} placeholder="City" required colors={colors} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Field label="State" value={sellerForm.state} onChangeText={sel('state')} placeholder="State" required colors={colors} />
                  </View>
                </View>
                <Field label="Pincode" value={sellerForm.pincode} onChangeText={sel('pincode')} placeholder="6-digit pincode" keyboardType="number-pad" required colors={colors} />

                {/* Location */}
                <SectionHeader icon={<MapPin size={14} color={colors.primary} />} label="GPS Location (optional)" colors={colors} />
                <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                  Used to calculate accurate shipping fees for buyers. Open Google Maps, long-press your location, and copy the coordinates.
                </Text>
                <View style={styles.rowFields}>
                  <View style={{ flex: 1 }}>
                    <Field label="Latitude" value={sellerForm.latitude} onChangeText={sel('latitude')} placeholder="e.g. 28.6139" keyboardType="decimal-pad" colors={colors} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Field label="Longitude" value={sellerForm.longitude} onChangeText={sel('longitude')} placeholder="e.g. 77.2090" keyboardType="decimal-pad" colors={colors} />
                  </View>
                </View>
              </>
            )}
          </View>

          {/* Submit */}
          <LinearGradient colors={[...colors.gradientGold]} style={styles.submitBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <TouchableOpacity style={styles.submitInner} onPress={handleSubmit} disabled={submitting}>
              {submitting
                ? <ActivityIndicator color={colors.primaryForeground} />
                : <>
                    <Text style={[styles.submitText, { color: colors.primaryForeground }]}>
                      {isStoreOwner ? 'Register My Store' : 'Create Seller Profile'}
                    </Text>
                    <ChevronRight size={18} color={colors.primaryForeground} />
                  </>
              }
            </TouchableOpacity>
          </LinearGradient>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ── Section header helper ─────────────────────────────────────────────────────

const SectionHeader = ({ icon, label, colors }: { icon: React.ReactNode; label: string; colors: any }) => (
  <View style={[styles.sectionHeader, { borderBottomColor: colors.border }]}>
    {icon}
    <Text style={[styles.sectionLabel, { color: colors.foreground }]}>{label}</Text>
  </View>
);

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingBottom: 40, gap: 16 },
  heroBanner: { borderRadius: 20, padding: 24, alignItems: 'center', gap: 10, marginTop: 8 },
  heroTitle: { fontSize: 22, fontWeight: '800', fontStyle: 'italic', textAlign: 'center' },
  heroSub: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  card: { borderRadius: 20, borderWidth: 1, padding: 20, gap: 14 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingBottom: 10, borderBottomWidth: 1, marginBottom: 2 },
  sectionLabel: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  rowFields: { flexDirection: 'row', gap: 12 },
  input: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14 },
  inputMulti: { minHeight: 80, paddingTop: 10 },
  hint: { fontSize: 12, lineHeight: 18, marginTop: -6 },
  submitBtn: { borderRadius: 16 },
  submitInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15 },
  submitText: { fontSize: 16, fontWeight: '700' },
});

export default ShopSetupScreen;
