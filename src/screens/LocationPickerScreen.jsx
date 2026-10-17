import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import StatusMessage from '../components/StatusMessage';
import { getLocations } from '../services/forecastApi';
import { COLORS, describeError } from '../utils/formatters';
import { countryName, distanceKm, placeName } from '../utils/places';

// Lista os pontos de medição (GET /api/v1/locations) para o usuário escolher um local
// sem depender do GPS. Se o app conhece a posição do usuário, ordena pela distância.
export default function LocationPickerScreen({ userCoords, currentProbeId, onSelectProbe, onUseMyLocation, onBack }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadLocations() {
    setLoading(true);
    setError(null);
    try {
      const items = await getLocations();
      const withDistance = items.map((item) => ({
        ...item,
        distance: userCoords ? distanceKm(userCoords, item.location) : null,
      }));
      if (userCoords) {
        withDistance.sort((a, b) => a.distance - b.distance);
      }
      setLocations(withDistance);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLocations();
  }, []);

  function renderBody() {
    if (loading) {
      return <StatusMessage loading title="Buscando os pontos de medição" />;
    }

    if (error) {
      return (
        <StatusMessage
          title="Não foi possível carregar os locais"
          message={describeError(error)}
          actions={[
            { label: 'Tentar novamente', onPress: loadLocations },
            { label: 'Voltar', onPress: onBack, secondary: true },
          ]}
        />
      );
    }

    return (
      <>
        <Text style={styles.subtitle}>
          Escolha um ponto de medição para ver a previsão daquela região.
          {userCoords ? ' Os mais próximos de você aparecem primeiro.' : ''}
        </Text>

        <Pressable onPress={onUseMyLocation} style={styles.myLocation} accessibilityRole="button">
          <Text style={styles.myLocationText}>Usar minha localização</Text>
        </Pressable>

        {locations.map((item) => {
          const selected = item.probeId === currentProbeId;
          return (
            <Pressable
              key={item.probeId}
              onPress={() => onSelectProbe(item)}
              style={[styles.option, selected && styles.optionSelected]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text style={styles.place}>{placeName(item.location)}</Text>
              <Text style={styles.detail}>
                {countryName(item.countryCode)} · ponto {item.probeId}
                {item.distance !== null ? ` · ${Math.round(item.distance)} km de você` : ''}
              </Text>
            </Pressable>
          );
        })}
      </>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Escolher local</Text>
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
  },
  myLocation: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 4,
  },
  myLocationText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  option: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: COLORS.primary,
  },
  place: {
    color: COLORS.ink,
    fontSize: 17,
    fontWeight: '700',
  },
  detail: {
    color: COLORS.muted,
    fontSize: 14,
    marginTop: 2,
  },
});
