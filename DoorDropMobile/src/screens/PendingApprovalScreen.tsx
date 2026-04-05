import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, ShoppingBag, RefreshCw } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import apiClient from '../api/apiClient';
import { NearbyStoreResponse } from '../api/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const PendingApprovalScreen = () => {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const s = makeStyles(colors);
  const [checking, setChecking] = useState(false);

  const checkApproval = async () => {
    setChecking(true);
    try {
      const { data } = await apiClient.get<NearbyStoreResponse>('/api/stores/my');
      if (data.isApproved) {
        navigation.replace('StoreAdmin');
      } else {
        // Still pending — no-op, user sees the same screen
      }
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404 || status === 409) {
        navigation.replace('ShopSetup');
      }
    } finally {
      setChecking(false);
    }
  };

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {/* Illustration area */}
      <View style={s.topSection}>
        <LinearGradient
          colors={[...colors.gradientGold]}
          style={s.iconCircle}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Clock size={44} color={colors.primaryForeground} />
        </LinearGradient>

        <Text style={[s.heading, { color: colors.foreground }]}>
          Store Under Review
        </Text>
        <Text style={[s.sub, { color: colors.mutedForeground }]}>
          Your store has been submitted successfully. Our team will review your details and approve it shortly.
        </Text>
        <Text style={[s.sub2, { color: colors.mutedForeground }]}>
          This usually takes 24–48 hours.
        </Text>
      </View>

      {/* Steps */}
      <View style={[s.stepsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {[
          { step: '1', label: 'Store details submitted', done: true },
          { step: '2', label: 'Admin review in progress', done: false },
          { step: '3', label: 'Store approved & dashboard unlocked', done: false },
        ].map(({ step, label, done }) => (
          <View key={step} style={s.stepRow}>
            <View style={[s.stepDot, { backgroundColor: done ? colors.primary : colors.border }]}>
              <Text style={[s.stepNum, { color: done ? colors.primaryForeground : colors.mutedForeground }]}>
                {step}
              </Text>
            </View>
            <Text style={[s.stepLabel, { color: done ? colors.foreground : colors.mutedForeground }]}>
              {label}
            </Text>
          </View>
        ))}
      </View>

      {/* Actions */}
      <View style={s.actions}>
        {/* Check status */}
        <TouchableOpacity
          style={[s.checkBtn, { borderColor: colors.primary + '60', backgroundColor: colors.primary + '10' }]}
          onPress={checkApproval}
          disabled={checking}
        >
          {checking
            ? <ActivityIndicator size="small" color={colors.primary} />
            : <RefreshCw size={16} color={colors.primary} />
          }
          <Text style={[s.checkBtnText, { color: colors.primary }]}>
            {checking ? 'Checking...' : 'Check Approval Status'}
          </Text>
        </TouchableOpacity>

        {/* Browse as customer */}
        <LinearGradient
          colors={[...colors.gradientGold]}
          style={s.browseBtn}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity style={s.browseBtnInner} onPress={() => navigation.navigate('Home')}>
            <ShoppingBag size={18} color={colors.primaryForeground} />
            <Text style={[s.browseBtnText, { color: colors.primaryForeground }]}>
              Browse as Customer
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        <Text style={[s.note, { color: colors.mutedForeground }]}>
          You can shop while you wait. Your store dashboard will unlock once approved.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 24 },
    topSection: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
    iconCircle: {
      width: 100, height: 100, borderRadius: 50,
      alignItems: 'center', justifyContent: 'center', marginBottom: 8,
    },
    heading: { fontSize: 24, fontWeight: '800', fontStyle: 'italic', textAlign: 'center' },
    sub: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
    sub2: { fontSize: 13, textAlign: 'center' },
    stepsCard: {
      borderRadius: 20, borderWidth: 1, padding: 20, gap: 16, marginBottom: 24,
    },
    stepRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    stepDot: {
      width: 30, height: 30, borderRadius: 15,
      alignItems: 'center', justifyContent: 'center',
    },
    stepNum: { fontSize: 13, fontWeight: '700' },
    stepLabel: { fontSize: 14, flex: 1 },
    actions: { gap: 12, paddingBottom: 16 },
    checkBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 8, paddingVertical: 13, borderRadius: 14, borderWidth: 1,
    },
    checkBtnText: { fontSize: 14, fontWeight: '600' },
    browseBtn: { borderRadius: 16 },
    browseBtnInner: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 10, paddingVertical: 15,
    },
    browseBtnText: { fontSize: 16, fontWeight: '700' },
    note: { fontSize: 12, textAlign: 'center', lineHeight: 18 },
  });

export default PendingApprovalScreen;
