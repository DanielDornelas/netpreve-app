import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import QualitySignal from './QualitySignal';
import { COLORS, formatHour, formatMs } from '../utils/formatters';

// Linha do tempo das próximas horas. Tocar em um horário o seleciona
// (o horário escolhido é usado na verificação de atividade).
export default function TimelineList({ items, selectedTime, onSelect }) {
  if (items.length === 0) {
    return <Text style={styles.empty}>Sem previsões futuras para este local.</Text>;
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list}>
      {items.map((item) => {
        const selected = item.predictionFor === selectedTime;
        return (
          <Pressable
            key={item.predictionFor}
            onPress={() => onSelect(item.predictionFor)}
            style={[styles.item, selected && styles.itemSelected]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            <Text style={[styles.hour, selected && styles.textSelected]}>{formatHour(item.predictionFor)}</Text>
            <View style={styles.signal}>
              <QualitySignal quality={item.quality} size="small" />
            </View>
            <Text style={[styles.rtt, selected && styles.textSelected]}>{formatMs(item.predictedAvgRttMs)}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
    paddingVertical: 4,
  },
  item: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    minWidth: 64,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  itemSelected: {
    borderColor: COLORS.primary,
  },
  hour: {
    color: COLORS.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  signal: {
    marginVertical: 6,
  },
  rtt: {
    color: COLORS.muted,
    fontSize: 12,
  },
  textSelected: {
    color: COLORS.primary,
  },
  empty: {
    color: COLORS.muted,
    fontSize: 14,
  },
});
