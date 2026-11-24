import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { formatearCOP } from '../data/productos';

export default function Historial({
  historial,
  onAvanzarEstado,
  onCancelarPedido,
  onIrCatalogo,
}) {
  const [pedidoAbierto, setPedidoAbierto] = useState(
    historial.length > 0 ? historial[0].codigo : null
  );

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

  const confirmarCancelacion = (codigo) => {
    Alert.alert(
      'Cancelar pedido',
      `¿Deseas cancelar el pedido ${codigo} y devolver sus unidades al inventario?`,
      [
        { text: 'No', style: 'cancel' },
        { text: 'Sí, cancelar', style: 'destructive', onPress: () => onCancelarPedido(codigo) },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <Text style={styles.titulo}>Mis Pedidos</Text>

      {historial.map((pedido) => {
        const abierto = pedidoAbierto === pedido.codigo;
        const esCancelado = pedido.estado === 'Cancelado';
        const esEntregado = pedido.estado === 'Entregado';

        return (
          <View key={pedido.codigo} style={styles.card}>
            <Pressable
              style={styles.cabecera}
              onPress={() => setPedidoAbierto(abierto ? null : pedido.codigo)}
            >
              <View>
                <Text style={styles.codigo}>{pedido.codigo}</Text>
                <Text style={styles.fecha}>{pedido.fecha}</Text>
                <Text
                  style={[
                    styles.badgeEstado,
                    esCancelado && styles.estadoCancelado,
                    esEntregado && styles.estadoEntregado,
                  ]}
                >
                  Estado: {pedido.estado}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.total}>{formatearCOP(pedido.total)} COP</Text>
                <Text style={styles.verDetalle}>{abierto ? 'Ocultar' : 'Ver detalle'}</Text>
              </View>
            </Pressable>

            {abierto && (
              <View style={styles.detalle}>
                <Text style={styles.cliente}>
                  Entrega: {pedido.comprador.nombre} · {pedido.comprador.municipio} ({pedido.comprador.direccion})
                </Text>

                {pedido.items.map((item, index) => (
                  <Text key={item.keyUnico || index} style={styles.lineaItem}>
                    {item.cantidad}x {item.nombre}
                    {item.varianteEtiqueta ? ` (${item.varianteEtiqueta})` : ''} -{' '}
                    {formatearCOP(item.precio)} c/u
                  </Text>
                ))}

                <Text style={styles.resumenExtra}>
                  Envío: {formatearCOP(pedido.envio)} | Descuento: -{formatearCOP(pedido.descuento)}
                </Text>

                {/* Historial cronologico de estados */}
                <View style={styles.timelineBox}>
                  <Text style={styles.timelineTitulo}>Seguimiento cronológico:</Text>
                  {(pedido.historialEstados || []).map((ev, idx) => (
                    <Text key={idx} style={styles.timelineLinea}>
                      • {ev.estado} ({ev.fecha})
                    </Text>
                  ))}
                </View>

                {/* Controles de simulacion de entrega y cancelacion */}
                <View style={styles.filaAcciones}>
                  {!esCancelado && !esEntregado && (
                    <Pressable
                      style={styles.btnSimular}
                      onPress={() => onAvanzarEstado(pedido.codigo)}
                    >
                      <Text style={styles.textoSimular}>Simular avance de entrega</Text>
                    </Pressable>
                  )}

                  {!esCancelado && (
                    <Pressable
                      style={styles.btnCancelar}
                      onPress={() =>
                        pedido.estado === 'Confirmado' || pedido.estado === 'Preparando'
                          ? confirmarCancelacion(pedido.codigo)
                          : onCancelarPedido(pedido.codigo)
                      }
                    >
                      <Text style={styles.textoCancelar}>Cancelar pedido</Text>
                    </Pressable>
                  )}
                </View>
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
  badgeEstado: { fontSize: 12, fontWeight: 'bold', color: '#D97706', marginTop: 2 },
  estadoCancelado: { color: '#DC2626' },
  estadoEntregado: { color: '#16A34A' },
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
  timelineBox: {
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    gap: 2,
  },
  timelineTitulo: { fontSize: 12, fontWeight: 'bold', color: '#0F172A' },
  timelineLinea: { fontSize: 12, color: '#475569' },
  filaAcciones: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  btnSimular: {
    backgroundColor: '#1E3A5F',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  textoSimular: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  btnCancelar: {
    borderWidth: 1,
    borderColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  textoCancelar: { color: '#DC2626', fontSize: 12, fontWeight: 'bold' },
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