// Funções utilitárias (exportação nomeada): convertem dados da API em texto para a interface.

export const COLORS = {
  background: '#EEF3F7',
  surface: '#FFFFFF',
  ink: '#14213D',
  muted: '#5C6B7A',
  line: '#D5DEE7',
  primary: '#1D5C96',
  good: '#2A9D8F',
  moderate: '#E09A2D',
  unstable: '#D1495B',
};

// A UI usa sempre o código (estável), nunca o texto da API, para decidir cor e ícone.
export const QUALITY = {
  GOOD: { label: 'Boa', description: 'Conexão prevista adequada', color: COLORS.good, bars: 3 },
  MODERATE: { label: 'Moderada', description: 'Pode haver instabilidade', color: COLORS.moderate, bars: 2 },
  UNSTABLE: { label: 'Instável', description: 'Considere recursos offline', color: COLORS.unstable, bars: 1 },
};

export const RECOMMENDATION_TITLES = {
  NORMAL_USE: 'Uso normal',
  REDUCE_NETWORK_USAGE: 'Reduza o uso de rede',
  PREPARE_OFFLINE: 'Prepare conteúdo offline',
};

export const ACTIVITIES = [
  { code: 'VIDEO_CALL', label: 'Chamada de vídeo' },
  { code: 'AUDIO_CALL', label: 'Chamada de voz' },
  { code: 'STREAMING', label: 'Streaming' },
  { code: 'FILE_UPLOAD', label: 'Envio de arquivos' },
  { code: 'WEB_BROWSING', label: 'Navegação' },
  { code: 'MESSAGING', label: 'Mensagens' },
];

export function qualityInfo(code) {
  return QUALITY[code] || { label: code, description: '', color: COLORS.muted, bars: 0 };
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
