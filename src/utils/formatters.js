// Funções utilitárias (exportação nomeada): convertem dados da API em texto para a interface.

import { COLORS } from './theme';

export { COLORS };

// A UI usa sempre o código (estável), nunca o texto da API, para decidir cor e ícone.
export const QUALITY = {
  GOOD: { label: 'Boa', description: 'Conexão prevista adequada', color: COLORS.good, soft: COLORS.goodSoft, bars: 3 },
  MODERATE: { label: 'Moderada', description: 'Pode haver instabilidade', color: COLORS.moderate, soft: COLORS.moderateSoft, bars: 2 },
  UNSTABLE: { label: 'Instável', description: 'Considere recursos offline', color: COLORS.unstable, soft: COLORS.unstableSoft, bars: 1 },
};

export const RECOMMENDATION_TITLES = {
  NORMAL_USE: 'Uso normal',
  REDUCE_NETWORK_USAGE: 'Reduza o uso de rede',
  PREPARE_OFFLINE: 'Prepare conteúdo offline',
};

// `icon` é o nome do ícone no conjunto Ionicons (vem junto com o Expo).
export const ACTIVITIES = [
  { code: 'VIDEO_CALL', label: 'Chamada de vídeo', icon: 'videocam-outline' },
  { code: 'AUDIO_CALL', label: 'Chamada de voz', icon: 'call-outline' },
  { code: 'STREAMING', label: 'Streaming', icon: 'play-circle-outline' },
  { code: 'FILE_UPLOAD', label: 'Envio de arquivos', icon: 'cloud-upload-outline' },
  { code: 'WEB_BROWSING', label: 'Navegação', icon: 'globe-outline' },
  { code: 'MESSAGING', label: 'Mensagens', icon: 'chatbubbles-outline' },
];

// Ordem de preferência para escolher o melhor horário.
const QUALITY_RANK = { GOOD: 0, MODERATE: 1, UNSTABLE: 2 };

// Melhor horário da linha do tempo: melhor qualidade e, no empate, menor tempo de resposta.
export function bestTimelineItem(items) {
  return items.reduce((best, item) => {
    if (!best) return item;
    const rankDiff = (QUALITY_RANK[item.quality] ?? 3) - (QUALITY_RANK[best.quality] ?? 3);
    if (rankDiff !== 0) return rankDiff < 0 ? item : best;
    return item.predictedAvgRttMs < best.predictedAvgRttMs ? item : best;
  }, null);
}

// Texto usado quando a resposta da API não traz o aviso (previsão de um ponto escolhido na lista).
export const DEFAULT_DISCLAIMER =
  'A previsão está associada à probe RIPE Atlas selecionada como referência geográfica e não representa uma medição direta do dispositivo do usuário.';

export function qualityInfo(code) {
  return QUALITY[code] || { label: code, description: '', color: COLORS.muted, soft: COLORS.background, bars: 0 };
}

function pad(value) {
  return String(value).padStart(2, '0');
}

// A API entrega horários em UTC (sufixo Z). Aqui convertemos para o horário do aparelho.
export function formatDateTime(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)} às ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatDay(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;
}

export function formatHour(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return `${pad(date.getHours())}h`;
}

export function formatMs(value) {
  return `${Math.round(value)} ms`;
}

export function formatPercent(value) {
  return `${value.toFixed(1).replace('.', ',')}%`;
}

// Traduz um erro da API ou de rede em uma mensagem que diz o que fazer.
export function describeError(error) {
  switch (error && error.code) {
    case 'NETWORK':
      return 'Sem conexão com o servidor. Verifique a internet do aparelho e o endereço da API.';
    case 'TIMEOUT':
      return 'O servidor demorou para responder. Se ele estava hibernando, tente de novo em instantes.';
    case 'VALIDATION_ERROR':
      return 'A localização ou o modelo enviados são inválidos.';
    case 'NO_PROBE_IN_RANGE':
      return 'Nenhum ponto de medição perto da sua localização.';
    case 'PROBE_NOT_FOUND':
      return 'Não há previsão para este local com o modelo escolhido.';
    case 'MODEL_NOT_FOUND':
    case 'MODEL_INACTIVE':
      return 'O modelo escolhido não está mais disponível. Escolha outro.';
    case 'DATASET_UNAVAILABLE':
    case 'INTERNAL_ERROR':
      return 'O servidor está com problemas. Tente novamente mais tarde.';
    default:
      return (error && error.message) || 'Algo deu errado. Tente novamente.';
  }
}
