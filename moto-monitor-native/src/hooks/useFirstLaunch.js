// ═══════════════════════════════════════════════════════════════════════════════
// useFirstLaunch.js — Detecta si es la primera vez que se abre la app
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FIRST_LAUNCH_KEY = 'moto_monitor_first_launch';

export function useFirstLaunch() {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(FIRST_LAUNCH_KEY)
      .then((value) => {
        setIsFirstLaunch(value === null);
      })
      .catch(() => setIsFirstLaunch(false));
  }, []);

  const completeFirstLaunch = async () => {
    await AsyncStorage.setItem(FIRST_LAUNCH_KEY, 'done');
    setIsFirstLaunch(false);
  };

  return { isFirstLaunch, completeFirstLaunch };
}