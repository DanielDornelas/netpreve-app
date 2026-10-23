import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatusMessage from '../components/StatusMessage';
import { getLocations } from '../services/forecastApi';
import { describeError } from '../utils/formatters';
import { countryName, distanceKm, placeName } from '../utils/places';
import { COLORS, RADIUS } from '../utils/theme';

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
          icon="cloud-offline-outline"
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

        <Pressable
          onPress={onUseMyLocation}
          style={[styles.option, !currentProbeId && styles.optionSelected]}
          accessibilityRole="button"
        >
          <View style={[styles.icon, styles.iconPrimary]}>
            <Ionicons name="navigate" size={18} color="#FFFFFF" />
          </View>
          <View style={styles.optionText}>
            <Text style={styles.place}>Usar minha localização</Text>
            <Text style={styles.detail}>O ponto mais próximo de onde você está</Text>
          </View>
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
              <View style={styles.icon}>
                <Ionicons name="location-outline" size={18} color={COLORS.primary} />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.place}>{placeName(item.location)}</Text>
                <Text style={styles.detail}>
                  {countryName(item.countryCode)}, ponto {item.probeId}
                </Text>
              </View>
              {item.distance !== null && (
                <View style={styles.distance}>
                  <Text style={styles.distanceText}>{Math.round(item.distance)} km</Text>
                </View>
              )}
            </Pressable>
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
        <Text style={styles.title}>Escolher local</Text>
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
    marginBottom: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 14,
  },
  optionSelected: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    padding: 13,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPrimary: {
    backgroundColor: COLORS.primary,
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  place: {
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  detail: {
    color: COLORS.muted,
    fontSize: 13,
  },
  distance: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.pill,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  distanceText: {
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
