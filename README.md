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
| Comparar modelos | A previsão de todos os modelos lado a lado, para o mesmo local e horário (sem declarar vencedor) | `GET /api/v1/forecasts/probes/{id}/compare` |

Se o usuário negar a localização, ele pode **escolher um local na lista** de pontos de medição. Sem conexão com a API, ele mostra uma mensagem com a opção de tentar de novo, em vez de travar.

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

Para ver no tamanho de um celular, aperte **F12** e depois **Ctrl+Shift+M**. Quando o navegador pedir a localização, clique em **Permitir**.

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
  services/
    forecastApi.js            chamadas à API, com tempo limite de 60 s e erros padronizados
  storage/
    modelStorage.js           guarda o modelo escolhido no aparelho
  utils/
    formatters.js             cores, rótulos, horários (UTC → hora local), melhor horário e mensagens de erro
    places.js                 distância entre pontos e nome da região de cada ponto de medição
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

---

Projeto acadêmico do Centro Universitário Braz Cubas: Programação para Dispositivos Móveis e Análise e Projeto de Sistemas II, 2026/2.
Squad **Soft in. Hard out.**: Daniel, Melissa, Samuel, Vinicius e Alexander.
