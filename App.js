import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import CompareScreen from './src/screens/CompareScreen';
import HomeScreen from './src/screens/HomeScreen';
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

    // A HomeScreen continua montada (só fica escondida) enquanto a comparação está aberta,
    // para não perder a previsão e o horário selecionado ao voltar.
    return (
      <>
        <View style={[styles.fill, compareParams && styles.hidden]}>
          <HomeScreen
            modelId={modelId}
            onChangeModel={() => setChoosingModel(true)}
            onModelUnavailable={handleModelUnavailable}
            onCompare={setCompareParams}
          />
        </View>
        {compareParams && (
          <CompareScreen
            probeId={compareParams.probeId}
            predictionFor={compareParams.predictionFor}
            currentModelId={modelId}
            onBack={() => setCompareParams(null)}
          />
        )}
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
