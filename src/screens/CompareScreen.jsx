import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import QualitySignal from '../components/QualitySignal';
import StatusMessage from '../components/StatusMessage';
import { compareModels } from '../services/forecastApi';
import { COLORS, describeError, formatDateTime, formatMs, formatPercent, qualityInfo } from '../utils/formatters';

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

    return (
      <>
        <Text style={styles.subtitle}>
          Previsão de cada modelo para {formatDateTime(comparison.predictionFor)}, no mesmo ponto de medição.
          Cada grupo usou uma abordagem diferente: as diferenças mostram como elas divergem, não qual está certa.
        </Text>

        {comparison.models.map((item) => {
          const info = qualityInfo(item.quality);
          const isCurrent = item.modelId === currentModelId;
          return (
            <View key={item.modelId} style={[styles.row, isCurrent && styles.rowCurrent]}>
              <View style={styles.rowHeader}>
                <Text style={styles.modelName}>{item.modelName}</Text>
                {isCurrent && <Text style={styles.currentTag}>em uso</Text>}
              </View>
              <View style={styles.rowBody}>
                <QualitySignal quality={item.quality} size="small" />
                <Text style={[styles.quality, { color: info.color }]}>{info.label}</Text>
                <Text style={styles.metric}>{formatMs(item.predictedAvgRttMs)}</Text>
                <Text style={styles.metric}>{formatPercent(item.predictedPacketLossPct)} de perda</Text>
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
        <Text style={styles.title}>Comparar modelos</Text>
        <Pressable onPress={onBack} accessibilityRole="button">
          <Text style={styles.back}>Voltar</Text>
        </Pressable>
      </View>
      {renderBody()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: COLORS.ink,
    fontSize: 26,
    fontWeight: '700',
  },
  back: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 6,
  },
  row: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  rowCurrent: {
    borderColor: COLORS.primary,
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
  currentTag: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  rowBody: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  quality: {
    fontSize: 16,
    fontWeight: '700',
  },
  metric: {
    color: COLORS.ink,
    fontSize: 14,
  },
});
