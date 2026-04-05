import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';

// ── Screens ───────────────────────────────────────────────────────────────────
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import CartScreen from '../screens/CartScreen';
import AccountScreen from '../screens/AccountScreen';
import AdminScreen from '../screens/AdminScreen';
import SellerDashboardScreen from '../screens/SellerDashboardScreen';
import DeliveryAgentScreen from '../screens/DeliveryAgentScreen';
import ShopSetupScreen from '../screens/ShopSetupScreen';
import PendingApprovalScreen from '../screens/PendingApprovalScreen';

// ── Param lists (exported so screens can import them) ─────────────────────────

export type RootStackParamList = {
  Home: undefined;
  Cart: undefined;
  Account: undefined;
  StoreAdmin: undefined;
  ShopSetup: undefined;
  PendingApproval: undefined;
  SellerDashboard: undefined;
  DeliveryAgent: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type CustomerStackParamList = {
  Home: undefined;
  Cart: undefined;
  Account: undefined;
};

export type StoreOwnerStackParamList = {
  StoreAdmin: undefined;
  ShopSetup: undefined;
  PendingApproval: undefined;
  Account: undefined;
  Home: undefined;
  Cart: undefined;
};

export type SellerStackParamList = {
  SellerDashboard: undefined;
  ShopSetup: undefined;
  Account: undefined;
};

export type DeliveryStackParamList = {
  DeliveryAgent: undefined;
};

// ── Navigators ────────────────────────────────────────────────────────────────

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const CustomerStack = createNativeStackNavigator<CustomerStackParamList>();
const StoreOwnerStack = createNativeStackNavigator<StoreOwnerStackParamList>();
const SellerStack = createNativeStackNavigator<SellerStackParamList>();
const DeliveryStack = createNativeStackNavigator<DeliveryStackParamList>();

// ── Auth flow ─────────────────────────────────────────────────────────────────

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

// ── CUSTOMER flow ─────────────────────────────────────────────────────────────

const CustomerNavigator = () => (
  <CustomerStack.Navigator screenOptions={{ headerShown: false }}>
    <CustomerStack.Screen name="Home" component={HomeScreen} />
    <CustomerStack.Screen name="Cart" component={CartScreen} />
    <CustomerStack.Screen name="Account" component={AccountScreen} />
  </CustomerStack.Navigator>
);

// ── STORE_OWNER flow ──────────────────────────────────────────────────────────

const StoreOwnerNavigator = () => (
  <StoreOwnerStack.Navigator screenOptions={{ headerShown: false }}>
    <StoreOwnerStack.Screen name="StoreAdmin" component={AdminScreen} />
    <StoreOwnerStack.Screen name="ShopSetup" component={ShopSetupScreen} />
    <StoreOwnerStack.Screen name="PendingApproval" component={PendingApprovalScreen} />
    <StoreOwnerStack.Screen name="Account" component={AccountScreen} />
    <StoreOwnerStack.Screen name="Home" component={HomeScreen} />
    <StoreOwnerStack.Screen name="Cart" component={CartScreen} />
  </StoreOwnerStack.Navigator>
);

// ── SELLER flow ───────────────────────────────────────────────────────────────

const SellerNavigator = () => (
  <SellerStack.Navigator screenOptions={{ headerShown: false }}>
    <SellerStack.Screen name="SellerDashboard" component={SellerDashboardScreen} />
    <SellerStack.Screen name="ShopSetup" component={ShopSetupScreen} />
    <SellerStack.Screen name="Account" component={AccountScreen} />
  </SellerStack.Navigator>
);

// ── DELIVERY_AGENT flow ───────────────────────────────────────────────────────

const DeliveryNavigator = () => (
  <DeliveryStack.Navigator screenOptions={{ headerShown: false }}>
    <DeliveryStack.Screen name="DeliveryAgent" component={DeliveryAgentScreen} />
  </DeliveryStack.Navigator>
);

// ── Root navigator — picks stack based on auth + role ─────────────────────────

const AppNavigator = () => {
  const { user, isLoading } = useAuth();
  const { colors } = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const renderAppStack = () => {
    if (!user) return <AuthNavigator />;

    switch (user.role) {
      case 'STORE_OWNER':
        return <StoreOwnerNavigator />;
      case 'SELLER':
        return <SellerNavigator />;
      case 'DELIVERY_AGENT':
        return <DeliveryNavigator />;
      case 'CUSTOMER':
      default:
        return <CustomerNavigator />;
    }
  };

  return (
    <NavigationContainer>
      {renderAppStack()}
    </NavigationContainer>
  );
};

export default AppNavigator;
