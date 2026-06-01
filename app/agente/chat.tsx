import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { useTema } from '@/src/contexts/TemaContext';
import { usePacientes } from '@/src/contexts/PacienteContext';
import { useVisitas } from '@/src/contexts/VisitaContext';
import { useFamilias } from '@/src/contexts/FamiliaContext';

type Mensagem = {
  id: string;
  texto: string;
  remetente: 'user' | 'agente';
};

export default function ChatScreen() {
  const { cores } = useTema();
  const { pacientes } = usePacientes();
  const { visitas } = useVisitas();
  const { familias } = useFamilias();
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      id: '0',
      texto: 'Olá! Sou o Agente de Saúde, seu copiloto clínico-territorial offline. Baseado nos dados do seu território, posso ajudar com:\n\n• Resumo de famílias e pacientes\n• Sugestões de perguntas para a visita\n• Alertas de risco\n• Orientações baseadas em protocolos SUS\n\nO que você precisa?',
      remetente: 'agente',
    },
  ]);
  const [input, setInput] = useState('');
  const [pensando, setPensando] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const hipertensos = pacientes.filter(p => p.hipertensao).length;
  const diabeticos = pacientes.filter(p => p.diabetes).length;
  const gestantes = pacientes.filter(p => p.gestante).length;

  const gerarResposta = (pergunta: string): string => {
    const q = pergunta.toLowerCase();

    if (q.includes('resumo') || q.includes('território') || q.includes('territorio')) {
      return `📋 **Resumo do Território**

• Total de pacientes: ${pacientes.length}
• Total de famílias: ${familias.length}
• Hipertensos: ${hipertensos}
• Diabéticos: ${diabeticos}
• Gestantes: ${gestantes}
• Total de visitas registradas: ${visitas.length}

Famílias sem visita há 90 dias: ${pacientes.filter(p => {
  if (!p.ultimaVisita) return true;
  const dias = Math.floor((Date.now() - new Date(p.ultimaVisita).getTime()) / (1000 * 60 * 60 * 24));
  return dias > 90;
}).length}

Risco de isolamento: ${pacientes.filter(p => !p.ultimaVisita).length} pacientes nunca visitados.`;

    }

    if (q.includes('pergunta') || q.includes('pergunt') || q.includes('sugestão') || q.includes('sugestao')) {
      return `💡 **Sugestões de perguntas para a visita de hoje:**

1. O(A) senhor(a) está tomando os medicamentos direitinho?
2. Teve alguma consulta ou exame desde a última visita?
3. Alguém na casa está com febre, tosse ou falta de ar?
4. As crianças estão com as vacinas em dia?
5. Precisa de agendamento na UBS?

Lembre-se: adapte as perguntas conforme o perfil da família.`;
    }

    if (q.includes('alerta') || q.includes('risco') || q.includes('urgente')) {
      let alertas = [];
      const semVisita = pacientes.filter(p => !p.ultimaVisita).length;
      if (semVisita > 0) alertas.push(`🔴 ${semVisita} paciente(s) nunca foram visitados`);
      if (hipertensos > 0) alertas.push(`🟠 ${hipertensos} hipertenso(s) — priorize verificação de PA`);
      if (gestantes > 0) alertas.push(`🟣 ${gestantes} gestante(s) — confirmar pré-natal`);
      if (diabeticos > 0) alertas.push(`🔵 ${diabeticos} diabético(s) — verificar glicemia`);

      return `⚠️ **Alertas detectados no território**

${alertas.join('\n')}

💡 Priorize do mais urgente ao menos urgente.`;
    }

    if (q.includes('família') || q.includes('familia') || q.includes('familias') || q.includes('famílias')) {
      let resumo = `👨‍👩‍👧‍👦 **Famílias cadastradas: ${familias.length}**\n\n`;
      familias.slice(0, 5).forEach(f => {
        resumo += `• ${f.nome} ${f.responsavel ? `(Resp: ${f.responsavel})` : ''}\n`;
      });
      if (familias.length > 5) resumo += `\n...e mais ${familias.length - 5} família(s)`;
      return resumo;
    }

    // Resposta padrão baseada em protocolos SUS
    return `🧠 **Análise do Agente de Saúde**

Com base nos dados disponíveis (${pacientes.length} pacientes, ${familias.length} famílias, ${visitas.length} visitas), sugiro:

1️⃣ Priorize famílias sem visita recente
2️⃣ Verifique hipertensos e diabéticos com acompanhamento
3️⃣ Confirme vacinação de crianças < 2 anos
4️⃣ Gestantes com pré-natal em dia

Use linguagem clara e direta. Acolha a família. Registre tudo no app.

⚕️ Lembre-se: IA é ferramenta de apoio. Decisões clínicas com o enfermeiro/médico da UBS.`;
  };

  const enviarMensagem = () => {
    if (!input.trim() || pensando) return;

    const novaMsg: Mensagem = { id: Date.now().toString(), texto: input, remetente: 'user' };
    setMensagens(prev => [...prev, novaMsg]);
    setInput('');
    setPensando(true);

    // Simula processamento da IA local
    setTimeout(() => {
      const resposta = gerarResposta(input);
      setMensagens(prev => [...prev, { id: (Date.now() + 1).toString(), texto: resposta, remetente: 'agente' }]);
      setPensando(false);
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: cores.fundo }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={mensagens}
        keyExtractor={item => item.id}
        style={styles.chatList}
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        renderItem={({ item }) => (
          <View style={[
            styles.bolha,
            item.remetente === 'user' ? styles.bolhaUser : styles.bolhaAgente,
            { backgroundColor: item.remetente === 'user' ? '#FF8C00' : cores.card }
          ]}>
            <Text style={[
              styles.bolhaTexto,
              { color: item.remetente === 'user' ? '#FFF' : '#333' }
            ]}>
              {item.texto}
            </Text>
          </View>
        )}
        ListFooterComponent={pensando ? (
          <View style={[styles.bolha, styles.bolhaAgente, { backgroundColor: cores.card }]}>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              <ActivityIndicator size="small" color="#FF8C00" />
              <Text style={{ color: '#999', marginLeft: 8 }}>Agente pensando...</Text>
            </View>
          </View>
        ) : null}
      />

      <View style={[styles.inputContainer, { backgroundColor: cores.card }]}>
        <TextInput
          style={[styles.input, { color: cores.texto, backgroundColor: cores.fundo }]}
          value={input}
          onChangeText={setInput}
          placeholder="Digite sua pergunta..."
          placeholderTextColor="#999"
          multiline
          onSubmitEditing={enviarMensagem}
        />
        <TouchableOpacity style={styles.btnEnviar} onPress={enviarMensagem}>
          <Text style={styles.btnEnviarText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  chatList: { flex: 1 },
  chatContent: { padding: 16, paddingBottom: 8 },
  bolha: { maxWidth: '85%', padding: 12, borderRadius: 12, marginBottom: 10 },
  bolhaUser: { alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  bolhaAgente: { alignSelf: 'flex-start', borderBottomLeftRadius: 4, elevation: 1 },
  bolhaTexto: { fontSize: 15, lineHeight: 22 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', padding: 8, gap: 8,
    borderTopWidth: 1, borderTopColor: '#E0E0E0',
  },
  input: {
    flex: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
    maxHeight: 100, fontSize: 15,
  },
  btnEnviar: {
    backgroundColor: '#FF8C00', width: 60, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  btnEnviarText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
});
