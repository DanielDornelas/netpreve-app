import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatusMessage from '../components/StatusMessage';
import { getModels } from '../services/forecastApi';
import { describeError } from '../utils/formatters';
import { COLORS, RADIUS } from '../utils/theme';

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
        <StatusMessage loading title="Conectando ao servidor" message="A primeira conexão pode levar até um minuto." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <StatusMessage
          icon="cloud-offline-outline"
          title="Não foi possível carregar os modelos"
          message={describeError(error)}
          actions={[{ label: 'Tentar novamente', onPress: loadModels }]}
        />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Escolha um modelo de previsão</Text>
      <Text style={styles.subtitle}>
        Cada modelo foi feito por um grupo diferente. Troque quando quiser para comparar as abordagens: a lista não é
        um ranking.
      </Text>

      {models.map((model) => {
        const selected = model.id === selectedId;
        const initial = model.name.trim().slice(-1).toUpperCase();
        return (
          <Pressable
            key={model.id}
            onPress={() => setSelectedId(model.id)}
            style={[styles.option, selected && styles.optionSelected]}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
          >
            <View style={[styles.avatar, selected && styles.avatarSelected]}>
              <Text style={[styles.avatarText, selected && styles.avatarTextSelected]}>{initial}</Text>
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionName}>{model.name}</Text>
              <Text style={styles.optionDetail}>
                {model.groupName}, versão {model.version}
              </Text>
              {model.description ? <Text style={styles.optionDescription}>{model.description}</Text> : null}
            </View>
            <Ionicons
              name={selected ? 'checkmark-circle' : 'ellipse-outline'}
              size={24}
              color={selected ? COLORS.primary : COLORS.line}
            />
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
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  optionSelected: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    padding: 15,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSelected: {
    backgroundColor: COLORS.primary,
  },
  avatarText: {
    color: COLORS.ink,
    fontSize: 18,
    fontWeight: '800',
  },
  avatarTextSelected: {
    color: '#FFFFFF',
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionName: {
    color: COLORS.ink,
    fontSize: 17,
    fontWeight: '700',
  },
  optionDetail: {
    color: COLORS.muted,
    fontSize: 14,
  },
  optionDescription: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.control,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.35,
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
    fontWeight: '600',
  },
});
