import React from 'react';
import { View, Text, Pressable, FlatList, StyleSheet } from 'react-native';
import { formatearCOP } from '../data/productos';

export default function Favoritos({
  productos,
  favoritos,
  onAlternarFavorito,
  onVerDetalle,
  onIrCatalogo,
}) {
  const listaFavoritos = productos.filter((p) => favoritos.includes(p.id));

  if (listaFavoritos.length === 0) {
    return (
      <View style={styles.vacioBox}>
        <Text style={styles.vacioTexto}>No tienes productos guardados en favoritos</Text>
        <Pressable style={styles.btnCatalogo} onPress={onIrCatalogo}>
          <Text style={styles.textoBtn}>Volver al catálogo</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Mis Favoritos</Text>
      <FlatList
        data={listaFavoritos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 10 }}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => onVerDetalle(item.id)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.nombre}>{item.nombre}</Text>
              <Text style={styles.precio}>{formatearCOP(item.precio)} COP</Text>
            </View>
            <Pressable
              style={styles.btnQuitar}
              onPress={() => onAlternarFavorito(item.id)}
            >
              <Text style={styles.textoQuitar}>Quitar</Text>
            </Pressable>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, padding: 14 },
  titulo: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  nombre: { fontWeight: 'bold', color: '#0F172A', fontSize: 14 },
  precio: { color: '#1E3A5F', fontWeight: '600', marginTop: 2 },
  btnQuitar: {
    borderWidth: 1,
    borderColor: '#DC2626',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  textoQuitar: { color: '#DC2626', fontSize: 12, fontWeight: 'bold' },
  vacioBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, gap: 12 },
  vacioTexto: { fontSize: 15, color: '#475569', textAlign: 'center' },
  btnCatalogo: {
    backgroundColor: '#1E3A5F',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  textoBtn: { color: '#FFFFFF', fontWeight: 'bold' },
});