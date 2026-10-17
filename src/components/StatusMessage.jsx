import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../utils/formatters';

// Tela de estado: carregando, erro ou vazio. Sempre diz o que aconteceu e o que fazer.
export default function StatusMessage({ title, message, loading = false, actions = [] }) {
  return (
    <View style={styles.box}>
      {loading && <ActivityIndicator size="large" color={COLORS.primary} style={styles.spinner} />}
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}
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
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'stretch',
  },
  spinner: {
    marginBottom: 16,
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
    marginTop: 8,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.line,
    marginTop: 8,
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
