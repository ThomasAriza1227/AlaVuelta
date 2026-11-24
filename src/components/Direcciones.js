import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';

export default function Direcciones({
  direcciones,
  direccionSeleccionadaId,
  onSeleccionarDireccion,
  onGuardarDireccion,
  onMarcarPrincipal,
}) {
  const [idEditando, setIdEditando] = useState(null);
  const [alias, setAlias] = useState('');
  const [municipio, setMunicipio] = useState('Mosquera');
  const [descripcion, setDescripcion] = useState('');

  const limpiarFormulario = () => {
    setIdEditando(null);
    setAlias('');
    setMunicipio('Mosquera');
    setDescripcion('');
  };

  const iniciarEdicion = (dir) => {
    setIdEditando(dir.id);
    setAlias(dir.alias);
    setMunicipio(dir.municipio);
    setDescripcion(dir.descripcion);
  };

  const guardar = () => {
    if (!alias.trim()) {
      setAlerta('Falta el alias (ej. Casa, Oficina).');
      return Alert.alert('Dato faltante', 'Ingresa un alias.');
    }
    if (!municipio.trim()) {
      setAlerta('Falta indicar el municipio de entrega.');
      return Alert.alert('Dato faltante', 'Ingresa el municipio.');
    }
    if (!descripcion.trim()) {
      setAlerta('Falta escribir la dirección y referencia de entrega.');
      return Alert.alert('Dato faltante', 'Ingresa la dirección.');
    }
    setAlerta('');
    onGuardarDireccion(
      { id: idEditando, alias: alias.trim(), municipio: municipio.trim(), descripcion: descripcion.trim() },
      Boolean(idEditando)
    );
    Alert.alert('Listo', idEditando ? 'Dirección actualizada.' : 'Dirección registrada.');
    limpiarFormulario();
  };

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <Text style={styles.titulo}>Mis Direcciones</Text>

      <View style={styles.form}>
        <Text style={styles.subtitulo}>
          {idEditando ? 'Editar dirección' : 'Agregar nueva dirección'}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Alias (ej: Casa, Oficina)"
          value={alias}
          onChangeText={setAlias}
        />

        <View style={styles.filaMunicipios}>
          {['Mosquera', 'Funza', 'Madrid'].map((mun) => (
            <Pressable
              key={mun}
              style={[styles.chip, municipio === mun && styles.chipActivo]}
              onPress={() => setMunicipio(mun)}
            >
              <Text style={[styles.chipTexto, municipio === mun && styles.chipTextoActivo]}>
                {mun}
              </Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Municipio"
          value={municipio}
          onChangeText={setMunicipio}
        />

        <TextInput
          style={styles.input}
          placeholder="Dirección y referencia (ej: Calle 5 #10-20, Apto 201)"
          value={descripcion}
          onChangeText={setDescripcion}
        />

        <Pressable style={styles.btnPrimario} onPress={guardar}>
          <Text style={styles.textoPrimario}>
            {idEditando ? 'Guardar cambios' : 'Registrar dirección'}
          </Text>
        </Pressable>

        {idEditando && (
          <Pressable style={styles.btnCancelar} onPress={limpiarFormulario}>
            <Text style={styles.textoCancelar}>Cancelar edición</Text>
          </Pressable>
        )}
      </View>

      <Text style={styles.subtitulo}>Direcciones guardadas</Text>

      {direcciones.map((dir) => {
        const seleccionada = dir.id === direccionSeleccionadaId;
        return (
          <View
            key={dir.id}
            style={[styles.card, seleccionada && styles.cardSeleccionada]}
          >
            <View style={styles.cabeceraCard}>
              <Text style={styles.alias}>{dir.alias}</Text>
              {dir.principal && (
                <View style={styles.badgePrincipal}>
                  <Text style={styles.textoBadge}>Principal</Text>
                </View>
              )}
            </View>

            <Text style={styles.municipio}>{dir.municipio}</Text>
            <Text style={styles.desc}>{dir.descripcion}</Text>

            <View style={styles.accionesCard}>
              <Pressable
                style={[styles.btnAccion, seleccionada && styles.btnAccionActiva]}
                onPress={() => onSeleccionarDireccion(dir.id)}
              >
                <Text style={[styles.textoAccion, seleccionada && styles.textoAccionActiva]}>
                  {seleccionada ? 'Seleccionada para envío' : 'Usar para envío'}
                </Text>
              </Pressable>

              {!dir.principal && (
                <Pressable
                  style={styles.btnSecundario}
                  onPress={() => onMarcarPrincipal(dir.id)}
                >
                  <Text style={styles.textoSecundario}>Hacer principal</Text>
                </Pressable>
              )}

              <Pressable
                style={styles.btnSecundario}
                onPress={() => iniciarEdicion(dir)}
              >
                <Text style={styles.textoSecundario}>Editar</Text>
              </Pressable>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { padding: 14, gap: 10 },
  titulo: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  subtitulo: { fontSize: 14, fontWeight: 'bold', color: '#0F172A' },
  form: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  filaMunicipios: { flexDirection: 'row', gap: 6 },
  chip: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  chipActivo: { backgroundColor: '#1E3A5F' },
  chipTexto: { fontSize: 12, color: '#334155' },
  chipTextoActivo: { color: '#FFFFFF', fontWeight: 'bold' },
  btnPrimario: {
    backgroundColor: '#1E3A5F',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  textoPrimario: { color: '#FFFFFF', fontWeight: 'bold' },
  btnCancelar: { alignItems: 'center', paddingVertical: 4 },
  textoCancelar: { color: '#475569', fontSize: 13 },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  cardSeleccionada: { borderColor: '#1E3A5F', borderWidth: 2 },
  cabeceraCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  alias: { fontWeight: 'bold', fontSize: 15, color: '#0F172A' },
  badgePrincipal: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  textoBadge: { color: '#1E3A5F', fontSize: 11, fontWeight: 'bold' },
  municipio: { fontSize: 13, fontWeight: '600', color: '#1E3A5F' },
  desc: { fontSize: 13, color: '#475569' },
  accionesCard: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  btnAccion: {
    borderWidth: 1,
    borderColor: '#1E3A5F',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  btnAccionActiva: { backgroundColor: '#1E3A5F' },
  textoAccion: { fontSize: 12, color: '#1E3A5F', fontWeight: '600' },
  textoAccionActiva: { color: '#FFFFFF' },
  btnSecundario: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  textoSecundario: { fontSize: 12, color: '#334155', fontWeight: '600' },
});