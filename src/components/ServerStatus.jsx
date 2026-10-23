import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getHealth } from '../services/forecastApi';
import { COLORS, RADIUS } from '../utils/theme';

const CHECK_INTERVAL_MS = 30000;

const STATES = {
  checking: { label: 'Conectando', color: COLORS.moderate },
  online: { label: 'Servidor conectado', color: COLORS.good },
  offline: { label: 'Sem conexão', color: COLORS.unstable },
};

// Indicador de conexão com a API (GET /api/v1/health), conferido a cada 30 segundos.
// Tocar nele força uma nova verificação.
export default function ServerStatus() {
  const [status, setStatus] = useState('checking');

  async function check() {
    try {
      const data = await getHealth();
      setStatus(data && data.status === 'ok' ? 'online' : 'offline');
    } catch {
      setStatus('offline');
    }
  }

  useEffect(() => {
    check();
    const timer = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  const state = STATES[status];

  return (
    <Pressable
      onPress={() => {
        setStatus('checking');
        check();
      }}
      style={styles.pill}
      accessibilityRole="button"
      accessibilityLabel={`${state.label}. Toque para verificar de novo.`}
    >
      <View style={[styles.dot, { backgroundColor: state.color }]} />
      <Text style={styles.text}>{state.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.pill,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  text: {
    color: COLORS.ink,
    fontSize: 12,
    fontWeight: '600',
  },
});
