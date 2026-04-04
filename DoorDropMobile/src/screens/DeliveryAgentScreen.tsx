import React, { useEffect, useCallback, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, Animated, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Package, CheckCircle, Clock, Truck,
  Navigation, MapPin, Phone, LogOut, RefreshCw, User,
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import { LiveTrackingResponse, DeliveryStatus } from '../api/types';

// ── Status steps definition ───────────────────────────────────────────────────

type Step = {
  status: DeliveryStatus;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  color: string;
  actionLabel: string;
};

const STEPS: Step[] = [
  {
    status: 'ASSIGNED',
    label: 'Order Assigned',
    sublabel: 'You have a new delivery',
    icon: Clock,
    color: '#FB923C',
    actionLabel: 'Head to Store →',
  },
  {
    status: 'HEADING_TO_STORE',
    label: 'Heading to Store',
    sublabel: 'On the way to pick up the order',
    icon: Navigation,
    color: '#60A5FA',
    actionLabel: 'Confirm Pickup →',
  },
  {
    status: 'PICKED_UP',
    label: 'Order Picked Up',
    sublabel: 'Collected from store, heading to customer',
    icon: Package,
    color: '#A78BFA',
    actionLabel: 'Start Delivery →',
  },
  {
    status: 'OUT_FOR_DELIVERY',
    label: 'Out for Delivery',
    sublabel: 'Almost there! En route to customer',
    icon: Truck,
    color: '#F59E0B',
    actionLabel: 'Mark as Delivered ✓',
  },
  {
    status: 'DELIVERED',
    label: 'Delivered',
    sublabel: 'Order successfully handed over',
    icon: CheckCircle,
    color: '#4ADE80',
    actionLabel: '',
  },
];

// ── FadeIn helper ─────────────────────────────────────────────────────────────

const FadeIn = ({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: object }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>{children}</Animated.View>;
};

// ── DeliveryAgentScreen ───────────────────────────────────────────────────────

const DeliveryAgentScreen = () => {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const s = makeStyles(colors);

  const [tracking, setTracking] = useState<LiveTrackingResponse | null>(null);
  const [currentStatus, setCurrentStatus] = useState<DeliveryStatus>('ASSIGNED');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const currentStepIndex = STEPS.findIndex(s => s.status === currentStatus);
  const currentStep = STEPS[currentStepIndex] ?? STEPS[0];
  const nextStep = STEPS[currentStepIndex + 1] ?? null;

  // ── Fetch active assignment ───────────────────────────────────────────────

  const fetchAssignment = useCallback(async () => {
    try {
      const res = await apiClient.get<LiveTrackingResponse>('/api/tracking/my-assignment');
      setTracking(res.data);
      setCurrentStatus(res.data.deliveryStatus);
    } catch (err: any) {
      if (err?.response?.status !== 404) {
        Alert.alert('Error', 'Could not load your assignment.');
      }
      setTracking(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAssignment(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchAssignment(); };

  // ── Advance status ────────────────────────────────────────────────────────

  const advanceStatus = async () => {
    if (!nextStep) return;
    setUpdatingStatus(true);
    try {
      await apiClient.patch('/api/tracking/status', null, { params: { status: nextStep.status } });
      setCurrentStatus(nextStep.status);
      if (nextStep.status === 'DELIVERED') setTracking(null);
    } catch {
      Alert.alert('Error', 'Could not update status. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <View style={[s.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <LinearGradient colors={[...colors.gradientGold]} style={s.avatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={[s.avatarText, { color: colors.primaryForeground }]}>
              {user?.name?.[0]?.toUpperCase() ?? 'D'}
            </Text>
          </LinearGradient>
          <View>
            <Text style={[s.headerTitle, { color: colors.foreground }]}>Delivery Agent</Text>
            <Text style={[s.headerSub, { color: colors.mutedForeground }]}>{user?.name}</Text>
          </View>
        </View>
        <View style={s.headerActions}>
          <TouchableOpacity onPress={onRefresh} style={[s.iconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <RefreshCw size={16} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={logout} style={[s.iconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <LogOut size={16} color={colors.destructive} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* ── No active assignment ── */}
        {!tracking ? (
          <FadeIn style={s.idleContainer}>
            <View style={[s.idleIconBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={{ fontSize: 52 }}>🛵</Text>
            </View>
            <Text style={[s.idleTitle, { color: colors.foreground }]}>No active delivery</Text>
            <Text style={[s.idleSub, { color: colors.mutedForeground }]}>
              You'll be assigned automatically when a new order comes in nearby.
            </Text>
            <TouchableOpacity
              onPress={onRefresh}
              style={[s.checkBtn, { borderColor: colors.primary }]}
            >
              <RefreshCw size={14} color={colors.primary} />
              <Text style={[s.checkBtnText, { color: colors.primary }]}>Check for assignments</Text>
            </TouchableOpacity>
          </FadeIn>
        ) : (
          <>
            {/* ── Current status banner ── */}
            <FadeIn delay={0}>
              <LinearGradient
                colors={[...colors.gradientGold]}
                style={s.statusBanner}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <currentStep.icon size={28} color={colors.primaryForeground} />
                <View style={{ flex: 1 }}>
                  <Text style={[s.bannerStatus, { color: colors.primaryForeground }]}>{currentStep.label}</Text>
                  <Text style={[s.bannerSub, { color: colors.primaryForeground + 'CC' }]}>{currentStep.sublabel}</Text>
                </View>
              </LinearGradient>
            </FadeIn>

            {/* ── Order Info ── */}
            <FadeIn delay={80}>
              <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[s.cardTitle, { color: colors.mutedForeground }]}>ORDER DETAILS</Text>
                <Text style={[s.orderNumber, { color: colors.foreground }]}>{tracking.orderNumber}</Text>

                <View style={[s.divider, { backgroundColor: colors.border }]} />

                {/* Customer info */}
                <View style={s.infoRow}>
                  <View style={[s.infoIcon, { backgroundColor: colors.primary + '20' }]}>
                    <User size={15} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.infoLabel, { color: colors.mutedForeground }]}>Customer</Text>
                    <Text style={[s.infoValue, { color: colors.foreground }]}>{tracking.agentName}</Text>
                  </View>
                  <TouchableOpacity style={[s.callBtn, { borderColor: colors.primary }]}>
                    <Phone size={14} color={colors.primary} />
                    <Text style={[s.callBtnText, { color: colors.primary }]}>{tracking.agentPhone}</Text>
                  </TouchableOpacity>
                </View>

                {/* Delivery address */}
                <View style={s.infoRow}>
                  <View style={[s.infoIcon, { backgroundColor: colors.primary + '20' }]}>
                    <MapPin size={15} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.infoLabel, { color: colors.mutedForeground }]}>Delivery address</Text>
                    <Text style={[s.infoValue, { color: colors.foreground }]}>
                      {tracking.destinationLatitude.toFixed(4)}, {tracking.destinationLongitude.toFixed(4)}
                    </Text>
                  </View>
                </View>

                {/* ETA */}
                <View style={s.infoRow}>
                  <View style={[s.infoIcon, { backgroundColor: colors.primary + '20' }]}>
                    <Clock size={15} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.infoLabel, { color: colors.mutedForeground }]}>Estimated time</Text>
                    <Text style={[s.infoValue, { color: colors.foreground }]}>
                      {tracking.estimatedMinutes} min · {tracking.distanceRemainingKm.toFixed(1)} km
                    </Text>
                  </View>
                </View>
              </View>
            </FadeIn>

            {/* ── Status progress stepper ── */}
            <FadeIn delay={160}>
              <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[s.cardTitle, { color: colors.mutedForeground }]}>DELIVERY PROGRESS</Text>
                <View style={s.stepper}>
                  {STEPS.map((step, i) => {
                    const done = i < currentStepIndex;
                    const active = i === currentStepIndex;
                    const upcoming = i > currentStepIndex;
                    return (
                      <View key={step.status} style={s.stepRow}>
                        {/* Left: dot + connector line */}
                        <View style={s.stepTrack}>
                          <View style={[
                            s.stepDot,
                            {
                              backgroundColor: done ? step.color : active ? step.color : colors.surfaceElevated,
                              borderColor: done || active ? step.color : colors.border,
                              borderWidth: upcoming ? 1.5 : 0,
                            },
                          ]}>
                            {done
                              ? <CheckCircle size={14} color="#fff" />
                              : <step.icon size={14} color={active ? '#fff' : colors.border} />
                            }
                          </View>
                          {i < STEPS.length - 1 && (
                            <View style={[
                              s.stepLine,
                              { backgroundColor: done ? step.color : colors.border },
                            ]} />
                          )}
                        </View>

                        {/* Right: text */}
                        <View style={s.stepContent}>
                          <Text style={[
                            s.stepLabel,
                            {
                              color: active ? colors.foreground : done ? colors.mutedForeground : colors.border,
                              fontWeight: active ? '700' : '400',
                            },
                          ]}>
                            {step.label}
                          </Text>
                          {active && (
                            <Text style={[s.stepSublabel, { color: colors.mutedForeground }]}>
                              {step.sublabel}
                            </Text>
                          )}
                        </View>

                        {/* Active badge */}
                        {active && (
                          <View style={[s.activeBadge, { backgroundColor: step.color + '20' }]}>
                            <Text style={[s.activeBadgeText, { color: step.color }]}>Now</Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            </FadeIn>

            {/* ── Action button ── */}
            <FadeIn delay={240}>
              {currentStatus === 'DELIVERED' ? (
                <View style={[s.deliveredCard, { backgroundColor: '#4ADE8015', borderColor: '#4ADE80' }]}>
                  <CheckCircle size={28} color="#4ADE80" />
                  <View>
                    <Text style={[s.deliveredTitle, { color: '#4ADE80' }]}>Delivered!</Text>
                    <Text style={[s.deliveredSub, { color: colors.mutedForeground }]}>
                      Great job! Pull down to check for new assignments.
                    </Text>
                  </View>
                </View>
              ) : nextStep ? (
                <LinearGradient colors={[...colors.gradientGold]} style={s.actionBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <TouchableOpacity
                    style={s.actionBtnInner}
                    onPress={advanceStatus}
                    disabled={updatingStatus}
                  >
                    {updatingStatus
                      ? <ActivityIndicator color={colors.primaryForeground} />
                      : <>
                          <currentStep.icon size={20} color={colors.primaryForeground} />
                          <Text style={[s.actionBtnText, { color: colors.primaryForeground }]}>
                            {currentStep.actionLabel}
                          </Text>
                        </>
                    }
                  </TouchableOpacity>
                </LinearGradient>
              ) : null}
            </FadeIn>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: 16, paddingBottom: 40, gap: 14 },
  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '800' },
  headerTitle: { fontSize: 18, fontWeight: '700', fontStyle: 'italic' },
  headerSub: { fontSize: 12, marginTop: 1 },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  // Idle
  idleContainer: { alignItems: 'center', paddingTop: 60, gap: 16 },
  idleIconBox: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  idleTitle: { fontSize: 20, fontWeight: '700' },
  idleSub: { fontSize: 14, textAlign: 'center', lineHeight: 22, paddingHorizontal: 24 },
  checkBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10, marginTop: 4 },
  checkBtnText: { fontSize: 14, fontWeight: '600' },
  // Status banner
  statusBanner: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 18, padding: 18 },
  bannerStatus: { fontSize: 17, fontWeight: '700' },
  bannerSub: { fontSize: 12, marginTop: 2 },
  // Card
  card: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 12 },
  cardTitle: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  orderNumber: { fontSize: 18, fontWeight: '800', marginTop: -4 },
  divider: { height: 1 },
  // Info rows
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  infoLabel: { fontSize: 10, fontWeight: '600', marginBottom: 1 },
  infoValue: { fontSize: 13, fontWeight: '500' },
  callBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  callBtnText: { fontSize: 12, fontWeight: '600' },
  // Stepper
  stepper: { gap: 0 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, minHeight: 48 },
  stepTrack: { alignItems: 'center', width: 28 },
  stepDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  stepLine: { width: 2, flex: 1, minHeight: 8, marginVertical: 3 },
  stepContent: { flex: 1, paddingTop: 4 },
  stepLabel: { fontSize: 14 },
  stepSublabel: { fontSize: 11, marginTop: 2 },
  activeBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginTop: 4 },
  activeBadgeText: { fontSize: 10, fontWeight: '700' },
  // Action button
  actionBtn: { borderRadius: 18 },
  actionBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
  actionBtnText: { fontSize: 16, fontWeight: '700' },
  // Delivered
  deliveredCard: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 18, borderWidth: 1, padding: 18 },
  deliveredTitle: { fontSize: 17, fontWeight: '700' },
  deliveredSub: { fontSize: 12, marginTop: 2 },
});

export default DeliveryAgentScreen;
