import { Pressable, StyleSheet, Text, View } from 'react-native';
import QualitySignal from './QualitySignal';
import { COLORS, bestTimelineItem, formatDateTime, formatMs, qualityInfo } from '../utils/formatters';

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
    <View style={[styles.box, { borderLeftColor: info.color }]}>
      <View style={styles.row}>
        <QualitySignal quality={best.quality} size="small" />
        <Text style={styles.title}>Melhor horário: {formatDateTime(best.predictionFor)}</Text>
      </View>
      <Text style={styles.text}>
        Qualidade {info.label.toLowerCase()}, com tempo de resposta de {formatMs(best.predictedAvgRttMs)}.
      </Text>
      {isSelected ? (
        <Text style={styles.selected}>Este é o horário selecionado.</Text>
      ) : (
        <Pressable onPress={() => onSelect(best.predictionFor)} accessibilityRole="button">
          <Text style={styles.action}>Selecionar este horário</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 14,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: COLORS.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  text: {
    color: COLORS.ink,
    fontSize: 14,
  },
  action: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  selected: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 4,
  },
});
