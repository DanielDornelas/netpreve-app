import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QualitySignal from '../components/QualitySignal';
import StatusMessage from '../components/StatusMessage';
import { compareModels } from '../services/forecastApi';
import { describeError, formatDateTime, formatMs, formatPercent, qualityInfo } from '../utils/formatters';
import { COLORS, RADIUS } from '../utils/theme';

// Compara a previsão de todos os modelos para o mesmo ponto e horário.
// A ordem é a da API (por nome): não é um ranking e não declara vencedor.
export default function CompareScreen({ probeId, predictionFor, currentModelId, onBack }) {
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadComparison() {
    setLoading(true);
    setError(null);
    try {
      const data = await compareModels({ probeId, predictionFor });
      setComparison(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComparison();
  }, [probeId, predictionFor]);

  function renderBody() {
    if (loading) {
      return <StatusMessage loading title="Buscando a previsão de cada modelo" />;
    }

    if (error) {
      return (
        <StatusMessage
          icon="alert-circle-outline"
          title={error.code === 'NO_COMMON_PREDICTION' ? 'Sem horário em comum' : 'Não foi possível comparar'}
          message={
            error.code === 'NO_COMMON_PREDICTION'
              ? 'Os modelos não têm previsão para o mesmo horário neste local.'
              : describeError(error)
          }
          actions={[
            { label: 'Tentar novamente', onPress: loadComparison },
            { label: 'Voltar', onPress: onBack, secondary: true },
          ]}
        />
      );
    }

    // Barras de tempo de resposta proporcionais ao maior valor da comparação.
    const maxRtt = Math.max(...comparison.models.map((item) => item.predictedAvgRttMs), 1);

    return (
      <>
        <Text style={styles.subtitle}>
          Previsão de cada modelo para {formatDateTime(comparison.predictionFor)}, no mesmo ponto de medição. Cada
          grupo usou uma abordagem diferente: as diferenças mostram como elas divergem, não qual está certa.
        </Text>

        {comparison.models.map((item) => {
          const info = qualityInfo(item.quality);
          const isCurrent = item.modelId === currentModelId;
          return (
            <View key={item.modelId} style={[styles.row, isCurrent && styles.rowCurrent]}>
              <View style={styles.rowHeader}>
                <Text style={styles.modelName}>{item.modelName}</Text>
                {isCurrent && (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>Em uso</Text>
                  </View>
                )}
                <View style={styles.spacer} />
                <QualitySignal quality={item.quality} size="medium" />
                <Text style={[styles.quality, { color: info.color }]}>{info.label}</Text>
              </View>

              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${(item.predictedAvgRttMs / maxRtt) * 100}%`, backgroundColor: info.color },
                  ]}
                />
              </View>
              <View style={styles.values}>
                <Text style={styles.value}>{formatMs(item.predictedAvgRttMs)} de tempo de resposta</Text>
                <Text style={styles.value}>{formatPercent(item.predictedPacketLossPct)} de perda</Text>
              </View>
            </View>
          );
        })}
      </>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.back} accessibilityRole="button" accessibilityLabel="Voltar">
          <Ionicons name="arrow-back" size={22} color={COLORS.ink} />
        </Pressable>
        <Text style={styles.title}>Comparar modelos</Text>
      </View>
      {renderBody()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: COLORS.ink,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 15,
    lineHeight: 21,
  },
  row: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 16,
    gap: 10,
  },
  rowCurrent: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    padding: 15,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modelName: {
    color: COLORS.ink,
    fontSize: 17,
    fontWeight: '700',
  },
  tag: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.pill,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  tagText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  spacer: {
    flex: 1,
  },
  quality: {
    fontSize: 15,
    fontWeight: '700',
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.background,
    overflow: 'hidden',
  },
  barFill: {
    height: 8,
    borderRadius: 4,
  },
  values: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  value: {
    color: COLORS.ink,
    fontSize: 13,
    fontVariant: ['tabular-nums'],
  },
});
