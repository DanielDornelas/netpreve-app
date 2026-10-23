import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../utils/theme';
import { bestTimelineItem, formatDateTime, formatMs, qualityInfo } from '../utils/formatters';

// Destaca o melhor horário da linha do tempo (melhor qualidade, depois menor tempo de resposta).
// Usa só os dados que a timeline já trouxe: nenhuma chamada nova à API.
export default function BestTimeHint({ items, selectedTime, onSelect }) {
  const best = bestTimelineItem(items);
  if (!best) {
    return null;
  }

  const info = qualityInfo(best.quality);
  const isSelected = best.predictionFor === selectedTime;

  return (
    <View style={[styles.box, { backgroundColor: info.soft }]}>
      <Ionicons name="star" size={18} color={info.color} />
      <View style={styles.text}>
        <Text style={styles.title}>Melhor horário: {formatDateTime(best.predictionFor)}</Text>
        <Text style={styles.detail}>
          Qualidade {info.label.toLowerCase()}, {formatMs(best.predictedAvgRttMs)} de tempo de resposta
        </Text>
      </View>
      {isSelected ? (
        <Ionicons name="checkmark-circle" size={22} color={info.color} accessibilityLabel="Horário selecionado" />
      ) : (
        <Pressable
          onPress={() => onSelect(best.predictionFor)}
          style={[styles.action, { borderColor: info.color }]}
          accessibilityRole="button"
        >
          <Text style={[styles.actionText, { color: info.color }]}>Selecionar</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: RADIUS.card,
    padding: 14,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: COLORS.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  detail: {
    color: COLORS.ink,
    fontSize: 13,
  },
  action: {
    borderWidth: 1,
    borderRadius: RADIUS.pill,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
