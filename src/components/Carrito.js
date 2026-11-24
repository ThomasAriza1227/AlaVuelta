import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { formatearCOP } from '../data/productos';

export default function Carrito({
  carrito,
  onCambiarCantidad,
  onEliminar,
  onConfirmarCompra,
  onIrCatalogo,
}) {
  const [cuponTexto, setCuponTexto] = useState('');
  const [cuponAplicado, setCuponAplicado] = useState(false);

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [direccion, setDireccion] = useState('');

  if (carrito.length === 0) {
    return (
      <View style={styles.vacioBox}>
        <Text style={styles.vacioTexto}>Tu carrito está vacío</Text>
        <Pressable style={styles.btnPrimario} onPress={onIrCatalogo}>
          <Text style={styles.textoPrimario}>Explorar catálogo</Text>
        </Pressable>
      </View>
    );
  }

  const subtotal = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const descuento = cuponAplicado ? Math.round(subtotal * 0.1) : 0;
  const envio = subtotal >= 150000 ? 0 : 8000;
  const total = Math.max(0, subtotal - descuento + envio);

  const aplicarCupon = () => {
    if (cuponTexto.trim().toUpperCase() === 'BIENVENIDO10') {
      setCuponAplicado(true);
      Alert.alert('Cupón aplicado', 'Se aplicó un 10% de descuento sobre el subtotal.');
    } else {
      setCuponAplicado(false);
      Alert.alert('Cupón inválido', 'El código ingresado no es válido.');
    }
  };

  const procesarCompra = () => {
    if (!nombre.trim()) {
      Alert.alert('Dato faltante', 'Por favor ingresa tu nombre.');
      return;
    }
    if (!telefono.trim()) {
      Alert.alert('Dato faltante', 'Por favor ingresa tu teléfono.');
      return;
    }
    if (!municipio.trim()) {
      Alert.alert('Dato faltante', 'Por favor ingresa tu municipio.');
      return;
    }
    if (!direccion.trim()) {
      Alert.alert('Dato faltante', 'Por favor ingresa tu dirección.');
      return;
    }

    const exito = onConfirmarCompra(
      {
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        municipio: municipio.trim(),
        direccion: direccion.trim(),
      },
      { subtotal, descuento, envio, total }
    );

    if (exito) {
      setCuponAplicado(false);
      setCuponTexto('');
      setNombre('');
      setTelefono('');
      setMunicipio('');
      setDireccion('');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <Text style={styles.titulo}>Mi Carrito</Text>

      {carrito.map((item) => (
        <View key={item.id} style={styles.itemCard}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemNombre}>{item.nombre}</Text>
            <Text style={styles.itemPrecio}>{formatearCOP(item.precio)} c/u</Text>
          </View>

          <View style={styles.controles}>
            <Pressable
              style={[styles.btnCant, item.cantidad <= 1 && styles.btnCantDisabled]}
              onPress={() => onCambiarCantidad(item.id, -1)}
              disabled={item.cantidad <= 1}
            >
              <Text style={styles.textoCant}>-</Text>
            </Pressable>

            <Text style={styles.cantidad}>{item.cantidad}</Text>

            <Pressable
              style={styles.btnCant}
              onPress={() => onCambiarCantidad(item.id, 1)}
            >
              <Text style={styles.textoCant}>+</Text>
            </Pressable>

            <Pressable style={styles.btnEliminar} onPress={() => onEliminar(item.id)}>
              <Text style={styles.textoEliminar}>Eliminar</Text>
            </Pressable>
          </View>
        </View>
      ))}

      {/* Cupon promocional */}
      <View style={styles.seccion}>
        <Text style={styles.subtitulo}>Cupón promocional</Text>
        <View style={styles.filaCupon}>
          <TextInput
            style={styles.inputCupon}
            placeholder="Código (ej: BIENVENIDO10)"
            value={cuponTexto}
            onChangeText={setCuponTexto}
            autoCapitalize="characters"
          />
          <Pressable style={styles.btnSecundario} onPress={aplicarCupon}>
            <Text style={styles.textoSecundario}>Aplicar</Text>
          </Pressable>
        </View>
      </View>

      {/* Resumen de valores */}
      <View style={styles.seccion}>
        <Text style={styles.subtitulo}>Resumen de compra</Text>
        <View style={styles.filaResumen}>
          <Text style={styles.labelResumen}>Subtotal:</Text>
          <Text style={styles.valorResumen}>{formatearCOP(subtotal)} COP</Text>
        </View>
        {cuponAplicado && (
          <View style={styles.filaResumen}>
            <Text style={styles.labelResumen}>Descuento (10%):</Text>
            <Text style={styles.valorDescuento}>-{formatearCOP(descuento)} COP</Text>
          </View>
        )}
        <View style={styles.filaResumen}>
          <Text style={styles.labelResumen}>Envío:</Text>
          <Text style={styles.valorResumen}>
            {envio === 0 ? 'Gratis ($0)' : `${formatearCOP(envio)} COP`}
          </Text>
        </View>
        <View style={[styles.filaResumen, styles.filaTotal]}>
          <Text style={styles.labelTotal}>Total a pagar:</Text>
          <Text style={styles.valorTotal}>{formatearCOP(total)} COP</Text>
        </View>
      </View>

      {/* Datos basicos del comprador */}
      <View style={styles.seccion}>
        <Text style={styles.subtitulo}>Datos de entrega</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre completo"
          value={nombre}
          onChangeText={setNombre}
        />
        <TextInput
          style={styles.input}
          placeholder="Teléfono de contacto"
          keyboardType="phone-pad"
          value={telefono}
          onChangeText={setTelefono}
        />
        <TextInput
          style={styles.input}
          placeholder="Municipio (Mosquera, Madrid o Funza)"
          value={municipio}
          onChangeText={setMunicipio}
        />
        <TextInput
          style={styles.input}
          placeholder="Dirección de entrega"
          value={direccion}
          onChangeText={setDireccion}
        />

        <Pressable style={styles.btnPrimario} onPress={procesarCompra}>
          <Text style={styles.textoPrimario}>Confirmar Compra</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { padding: 14, gap: 12 },
  titulo: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  itemCard: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  itemInfo: { flexDirection: 'row', justifyContent: 'space-between' },
  itemNombre: { fontWeight: 'bold', color: '#0F172A', flex: 1 },
  itemPrecio: { color: '#1E3A5F', fontWeight: '600' },
  controles: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  btnCant: {
    backgroundColor: '#1E3A5F',
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCantDisabled: { backgroundColor: '#CBD5E1' },
  textoCant: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  cantidad: { fontWeight: 'bold', fontSize: 15, minWidth: 20, textAlign: 'center' },
  btnEliminar: { marginLeft: 'auto', paddingHorizontal: 8, paddingVertical: 4 },
  textoEliminar: { color: '#DC2626', fontSize: 12, fontWeight: 'bold' },
  seccion: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  subtitulo: { fontWeight: 'bold', color: '#0F172A', fontSize: 14 },
  filaCupon: { flexDirection: 'row', gap: 8 },
  inputCupon: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  btnSecundario: {
    backgroundColor: '#475569',
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: 6,
  },
  textoSecundario: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  filaResumen: { flexDirection: 'row', justifyContent: 'space-between' },
  labelResumen: { color: '#475569', fontSize: 13 },
  valorResumen: { color: '#0F172A', fontSize: 13, fontWeight: '600' },
  valorDescuento: { color: '#16A34A', fontSize: 13, fontWeight: '600' },
  filaTotal: { borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 6, marginTop: 4 },
  labelTotal: { fontWeight: 'bold', fontSize: 15, color: '#0F172A' },
  valorTotal: { fontWeight: 'bold', fontSize: 15, color: '#1E3A5F' },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  btnPrimario: {
    backgroundColor: '#1E3A5F',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  textoPrimario: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  vacioBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, gap: 12 },
  vacioTexto: { fontSize: 15, color: '#475569' },
});