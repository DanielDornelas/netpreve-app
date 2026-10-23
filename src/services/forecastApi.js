// Serviço de acesso à API de previsão de qualidade de conexão.
// Responsabilidade: falar com a API e devolver dados. Não cria interface.

const BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || 'http://10.0.2.2:8080').replace(/\/$/, '');
const API_URL = `${BASE_URL}/api/v1`;

// No plano gratuito do Render a primeira chamada pode levar de 30 a 60 segundos.
const TIMEOUT_MS = 60000;

export class ApiError extends Error {
  constructor({ status = 0, code, message, details = [] }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function toQuery(params) {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
}

async function request(path, options = {}, timeoutMs = TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      },
      signal: controller.signal,
    });
  } catch (error) {
    // Sem HTTP: timeout, DNS, modo avião, servidor desligado. Não vem JSON de erro.
    const code = error.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK';
    throw new ApiError({
      code,
      message: code === 'TIMEOUT' ? 'O servidor demorou para responder.' : 'Sem conexão com o servidor.',
    });
  } finally {
    clearTimeout(timer);
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = data && data.error ? data.error : {};
    throw new ApiError({
      status: response.status,
      code: error.code || 'HTTP_ERROR',
      message: error.message || `Erro HTTP ${response.status}`,
      details: error.details || [],
    });
  }

  return data;
}

// GET /api/v1/health — confirma que a API está no ar.
// Tempo limite menor: serve só para o indicador de conexão.
export function getHealth() {
  return request('/health', {}, 15000);
}

// GET /api/v1/models — só modelos ativos, ordenados por nome
export async function getModels() {
  const data = await request('/models');
  return data.items;
}

// GET /api/v1/locations — pontos de medição que têm previsão
export async function getLocations() {
  const data = await request('/locations');
  return data.items;
}

// GET /api/v1/forecasts/probes/{probeId}?model_id= — previsão de um ponto escolhido
export function getProbeForecast({ probeId, modelId }) {
  const query = toQuery({ model_id: modelId });
  return request(`/forecasts/probes/${probeId}?${query}`);
}

// GET /api/v1/forecasts/nearby?lat=&lon=&model_id=&radius_km=
export function getNearbyForecast({ latitude, longitude, modelId, radiusKm }) {
  const query = toQuery({ lat: latitude, lon: longitude, model_id: modelId, radius_km: radiusKm });
  return request(`/forecasts/nearby?${query}`);
}

// GET /api/v1/forecasts/probes/{probeId}/timeline?model_id=&limit=
export async function getTimeline({ probeId, modelId, limit = 24 }) {
  const query = toQuery({ model_id: modelId, limit });
  const data = await request(`/forecasts/probes/${probeId}/timeline?${query}`);
  return data.items;
}

// GET /api/v1/forecasts/probes/{probeId}/compare?prediction_for=
// Previsão de todos os modelos ativos para o mesmo ponto e horário.
export function compareModels({ probeId, predictionFor }) {
  const query = toQuery({ prediction_for: predictionFor });
  return request(`/forecasts/probes/${probeId}/compare?${query}`);
}

// POST /api/v1/activity/check
export function checkActivity({ modelId, latitude, longitude, dateTime, activity }) {
  return request('/activity/check', {
    method: 'POST',
    body: JSON.stringify({ modelId, latitude, longitude, dateTime, activity }),
  });
}
