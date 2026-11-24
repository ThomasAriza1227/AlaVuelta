import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';

export default function Notificaciones({ notificaciones, onMarcarLeida }) {
  if (notificaciones.length === 0) {
    return (
      <View style={styles.vacioBox}>
        <Text style={styles.vacioTitulo}>Sin notificaciones</Text>
        <Text style={styles.vacioTexto}>
          Aquí aparecerán los avisos sobre el estado de tus pedidos y reposiciones de inventario.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <Text style={styles.titulo}>Centro de Notificaciones</Text>
      <Text style={styles.subtitulo}>Toca un aviso para marcarlo como leído</Text>

      {notificaciones.map((notif) => (
        <Pressable
          key={notif.id}
          style={[styles.card, !notif.leida && styles.cardNoLeida]}
          onPress={() => onMarcarLeida(notif.id)}
        >
          <View style={styles.filaTop}>
            <Text style={styles.tipo}>{notif.tipo}</Text>
            <Text style={styles.estado}>{notif.leida ? 'Leída' : 'Nueva'}</Text>
          </View>
          <Text style={styles.mensaje}>{notif.mensaje}</Text>
          <Text style={styles.fecha}>{notif.fecha}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { padding: 14, gap: 10 },
  titulo: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  subtitulo: { fontSize: 12, color: '#475569' },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  cardNoLeida: {
    borderLeftWidth: 4,
    borderLeftColor: '#1E3A5F',
    backgroundColor: '#F8FAFC',
  },
  filaTop: { flexDirection: 'row', justifyContent: 'space-between' },
  tipo: { fontSize: 12, fontWeight: 'bold', color: '#1E3A5F' },
  estado: { fontSize: 11, fontWeight: 'bold', color: '#475569' },
  mensaje: { fontSize: 13, color: '#0F172A' },
  fecha: { fontSize: 11, color: '#64748B', marginTop: 2 },
  vacioBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 8 },
  vacioTitulo: { fontSize: 17, fontWeight: 'bold', color: '#0F172A' },
  vacioTexto: { fontSize: 14, color: '#475569', textAlign: 'center' },
});