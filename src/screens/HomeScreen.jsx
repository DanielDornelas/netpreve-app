import { useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import ActivityChecker from '../components/ActivityChecker';
import BestTimeHint from '../components/BestTimeHint';
import ForecastCard from '../components/ForecastCard';
import StatusMessage from '../components/StatusMessage';
import TimelineList from '../components/TimelineList';
import { checkActivity, getNearbyForecast, getProbeForecast, getTimeline } from '../services/forecastApi';
import { COLORS, DEFAULT_DISCLAIMER, describeError } from '../utils/formatters';
import { placeName } from '../utils/places';

// Tela principal: local (GPS ou escolhido na lista) → previsão → próximas horas → atividade.
// `probe` é o ponto escolhido na lista; quando é null, o app usa a localização do aparelho.
export default function HomeScreen({ modelId, probe, onChangeModel, onModelUnavailable, onCompare, onPickLocation }) {
  const [deviceCoords, setDeviceCoords] = useState(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [forecast, setForecast] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [activity, setActivity] = useState(null);
  const [activityResult, setActivityResult] = useState(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState(null);

  async function getDeviceCoords() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }
    const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return { latitude: position.coords.latitude, longitude: position.coords.longitude };
  }

  // Previsão do ponto escolhido na lista (GET /forecasts/probes/{id}).
  async function loadProbeForecast() {
    const data = await getProbeForecast({ probeId: probe.probeId, modelId });
    return {
      model: data.model,
      prediction: data.prediction,
      assessment: data.assessment,
      recommendation: data.recommendation,
      probeId: data.probeId,
      coords: { latitude: data.location.latitude, longitude: data.location.longitude },
      reference: `Local escolhido: ${placeName(probe.location)} (ponto ${data.probeId})`,
      disclaimer: DEFAULT_DISCLAIMER,
    };
  }

  // Previsão perto do aparelho (GET /forecasts/nearby). Devolve null se a localização for negada.
  async function loadNearbyForecast() {
    const position = await getDeviceCoords();
    if (!position) {
      return null;
    }
    setDeviceCoords(position);
    const data = await getNearbyForecast({ latitude: position.latitude, longitude: position.longitude, modelId });
    const distance = data.matchedProbe.distanceKm.toString().replace('.', ',');
    return {
      model: data.model,
      prediction: data.prediction,
      assessment: data.assessment,
      recommendation: data.recommendation,
      probeId: data.matchedProbe.probeId,
      coords: position,
      reference: `Ponto de medição a ${distance} km de você`,
      disclaimer: data.metadata.disclaimer,
    };
  }

  async function loadForecast({ isRefresh = false } = {}) {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    setActivityResult(null);
    setActivityError(null);

    try {
      const result = probe ? await loadProbeForecast() : await loadNearbyForecast();
      if (!result) {
        setLocationDenied(true);
        return;
      }
      setLocationDenied(false);
      setForecast(result);

      const items = await getTimeline({ probeId: result.probeId, modelId });
      setTimeline(items);
      const current = items.find((item) => item.predictionFor === result.prediction.predictionFor);
      setSelectedTime(current ? current.predictionFor : result.prediction.predictionFor);
    } catch (err) {
      if (err.code === 'MODEL_NOT_FOUND' || err.code === 'MODEL_INACTIVE') {
        onModelUnavailable();
        return;
      }
      setForecast(null);
      setError(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleCheckActivity() {
    setActivityLoading(true);
    setActivityError(null);
    setActivityResult(null);
    try {
      const result = await checkActivity({
        modelId,
        latitude: forecast.coords.latitude,
        longitude: forecast.coords.longitude,
        dateTime: selectedTime,
        activity,
      });
      setActivityResult(result);
    } catch (err) {
      setActivityError(err);
    } finally {
      setActivityLoading(false);
    }
  }

  function handleSelectTime(time) {
    setSelectedTime(time);
    setActivityResult(null);
  }

  function handleSelectActivity(code) {
    setActivity(code);
    setActivityResult(null);
  }

  useEffect(() => {
    loadForecast();
  }, [modelId, probe]);

  function renderBody() {
    if (loading) {
      return (
        <StatusMessage
          loading
          title="Buscando a previsão"
          message="Se o servidor estava hibernando, a primeira resposta pode levar até um minuto."
        />
      );
    }

    if (locationDenied) {
      return (
        <StatusMessage
          title="Precisamos da sua localização"
          message="Ela é usada só para encontrar o ponto de medição mais próximo. Se preferir, escolha um local na lista."
          actions={[
            { label: 'Permitir localização', onPress: () => loadForecast() },
            { label: 'Escolher um local na lista', onPress: () => onPickLocation(null), secondary: true },
          ]}
        />
      );
    }

    if (error) {
      return (
        <StatusMessage
          title={error.code === 'PROBE_NOT_FOUND' ? 'Sem previsão para este local' : 'Não foi possível carregar a previsão'}
          message={describeError(error)}
          actions={[
            { label: 'Tentar novamente', onPress: () => loadForecast() },
            { label: 'Escolher outro local', onPress: () => onPickLocation(deviceCoords), secondary: true },
          ]}
        />
      );
    }

    if (!forecast) {
      return null;
    }

    return (
      <>
        <ForecastCard forecast={forecast} reference={forecast.reference} />

        <Pressable
          onPress={() => onCompare({ probeId: forecast.probeId, predictionFor: selectedTime })}
          style={styles.outlineButton}
          accessibilityRole="button"
        >
          <Text style={styles.outlineText}>Comparar com os outros modelos</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Próximas horas</Text>
        <BestTimeHint items={timeline} selectedTime={selectedTime} onSelect={handleSelectTime} />
        <TimelineList items={timeline} selectedTime={selectedTime} onSelect={handleSelectTime} />

        <Text style={styles.sectionTitle}>Vai dar para fazer?</Text>
        <ActivityChecker
          selectedTime={selectedTime}
          activity={activity}
          onSelectActivity={handleSelectActivity}
          onCheck={handleCheckActivity}
          loading={activityLoading}
          result={activityResult}
          error={activityError}
        />

        <Text style={styles.disclaimer}>{forecast.disclaimer}</Text>
      </>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadForecast({ isRefresh: true })} />}
    >
      <View style={styles.header}>
        <Text style={styles.appName}>NetPrevê</Text>
        <Pressable onPress={onChangeModel} accessibilityRole="button">
          <Text style={styles.link}>Trocar modelo</Text>
        </Pressable>
      </View>

      <View style={styles.placeBar}>
        <Text style={styles.placeText}>{probe ? placeName(probe.location) : 'Perto de você'}</Text>
        <Pressable onPress={() => onPickLocation(deviceCoords)} accessibilityRole="button">
          <Text style={styles.link}>Trocar local</Text>
        </Pressable>
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appName: {
    color: COLORS.ink,
    fontSize: 28,
    fontWeight: '700',
  },
  link: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  placeBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  placeText: {
    color: COLORS.muted,
    fontSize: 15,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  outlineText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  sectionTitle: {
    color: COLORS.ink,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  disclaimer: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 12,
  },
});
