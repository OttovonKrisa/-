/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Station {
  id: string;
  name: string;
  lat: number;
  lon: number;
  shortInfo: string;
  fullInfo: string;
  type: 'rosatom' | 'tpu' | 'joint';
  city?: string;
  createdAt: number;
}

export interface SecurityConfig {
  isAdmin: boolean;
  masterPasswordHash?: string;
}

export interface SystemState {
  currentTheme: 'rosatom' | 'tpu';
  screenPowerOff: boolean; // True when local time is strictly >= 22:00 or < 06:00
  sleepStart: string; // "22:00" default
  sleepEnd: string;   // "06:00" default
}
