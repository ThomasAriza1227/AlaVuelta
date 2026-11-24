import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { formatearCOP } from '../data/productos';
import { TARIFAS_ENVIO } from '../data/datosIniciales';

export default function Carrito({
  carrito,
  direcciones,
  direccionActual,
  onSeleccionarDireccion,
  onIrDirecciones,
  onCambiarCantidad,
  onEliminar,
  onConfirmarCompra,
  onIrCatalogo,
}) {
  const [cuponTexto, setCuponTexto] = useState('');
  const [cuponAplicado, setCuponAplicado] = useState(false);
  const [modalidadEnvio, setModalidadEnvio] = useState('estandar');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [alertaError, setAlertaError] = useState('');

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

  const tarifaMunicipio = direccionActual ? TARIFAS_ENVIO[direccionActual.municipio] : null;
  const envioValido = Boolean(direccionActual && tarifaMunicipio && modalidadEnvio);
  const envio = envioValido
    ? modalidadEnvio === 'expres'
      ? tarifaMunicipio.expres
      : tarifaMunicipio.estandar
    : 0;
  const plazoEstimado = envioValido
    ? modalidadEnvio === 'expres'
      ? tarifaMunicipio.plazoExpres
      : tarifaMunicipio.plazoEstandar
    : 'Sin calcular';

  const total = Math.max(0, subtotal - descuento + envio);

  const mostrarError = (titulo, mensaje) => {
    setAlertaError(mensaje);
    Alert.alert(titulo, mensaje);
  };

  const aplicarCupon = () => {
    if (!cuponTexto.trim()) {
      mostrarError('Cupón vacío', 'Escribe un código de cupón antes de aplicar.');
      return;
    }
    if (cuponTexto.trim().toUpperCase() === 'BIENVENIDO10') {
      setCuponAplicado(true);
      setAlertaError('');
      Alert.alert('Cupón aplicado', 'Se aplicó un 10% de descuento sobre el subtotal.');
    } else {
      setCuponAplicado(false);
      mostrarError('Cupón inválido', 'El código ingresado no es válido. Usa BIENVENIDO10.');
    }
  };

  const procesarCompra = () => {
    if (!direccionActual) {
      mostrarError('Falta dirección', 'Debes seleccionar una dirección de entrega antes de continuar.');
      return;
    }
    if (!tarifaMunicipio) {
      mostrarError('Sin cobertura', 'Solo hay tarifas configuradas para Mosquera, Funza y Madrid.');
      return;
    }
    if (!nombre.trim()) {
      mostrarError('Falta el nombre', 'Ingresa tu nombre completo en los datos de contacto.');
      return;
    }
    if (!telefono.trim()) {
      mostrarError('Falta el teléfono', 'Ingresa tu número de teléfono en los datos de contacto.');
      return;
    }

    setAlertaError('');
    const exito = onConfirmarCompra(
      {
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        municipio: direccionActual.municipio,
        direccion: `${direccionActual.alias} - ${direccionActual.descripcion}`,
      },
      { subtotal, descuento, envio, total },
      modalidadEnvio
    );

    if (exito) {
      setCuponAplicado(false);
      setCuponTexto('');
      setNombre('');
      setTelefono('');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <Text style={styles.titulo}>Mi Carrito</Text>

      {carrito.map((item) => (
        <View key={item.keyUnico} style={styles.itemCard}>
          <View style={styles.itemInfo}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemNombre}>{item.nombre}</Text>
              {item.varianteEtiqueta && (
                <Text style={styles.varianteTag}>Opción: {item.varianteEtiqueta}</Text>
              )}
            </View>
            <Text style={styles.itemPrecio}>{formatearCOP(item.precio)} c/u</Text>
          </View>

          <View style={styles.controles}>
            <Pressable
              style={[styles.btnCant, item.cantidad <= 1 && styles.btnCantDisabled]}
              onPress={() => onCambiarCantidad(item.keyUnico, -1)}
              disabled={item.cantidad <= 1}
            >
              <Text style={styles.textoCant}>-</Text>
            </Pressable>

            <Text style={styles.cantidad}>{item.cantidad}</Text>

            <Pressable
              style={styles.btnCant}
              onPress={() => onCambiarCantidad(item.keyUnico, 1)}
            >
              <Text style={styles.textoCant}>+</Text>
            </Pressable>

            <Pressable style={styles.btnEliminar} onPress={() => onEliminar(item.keyUnico)}>
              <Text style={styles.textoEliminar}>Eliminar</Text>
            </Pressable>
          </View>
        </View>
      ))}

      <View style={styles.seccion}>
        <View style={styles.filaSpace}>
          <Text style={styles.subtitulo}>Dirección de entrega *</Text>
          <Pressable onPress={onIrDirecciones}>
            <Text style={styles.link}>Gestionar direcciones</Text>
          </Pressable>
        </View>

        <View style={styles.filaChips}>
          {direcciones.map((dir) => {
            const sel = direccionActual && direccionActual.id === dir.id;
            return (
              <Pressable
                key={dir.id}
                style={[styles.chip, sel && styles.chipActivo]}
                onPress={() => {
                  onSeleccionarDireccion(dir.id);
                  setAlertaError('');
                }}
              >
                <Text style={[styles.chipTexto, sel && styles.chipTextoActivo]}>
                  {dir.alias} ({dir.municipio})
                </Text>
              </Pressable>
            );
          })}
        </View>

        {direccionActual && (
          <Text style={styles.textoDireccion}>{direccionActual.descripcion}</Text>
        )}

        <Text style={[styles.subtitulo, { marginTop: 4 }]}>Modalidad de envío</Text>
        <View style={styles.filaChips}>
          {[
            { key: 'estandar', label: 'Envío Estándar' },
            { key: 'expres', label: 'Envío Exprés' },
          ].map((mod) => {
            const sel = modalidadEnvio === mod.key;
            return (
              <Pressable
                key={mod.key}
                style={[styles.chip, sel && styles.chipActivo]}
                onPress={() => setModalidadEnvio(mod.key)}
              >
                <Text style={[styles.chipTexto, sel && styles.chipTextoActivo]}>{mod.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

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
          <Text style={styles.labelResumen}>
            Envío ({envioValido ? `${direccionActual.municipio} · ${plazoEstimado}` : 'Pendiente'}):
          </Text>
          <Text style={styles.valorResumen}>
            {envioValido ? `${formatearCOP(envio)} COP` : 'No disponible'}
          </Text>
        </View>
        <View style={[styles.filaResumen, styles.filaTotal]}>
          <Text style={styles.labelTotal}>Total a pagar:</Text>
          <Text style={styles.valorTotal}>{formatearCOP(total)} COP</Text>
        </View>
      </View>

      <View style={styles.seccion}>
        <Text style={styles.subtitulo}>Datos de contacto *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre completo *"
          value={nombre}
          onChangeText={(txt) => {
            setNombre(txt);
            if (alertaError) setAlertaError('');
          }}
        />
        <TextInput
          style={styles.input}
          placeholder="Teléfono de contacto *"
          keyboardType="phone-pad"
          value={telefono}
          onChangeText={(txt) => {
            setTelefono(txt);
            if (alertaError) setAlertaError('');
          }}
        />

        {alertaError !== '' && (
          <View style={styles.alertaBox}>
            <Text style={styles.alertaTexto}>{alertaError}</Text>
          </View>
        )}

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
  alertaBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#DC2626',
    padding: 10,
    borderRadius: 6,
  },
  alertaTexto: { color: '#991B1B', fontSize: 12, fontWeight: '600' },
  itemCard: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  itemInfo: { flexDirection: 'row', justifyContent: 'space-between' },
  itemNombre: { fontWeight: 'bold', color: '#0F172A' },
  varianteTag: { fontSize: 12, color: '#475569' },
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
  filaSpace: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subtitulo: { fontWeight: 'bold', color: '#0F172A', fontSize: 14 },
  link: { color: '#1E3A5F', fontSize: 12, fontWeight: 'bold' },
  filaChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  chipActivo: { backgroundColor: '#1E3A5F' },
  chipTexto: { fontSize: 12, color: '#334155', fontWeight: '600' },
  chipTextoActivo: { color: '#FFFFFF' },
  textoDireccion: { fontSize: 12, color: '#475569' },
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