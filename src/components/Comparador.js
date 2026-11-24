import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { formatearCOP, obtenerStockProducto } from '../data/productos';

export default function Comparador({
  productos,
  comparacion,
  onQuitarComparacion,
  onVerDetalle,
  onIrCatalogo,
}) {
  const listaComparar = productos.filter((p) => comparacion.includes(p.id));

  if (listaComparar.length < 2) {
    return (
      <View style={styles.vacioBox}>
        <Text style={styles.vacioTitulo}>Comparador de productos</Text>
        <Text style={styles.vacioTexto}>
          Selecciona entre 2 y 3 productos desde el catálogo para compararlos lado a lado (tienes {listaComparar.length}).
        </Text>
        <Pressable style={styles.btnPrimario} onPress={onIrCatalogo}>
          <Text style={styles.textoPrimario}>Ir al catálogo</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <Text style={styles.titulo}>Comparando {listaComparar.length} productos</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View style={styles.filaColumnas}>
          {listaComparar.map((prod) => {
            const stockTotal = obtenerStockProducto(prod);
            return (
              <View key={prod.id} style={styles.columna}>
                <Text style={styles.nombre}>{prod.nombre}</Text>

                <View style={styles.datoBox}>
                  <Text style={styles.etiqueta}>Marca</Text>
                  <Text style={styles.valor}>{prod.marca || 'Genérica'}</Text>
                </View>

                <View style={styles.datoBox}>
                  <Text style={styles.etiqueta}>Categoría</Text>
                  <Text style={styles.valor}>{prod.categoria}</Text>
                </View>

                <View style={styles.datoBox}>
                  <Text style={styles.etiqueta}>Precio base</Text>
                  <Text style={styles.precio}>{formatearCOP(prod.precio)} COP</Text>
                </View>

                <View style={styles.datoBox}>
                  <Text style={styles.etiqueta}>Disponibilidad</Text>
                  <Text style={[styles.valor, stockTotal === 0 && styles.agotado]}>
                    {stockTotal > 0 ? `${stockTotal} unidades` : 'Agotado'}
                  </Text>
                </View>

                <View style={styles.datoBox}>
                  <Text style={styles.etiqueta}>Variantes</Text>
                  <Text style={styles.valor}>
                    {prod.variantes ? `${prod.variantes.length} opciones` : 'Única'}
                  </Text>
                </View>

                <Pressable
                  style={styles.btnVer}
                  onPress={() => onVerDetalle(prod.id)}
                >
                  <Text style={styles.textoVer}>Ver detalle</Text>
                </Pressable>

                <Pressable
                  style={styles.btnQuitar}
                  onPress={() => onQuitarComparacion(prod.id)}
                >
                  <Text style={styles.textoQuitar}>Retirar</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { padding: 14, gap: 12 },
  titulo: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  filaColumnas: { flexDirection: 'row', gap: 10, paddingBottom: 10 },
  columna: {
    width: 175,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 8,
  },
  nombre: { fontWeight: 'bold', fontSize: 14, color: '#0F172A', minHeight: 38 },
  datoBox: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 6 },
  etiqueta: { fontSize: 11, color: '#64748B' },
  valor: { fontSize: 13, color: '#0F172A', fontWeight: '600' },
  precio: { fontSize: 14, color: '#1E3A5F', fontWeight: 'bold' },
  agotado: { color: '#DC2626' },
  btnVer: {
    backgroundColor: '#1E3A5F',
    paddingVertical: 7,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 4,
  },
  textoVer: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  btnQuitar: {
    borderWidth: 1,
    borderColor: '#DC2626',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  textoQuitar: { color: '#DC2626', fontSize: 12, fontWeight: 'bold' },
  vacioBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 10 },
  vacioTitulo: { fontSize: 17, fontWeight: 'bold', color: '#0F172A' },
  vacioTexto: { fontSize: 14, color: '#475569', textAlign: 'center' },
  btnPrimario: {
    backgroundColor: '#1E3A5F',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 6,
  },
  textoPrimario: { color: '#FFFFFF', fontWeight: 'bold' },
});