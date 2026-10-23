import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS } from '../utils/theme';
import { formatDay, formatHour, qualityInfo } from '../utils/formatters';

const TRACK_HEIGHT = 54;
const COLUMN_WIDTH = 60; // largura da coluna + espaço entre colunas

// Linha do tempo como um pequeno gráfico de colunas: quanto mais alta e verde a coluna,
// melhor a conexão prevista. Tocar numa coluna seleciona o horário.
export default function TimelineList({ items, selectedTime, onSelect }) {
  const scrollRef = useRef(null);

  // Rola a faixa até o horário selecionado, para ele ficar sempre à vista.
  useEffect(() => {
    const index = items.findIndex((item) => item.predictionFor === selectedTime);
    if (index >= 0 && scrollRef.current) {
      scrollRef.current.scrollTo({ x: Math.max(0, index * COLUMN_WIDTH - COLUMN_WIDTH * 2), animated: true });
    }
  }, [items, selectedTime]);

  if (items.length === 0) {
    return <Text style={styles.empty}>Sem previsões para este local.</Text>;
  }

  return (
    <ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list}>
      {items.map((item, index) => {
        const info = qualityInfo(item.quality);
        const selected = item.predictionFor === selectedTime;
        const day = formatDay(item.predictionFor);
        const showDay = index === 0 || formatDay(items[index - 1].predictionFor) !== day;

        return (
          <View key={item.predictionFor} style={styles.column}>
            <Text style={styles.day}>{showDay ? day : ' '}</Text>
            <Pressable
              onPress={() => onSelect(item.predictionFor)}
              style={[styles.item, selected && styles.itemSelected]}
              accessibilityRole="button"
              accessibilityLabel={`${formatHour(item.predictionFor)}, qualidade ${info.label}`}
              accessibilityState={{ selected }}
            >
              <View style={styles.track}>
                <View
                  style={[
                    styles.bar,
                    { height: (TRACK_HEIGHT * info.bars) / 3, backgroundColor: info.color },
                  ]}
                />
              </View>
              <Text style={[styles.hour, selected && styles.textSelected]}>{formatHour(item.predictionFor)}</Text>
              <Text style={[styles.rtt, selected && styles.textSelected]}>{Math.round(item.predictedAvgRttMs)} ms</Text>
            </Pressable>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 6,
    paddingVertical: 2,
  },
  column: {
    alignItems: 'center',
  },
  day: {
    color: COLORS.muted,
    fontSize: 11,
    marginBottom: 4,
  },
  item: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    width: 54,
    borderRadius: RADIUS.control,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    gap: 4,
  },
  itemSelected: {
    backgroundColor: COLORS.ink,
    borderColor: COLORS.ink,
  },
  track: {
    height: TRACK_HEIGHT,
    width: 10,
    borderRadius: 5,
    backgroundColor: COLORS.background,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: 10,
    borderRadius: 5,
  },
  hour: {
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  rtt: {
    color: COLORS.muted,
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
  textSelected: {
    color: '#FFFFFF',
  },
  empty: {
    color: COLORS.muted,
    fontSize: 14,
  },
});
