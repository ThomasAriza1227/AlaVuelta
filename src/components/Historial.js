import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { formatearCOP } from '../data/productos';

export default function Historial({ historial, onIrCatalogo }) {
  const [pedidoAbierto, setPedidoAbierto] = useState(null);

  if (historial.length === 0) {
    return (
      <View style={styles.vacioBox}>
        <Text style={styles.vacioTexto}>Aún no tienes pedidos registrados</Text>
        <Pressable style={styles.btnCatalogo} onPress={onIrCatalogo}>
          <Text style={styles.textoBtn}>Ir al catálogo</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <Text style={styles.titulo}>Historial de Pedidos</Text>

      {historial.map((pedido) => {
        const abierto = pedidoAbierto === pedido.codigo;
        return (
          <View key={pedido.codigo} style={styles.card}>
            <Pressable
              style={styles.cabecera}
              onPress={() => setPedidoAbierto(abierto ? null : pedido.codigo)}
            >
              <View>
                <Text style={styles.codigo}>{pedido.codigo}</Text>
                <Text style={styles.fecha}>{pedido.fecha}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.total}>{formatearCOP(pedido.total)} COP</Text>
                <Text style={styles.verDetalle}>{abierto ? 'Ocultar' : 'Ver detalle'}</Text>
              </View>
            </Pressable>

            {abierto && (
              <View style={styles.detalle}>
                <Text style={styles.cliente}>
                  Entrega: {pedido.comprador.nombre} - {pedido.comprador.municipio} ({pedido.comprador.direccion})
                </Text>
                {pedido.items.map((item) => (
                  <Text key={item.id} style={styles.lineaItem}>
                    {item.cantidad}x {item.nombre} ({formatearCOP(item.precio)} c/u)
                  </Text>
                ))}
                <Text style={styles.resumenExtra}>
                  Envío: {formatearCOP(pedido.envio)} | Descuento: -{formatearCOP(pedido.descuento)}
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { padding: 14, gap: 10 },
  titulo: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cabecera: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  codigo: { fontWeight: 'bold', color: '#1E3A5F', fontSize: 15 },
  fecha: { fontSize: 12, color: '#475569' },
  total: { fontWeight: 'bold', color: '#0F172A', fontSize: 14 },
  verDetalle: { fontSize: 12, color: '#1E3A5F', marginTop: 2 },
  detalle: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 4,
  },
  cliente: { fontSize: 12, color: '#334155', fontWeight: '600', marginBottom: 4 },
  lineaItem: { fontSize: 13, color: '#0F172A' },
  resumenExtra: { fontSize: 12, color: '#475569', marginTop: 4 },
  vacioBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, gap: 12 },
  vacioTexto: { fontSize: 15, color: '#475569' },
  btnCatalogo: {
    backgroundColor: '#1E3A5F',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  textoBtn: { color: '#FFFFFF', fontWeight: 'bold' },
});