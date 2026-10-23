import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import CompareScreen from './src/screens/CompareScreen';
import HomeScreen from './src/screens/HomeScreen';
import LocationPickerScreen from './src/screens/LocationPickerScreen';
import ModelSelectScreen from './src/screens/ModelSelectScreen';
import { clearSelectedModelId, loadSelectedModelId, saveSelectedModelId } from './src/storage/modelStorage';
import { COLORS } from './src/utils/theme';

// App.js: inicia o app e decide qual tela mostrar.
// Sem modelo salvo → escolha de modelo. Com modelo salvo → previsão.
// No navegador de um computador, o app aparece dentro de uma moldura de celular.
const PHONE = { width: 390, height: 844, bezel: 12 };

export default function App() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const showPhoneFrame = Platform.OS === 'web' && windowWidth >= 600;
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

  if (showPhoneFrame) {
    const phoneHeight = Math.min(PHONE.height, windowHeight - 48);
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <View style={styles.desk}>
          <View style={[styles.phone, { height: phoneHeight }]}>
            <View style={styles.screen}>
              <View style={styles.island} />
              <View style={styles.screenContent}>{renderScreen()}</View>
            </View>
          </View>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.frame}>{renderScreen()}</View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  desk: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.line,
  },
  phone: {
    width: PHONE.width + PHONE.bezel * 2,
    padding: PHONE.bezel,
    borderRadius: 56,
    backgroundColor: COLORS.ink,
  },
  screen: {
    flex: 1,
    borderRadius: 44,
    overflow: 'hidden',
    backgroundColor: COLORS.background,
  },
  island: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    width: 110,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.ink,
    zIndex: 1,
  },
  screenContent: {
    flex: 1,
    paddingTop: 44,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  frame: {
    flex: 1,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
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
