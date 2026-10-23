import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QualitySignal from './QualitySignal';
import { COLORS, RADIUS } from '../utils/theme';
import { RECOMMENDATION_TITLES, formatDateTime, formatMs, formatPercent, qualityInfo } from '../utils/formatters';

// Cartão principal, no estilo de um app de previsão do tempo:
// a parte de cima é pintada com a cor da qualidade; a de baixo traz os números e a recomendação.
export default function ForecastCard({ forecast, reference }) {
  const { model, prediction, assessment, recommendation } = forecast;
  const info = qualityInfo(assessment.quality);
  const confidence = prediction.modelConfidence;

  return (
    <View style={styles.card}>
      <View style={[styles.hero, { backgroundColor: info.color }]}>
        <Text style={styles.heroModel}>
          {model.name}, versão {model.version}
        </Text>
        <View style={styles.heroRow}>
          <QualitySignal quality={assessment.quality} size="hero" tone="light" />
          <View style={styles.heroText}>
            <Text style={styles.heroLabel}>{info.label}</Text>
            <Text style={styles.heroDescription}>{info.description}</Text>
          </View>
        </View>
        <View style={styles.heroTime}>
          <Ionicons name="time-outline" size={15} color="#FFFFFF" />
          <Text style={styles.heroTimeText}>Previsão para {formatDateTime(prediction.predictionFor)}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.metrics}>
          <Metric icon="speedometer-outline" value={formatMs(prediction.predictedAvgRttMs)} label="Tempo de resposta" />
          <Metric icon="pulse-outline" value={formatPercent(prediction.predictedPacketLossPct)} label="Perda de pacotes" />
        </View>

        <View style={[styles.recommendation, { backgroundColor: info.soft }]}>
          <Text style={[styles.recommendationTitle, { color: info.color }]}>
            {RECOMMENDATION_TITLES[recommendation.code] || recommendation.code}
          </Text>
          <Text style={styles.recommendationMessage}>{recommendation.message}</Text>
        </View>

        {confidence !== null && confidence !== undefined && (
          <Text style={styles.footnote}>Confiança do modelo nesta previsão: {Math.round(confidence * 100)}%</Text>
        )}
        <View style={styles.reference}>
          <Ionicons name="location-outline" size={14} color={COLORS.muted} />
          <Text style={styles.footnote}>{reference}</Text>
        </View>
      </View>
    </View>
  );
}

function Metric({ icon, value, label }) {
  return (
    <View style={styles.metric}>
      <Ionicons name={icon} size={18} color={COLORS.muted} />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.hero,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  hero: {
    padding: 22,
    gap: 14,
  },
  heroModel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontWeight: '600',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 18,
  },
  heroText: {
    flex: 1,
  },
  heroLabel: {
    color: '#FFFFFF',
    fontSize: 44,
    fontWeight: '800',
    lineHeight: 48,
    letterSpacing: -1,
  },
  heroDescription: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  heroTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroTimeText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  body: {
    padding: 18,
    gap: 14,
  },
  metrics: {
    flexDirection: 'row',
    gap: 12,
  },
  metric: {
    flex: 1,
    borderRadius: RADIUS.control,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 14,
    gap: 4,
  },
  metricValue: {
    color: COLORS.ink,
    fontSize: 26,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  metricLabel: {
    color: COLORS.muted,
    fontSize: 13,
  },
  recommendation: {
    borderRadius: RADIUS.control,
    padding: 14,
    gap: 4,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  recommendationMessage: {
    color: COLORS.ink,
    fontSize: 15,
    lineHeight: 21,
  },
  reference: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footnote: {
    color: COLORS.muted,
    fontSize: 13,
  },
});
