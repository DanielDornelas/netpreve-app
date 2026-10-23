import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../utils/theme';

// Tela de estado: carregando, erro ou vazio. Sempre diz o que aconteceu e o que fazer.
export default function StatusMessage({ title, message, loading = false, icon, actions = [] }) {
  return (
    <View style={styles.box}>
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : (
        icon && (
          <View style={styles.iconCircle}>
            <Ionicons name={icon} size={28} color={COLORS.primary} />
          </View>
        )
      )}
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actions.length > 0 && (
        <View style={styles.actions}>
          {actions.map((action) => (
            <Pressable
              key={action.label}
              onPress={action.onPress}
              style={[styles.button, action.secondary && styles.buttonSecondary]}
              accessibilityRole="button"
            >
              <Text style={[styles.buttonText, action.secondary && styles.buttonTextSecondary]}>{action.label}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: COLORS.ink,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    color: COLORS.muted,
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
  },
  actions: {
    alignSelf: 'stretch',
    gap: 8,
    marginTop: 8,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.control,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonTextSecondary: {
    color: COLORS.ink,
  },
});
