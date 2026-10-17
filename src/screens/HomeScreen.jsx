import { useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import ActivityChecker from '../components/ActivityChecker';
import ForecastCard from '../components/ForecastCard';
import StatusMessage from '../components/StatusMessage';
import TimelineList from '../components/TimelineList';
import { checkActivity, getNearbyForecast, getTimeline } from '../services/forecastApi';
import { COLORS, describeError } from '../utils/formatters';

// Local usado quando o usuário não libera a localização (praça da Sé, São Paulo).
const SAMPLE_LOCATION = { latitude: -23.5505, longitude: -46.6333, isSample: true };

// Tela principal: localização → previsão perto do usuário → linha do tempo → atividade.
export default function HomeScreen({ modelId, onChangeModel, onModelUnavailable, onCompare }) {
  const [coords, setCoords] = useState(null);
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
    return { latitude: position.coords.latitude, longitude: position.coords.longitude, isSample: false };
  }

  async function loadForecast({ useSample = false, isRefresh = false } = {}) {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    setActivityResult(null);
    setActivityError(null);

    try {
      const position = useSample ? SAMPLE_LOCATION : await getDeviceCoords();
      if (!position) {
        setLocationDenied(true);
        return;
      }
      setLocationDenied(false);
      setCoords(position);

      const nearby = await getNearbyForecast({
        latitude: position.latitude,
        longitude: position.longitude,
        modelId,
      });
      setForecast(nearby);

      const items = await getTimeline({ probeId: nearby.matchedProbe.probeId, modelId });
      setTimeline(items);
      const current = items.find((item) => item.predictionFor === nearby.prediction.predictionFor);
      setSelectedTime(current ? current.predictionFor : nearby.prediction.predictionFor);
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
        latitude: coords.latitude,
        longitude: coords.longitude,
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
  }, [modelId]);

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
          message="Ela é usada só para encontrar o ponto de medição mais próximo de você."
          actions={[
            { label: 'Permitir localização', onPress: () => loadForecast() },
            { label: 'Usar local de exemplo (São Paulo)', onPress: () => loadForecast({ useSample: true }), secondary: true },
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
            { label: 'Tentar novamente', onPress: () => loadForecast({ useSample: coords?.isSample }) },
            { label: 'Trocar modelo', onPress: onChangeModel, secondary: true },
          ]}
        />
      );
    }

    if (!forecast) {
      return null;
    }

    return (
      <>
        {coords?.isSample && (
          <Text style={styles.sampleNote}>Mostrando a previsão para o local de exemplo (São Paulo).</Text>
        )}

        <ForecastCard forecast={forecast} />

        <Pressable
          onPress={() => onCompare({ probeId: forecast.matchedProbe.probeId, predictionFor: selectedTime })}
          style={styles.compareButton}
          accessibilityRole="button"
        >
          <Text style={styles.compareText}>Comparar com os outros modelos</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Próximas horas</Text>
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

        <Text style={styles.disclaimer}>{forecast.metadata.disclaimer}</Text>
      </>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => loadForecast({ useSample: coords?.isSample, isRefresh: true })}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.appName}>NetPrevê</Text>
        <Pressable onPress={onChangeModel} accessibilityRole="button">
          <Text style={styles.changeModel}>Trocar modelo</Text>
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
    marginBottom: 4,
  },
  appName: {
    color: COLORS.ink,
    fontSize: 28,
    fontWeight: '700',
  },
  changeModel: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  compareButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  compareText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  sampleNote: {
    color: COLORS.muted,
    fontSize: 14,
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
