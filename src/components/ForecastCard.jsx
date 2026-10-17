import { StyleSheet, Text, View } from 'react-native';
import QualitySignal from './QualitySignal';
import {
  COLORS,
  RECOMMENDATION_TITLES,
  formatDateTime,
  formatMs,
  formatPercent,
  qualityInfo,
} from '../utils/formatters';

// Recebe a resposta de GET /forecasts/nearby via props e só apresenta.
export default function ForecastCard({ forecast }) {
  const { model, prediction, assessment, recommendation, matchedProbe } = forecast;
  const info = qualityInfo(assessment.quality);

  return (
    <View style={styles.card}>
      <Text style={styles.model}>
        {model.name} · versão {model.version}
      </Text>

      <View style={styles.qualityRow}>
        <QualitySignal quality={assessment.quality} />
        <View style={styles.qualityText}>
          <Text style={[styles.qualityLabel, { color: info.color }]}>{info.label}</Text>
          <Text style={styles.qualityDescription}>{info.description}</Text>
        </View>
      </View>

      <Text style={styles.when}>Previsão para {formatDateTime(prediction.predictionFor)}</Text>

      <View style={styles.metrics}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{formatMs(prediction.predictedAvgRttMs)}</Text>
          <Text style={styles.metricLabel}>Tempo de resposta</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{formatPercent(prediction.predictedPacketLossPct)}</Text>
          <Text style={styles.metricLabel}>Perda de pacotes</Text>
        </View>
      </View>

      <View style={[styles.recommendation, { borderLeftColor: info.color }]}>
        <Text style={styles.recommendationTitle}>
          {RECOMMENDATION_TITLES[recommendation.code] || recommendation.code}
        </Text>
        <Text style={styles.recommendationMessage}>{recommendation.message}</Text>
      </View>

      <Text style={styles.reference}>
        Ponto de medição a {matchedProbe.distanceKm.toString().replace('.', ',')} km de você
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
  },
  model: {
    color: COLORS.muted,
    fontSize: 14,
    marginBottom: 16,
  },
  qualityRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16,
  },
  qualityText: {
    flex: 1,
  },
  qualityLabel: {
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 38,
  },
  qualityDescription: {
    color: COLORS.ink,
    fontSize: 16,
  },
  when: {
    color: COLORS.muted,
    fontSize: 14,
    marginTop: 16,
  },
  metrics: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  metric: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
  },
  metricValue: {
    color: COLORS.ink,
    fontSize: 22,
    fontWeight: '700',
  },
  metricLabel: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 2,
  },
  recommendation: {
    borderLeftWidth: 4,
    paddingLeft: 12,
    marginTop: 20,
  },
  recommendationTitle: {
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  recommendationMessage: {
    color: COLORS.ink,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 2,
  },
  reference: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 16,
  },
});
