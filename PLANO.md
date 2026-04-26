# PLANO - Saúde do Gueto 🐢 v2.0

## Missão
Ferramenta digital gratuita para Agentes Comunitários de Saúde (ACS) que atuam em áreas periféricas, comunidades e territórios de difícil acesso. O app substitui a fichinha de papel e organiza o trabalho na ponta.

## Público-Alvo
- Agentes Comunitários de Saúde
- Comunidades periféricas e áreas de difícil acesso
- Trabalhadores da saúde da família

---

## Status das Fases

### ✅ FASE 1 - Núcleo
- Login com senha numérica (4-6 dígitos)
- Dashboard com total de pacientes + cards (hipertensos, diabéticos, gestantes)
- Cadastro de paciente (nome, SUS, telefone, endereço, microárea, condições, obs)
- Lista de pacientes com busca por nome/SUS/telefone
- Detalhes do paciente (ficha completa)
- Editar e excluir paciente (long press)
- 100% offline (AsyncStorage)

### ✅ FASE 2 - Visitas Domiciliares
- Registrar visita: seletor de paciente com busca, data, hora, motivo (rotina/retorno/queixa/encaminhamento)
- Sinais vitais: pressão sistólica/diastólica, glicemia
- Vacinas em dia (sim/não)
- Observações e próxima visita agendada
- Histórico de visitas agrupado por paciente (expansível)
- Excluir visita (long press)

### ✅ FASE 3 - Relatórios e Dados
- Tela de relatórios: filtro geral/mês/semana
- Estatísticas: total pacientes, % hipertensos, diabéticos, gestantes
- Visitas: total, pacientes visitados, por motivo
- Exportar pacientes (CSV)
- Exportar visitas (CSV)

### ✅ FASE 4 - Comunidade e Sincronia
- Cadastro de famílias (responsável, endereço, microárea, telefone)
- Vinculação de pacientes como membros da família
- Remoção de membros
- Backup manual (exporta JSON completo)
- Restauração de backup
- Status do armazenamento

### ✅ FASE 5 - Avançado
- Tema escuro (claro/escuro/sistema) aplicado em TODAS as telas
- Tela de configurações (tema, sobre, limpar dados, logout)
- Exportação compatível com e-SUS / SIS Online
- Filtro de pacientes por condição (HAS/DM/GEST) na lista
- Lembretes de visita agendada
- Notificações locais (expo-notifications)
- Tela de lembretes: pendentes (com checkbox) e concluídos

---

## Telas Atuais (12 telas)
1. **Index** → Tela inicial com logo e entrar
2. **Login** → Senha numérica
3. **Dashboard** → Menu principal com atalhos
4. **Cadastro** → Novo ou editar paciente
5. **Lista** → Pacientes com busca + filtro por condição
6. **Detalhes** → Ficha completa do paciente
7. **Visita** → Registrar visita domiciliar
8. **Histórico** → Histórico de visitas agrupado
9. **Relatórios** → Estatísticas e exportação
10. **Famílias** → Cadastro e vinculação de famílias
11. **Backup** → Exportar/restaurar dados
12. **Config** → Tema, sobre, limpar dados
13. **e-SUS / SIS Online** → Exportação por competência
14. **Lembretes** → Pendentes e concluídos

## Futuro
- [ ] Mapa do território
- [ ] Gráficos visuais (barras/pizza)
- [ ] Sincronia automática na nuvem (Google Drive / Firebase)
- [ ] Compartilhamento de dados com equipe
- [ ] Integração com APIs oficiais (e-SUS AB, RNDS)
- [ ] Versão web
