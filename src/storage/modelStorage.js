// Guarda no aparelho o modelo escolhido pelo usuário.
// A API não guarda essa escolha: é o app que precisa lembrar dela ao reabrir.
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'netpreve:selectedModelId';

export async function loadSelectedModelId() {
  try {
    return await AsyncStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export async function saveSelectedModelId(modelId) {
  await AsyncStorage.setItem(KEY, modelId);
}

export async function clearSelectedModelId() {
  await AsyncStorage.removeItem(KEY);
}
