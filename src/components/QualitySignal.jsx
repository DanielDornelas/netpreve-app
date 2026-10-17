import { StyleSheet, View } from 'react-native';
import { COLORS, qualityInfo } from '../utils/formatters';

// Barrinhas de sinal: 3 para Boa, 2 para Moderada, 1 para Instável.
export default function QualitySignal({ quality, size = 'large' }) {
  const info = qualityInfo(quality);
  const heights = size === 'large' ? [18, 32, 46] : [6, 10, 14];
  const width = size === 'large' ? 12 : 4;

  return (
    <View style={styles.row} accessibilityLabel={`Qualidade ${info.label}`}>
      {heights.map((height, index) => (
        <View
          key={height}
          style={[
            styles.bar,
            {
              height,
              width,
              borderRadius: width / 2,
              backgroundColor: index < info.bars ? info.color : COLORS.line,
            },
          ]}
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
  bar: {},
});
