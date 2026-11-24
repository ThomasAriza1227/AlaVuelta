import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';

export default function CentroAyuda({
  historial,
  tickets,
  onCrearTicket,
  onSimularRespuestaTicket,
}) {
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(
    historial.length > 0 ? historial[0].codigo : ''
  );
  const [motivo, setMotivo] = useState('Entrega');
  const [descripcion, setDescripcion] = useState('');

  const enviarSolicitud = () => {
    const codigoPedido = pedidoSeleccionado || (historial[0] ? historial[0].codigo : '');
    if (!codigoPedido) {
      Alert.alert('Sin pedido', 'Debes seleccionar un pedido del historial para crear una solicitud.');
      return;
    }
    if (descripcion.trim().length < 15) {
      Alert.alert('Descripción corta', 'Describe el inconveniente con al menos 15 caracteres.');
      return;
    }

    onCrearTicket({
      pedido: codigoPedido,
      motivo,
      descripcion: descripcion.trim(),
    });

    setDescripcion('');
    Alert.alert('Solicitud creada', 'Tu caso quedó registrado con estado Abierto.');
  };

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <Text style={styles.titulo}>Centro de Ayuda y Soporte</Text>

      {historial.length === 0 ? (
        <View style={styles.avisoBox}>
          <Text style={styles.avisoTexto}>
            No tienes pedidos en el historial para asociar una solicitud de ayuda.
          </Text>
        </View>
      ) : (
        <View style={styles.form}>
          <Text style={styles.subtitulo}>1. Selecciona el pedido</Text>
          <View style={styles.filaChips}>
            {historial.map((ped) => {
              const activo = (pedidoSeleccionado || historial[0].codigo) === ped.codigo;
              return (
                <Pressable
                  key={ped.codigo}
                  style={[styles.chip, activo && styles.chipActivo]}
                  onPress={() => setPedidoSeleccionado(ped.codigo)}
                >
                  <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]}>
                    {ped.codigo}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.subtitulo}>2. Motivo de la solicitud</Text>
          <View style={styles.filaChips}>
            {['Entrega', 'Producto', 'Otro'].map((item) => (
              <Pressable
                key={item}
                style={[styles.chip, motivo === item && styles.chipActivo]}
                onPress={() => setMotivo(item)}
              >
                <Text style={[styles.chipTexto, motivo === item && styles.chipTextoActivo]}>
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.subtitulo}>3. Detalle del inconveniente</Text>
          <TextInput
            style={styles.inputArea}
            placeholder="Describe tu solicitud (mínimo 15 caracteres)"
            multiline
            value={descripcion}
            onChangeText={setDescripcion}
          />

          <Pressable style={styles.btnPrimario} onPress={enviarSolicitud}>
            <Text style={styles.textoPrimario}>Enviar solicitud</Text>
          </Pressable>
        </View>
      )}

      <Text style={styles.subtitulo}>Mis solicitudes ({tickets.length})</Text>

      {tickets.length === 0 ? (
        <Text style={styles.vacioTexto}>No hay solicitudes registradas.</Text>
      ) : (
        tickets.map((t) => (
          <View key={t.id} style={styles.card}>
            <View style={styles.filaTop}>
              <Text style={styles.idTicket}>{t.id} · {t.pedido}</Text>
              <Text style={[styles.estado, t.estado === 'Respondido' && styles.estadoResp]}>
                {t.estado}
              </Text>
            </View>
            <Text style={styles.motivo}>Motivo: {t.motivo}</Text>
            <Text style={styles.desc}>{t.descripcion}</Text>

            {t.respuesta ? (
              <View style={styles.respuestaBox}>
                <Text style={styles.respuestaTitulo}>Respuesta simulada:</Text>
                <Text style={styles.respuestaTexto}>{t.respuesta}</Text>
              </View>
            ) : (
              <Pressable
                style={styles.btnSimular}
                onPress={() => onSimularRespuestaTicket(t.id)}
              >
                <Text style={styles.textoSimular}>Simular respuesta</Text>
              </Pressable>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { padding: 14, gap: 10 },
  titulo: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  subtitulo: { fontSize: 14, fontWeight: 'bold', color: '#0F172A', marginTop: 4 },
  form: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  filaChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  chipActivo: { backgroundColor: '#1E3A5F' },
  chipTexto: { fontSize: 12, color: '#334155', fontWeight: '600' },
  chipTextoActivo: { color: '#FFFFFF' },
  inputArea: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    padding: 10,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  btnPrimario: {
    backgroundColor: '#1E3A5F',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  textoPrimario: { color: '#FFFFFF', fontWeight: 'bold' },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  filaTop: { flexDirection: 'row', justifyContent: 'space-between' },
  idTicket: { fontWeight: 'bold', color: '#1E3A5F', fontSize: 13 },
  estado: { fontSize: 12, fontWeight: 'bold', color: '#D97706' },
  estadoResp: { color: '#16A34A' },
  motivo: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  desc: { fontSize: 13, color: '#475569' },
  respuestaBox: {
    backgroundColor: '#F1F5F9',
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  respuestaTitulo: { fontSize: 11, fontWeight: 'bold', color: '#1E3A5F' },
  respuestaTexto: { fontSize: 12, color: '#334155' },
  btnSimular: {
    backgroundColor: '#475569',
    paddingVertical: 7,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 6,
  },
  textoSimular: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  avisoBox: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avisoTexto: { color: '#475569', fontSize: 13 },
  vacioTexto: { color: '#64748B', fontSize: 13 },
});