import { Platform } from 'react-native';

/**
 * Base API URL selector.
 *
 * DEV options:
 *   a) Android Emulator  → 10.0.2.2 maps to your computer's localhost
 *   b) iOS Simulator     → localhost works directly
 *   c) Real device       → set your computer's local IP (e.g. 192.168.1.5)
 *
 * PROD: set EXPO_PUBLIC_API_URL in your .env or Northflank env vars.
 *
 * To switch between (a), (b), (c) while testing, change DEV_TARGET below.
 */

type DevTarget = 'emulator' | 'simulator' | 'device';

// ── Change this to match how you're testing ─────────────────────────────────
const DEV_TARGET: DevTarget = 'emulator';

// ── Your computer's local IP when testing on a real device ──────────────────
const LOCAL_DEVICE_IP = '192.168.1.5'; // <-- update this to your machine's IP

// ── Production URL (fill in after Northflank deployment) ────────────────────
const PROD_URL = 'https://YOUR_SERVICE.northflank.app';

// ── Resolved base URL ────────────────────────────────────────────────────────
function resolveBaseUrl(): string {
  if (!__DEV__) return PROD_URL;

  switch (DEV_TARGET) {
    case 'emulator':
      // Android emulator routes 10.0.2.2 → host machine localhost
      return Platform.OS === 'android'
        ? 'http://10.0.2.2:8080'
        : 'http://localhost:8080';
    case 'simulator':
      return 'http://localhost:8080';
    case 'device':
      return `http://${LOCAL_DEVICE_IP}:8080`;
  }
}

export const API_BASE_URL = resolveBaseUrl();
