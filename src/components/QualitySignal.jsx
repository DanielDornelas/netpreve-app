import { StyleSheet, View } from 'react-native';
import { COLORS } from '../utils/theme';
import { qualityInfo } from '../utils/formatters';

const SIZES = {
  hero: { heights: [22, 38, 54], width: 14 },
  medium: { heights: [10, 16, 22], width: 6 },
  small: { heights: [6, 10, 14], width: 4 },
};

// Barrinhas de sinal: 3 para Boa, 2 para Moderada, 1 para Instável.
// tone="light" desenha em branco, para ficar sobre o fundo colorido do cartão principal.
export default function QualitySignal({ quality, size = 'medium', tone = 'color' }) {
  const info = qualityInfo(quality);
  const { heights, width } = SIZES[size] || SIZES.medium;
  const on = tone === 'light' ? '#FFFFFF' : info.color;
  const off = tone === 'light' ? 'rgba(255,255,255,0.35)' : COLORS.line;

  return (
    <View style={styles.row} accessibilityLabel={`Qualidade ${info.label}`}>
      {heights.map((height, index) => (
        <View
          key={height}
          style={{ height, width, borderRadius: width / 2, backgroundColor: index < info.bars ? on : off }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
});
