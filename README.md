# NetPrevê

App em React Native (Expo) que mostra a **previsão da qualidade da internet** perto de você: se a conexão deve estar boa, moderada ou instável nas próximas horas, e se dá para fazer uma chamada de vídeo, um streaming ou um envio de arquivos naquele horário.

O app consome a **Connectivity Forecast API** da squad Soft in. Hard out.:
[github.com/DanielDornelas/connectivity-forecast-squad-15](https://github.com/DanielDornelas/connectivity-forecast-squad-15)

> **Os dados são de exemplo.** A API usa previsões fictícias e fixas (agosto de 2026) e não mede a rede do seu aparelho. A previsão é ligada a um ponto de medição de referência próximo de você, e o app mostra esse aviso na tela.

---

## O que o app faz

| Tela | O que mostra | Endpoint da API |
|---|---|---|
| Escolha do modelo | Os modelos de previsão disponíveis. A escolha fica salva no aparelho. | `GET /api/v1/models` |
| Previsão | Qualidade esperada, tempo de resposta, perda de pacotes e recomendação para o ponto de medição mais próximo | `GET /api/v1/forecasts/nearby` |
| Escolher local | Os pontos de medição em lista (os mais próximos primeiro); tocar num deles mostra a previsão daquela região, com a confiança do modelo | `GET /api/v1/locations` e `GET /api/v1/forecasts/probes/{id}` |
| Próximas horas | A qualidade prevista hora a hora, com o **melhor horário** em destaque; tocar num horário o seleciona | `GET /api/v1/forecasts/probes/{id}/timeline` |
| Vai dar para fazer? | Se o horário escolhido é bom para uma atividade (chamada de vídeo, streaming, mensagens…) | `POST /api/v1/activity/check` |
| Indicador de servidor | "Servidor conectado" ou "Sem conexão" no topo, conferido a cada 30 segundos | `GET /api/v1/health` |
| Comparar modelos | A previsão de todos os modelos lado a lado, para o mesmo local e horário (sem declarar vencedor) | `GET /api/v1/forecasts/probes/{id}/compare` |

Se o usuário negar a localização, ele pode **escolher um local na lista** de pontos de medição. Sem conexão com a API, ele mostra uma mensagem com a opção de tentar de novo, em vez de travar.

## Endpoints e como o app traduz cada um

Toda chamada à API fica em `src/services/forecastApi.js`. O app **não altera os dados**: ele só os transforma em texto, cor e ícone. As tabelas abaixo mostram, para cada endpoint, o que a API devolve e o que aparece na tela.

### `GET /api/v1/health`

| A API devolve | O app mostra |
|---|---|
| `{"status": "ok"}` | Bolinha verde e "Servidor conectado", no topo |
| Sem resposta em 15 s ou erro de rede | Bolinha vermelha e "Sem conexão" |

O app confere a cada 30 segundos (`ServerStatus.jsx`); tocar no indicador força uma nova verificação.

### `GET /api/v1/models`

| Campo da API | Na tela |
|---|---|
| `id` | Não aparece: é salvo no aparelho (`modelStorage.js`) e enviado como `model_id` em todas as outras chamadas |
| `name` | Nome do modelo ("Modelo A") e a letra no círculo ("A") |
| `groupName`, `version` | "Grupo 1, versão 1.0" |
| `description` | Texto pequeno abaixo do nome |

A ordem é a da API (por nome), e o texto da tela avisa que a lista não é um ranking.

### `GET /api/v1/forecasts/nearby?lat=&lon=&model_id=`

A latitude e a longitude vêm do aparelho (`expo-location`).

| Campo da API | Na tela |
|---|---|
| `model.name`, `model.version` | "Modelo A, versão 1.0", no topo do cartão |
| `assessment.quality` | Cor do cartão, barrinhas de sinal e a palavra grande (veja a tabela de qualidade abaixo) |
| `prediction.predictionFor` | "Previsão para 20/08 às 20:00", convertido de UTC para o horário do aparelho |
| `prediction.predictedAvgRttMs` | "73 ms", com o rótulo "Tempo de resposta" |
| `prediction.predictedPacketLossPct` | "3,9%", com o rótulo "Perda de pacotes" |
| `recommendation.code` | Título da recomendação (veja a tabela de recomendações abaixo) |
| `recommendation.message` | Texto da recomendação, exibido como veio |
| `matchedProbe.distanceKm` | "Ponto de medição a 44,7 km de você" |
| `matchedProbe.probeId` | Não aparece: é usado para buscar as próximas horas e a comparação |
| `metadata.disclaimer` | Aviso no fim da tela |

### `GET /api/v1/locations`

| Campo da API | Na tela |
|---|---|
| `probeId` | "ponto 900001" |
| `countryCode` | "Brasil" (`BR` traduzido pelo app) |
| `location.latitude`, `location.longitude` | "Região de São Paulo" e "45 km", calculados pelo app a partir das coordenadas; a lista é ordenada do mais próximo ao mais distante |

A API não manda nomes de cidades: o nome da região vem de uma lista de referência do próprio app (`places.js`).

### `GET /api/v1/forecasts/probes/{id}?model_id=`

Usado quando o usuário escolhe um local na lista. A tela é a mesma da previsão perto de você, com duas diferenças:

| Campo da API | Na tela |
|---|---|
| `prediction.modelConfidence` | "Confiança do modelo nesta previsão: 82%" (de 0 a 1, multiplicado por 100); não aparece quando vem `null` |
| `location` | "Local escolhido: Região de Manaus (ponto 900010)" |

### `GET /api/v1/forecasts/probes/{id}/timeline?model_id=&limit=24`

| Campo da API | Na tela |
|---|---|
| `items[].predictionFor` | A hora da coluna ("21h") e o dia acima dela ("19/08"), no horário do aparelho |
| `items[].quality` | Altura e cor da coluna: 3/3 verde (Boa), 2/3 âmbar (Moderada), 1/3 vermelha (Instável) |
| `items[].predictedAvgRttMs` | "63 ms", abaixo da hora |

O **melhor horário** é escolhido pelo app entre esses itens: a melhor qualidade e, no empate, o menor tempo de resposta. Nenhuma chamada extra é feita.

### `GET /api/v1/forecasts/probes/{id}/compare?prediction_for=`

O `prediction_for` é o horário selecionado na faixa de próximas horas.

| Campo da API | Na tela |
|---|---|
| `models[].modelName` | Nome de cada modelo; o que está em uso ganha a marca "Em uso" |
| `models[].quality` | Barrinhas e palavra colorida ("Boa", "Moderada", "Instável") |
| `models[].predictedAvgRttMs` | Barra proporcional ao maior tempo da comparação e o texto "58 ms de tempo de resposta" |
| `models[].predictedPacketLossPct` | "0,8% de perda" |
| `predictionFor` | "Previsão de cada modelo para 20/08 às 20:00" |

### `POST /api/v1/activity/check`

O app envia `modelId`, `latitude`, `longitude`, o horário selecionado (`dateTime`) e a atividade escolhida nos botões (`VIDEO_CALL`, `AUDIO_CALL`, `STREAMING`, `FILE_UPLOAD`, `WEB_BROWSING` ou `MESSAGING`).

| Campo da API | Na tela |
|---|---|
| `suitable: true` | Ícone verde e "Bom momento para isso" |
| `suitable: false` | Ícone vermelho e "Melhor escolher outro horário" |
| `forecast.quality` | "Qualidade prevista: Moderada" |
| `recommendation.code` e `message` | Título e texto da recomendação |

### Traduções usadas em todas as telas

**Qualidade** (`assessment.quality` e `quality`), em `src/utils/formatters.js`:

| Código da API | Texto | Descrição | Cor | Barrinhas |
|---|---|---|---|---|
| `GOOD` | Boa | Conexão prevista adequada | Verde `#1F8A78` | 3 |
| `MODERATE` | Moderada | Pode haver instabilidade | Âmbar `#D98A1F` | 2 |
| `UNSTABLE` | Instável | Considere recursos offline | Vermelho `#C8434F` | 1 |

**Recomendação** (`recommendation.code`). O app usa o código, que é estável, para escolher o título; o `message` da API aparece logo abaixo.

| Código da API | Título no app |
|---|---|
| `NORMAL_USE` | Uso normal |
| `REDUCE_NETWORK_USAGE` | Reduza o uso de rede |
| `PREPARE_OFFLINE` | Prepare conteúdo offline |

**Erros** (`error.code`). O app troca o código por uma mensagem que diz o que fazer:

| Código | Mensagem no app |
|---|---|
| Sem resposta (rede, modo avião, API desligada) | Sem conexão com o servidor. Verifique a internet do aparelho e o endereço da API. |
| Tempo esgotado (60 s) | O servidor demorou para responder. Se ele estava hibernando, tente de novo em instantes. |
| `VALIDATION_ERROR` (422) | A localização ou o modelo enviados são inválidos. |
| `NO_PROBE_IN_RANGE` | Nenhum ponto de medição perto da sua localização. |
| `PROBE_NOT_FOUND` | Não há previsão para este local com o modelo escolhido. |
| `MODEL_NOT_FOUND`, `MODEL_INACTIVE` | O app esquece o modelo salvo e volta para a escolha de modelo. |
| `NO_COMMON_PREDICTION` | Os modelos não têm previsão para o mesmo horário neste local. |
| `DATASET_UNAVAILABLE`, `INTERNAL_ERROR` | O servidor está com problemas. Tente novamente mais tarde. |

**Horários.** A API envia tudo em UTC (sufixo `Z`). O app converte para o horário do aparelho: no Brasil (UTC−3), `2026-08-20T23:00:00Z` aparece como **20/08 às 20:00**.

---

## Antes de começar

Você vai precisar de:

- **Node.js** (versão LTS), em [nodejs.org](https://nodejs.org). Para conferir: `node -v`.
- **A API rodando.** O app não tem dados próprios: ele busca tudo na API. Veja o passo 2.
- **Git Bash** (ou outro terminal), para os comandos abaixo.

---

## Como rodar

### 1. Baixe o app e instale as bibliotecas

Escolha um dos jeitos:

```bash
git clone https://github.com/DanielDornelas/netpreve-app.git
cd netpreve-app
```

ou baixe o ZIP pelo botão **Code → Download ZIP**, extraia e abra o terminal **na pasta onde está o `package.json`**.

Depois, **só na primeira vez em cada computador**:

```bash
npm install
```

### 2. Suba a API

No IntelliJ, abra o projeto da API e rode, no painel **Maven**, **Plugins → spring-boot → `spring-boot:run`**. Ou, no terminal, na pasta da API: `mvn spring-boot:run`.

Espere aparecer `Started ConnectivityForecastApiApplication` e confira no navegador:

```
http://localhost:8080/api/v1/health
```

Deve responder `{"status":"ok", ...}`. **Deixe a API rodando** enquanto usa o app.

### 3. Rode o app

```bash
npm run web
```

O app abre no navegador, em `http://localhost:8081`.

No computador, o app aparece dentro de uma moldura de celular. Quando o navegador pedir a localização, clique em **Permitir**.

### Para parar

Aperte **Ctrl+C** no terminal do app e pare a API no IntelliJ (quadrado vermelho).

---

## Endereço da API (`.env`)

O app lê o endereço da API do arquivo `.env`, na raiz do projeto. O padrão já vem configurado para o navegador no mesmo computador:

```
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080
```

Troque conforme onde o app vai rodar:

| Onde o app roda | Valor de `EXPO_PUBLIC_API_BASE_URL` |
|---|---|
| Navegador no mesmo computador da API | `http://localhost:8080` |
| Emulador Android | `http://10.0.2.2:8080` |
| Celular físico (mesmo Wi-Fi) | `http://IP-DO-COMPUTADOR:8080` (descubra o IP com `ipconfig`) |
| API publicada no Render | `https://seu-servico.onrender.com` |

Depois de mudar o `.env`, reinicie o app limpando o cache: `npx expo start -c`.

---

## Rodar no celular (opcional)

1. Instale o app **Expo Go** no celular.
2. Deixe o celular e o computador **na mesma rede Wi-Fi**.
3. No `.env`, use o IP do computador (veja a tabela acima). No celular, `localhost` não funciona.
4. No `app.json`, dentro de `"expo"`, adicione a mensagem de permissão de localização:

   ```json
   "plugins": [
     [
       "expo-location",
       { "locationWhenInUsePermission": "Usamos sua localização para encontrar o ponto de medição mais próximo." }
     ]
   ]
   ```

5. Rode `npx expo start -c` e leia o QR code com o Expo Go (Android) ou com a câmera (iPhone).

Para testar se o celular enxerga a API, abra `http://IP-DO-COMPUTADOR:8080/api/v1/health` no navegador do celular.

---

## Problemas comuns

| O que aparece | O que fazer |
|---|---|
| "Sem conexão com o servidor" | A API não está rodando ou o endereço do `.env` está errado. Suba a API, confira o `/health` e toque em **Tentar novamente**. |
| `npx` ou `npm` não é reconhecido | O Node.js não está instalado ou o terminal foi aberto antes da instalação. Instale e abra o terminal de novo. |
| Erro de módulo não encontrado ao rodar | Faltou o `npm install` neste computador. |
| Mudei o `.env` e nada mudou | Reinicie com `npx expo start -c`. |
| "Previsão para 20/08", mas hoje é outra data | É esperado: os dados da API são fixos de agosto de 2026, e ela devolve a previsão mais recente disponível. |
| No celular, não conecta à API | Confira se estão no mesmo Wi-Fi e se o Firewall do Windows liberou o Java. Redes de faculdade costumam bloquear a comunicação entre aparelhos. |

---

## Estrutura do projeto

```
App.js                        inicia o app e decide a tela (com ou sem modelo salvo)
src/
  screens/
    ModelSelectScreen.jsx     escolha do modelo de previsão
    HomeScreen.jsx            localização, previsão, próximas horas e atividade
    CompareScreen.jsx         comparação dos modelos no mesmo local e horário
    LocationPickerScreen.jsx  lista de pontos de medição para escolher um local
  components/
    ForecastCard.jsx          cartão com a previsão
    QualitySignal.jsx         barrinhas de sinal (Boa 3, Moderada 2, Instável 1)
    TimelineList.jsx          faixa das próximas horas
    BestTimeHint.jsx          destaque do melhor horário da faixa
    ActivityChecker.jsx       escolha da atividade e resultado
    StatusMessage.jsx         telas de carregando, erro e vazio
    ServerStatus.jsx          indicador de conexão com a API
  services/
    forecastApi.js            chamadas à API, com tempo limite de 60 s e erros padronizados
  storage/
    modelStorage.js           guarda o modelo escolhido no aparelho
  utils/
    formatters.js             cores, rótulos, horários (UTC → hora local), melhor horário e mensagens de erro
    places.js                 distância entre pontos e nome da região de cada ponto de medição
    theme.js                  cores e raios usados em todas as telas
```

> A API informa só as coordenadas dos pontos de medição, sem nomes de cidades. Os nomes que aparecem no app ("Região de São Paulo") vêm de uma lista de referência do próprio app, em `src/utils/places.js`.

Cada arquivo tem uma responsabilidade: as **telas** controlam o estado e as interações, os **componentes** só apresentam o que recebem por props, e o **serviço** é o único que conversa com a API.

---

## Tecnologias

- [React Native](https://reactnative.dev) com [Expo](https://expo.dev) (SDK 57)
- `expo-location` para a localização do aparelho
- `@react-native-async-storage/async-storage` para lembrar o modelo escolhido
- `react-native-safe-area-context` para respeitar as bordas da tela
- `react-native-web` para rodar no navegador
- `@expo/vector-icons` (Ionicons) para os ícones

---

Projeto acadêmico do Centro Universitário Braz Cubas: Programação para Dispositivos Móveis e Análise e Projeto de Sistemas II, 2026/2.
Squad **Soft in. Hard out.**: Daniel, Melissa, Samuel, Vinicius e Alexander.
