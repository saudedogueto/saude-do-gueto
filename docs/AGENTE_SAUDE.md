# 🧠 Agente de Saúde Offline — Plano

## Objetivo
Assistente de IA local (offline) no app Saúde do Gueto, especializado em atenção básica, rodando 100% no celular do ACS.

## Stack
- **Framework:** `react-native-executorch` (Software Mansion) via Expo
- **Modelo:** Llama 3.2 1B Instruct (quantizado Q4, ~700MB)
- **Download do modelo:** Primeiro uso com WiFi, armazena no cache do app
- **Contexto embutido:** Cadernos de Atenção Básica (SUS), protocolos de enfermagem, calendário vacinal

## Funcionalidades

### MVP (v1)
- Chat livre com o agente: "O que perguntar na visita de um hipertenso?"
- Contexto básico do SUS embutido no prompt do sistema
- Funciona offline total

### v2
- Integração com dados do app: "Resumo dos pacientes da microárea 2"
- Sugestão de roteiro de visita baseado nas comorbidades do paciente
- Alertas: "Maria está sem visita há 45 dias"

### v3
- Transcrição de voz (offline com Whisper.cpp)
- Agente ouve o relato do ACS e gera o resumo da visita automaticamente

## Desafios
- **Tamanho do download:** ~700MB na primeira vez (planejar baixar em WiFi)
- **Celulares fracos:** Testar em dispositivos básicos (2-3GB RAM)
- **Modelo pequeno:** Respostas mais simples que GPT, mas suficiente pra saúde básica
- **Aquecimento:** Processamento contínuo pode aquecer o celular

## Próximos Passos

### 🔜 Imediato (pós 01/06, depois do APK)
1. Criar branch `feature/agente-saude` no repositório
2. Instalar `react-native-executorch` e testar exemplo do Llama Chat
3. Definir prompt do sistema com os protocolos de atenção básica
4. Criar tela de Chat no app

### 📥 Médio prazo
5. Integrar com dados locais (pacientes, visitas) pra respostas contextuais
6. Testar em celular real (Android básico)
7. Otimizar tamanho do modelo (testar Phi-3 Mini como alternativa)

### 🚀 Longo prazo
8. Whisper.cpp para transcrição de voz offline
9. Agente proativo (notificações locais com sugestões)

## Modelos candidatos
| Modelo | Tamanho (Q4) | RAM | Qualidade |
|--------|-------------|-----|-----------|
| Llama 3.2 1B | ~700MB | 2GB+ | Boa pra tarefas simples |
| Llama 3.2 3B | ~1.8GB | 4GB+ | Muito melhor, mas pesado |
| Phi-3 Mini 3.8B | ~2.2GB | 4GB+ | Ótimo custo-benefício |
| Gemma 2 2B | ~1.3GB | 3GB+ | Bom, alternativo |

**Foco:** Llama 3.2 1B como padrão (roda em qualquer celular), Phi-3 Mini como upgrade.
