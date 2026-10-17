import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  ACTIVITIES,
  COLORS,
  RECOMMENDATION_TITLES,
  describeError,
  formatDateTime,
  qualityInfo,
} from '../utils/formatters';

// Escolha de atividade + resultado de POST /activity/check.
// Todo o estado fica na HomeScreen; este componente só recebe props e avisa eventos.
export default function ActivityChecker({
  selectedTime,
  activity,
  onSelectActivity,
  onCheck,
  loading,
  result,
  error,
}) {
  return (
    <View style={styles.box}>
      <Text style={styles.question}>O que você quer fazer às {formatDateTime(selectedTime)}?</Text>

      <View style={styles.chips}>
        {ACTIVITIES.map((item) => {
          const selected = item.code === activity;
          return (
            <Pressable
              key={item.code}
              onPress={() => onSelectActivity(item.code)}
              style={[styles.chip, selected && styles.chipSelected]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={onCheck}
        disabled={!activity || loading}
        style={[styles.button, (!activity || loading) && styles.buttonDisabled]}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Verificar atividade</Text>
      </Pressable>

      {loading && <ActivityIndicator style={styles.loading} color={COLORS.primary} />}

      {error && !loading && <Text style={styles.error}>{describeError(error)}</Text>}

      {result && !loading && !error && <ActivityResult result={result} />}
    </View>
  );
}

function ActivityResult({ result }) {
  const info = qualityInfo(result.forecast.quality);
  return (
    <View style={[styles.result, { borderLeftColor: result.suitable ? COLORS.good : COLORS.unstable }]}>
      <Text style={styles.resultTitle}>
        {result.suitable ? 'Bom momento para isso' : 'Melhor escolher outro horário'}
      </Text>
      <Text style={styles.resultText}>
        Qualidade prevista: {info.label}. {RECOMMENDATION_TITLES[result.recommendation.code] || ''}
      </Text>
      <Text style={styles.resultText}>{result.recommendation.message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
  },
  question: {
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.ink,
    fontSize: 14,
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loading: {
    marginTop: 12,
  },
  error: {
    color: COLORS.unstable,
    fontSize: 14,
    marginTop: 12,
  },
  result: {
    borderLeftWidth: 4,
    paddingLeft: 12,
    marginTop: 16,
    gap: 4,
  },
  resultTitle: {
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  resultText: {
    color: COLORS.ink,
    fontSize: 14,
    lineHeight: 20,
  },
});
