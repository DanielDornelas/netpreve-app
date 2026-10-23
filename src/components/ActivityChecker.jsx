import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../utils/theme';
import { ACTIVITIES, RECOMMENDATION_TITLES, describeError, formatDateTime, qualityInfo } from '../utils/formatters';

// Escolha de atividade + resultado de POST /activity/check.
// Todo o estado fica na HomeScreen; este componente só recebe props e avisa eventos.
export default function ActivityChecker({ selectedTime, activity, onSelectActivity, onCheck, loading, result, error }) {
  const disabled = !activity || loading;

  return (
    <View style={styles.box}>
      <Text style={styles.question}>O que você quer fazer em {formatDateTime(selectedTime)}?</Text>

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
              <Ionicons name={item.icon} size={16} color={selected ? '#FFFFFF' : COLORS.ink} />
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={onCheck}
        disabled={disabled}
        style={[styles.button, disabled && styles.buttonDisabled]}
        accessibilityRole="button"
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Verificar atividade</Text>
        )}
      </Pressable>

      {error && !loading && <Text style={styles.error}>{describeError(error)}</Text>}

      {result && !loading && !error && <ActivityResult result={result} />}
    </View>
  );
}

function ActivityResult({ result }) {
  const info = qualityInfo(result.forecast.quality);
  const color = result.suitable ? COLORS.good : COLORS.unstable;
  const soft = result.suitable ? COLORS.goodSoft : COLORS.unstableSoft;

  return (
    <View style={[styles.result, { backgroundColor: soft }]}>
      <Ionicons name={result.suitable ? 'checkmark-circle' : 'close-circle'} size={28} color={color} />
      <View style={styles.resultText}>
        <Text style={[styles.resultTitle, { color }]}>
          {result.suitable ? 'Bom momento para isso' : 'Melhor escolher outro horário'}
        </Text>
        <Text style={styles.resultDetail}>
          Qualidade prevista: {info.label}. {RECOMMENDATION_TITLES[result.recommendation.code] || ''}.
        </Text>
        <Text style={styles.resultDetail}>{result.recommendation.message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 18,
    gap: 14,
  },
  question: {
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: RADIUS.pill,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  chipSelected: {
    backgroundColor: COLORS.ink,
    borderColor: COLORS.ink,
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
    borderRadius: RADIUS.control,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.35,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  error: {
    color: COLORS.unstable,
    fontSize: 14,
  },
  result: {
    flexDirection: 'row',
    gap: 12,
    borderRadius: RADIUS.control,
    padding: 14,
  },
  resultText: {
    flex: 1,
    gap: 4,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  resultDetail: {
    color: COLORS.ink,
    fontSize: 14,
    lineHeight: 20,
  },
});
