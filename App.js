import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import CompareScreen from './src/screens/CompareScreen';
import HomeScreen from './src/screens/HomeScreen';
import LocationPickerScreen from './src/screens/LocationPickerScreen';
import ModelSelectScreen from './src/screens/ModelSelectScreen';
import { clearSelectedModelId, loadSelectedModelId, saveSelectedModelId } from './src/storage/modelStorage';
import { COLORS } from './src/utils/formatters';

// App.js: inicia o app e decide qual tela mostrar.
// Sem modelo salvo → escolha de modelo. Com modelo salvo → previsão.
export default function App() {
  const [modelId, setModelId] = useState(null);
  const [ready, setReady] = useState(false);
  const [choosingModel, setChoosingModel] = useState(false);
  const [compareParams, setCompareParams] = useState(null);
  // null = tela fechada; { userCoords } = tela de escolha de local aberta
  const [locationPicker, setLocationPicker] = useState(null);
  // null = usar a localização do aparelho; senão, o ponto escolhido na lista
  const [probe, setProbe] = useState(null);

  useEffect(() => {
    async function restoreModel() {
      const savedId = await loadSelectedModelId();
      setModelId(savedId);
      setReady(true);
    }
    restoreModel();
  }, []);

  async function handleConfirmModel(id) {
    await saveSelectedModelId(id);
    setModelId(id);
    setChoosingModel(false);
  }

  async function handleModelUnavailable() {
    // MODEL_NOT_FOUND / MODEL_INACTIVE: esquece a escolha e pede outra.
    await clearSelectedModelId();
    setModelId(null);
  }

  function handleSelectProbe(item) {
    setProbe(item);
    setLocationPicker(null);
  }

  function handleUseMyLocation() {
    setProbe(null);
    setLocationPicker(null);
  }

  function renderOverlay() {
    if (compareParams) {
      return (
        <CompareScreen
          probeId={compareParams.probeId}
          predictionFor={compareParams.predictionFor}
          currentModelId={modelId}
          onBack={() => setCompareParams(null)}
        />
      );
    }
    if (locationPicker) {
      return (
        <LocationPickerScreen
          userCoords={locationPicker.userCoords}
          currentProbeId={probe ? probe.probeId : null}
          onSelectProbe={handleSelectProbe}
          onUseMyLocation={handleUseMyLocation}
          onBack={() => setLocationPicker(null)}
        />
      );
    }
    return null;
  }

  function renderScreen() {
    if (!ready) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      );
    }

    if (!modelId || choosingModel) {
      return (
        <ModelSelectScreen
          currentModelId={modelId}
          onConfirm={handleConfirmModel}
          onCancel={modelId ? () => setChoosingModel(false) : null}
        />
      );
    }

    // A HomeScreen continua montada (só fica escondida) enquanto outra tela está aberta por cima,
    // para não perder a previsão e o horário selecionado ao voltar.
    const overlay = renderOverlay();
    return (
      <>
        <View style={[styles.fill, overlay && styles.hidden]}>
          <HomeScreen
            modelId={modelId}
            probe={probe}
            onChangeModel={() => setChoosingModel(true)}
            onModelUnavailable={handleModelUnavailable}
            onCompare={setCompareParams}
            onPickLocation={(userCoords) => setLocationPicker({ userCoords })}
          />
        </View>
        {overlay}
      </>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        {renderScreen()}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  fill: {
    flex: 1,
  },
  hidden: {
    display: 'none',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
