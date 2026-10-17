import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import StatusMessage from '../components/StatusMessage';
import { getModels } from '../services/forecastApi';
import { COLORS, describeError } from '../utils/formatters';

// Tela de escolha do modelo de previsão (GET /api/v1/models).
export default function ModelSelectScreen({ currentModelId, onConfirm, onCancel }) {
  const [models, setModels] = useState([]);
  const [selectedId, setSelectedId] = useState(currentModelId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadModels() {
    setLoading(true);
    setError(null);
    try {
      const items = await getModels();
      setModels(items);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadModels();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <StatusMessage
          loading
          title="Conectando ao servidor"
          message="A primeira conexão pode levar até um minuto."
        />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <StatusMessage
          title="Não foi possível carregar os modelos"
          message={describeError(error)}
          actions={[{ label: 'Tentar novamente', onPress: loadModels }]}
        />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Modelo de previsão</Text>
      <Text style={styles.subtitle}>
        Cada modelo foi feito por um grupo diferente. Troque à vontade para comparar as abordagens: a lista não
        é um ranking.
      </Text>

      {models.map((model) => {
        const selected = model.id === selectedId;
        return (
          <Pressable
            key={model.id}
            onPress={() => setSelectedId(model.id)}
            style={[styles.option, selected && styles.optionSelected]}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
          >
            <View style={[styles.radio, selected && styles.radioSelected]}>
              {selected && <View style={styles.radioDot} />}
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionName}>{model.name}</Text>
              <Text style={styles.optionDetail}>
                {model.groupName} · versão {model.version}
              </Text>
            </View>
          </Pressable>
        );
      })}

      <Pressable
        onPress={() => onConfirm(selectedId)}
        disabled={!selectedId}
        style={[styles.button, !selectedId && styles.buttonDisabled]}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Usar este modelo</Text>
      </Pressable>

      {onCancel && (
        <Pressable onPress={onCancel} style={styles.cancel} accessibilityRole="button">
          <Text style={styles.cancelText}>Voltar sem trocar</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    padding: 20,
    gap: 10,
  },
  title: {
    color: COLORS.ink,
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: COLORS.primary,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: COLORS.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  optionText: {
    flex: 1,
  },
  optionName: {
    color: COLORS.ink,
    fontSize: 17,
    fontWeight: '700',
  },
  optionDetail: {
    color: COLORS.muted,
    fontSize: 14,
    marginTop: 2,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cancel: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelText: {
    color: COLORS.primary,
    fontSize: 15,
  },
});
