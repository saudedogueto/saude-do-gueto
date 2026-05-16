import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput,
} from 'react-native';
import { useFamilias } from '@/src/contexts/FamiliaContext';
import { usePacientes } from '@/src/contexts/PacienteContext';
import { useTema } from '@/src/contexts/TemaContext';
import { router, useFocusEffect } from 'expo-router';

type FamiliaComPacientes = {
  familia: import('@/src/contexts/FamiliaContext').Familia;
  pacientes: import('@/src/contexts/PacienteContext').Paciente[];
};

export default function MapaSocialScreen() {
  const { familias, carregarFamilias } = useFamilias();
  const { pacientes, carregarPacientes } = usePacientes();
  const { cores } = useTema();
  const [filtroRua, setFiltroRua] = useState('');

  useFocusEffect(useCallback(() => {
    carregarFamilias();
    carregarPacientes();
  }, []));

  // Mapa: rua → famílias
  const familiasComPacientes: FamiliaComPacientes[] = familias.map(f => ({
    familia: f,
    pacientes: f.membros
      .map(id => pacientes.find(p => p.id === id))
      .filter((p): p is import('@/src/contexts/PacienteContext').Paciente => !!p),
  }));

  // Extrai o nome da rua do endereço (ex: "Rua das Flores, 123" → "Rua das Flores")
  const getRua = (endereco: string) => {
    if (!endereco) return 'Sem rua';
    const partes = endereco.split(',');
    return partes[0].trim();
  };

  // Agrupa por rua
  const ruas = new Map<string, FamiliaComPacientes[]>();
  for (const fp of familiasComPacientes) {
    const rua = getRua(fp.familia.endereco);
    if (!ruas.has(rua)) ruas.set(rua, []);
    ruas.get(rua)!.push(fp);
  }

  // Filtra por nome de rua
  const ruasFiltradas = filtroRua.trim()
    ? Array.from(ruas.entries()).filter(([rua]) =>
        rua.toLowerCase().includes(filtroRua.toLowerCase())
      )
    : Array.from(ruas.entries());

  // Ordena ruas alfabeticamente
  ruasFiltradas.sort(([a], [b]) => a.localeCompare(b));

  const getCondicoes = (p: import('@/src/contexts/PacienteContext').Paciente) => {
    const tags: { label: string; bg: string; color: string }[] = [];
    if (p.hipertensao) tags.push({ label: 'HAS', bg: '#FFCDD2', color: '#C62828' });
    if (p.diabetes) tags.push({ label: 'DM', bg: '#BBDEFB', color: '#1565C0' });
    if (p.gestante) tags.push({ label: 'Gestante', bg: '#F8BBD0', color: '#AD1457' });
    if (p.menorDoisAnos) tags.push({ label: '<2 anos', bg: '#C8E6C9', color: '#2E7D32' });
    return tags;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: cores.fundo }]}>
      {/* Busca por rua */}
      <View style={styles.searchBox}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: cores.input, color: cores.texto, borderColor: cores.borda }]}
          placeholder="Buscar por nome da rua..."
          placeholderTextColor={cores.textoSecundario}
          value={filtroRua}
          onChangeText={setFiltroRua}
        />
      </View>

      {ruasFiltradas.length === 0 && (
        <View style={styles.vazio}>
          <Text style={[styles.vazioTexto, { color: cores.textoSecundario }]}>
            {familias.length === 0
              ? 'Nenhuma família cadastrada ainda.\nVá em 👨‍👩‍👧‍👦 Famílias para cadastrar!'
              : 'Nenhuma rua encontrada com esse nome.'}
          </Text>
        </View>
      )}

      {ruasFiltradas.map(([rua, familiasDaRua]) => (
        <View key={rua} style={styles.ruaBloco}>
          {/* Cabeçalho da rua */}
          <View style={styles.ruaHeader}>
            <Text style={styles.ruaIcon}>📍</Text>
            <Text style={styles.ruaNome}>{rua}</Text>
            <View style={styles.ruaBadge}>
              <Text style={styles.ruaBadgeText}>{familiasDaRua.length} família(s)</Text>
            </View>
          </View>

          {/* Famílias dessa rua */}
          {familiasDaRua.map(({ familia, pacientes: membros }) => (
            <TouchableOpacity
              key={familia.id}
              style={[styles.familiaCard, { backgroundColor: cores.card, borderColor: cores.borda }]}
              onPress={() => router.push(`/(tabs)/familias`)}
              activeOpacity={0.7}
            >
              {/* Linha do responsável */}
              <View style={styles.familiaHeader}>
                {(() => {
                  const primeiroMembro = membros[0];
                  if (primeiroMembro?.foto) {
                    return <Image source={{ uri: primeiroMembro.foto }} style={styles.familiaFoto} />;
                  }
                  return (
                    <View style={[styles.familiaFoto, styles.familiaFotoPlaceholder]}>
                      <Text style={styles.familiaFotoPlaceholderText}>
                        {familia.nomeResponsavel.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  );
                })()}
                <View style={{ flex: 1 }}>
                  <Text style={[styles.familiaNome, { color: cores.texto }]}>
                    👨‍👩‍👧‍👦 {familia.nomeResponsavel}
                  </Text>
                  <Text style={[styles.familiaEndereco, { color: cores.textoSecundario }]}>
                    📍 {familia.endereco}
                  </Text>
                  {familia.telefone ? (
                    <Text style={[styles.familiaTel, { color: cores.textoSecundario }]}>
                      📞 {familia.telefone}
                    </Text>
                  ) : null}
                </View>
                <Text style={styles.familiaSeta}>›</Text>
              </View>

              {/* Membros da família */}
              {membros.length > 0 && (
                <View style={[styles.membrosArea, { borderTopColor: cores.borda }]}>
                  <Text style={[styles.membrosLabel, { color: cores.textoSecundario }]}>
                    👥 Membros ({membros.length})
                  </Text>
                  {membros.map(m => (
                    <TouchableOpacity
                      key={m.id}
                      style={styles.membroRow}
                      onPress={() => router.push(`/(tabs)/detalhes?id=${m.id}`)}
                    >
                      {m.foto ? (
                        <Image source={{ uri: m.foto }} style={styles.membroFoto} />
                      ) : (
                        <View style={[styles.membroFoto, styles.membroFotoPlaceholder]}>
                          <Text style={styles.membroFotoPlaceholderText}>
                            {m.nome.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.membroNome, { color: cores.texto }]}>{m.nome}</Text>
                        <View style={styles.tagsRow}>
                          {getCondicoes(m).map((tag, i) => (
                            <Text key={i} style={[styles.tag, { backgroundColor: tag.bg, color: tag.color }]}>
                              {tag.label}
                            </Text>
                          ))}
                        </View>
                      </View>
                      <Text style={styles.membroSeta}>›</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {membros.length === 0 && (
                <View style={[styles.membrosArea, { borderTopColor: cores.borda }]}>
                  <Text style={[styles.membrosLabel, { color: cores.textoSecundario }]}>
                    👥 Sem membros cadastrados
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  searchBox: {
    marginBottom: 12,
  },
  searchInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  vazio: {
    marginTop: 80,
    alignItems: 'center',
  },
  vazioTexto: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  ruaBloco: {
    marginBottom: 16,
  },
  ruaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  ruaIcon: {
    fontSize: 16,
  },
  ruaNome: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FF8C00',
    flex: 1,
  },
  ruaBadge: {
    backgroundColor: '#FF8C0020',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  ruaBadgeText: {
    fontSize: 12,
    color: '#FF8C00',
    fontWeight: '600',
  },
  familiaCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
  },
  familiaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  familiaFoto: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  familiaFotoPlaceholder: {
    backgroundColor: '#FF8C00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  familiaFotoPlaceholderText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  familiaNome: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  familiaEndereco: {
    fontSize: 13,
    marginTop: 2,
  },
  familiaTel: {
    fontSize: 13,
    marginTop: 1,
  },
  familiaSeta: {
    fontSize: 22,
    color: '#CCC',
    fontWeight: 'bold',
  },
  membrosArea: {
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  membrosLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  membroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  membroFoto: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  membroFotoPlaceholder: {
    backgroundColor: '#FF8C20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  membroFotoPlaceholderText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  membroNome: {
    fontSize: 14,
    fontWeight: '500',
  },
  membroSeta: {
    fontSize: 18,
    color: '#CCC',
    fontWeight: 'bold',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 3,
    flexWrap: 'wrap',
  },
  tag: {
    fontSize: 10,
    fontWeight: '600',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    overflow: 'hidden',
  },
});
